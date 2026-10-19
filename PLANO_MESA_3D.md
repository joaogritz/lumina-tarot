# Plano de implementação — Mesa Livre 3D do Lumina Tarot

Status: primeira versão funcional implementada. Validação em dispositivos físicos e no domínio publicado ainda pendente. Consulte [implementação e evidências](docs/mesa-3d/IMPLEMENTACAO.md).

## 1. Objetivo e princípios

Criar uma experiência tridimensional independente com Babylon.js, acessível por um link no Lumina. A prioridade é uma mesa bonita, agradável, legível e fluida, com identidade visual própria e integração com os dados existentes.

A primeira versão deve permitir entrar, escolher um baralho, manipular cartas, registrar reflexões e retomar a sessão depois.

Princípios de decisão:

1. Composição, materiais e iluminação sustentam a beleza da experiência.
2. Cartas e textos permanecem legíveis em todos os perfis gráficos.
3. Interações devem ser previsíveis em mouse, toque e teclado.
4. Desempenho é medido desde o protótipo visual.
5. A página 3D não carrega as animações e a interface do site principal.
6. Modelos, efeitos e funcionalidades entram quando contribuem para a leitura.
7. A sessão persistida é independente dos objetos do motor gráfico.

Uma página independente evita executar as animações atuais junto da mesa. Isso não garante, por si só, bom desempenho: modelos, texturas, iluminação, efeitos e lógica ainda precisam de orçamento e medição. Os gargalos atuais do site ainda precisam ser medidos, caso sejam objeto de uma otimização separada.

## 2. Direção de arte

### Conceito: observatório íntimo de Tarot

Madeira escura, tecido azul profundo, detalhes em latão envelhecido, luz quente lateral e referências celestes discretas. A sensação deve ser de concentração e acolhimento.

| Elemento | Decisão de design |
| --- | --- |
| Mesa | Madeira escura, acabamento acetinado e desgaste discreto. |
| Área de leitura | Tecido azul profundo, textura fina e ornamento celestial nas bordas. |
| Cartas | Artes atuais preservadas, espessura sutil, bordas claras e reflexo suave de papel. |
| Iluminação | Luz principal quente e preenchimento frio discreto, preservando a legibilidade. |
| Objetos | Poucos elementos periféricos: vela, caixa do baralho e objeto pequeno de latão. |
| Interface | Painéis escuros, texto claro, acentos dourados e superfícies predominantemente opacas. |
| Tipografia | Serifada nos títulos e fonte simples nos controles e textos longos. |
| Movimento | Curto, suave, com resposta clara para cada ação. |

O centro da mesa fica livre. Decoração não pode esconder cartas, competir com as artes ou dificultar o arraste.

### Entregas de design

- Referência de composição para computador.
- Referência para celular em retrato e paisagem.
- Paleta, tipografia, espaçamento e estados dos controles.
- Cena estática renderizada no navegador com a qualidade visual pretendida.
- Estados de carregamento, erro, seleção, edição e salvamento.
- Comparação visual entre os perfis gráficos baixo, médio e alto.

A cena de referência será o parâmetro visual das etapas seguintes. Reservar tempo explícito para modelagem, materiais e revisão visual.

## 3. Escopo inicial

### Incluído

- Tarot e Baralho Cigano, escolhidos ao iniciar uma sessão.
- Mesa 3D com área útil generosa e limites físicos claros.
- Câmera controlada, visão superior e enquadramento de todos os objetos.
- Monte embaralhado e retirada de cartas sem repetição.
- Seleção, arraste, rotação, revelação e organização.
- Inversões opcionais no Tarot.
- Notas e títulos de posições.
- Consulta de significados e inspeção das artes.
- Desfazer e refazer.
- Salvamento automático e lista de mesas salvas.
- Exportação e importação de sessão.
- Qualidade gráfica ajustável.
- Operação por mouse, toque e teclado.

### Evoluções posteriores

- Multiplayer e permissões de sessão.
- Cômodo explorável e múltiplos cenários.
- Física completa.
- Baralhos personalizados.
- Modelos de tiragem e conexões entre cartas.
- Linha do tempo com etapas da leitura.
- Integração da mesa com o diário e interpretação por IA contextual.
- Download explícito para uso offline.

## 4. Fluxo de entrada

O botão “Mesa 3D” abre uma página própria por navegação completa na mesma aba. A página anterior é encerrada, evitando manter os dois ambientes em execução.

Fluxo:

1. Abrir a página da mesa com imagem estática leve do ambiente.
2. Oferecer “Nova mesa” e “Continuar sessão”, quando houver sessão salva.
3. Na criação, escolher baralho, título opcional e inversões compatíveis.
4. Iniciar em qualidade conservadora, ajustável após observar o desempenho.
5. Carregar os recursos essenciais e revelar a cena pronta.
6. Na primeira visita, apresentar instruções discretas para puxar, mover e revelar.

O carregamento deve mostrar progresso real das etapas conhecidas, sem percentuais fictícios. Recursos secundários entram depois. Evitar revelar materiais ausentes ou exigir um passeio de câmera.

Falhas oferecem mensagem compreensível, tentativa novamente e retorno ao Lumina. Falta de suporte gráfico deve permitir voltar ao site principal e acessar os dados exportáveis, quando disponíveis.

## 5. Interface e conforto de uso

### Computador

- Barra superior: voltar, nome da mesa, estado de salvamento e preferências.
- Barra inferior: puxar carta, adicionar nota, organizar e controlar câmera.
- Painel lateral contextual: significados, edição e opções da seleção.
- Monte em uma posição periférica acessível.
- Área central ampla e livre de controles permanentes.

O painel não deve esconder a seleção. Ajustar o enquadramento útil quando necessário.

### Celular

- Ações frequentes próximas ao polegar.
- Painéis em gaveta inferior.
- Respeito às áreas seguras e às barras do navegador.
- Retrato plenamente funcional; paisagem como alternativa.
- Nenhuma informação depende de hover.
- Botões para ações que seriam difíceis apenas com gestos.

### Acessibilidade

- Lista HTML de cartas e notas para selecionar objetos sem localizar visualmente na cena.
- Navegação por teclado, foco visível e nomes acessíveis dos controles.
- Ações equivalentes para mover, girar, revelar e organizar sem arrastar.
- Painéis com gerenciamento de foco e fechamento previsível.
- Mensagens de seleção e salvamento com anúncios moderados.
- Movimento reduzido, áudio opcional e contraste adequado.
- O canvas não será a única representação operacional da sessão.

## 6. Câmera e navegação

Usar `ArcRotateCamera` com limites de inclinação, distância e deslocamento.

| Comando | Comportamento |
| --- | --- |
| Visão da mesa | Perspectiva inclinada para manipular cartas. |
| Visão superior | Enquadramento próximo do vertical para organização. |
| Ver tudo | Enquadrar cartas e notas respeitando os limites da cena. |
| Examinar | Abrir arte e significado em painel legível. |

Regras:

- Bloquear câmera durante arraste de objetos.
- Impedir câmera de atravessar mesa e decoração.
- Preservar margens confortáveis no enquadramento.
- Respeitar movimento reduzido nas transições.
- Não depender de aproximação extrema para ler as cartas.
- Computador: arraste do fundo navega; gesto de zoom deve ser consistente e documentado.
- Toque: um dedo manipula; dois navegam e aproximam, com cancelamento seguro da interação anterior.

Validar especialmente conflitos entre toque, seleção, arraste e câmera.

## 7. Cartas e interação

Estados explícitos: repouso, selecionada, arrastando, revelando e examinando.

Ao pegar uma carta:

1. Elevar discretamente sua representação.
2. Mostrar destaque suave.
3. Ajustar a sombra para comunicar distância da superfície.
4. Acompanhar o ponteiro sobre o plano de leitura.
5. Acomodar suavemente ao soltar.

Calcular o arraste pela interseção do ponteiro com um plano de leitura, preservando o deslocamento inicial entre o ponto tocado e o centro da carta para evitar saltos.

Decisões:

- Selecionar não revela; usar ação explícita de revelação.
- Separar rotação visual de `isReversed`.
- Permitir sobreposição com ordem persistida.
- Dar prioridade visual temporária à seleção.
- Controlar altura de empilhamento para evitar cintilação entre superfícies.
- Restringir objetos à área útil.
- Oferecer alinhamento em linha e coluna.
- Tornar encaixe e alinhamento automáticos opcionais.
- Cancelar arraste com Escape, interrupção de toque ou perda de captura, restaurando estado consistente.
- Registrar um arraste completo como uma ação de histórico.

Não usar física completa na primeira versão. Alturas controladas e regras de empilhamento mantêm previsibilidade.

## 8. Monte e regras do baralho

### Representação visual

- Corpo simplificado para representar o volume do monte.
- Poucas camadas visíveis nas bordas.
- Carta superior individual durante retirada.
- Embaralhamento com poucos elementos animados.

### Regras

- Embaralhar IDs com Fisher–Yates e fonte aleatória adequada.
- Persistir a ordem restante, não apenas cartas expostas.
- Impedir retirada duplicada.
- Embaralhar novamente somente as cartas restantes.
- Aplicar inversão na retirada quando ativa e compatível com o baralho.
- Usar um baralho por sessão.
- Remover da mesa envia a carta para descartadas.
- Devolver ao monte é outra ação explícita, com regra de reinserção definida e reversível.
- Trocar de baralho inicia outra mesa e preserva a anterior.

## 9. Notas e posições

Dois tipos iniciais:

- Posição: título curto, como “Desafio”.
- Reflexão: texto maior associado à mesa ou a uma carta.

Usar aparência discreta de etiqueta ou papel. Edição em HTML, com comportamento convencional de teclado e seleção de texto. A representação na cena é simples e atualizada apenas quando necessário.

Textos longos aparecem resumidos na mesa e completos no painel. Evitar processar HTML fornecido pelo usuário. Definir limites de comprimento e quantidade compatíveis com o uso esperado.

Conexões visuais entre cartas entram após estabilizar seleção, manipulação e notas.

## 10. Arquitetura e stack

Manter o repositório atual, com uma segunda entrada HTML e build multipágina do Vite.

```text
mesa-3d/
  index.html
  src/
    bootstrap.ts
    engine/
    scene/
    cards/
    interaction/
    session/
    persistence/
    ui/
    styles/

public/
  mesa-3d/
    models/
    textures/
    environments/
```

O build deve gerar `dist/mesa-3d/index.html`, além da página atual. A URL exata respeita o caminho-base de publicação no GitHub Pages.

| Camada | Responsabilidade |
| --- | --- |
| Motor | Inicialização, renderização, resolução, pausa e descarte. |
| Cena | Ambiente, iluminação, câmera e decoração. |
| Cartas | Geometria, materiais, imagens e animações. |
| Interação | Seleção, arraste, rotação e navegação. |
| Sessão | Regras, objetos, comandos e histórico. |
| Persistência | Salvamento, migrações, importação e exportação. |
| Interface | Menus, painéis, mensagens e acessibilidade. |

Stack:

- TypeScript na aplicação nova.
- Babylon.js para a cena.
- Vite para desenvolvimento e build.
- HTML/CSS para interface e edição.
- IndexedDB, com wrapper pequeno como `idb` se necessário.
- Blender para modelos e preparação visual.
- Playwright para fluxos de navegador.
- Runner Node atual para regras independentes do motor.

A página não importa `App.jsx`, efeitos de fundo ou o sistema de animações da interface atual. Reutilizar catálogos e utilitários puros por módulos compartilhados, sem puxar componentes do site principal.

Usar pacotes modulares do Babylon, imports específicos e registro explícito dos recursos necessários. Verificar tree shaking no build. Inspector somente em desenvolvimento. Fixar versões no lockfile.

## 11. Estado e comandos

Objetos Babylon representam o estado da sessão; não são a fonte dos dados persistidos.

```text
Session
  schemaVersion
  id, title, createdAt, updatedAt
  deckId
  remainingCardIds, discardedCardIds
  cards[]
    instanceId, cardId
    position, rotation, stackingOrder
    faceUp, isReversed
  notes[]
  camera
  preferences
```

Persistir coordenadas da mesa independentes da resolução. Referenciar cartas por ID; não duplicar imagens e significados em cada sessão.

Comandos reversíveis incluem retirar, mover, girar, revelar, inverter, descartar, devolver, organizar e editar nota. Durante arraste, atualizar a apresentação; no término, confirmar um comando e solicitar salvamento.

O histórico de desfazer pode ser limitado e permanecer em memória na primeira versão. Persistir sempre o resultado final da sessão. Separar preferências globais de escolhas específicas da mesa.

## 12. Pipeline de arte e assets

Construir um ambiente bem acabado antes de adicionar variações.

Ordem:

1. Proporções e enquadramento.
2. Dimensões e leitura das cartas.
3. Iluminação principal.
4. Madeira e tecido.
5. Bordas e materiais das cartas.
6. Objetos periféricos.
7. Efeitos opcionais dentro do orçamento.

Exportar modelos em GLB. Usar materiais PBR com rugosidade, cor e escala coerentes. Preparar iluminação pré-calculada para elementos estáticos quando apropriado e iluminação dinâmica seletiva para as cartas.

Cuidados:

- Preservar cores e detalhes das artes existentes.
- Controlar reflexos sobre as ilustrações.
- Evitar profundidade de campo durante leitura.
- Conferir aparência em brilho comum de celular.
- Manter composição e legibilidade no perfil baixo.
- Registrar origem, licença e arquivos-fonte dos assets.
- Definir convenção de escala, orientação, pivôs e nomes no Blender.
- Manter arquivos de produção fora do caminho de recursos publicados quando não forem necessários em execução.

## 13. Desempenho e qualidade gráfica

WebGL 2 como referência inicial de compatibilidade. Avaliar WebGPU depois, comparando estabilidade e desempenho reais.

| Perfil | Tratamento |
| --- | --- |
| Baixo | Resolução reduzida, sombras simplificadas e cenário essencial. |
| Médio | Sombras seletivas, materiais completos e resolução moderada. |
| Alto | Sombras melhores e detalhes adicionais dentro do orçamento. |

Preservar a direção visual ao mudar de perfil. Reduzir primeiro resolução, sombras e efeitos. Permitir escolha manual persistida; ajustes automáticos devem usar uma janela de medição e margem para evitar oscilações constantes.

Medidas:

- Compartilhar geometria entre cartas.
- Reutilizar materiais e texturas quando compatível com as artes diferentes.
- Carregar resoluções maiores por necessidade.
- Avaliar compressão de texturas para GPU e o custo dos decodificadores.
- Reduzir fontes e atualizações de sombras dinâmicas.
- Excluir decoração dos testes de seleção.
- Não atualizar DOM ou estado persistido a cada quadro.
- Pausar renderização e áudio quando a aba estiver oculta.
- Renderizar sob demanda quando não houver animações ou mudanças visuais.
- Retomar renderização em interação, resize e carregamento de assets.
- Descartar recursos e listeners ao encerrar ou substituir sessões.
- Tratar perda e restauração do contexto gráfico.
- Não congelar transformações ou listas que precisam mudar nas cartas móveis.

### Metas preliminares

Definir aparelhos e condições de rede de referência antes de validar estas metas. São objetivos de engenharia, não garantias antecipadas.

| Indicador | Meta proposta |
| --- | --- |
| Computador de referência | Próximo de 60 FPS durante manipulação. |
| Celular intermediário de referência | 30 FPS estáveis no perfil adequado. |
| Entrada essencial | Buscar até 8 MB transferidos e comprimidos. |
| Mesa pronta | Buscar até 5 segundos na rede de teste definida. |
| Uso prolongado | Sem crescimento contínuo de memória após repetir ações. |

Registrar tempo de quadro, travamentos, draw calls, triângulos, texturas e memória estimada. Média de FPS isolada não basta. Os limites de geometria, materiais e sombras serão fixados após o protótipo representativo.

Cenários de medição: entrada fria, entrada com cache, tiragem grande, notas, painel aberto, revelações repetidas, navegação e sessão prolongada. Testar aquecimento e queda sustentada de desempenho no celular.

## 14. Persistência e integridade

- Salvar em IndexedDB com debounce após alterações.
- Confirmar gravações após ações importantes e ao sair pelo botão da aplicação.
- Não depender exclusivamente de eventos de fechamento da página.
- Mostrar “Salvando”, “Salvo” e falha com alternativa de exportação.
- Usar transações para evitar estados parcialmente gravados.
- Versionar schema e implementar migrações testáveis.
- Evitar duas abas sobrescrevendo a mesma sessão silenciosamente; detectar conflito e oferecer cópia ou acesso somente para leitura.
- Validar arquivos importados: versão, IDs, quantidades, tamanho e números finitos.
- Não sobrescrever sessão existente ao importar sem ação explícita.
- Exportar dados da sessão em JSON independente dos assets.
- Tratar armazenamento indisponível ou quota excedida mantendo a sessão em memória e informando a limitação.

## 15. Integração, publicação e cache

Compartilhar inicialmente catálogos, artes, identificação dos baralhos, significados e preferências compatíveis.

O diário atual armazena leituras; a mesa armazena um documento espacial. Integração futura pode oferecer “Registrar leitura no diário” com resumo e referência à sessão.

### Vite e GitHub Pages

- Configurar duas entradas HTML.
- Garantir links e assets compatíveis com o caminho-base de publicação.
- Não carregar o bundle Babylon na página principal.
- Gerar ambas as aplicações no mesmo `dist`.
- Adaptar workflow para verificar as duas entradas.
- Validar navegação direta, retorno, refresh e assets em subdiretório.

### Service worker

O service worker atual pode retornar a página principal como fallback para outras navegações. Revisar esse comportamento antes de publicar a mesa.

- Distinguir o shell principal do shell da mesa.
- Não servir a interface antiga como fallback da mesa.
- Versionar recursos e caches da experiência 3D.
- Evitar baixar todos os recursos 3D na visita ao site principal.
- Tratar atualização com assets antigos ainda em uso.
- Mostrar estado offline compreensível quando faltarem recursos.
- Não prometer funcionamento offline completo na primeira versão.
- Avaliar futuramente download offline explícito, com tamanho e estado visíveis.

## 16. Etapas, dependências e critérios de avanço

### Etapa 1 — Direção visual

Entregar referências, tokens visuais, layouts responsivos e cena estática de referência.

Avançar quando cartas estiverem legíveis e a identidade estiver consistente em computador e celular.

### Etapa 2 — Protótipo representativo

Entregar ambiente próximo da qualidade final, câmera, monte, cartas manipuláveis e medição inicial. Usar uma quantidade representativa de cartas, incluindo teste com o baralho completo exposto.

Avançar quando aparência e desempenho forem viáveis nos dispositivos escolhidos. Se necessário, ajustar materiais, sombras e composição antes de ampliar funcionalidades.

### Etapa 3 — Aplicação independente

Entregar entrada própria, build multipágina, carregamento, tratamento de erros e retorno ao Lumina.

Avançar quando acesso direto e navegação funcionarem sem executar a interface antiga.

### Etapa 4 — Núcleo da leitura

Entregar regras do monte, sorteio, seleção, arraste, revelação, rotação, inversão e comandos reversíveis.

Avançar quando uma leitura completa funcionar em mouse e toque, sem duplicações ou conflitos de câmera.

### Etapa 5 — Organização e escrita

Entregar notas, posições, alinhamento, painel de significados, lista acessível e interface de desfazer/refazer.

Avançar quando edição e organização forem confortáveis em computador e celular.

### Etapa 6 — Persistência

Entregar autosave, mesas salvas, migrações, importação e exportação.

Avançar quando reabrir reproduzir a sessão e preservar o próximo sorteio, com falhas de gravação tratadas.

### Etapa 7 — Acabamento e otimização

Entregar assets finais, revisão de iluminação, áudio opcional, perfis gráficos, acessibilidade e correções de desempenho.

Avançar quando o visual permanecer consistente no perfil baixo e as metas acordadas forem verificadas.

### Etapa 8 — Integração e publicação

Entregar link no Lumina, cache revisado, verificações no workflow e build pronto para publicação.

Validar fluxos diretos, atualização entre versões e falhas no ambiente publicado.

## 17. Verificação

### Automatizada

- Sorteio sem duplicação e preservação da ordem do monte.
- Compatibilidade das inversões com cada baralho.
- Comandos e desfazer/refazer.
- Serialização, migração e validação de importações.
- Criação, salvamento e retomada de sessão.
- Falha de armazenamento e conflito de abas.
- Fluxo principal de navegador.
- Carregamento de assets e tratamento de falhas.
- Navegação direta e caminhos no build publicado.

### Manual e visual

- Beleza, legibilidade e fidelidade das artes.
- Sensação de arraste, rotação e câmera.
- Seleção em sobreposições.
- Conforto em retrato e paisagem.
- Foco, teclado, contraste e movimento reduzido.
- Uso prolongado e aquecimento.
- Perfis gráficos e navegadores representativos.
- Capturas de referência para comparar mudanças visuais.

## 18. Riscos e respostas

| Risco | Resposta planejada |
| --- | --- |
| Cena bonita apenas em máquinas fortes | Validar a cena representativa cedo e manter composição no perfil baixo. |
| Cartas pouco legíveis | Preservar cores, controlar reflexos e oferecer inspeção HTML. |
| Gestos conflitantes | Máquina de estados, captura de ponteiro e bloqueio de câmera durante arraste. |
| Excesso de texturas | Resoluções por necessidade, reutilização e medição de memória. |
| Perda de sessão | Transações, autosave, exportação e erros visíveis. |
| Assets ou HTML antigos em cache | Shells distintos e estratégia de atualização verificada. |
| Expansão excessiva do escopo | Concluir uma leitura completa antes de multiplayer, física e cenários adicionais. |
| Arte sem acabamento | Reservar entregas e revisões de modelagem, iluminação e materiais. |

## 19. Definição de pronto

A primeira versão está pronta quando uma pessoa consegue fazer uma leitura inteira sem instrução externa, manipular e encontrar suas cartas com facilidade, escrever reflexões e retomar a sessão depois, com apresentação bonita também no perfil gráfico baixo.

Além disso:

- As metas de desempenho foram medidas nos dispositivos definidos.
- Os fluxos de teclado e toque estão utilizáveis.
- Falhas de assets e armazenamento têm recuperação compreensível.
- A página principal não recebe o custo de carregar o motor 3D.
- Build, cache e navegação direta funcionam no ambiente de publicação.
- Licenças e origem dos assets estão documentadas.

## 20. Referências técnicas

- [Babylon.js — imports modulares e tree shaking](https://doc.babylonjs.com/setup/frameworkPackages/es6Support/treeShaking/)
- [Babylon.js — especificações do motor](https://www.babylonjs.com/specifications/)
- [Babylon.js — ambientes e iluminação PBR](https://github.com/BabylonJS/Documentation/blob/master/content/features/featuresDeepDive/materials/using/HDREnvironment.md)
- [Babylon.js — otimização de cena](https://doc.babylonjs.com/features/featuresDeepDive/scene/optimize_your_scene)

Arquivos existentes relevantes: `vite.config.js`, `src/data/decks.js`, `src/data/cardArtwork.js`, `src/utils/history.js`, `public/sw.js` e `.github/workflows/deploy.yml`.
