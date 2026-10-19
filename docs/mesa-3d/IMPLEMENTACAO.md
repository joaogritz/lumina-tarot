# Mesa Livre 3D — implementação e validação

Veja também o [refinamento visual e as novas interações](REFINAMENTO_VISUAL.md).

A aplicação fica em `/mesa-3d/`, na mesma origem do Lumina. O link **Mesa 3D** faz navegação completa na mesma aba. A página nova usa TypeScript e Babylon.js; não importa React, App.jsx, música ou animações do santuário.

## Executar e verificar

```sh
npm ci
npm run dev
# abrir http://localhost:5173/mesa-3d/
npm test
npm run typecheck
npm run test:mesa
npm run build
npx playwright install chromium
npm run test:browser
```

Os testes de navegador usam o build em `dist`, com preview em 4173 e outro em 4175 sob `/lumina-tarot/`. Não executar outro preview nessas portas durante a verificação de CI. Playwright usa Chromium com SwiftShader para permitir WebGL em ambiente sem GPU. Isso verifica comportamento e renderização, mas não representa desempenho em hardware real.

O workflow executa as regras das duas aplicações, TypeScript, build multipágina e os testes de navegador antes de publicar. A publicação em si continua dependendo do push para `main` ou do acionamento do workflow existente.

## Arquitetura

- `session/model.ts`: documento versionado, limites, importação, IDs e validação. Schema 1 é a versão inicial; versões desconhecidas são rejeitadas. Uma migração deve ser adicionada aqui quando houver um schema anterior real.
- `session/commands.ts`: comandos puros e histórico de até 100 ações em memória. O documento persistido contém o resultado, independente do motor.
- `persistence/storage.ts`: IndexedDB com transação e revisão otimista. BroadcastChannel antecipa o aviso; a proteção contra sobrescrita continua na transação quando o canal não existe.
- `engine/table.ts`: ciclo de vida do motor, cena, câmera, projeção dos objetos e perfis gráficos.
- `interaction/readingPlane.ts`: registro explícito de picking e interseção do ponteiro com o plano de leitura. Recebe pixels CSS, pois Babylon aplica a escala de renderização internamente.
- `scene/materials.ts`: materiais PBR da madeira e do tecido e desenhos procedurais do ambiente.
- `cards/material.ts`: materiais das artes, carregamento recuperável e resolução de GPU limitada. Preserva proporções, incluindo as diferenças entre Tarot e Lenormand.
- `ui/dom.ts` e `bootstrap.ts`: controles HTML, lista acessível, painéis, foco, salvamento e coordenação dos comandos. Dados do usuário entram com `textContent`, nunca como HTML.

## Comportamentos definidos

O monte conserva sua ordem exata. Retirar nunca revela automaticamente. A inversão do Tarot é independente do ângulo físico e não existe no Cigano. Devolver coloca a carta no fundo do monte; descartar a retira da circulação. Ambas as ações são reversíveis. Embaralhar afeta apenas as cartas restantes.

O arraste conserva o deslocamento inicial e confirma uma única ação ao soltar. Escape, perda de captura, perda de foco e um segundo toque cancelam a apresentação temporária. Dois dedos passam a controlar a câmera. A seleção se eleva acima das demais cartas sem alterar a ordem persistida até uma movimentação confirmada. A lista e os botões de movimento permitem operar sem arrastar.

Notas: até 60 por mesa; reflexões de até 4.000 caracteres e posições de até 120. O painel mantém o texto completo e a cena mostra um resumo. Importações têm limite de 512 KB, validam a partição completa do baralho, objetos, referências e números finitos, e sempre criam outro ID.

Alterações recebem autosave com debounce; retirar, revelar, descartar, devolver e guardar notas também solicitam gravação imediata. Sair pelo botão e abrir outra mesa aguardam a fila de gravação. Se houver falha, é possível exportar a versão atual e então navegar. O fechamento forçado do navegador não garante a conclusão da última gravação, por isso há salvamento durante o uso e exportação explícita.

Conflitos preservam a versão em memória e oferecem uma nova cópia ou JSON. Falta de IndexedDB mantém as operações em memória. Falta de WebGL oferece a interface acessível e exportação. Falhas de artes recebem uma face substituta e mantêm os significados disponíveis.

## Arte e recursos

O ambiente usa malhas e ornamentos procedurais, texturas PBR da Poly Haven e iluminação HDR pré-filtrada, em vez de arquivos GLB externos. Os arquivos-fonte da geometria são o próprio TypeScript; origens e licenças das texturas estão em `public/mesa-3d/ASSETS.md`. Essa escolha reduz transferências, mantém o ambiente editável e dispensa modelos de terceiros; não há arquivos Blender ocultos ou assets licenciados sem origem. O pipeline GLB/Blender descrito no plano permanece uma opção para futuros objetos que precisem de modelagem mais elaborada.

Escala: unidades de cena arbitrárias, cartas de 1,72 × 3, superfície no plano XZ, eixo Y para cima, pivô central. A área permitida para centros dos objetos é X ±8,7 e Z ±5,2, dentro do tecido de 20 × 13,5. Geometria de cartas e faces é compartilhada por clones. Todos os elementos de decoração ficam fora do picking.

Fontes: Cormorant Garamond e Outfit locais, com licença OFL. Paleta: obsidiana `#080706`, painéis `#12100f`, marfim `#e9e3d6`, dourado `#c9a45c` e tecido azul de meia-noite. Materiais PBR acetinados para madeira e tecido; faces das cartas sem iluminação para preservar as cores das artes. Ornamentos, verso, vela, caixa e esfera armilar são originais deste repositório, sob sua licença MIT. As texturas reais e o HDRI são CC0.

As artes e suas fontes/licenças continuam em `public/tarot` e `src/data/cardArtwork.js`: Rider–Waite–Smith (Pamela Colman Smith, 1910) e Das Spiel der Hofnung (1799), domínio público. Não foram geradas novas ilustrações das cartas. A inspeção HTML usa a miniatura existente e a ampliação usa a imagem original.

## Qualidade e medição

Média é o padrão quando não há preferência salva. Baixa usa resolução reduzida e sombras de contato, sem sombras dinâmicas. Média acrescenta sombras seletivas e brilho das chamas; alta aumenta a resolução e a qualidade das sombras. A opção global fica em localStorage. As texturas de GPU das cartas usam 256 × 512 em baixa/média e 512 × 1024 em alta, com proporções corrigidas ao desenhar. Trocar de perfil descarta os materiais de resolução anterior. As imagens decodificadas são liberadas após a cópia para a textura.

A cena pausa quando a aba fica oculta e deixa de enviar quadros quando está estática. Entradas de câmera mantêm uma janela curta para inércia; mudanças, resize, carregamentos e animações acordam o renderizador. As animações de retirada, acomodação, virada e descarte respeitam movimento reduzido. Não há áudio nesta versão.

Em Preferências → Ver medição da cena são mostrados quadros renderizados, quadros ociosos evitados, p95 do tempo de submissão CPU, draw calls do último quadro, triângulos, texturas e estimativa de bytes de textura com mipmaps. A estimativa não inclui memória total do navegador/driver; o p95 não é tempo de GPU nem promessa de FPS.

Antes do refinamento de materiais e cenário, uma medição preliminar local com Chromium/SwiftShader, 78 cartas reveladas e perfil baixo registrou 170 malhas, 16.564 triângulos, 165 draw calls e aproximadamente 72 MB de texturas. O mesmo cenário antes da limitação das artes estimava 182 MB. A renderização ociosa foi observada nos testes. Os valores atuais devem ser consultados no relatório de execução após mudanças de materiais.

## Cache e atualização

O service worker mantém shells distintos para o Lumina e a mesa. Visitar o Lumina não baixa a aplicação 3D. Navegações usam a rede primeiro e, sem conexão, o shell correto quando disponível. Se a mesa não estiver em cache, é exibida uma página offline própria, nunca o santuário. Recursos com hash permanecem em cache e a versão anterior é conservada para clientes que ainda a executam. Não há garantia de download offline completo.

## Critérios ainda dependentes de validação externa

A primeira versão funcional não encerra os critérios de hardware do plano. Ainda é preciso escolher e medir computador e celular intermediário reais, rede de referência, entrada fria/com cache, 30/60 FPS, travamentos, aquecimento e memória em uso prolongado. A GPU de software utilizada na automação não permite certificar essas metas. Testes reais de Safari/iOS, Android, leitor de tela e revisão estética humana também permanecem necessários.

O build e a navegação sob subdiretório são testados localmente. O domínio publicado e uma atualização real entre versões precisam de verificação após um deploy autorizado. Nenhum deploy é realizado pela implementação local.

As capturas em `references/` registram os estados visuais no navegador. A suíte também produz evidências atualizadas em `test-results/`, publicadas como artefato de CI.

Referências: [entrada](references/reference-entry.png), [perfil baixo](references/reference-low.png), [perfil alto](references/reference-high.png), [retrato](references/reference-portrait.png), [inspeção](references/reference-inspection.png) e [paisagem](references/mesa-844.png).
