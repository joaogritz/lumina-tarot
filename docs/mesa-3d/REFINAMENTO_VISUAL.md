# Refinamento visual e interação com o monte

A mesa usa a mesma linguagem do Lumina: obsidiana, marfim, dourado envelhecido, Cormorant Garamond e Outfit. As fontes são hospedadas no projeto, com as licenças OFL. A HUD tem ícones vetoriais, ferramentas de virar/descartar, atalhos visíveis e painéis adaptados ao toque.

## Direção visual

- Nogueira com mapas reais de cor, relevo e rugosidade; verniz acetinado e marchetaria metálica.
- Bordas arredondadas e chanfradas, com normais planas nas tampas e suaves no contorno para evitar reflexos triangulares.
- Tecido azul com relevo de trama, sheen de tecido, bordado celeste e numerais em resolução maior.
- HDRI pré-filtrado local para luz indireta e reflexos do latão. O arquivo publicado tem cerca de 237 KB; o HDR bruto não entra no build.
- Piso de pedra noturna, órbitas de latão, instrumento celeste e Lua atrás da mesa. Fundo em tons violetas, âmbar e azul, com vinheta discreta.
- Velas em alturas diferentes, castiçais, pavios, caixa com gravação Lumina, cristais e esfera armilar com base.
- Mesmo verso do santuário e bandeja para as cartas descartadas.

Os materiais PBR têm tratamento de exposição e tone mapping próprio. As ilustrações ficam sem iluminação, neblina ou gradação global, preservando suas cores e proporções. O brilho é seletivo nas chamas, sem desfocar a área de leitura.

## Revisão de modelagem, luz e animação (novembro de 2026)

A mesa é uma experiência de desktop, então os perfis médio e alto passaram a usar recursos mais pesados do Babylon.js.

### Modelagem
- **Cartas** com 1,72 × 3 de espessura real, cantos arredondados (raio 0,1) e borda dourada, como num baralho impresso. O corpo usa `roundedSlab` (`scene/geometry.ts`), com dois sub-meshes (faces de papel e borda) e um `MultiMaterial`. A face da arte é um `roundedPlane` com o mesmo arredondamento.
- **Monte e pilha de descartes** com a mesma geometria. A lateral do monte usa folhas douradas listradas, que se comprimem conforme as cartas saem.
- **Notas** como fichas de pergaminho com cantos arredondados e borda tingida.
- **Castiçais torneados** por `CreateLathe` (pé, molduras, haste e aparador) e **velas** com borda derretida e escorridos de cera, num único mesh mesclado.
- **Chamas** em gota com núcleo mais claro, as duas giradas a partir do mesmo perfil.
- **Cristais de quartzo** em aglomerado: prismas hexagonais com ponta piramidal, sombreamento facetado e índice de refração do quartzo.
- **Esfera armilar** com anéis de meridiano, eclíptica inclinada, eixo e globo central.
- **Couro** da bandeja e da caixa com granulação e pesponto dourado.

### Luz e materiais
- Clima de luz de velas: luz ambiente e de ambiente HDR bem reduzidas, um luar frio e fraco nas sombras e névoa mais densa ao fundo.
- Luz principal mais baixa, quente e discreta, para que cartas e objetos projetem sombras legíveis.
- Foco de leitura (`SpotLight`) forte e concentrado, somado a um poço de luz pintado no tecido: a área de leitura brilha e a borda cai no escuro.
- Luz das velas baixa e quente, com alcance controlado (queda padrão), aquecendo latão, cera e madeira ao redor; brilho mais intenso nas chamas.
- Vinheta em CSS sobre o canvas, em vez de na imagem processada, para não aplicar a correção de gama duas vezes.
- Cera com translucidez (`PBRMaterial.subSurface`) e o mesmo tone mapping ACES dos demais materiais PBR.
- Sombra de contato suave em todos os perfis, deslocada no sentido da luz principal e mais difusa quando a carta é levantada.

### Animação
O controlador fica em `cards/motion.ts` e roda dentro do ciclo de renderização da mesa, com curvas de easing próprias.
- **Voo** (puxar, devolver, descartar): aceleração suave, arco proporcional à distância, inclinação no sentido do voo e giro até o ângulo final.
- **Virar**: a carta gira apoiada na borda longa, como ao virar uma carta à mão, e troca de face no momento em que fica de perfil.
- **Deslize**: mover, girar, selecionar, desfazer, refazer e soltar uma carta arrastada deslizam em vez de saltar. Cancelar um arrasto devolve a carta na hora, para que um novo clique imediato a encontre.
- **Arrastar**: a carta sobe um pouco mais e inclina na direção do movimento.
- **Embaralhar**: duas metades do monte se afastam, curvam e se intercalam (riffle), depois se acertam.
- **Ambiente**: chamas tremulando com ruído em camadas, a luz das velas oscilando junto e a esfera armilar girando devagar.

## Retirar uma carta

Segure o topo do monte e arraste para a área de leitura. A representação acompanha o ponto tocado, elevada sobre a mesa. Durante o gesto não há retirada do baralho, escrita em disco nem entrada no histórico. Ao soltar fora do monte, um único comando registra a carta e sua posição. Ela se acomoda suavemente no lugar.

Escape, interrupção de toque, perda de captura, perda de foco ou um segundo dedo cancelam a retirada. Soltar novamente sobre o monte também cancela. A ordem do baralho permanece idêntica. Dois dedos passam a navegar na câmera.

O botão Puxar e a tecla D continuam disponíveis: a carta percorre um arco desde o monte até a posição inicial. Virar faz a carta se elevar e girar, trocando a face na passagem pela borda. Descartar a leva até a bandeja; devolver a leva ao monte. Toda animação representa um comando já definido no documento, sem tornar os objetos do motor fonte do estado.

## Atalhos

| Tecla | Ação |
| --- | --- |
| D | Puxar carta |
| F | Virar a carta selecionada, inclusive com um controle da HUD em foco |
| Espaço / Enter | Virar quando o canvas está em foco |
| Delete / Backspace | Descartar carta ou excluir nota |
| R | Girar 15 graus |
| Shift R | Alternar inversão no Tarot |
| [ / ] | Selecionar carta anterior / seguinte |
| Setas | Mover seleção com o canvas em foco |
| Shift + setas | Mover em passos maiores |
| Ctrl/Cmd Z | Desfazer |
| Ctrl/Cmd Shift Z | Refazer |
| Esc | Cancelar gesto ou fechar painel |
| ? | Abrir ajuda de teclado |

Campos, áreas editáveis e diálogos mantêm o comportamento convencional de teclado. Segurar uma tecla não retira ou descarta múltiplas cartas. Os botões e a lista HTML continuam disponíveis.

## Perfis e ciclo de renderização

Média é a escolha inicial quando não existe preferência salva.

| Perfil | O que acrescenta |
| --- | --- |
| Baixa | Mesma composição, sombras de contato, resolução levemente reduzida e FXAA. Cena ociosa não desenha nenhum quadro. |
| Média | Sombras PCF, brilho das chamas, `DefaultRenderingPipeline` (MSAA 4×, FXAA, bloom só acima de 1) e modo ambiente: cerca de 20 quadros por segundo com a mesa parada, para as chamas e a esfera armilar. |
| Alta | Supersampling (renderiza a pelo menos 1,5× a resolução da tela, até 2×), MSAA 8× ou o máximo da GPU, FXAA, sombras maiores e oclusão ambiente (`SSAO2RenderingPipeline`, quando WebGL2 está disponível). |

A nitidez (sharpen) do pipeline fica desligada, porque realça as bordas serrilhadas que o antisserrilhamento remove. Com pós-processamento ativo, o antisserrilhamento do próprio canvas deixa de valer; por isso o MSAA é configurado no pipeline.

O processamento de imagem continua por material: o pós-processamento não aplica gradação global, e as artes mantêm as cores originais. Movimento reduzido aplica os estados finais sem voos, giros, embaralhamento nem modo ambiente.

`engine/framePacer.ts` usa um fence WebGL2 com consulta de tempo zero para limitar a um o número de quadros pendentes na GPU. A interface não é bloqueada esperando a GPU. Em WebGL1, o caminho segue sem fences. A medição inclui o número de quadros adiados por pressão da GPU. Isso impede que uma animação curta gere uma longa fila de quadros em renderizadores lentos; não certifica uma taxa de FPS em aparelhos físicos.

O carregamento espera materiais, imagens e a conclusão de um quadro visível, em vez de esconder o carregador antes da primeira apresentação. Trocas de perfil e resize invalidam a apresentação até haver um novo quadro completo. A aba oculta continua pausada. No perfil baixo, a cena ociosa não envia novos quadros; nos perfis média e alta, o modo ambiente limita a cerca de 20 quadros por segundo.

Em desenvolvimento, a mesa não registra service worker. Uma limpeza limitada ao registro antigo de desenvolvimento libera o controle da página, sem tocar nas mesas do IndexedDB. Em produção, o service worker preserva os shells separados e não guarda o grafo de módulos do Vite.

## Referências pesquisadas

- [Babylon — Mastering PBR](https://doc.babylonjs.com/features/featuresDeepDive/materials/using/masterPBR/): materiais físicos, iluminação indireta, normal maps, roughness, clear coat e sheen.
- [Babylon — HDR Environment](https://doc.babylonjs.com/features/featuresDeepDive/materials/using/HDREnvironment/): preferência por ENV pré-filtrado para evitar a conversão do HDR na abertura da mesa.
- [Babylon — Shadows](https://doc.babylonjs.com/features/featuresDeepDive/lights/shadows/): geradores de sombra, filtragem e seleção dos objetos que projetam/recebem sombras.
- [Babylon — Advanced Animations](https://doc.babylonjs.com/features/featuresDeepDive/animation/advanced_animations/): easing para movimentos legíveis. O controlador usa CubicEase do Babylon e vetores do motor, mantendo a vida das animações no ciclo existente.
- [Babylon — Default Rendering Pipeline](https://doc.babylonjs.com/features/featuresDeepDive/postProcesses/defaultRenderingPipeline): efeitos e seus custos. A implementação usa brilho seletivo nas velas e processamento por material, preservando as artes sem DOF ou gradação global.
- [Khronos — WebGL 2, sync objects](https://registry.khronos.org/webgl/specs/latest/2.0/): fence e consulta não bloqueante.
- [Poly Haven — licença](https://polyhaven.com/license): origem e termos dos assets gratuitos. A lista completa está em `public/mesa-3d/ASSETS.md`.

As referências orientam decisões concretas da implementação. A validação de desempenho em GPU física, aquecimento e Safari/iOS continua separada dos testes locais em Chromium/SwiftShader.

## Medição e verificação desta revisão

No cenário de 78 cartas reveladas em Chromium/SwiftShader, a simplificação dos anéis e o agrupamento das marcas do piso reduziram os índices reportados de aproximadamente 278 mil para 26 mil triângulos. A cena otimizada registrou 288 malhas, 275 draw calls e aproximadamente 110 MB de texturas estimadas no perfil baixo. Essa comparação é com a primeira montagem do cenário refinado; a cena antiga tinha menos objetos e materiais.

A amostra de CPU de entrada inclui compilação de shaders e poucos quadros, portanto não mede FPS sustentado. Os testes confirmam a parada da renderização ociosa, a limitação da fila da GPU, a integridade dos dados e a restauração de um quadro visível após perda de contexto. As metas em aparelhos físicos continuam dependendo de medições nesses aparelhos.

A retirada, os cancelamentos e os atalhos foram verificados no navegador; os comandos e o redirecionamento de animações para a posição/rotação mais recente têm testes de regra. A criação de IDs também funciona quando `crypto.randomUUID` não é exposto em HTTP de rede local, usando `crypto.getRandomValues` para UUID v4. Isso permite testar a mesa no celular pelo endereço da rede do servidor Vite.

[Captura do baralho completo](references/full-deck.png).

### Devolver e embaralhar

A barra principal expõe Devolver (B) e Embaralhar (S). Soltar uma carta sobre o bolo também a devolve, com a animação de retorno existente. A devolução e o embaralhamento são ações independentes no histórico. Embaralhar afeta apenas as cartas restantes e anima o monte, respeitando movimento reduzido; cartas na mesa e descartes são preservados. Os controles ficam desabilitados quando não há carta selecionada ou há menos de duas cartas no bolo, respectivamente.

### Carta que salta, giro lateral e áudio

Cada embaralhamento pela interface ou pelo atalho S sorteia uma chance de 1 em 50 de uma carta saltar fechada para a mesa, com arco mais alto. A saída e o embaralhamento formam uma única ação no histórico; refazer preserva o resultado sorteado. O botão De lado, o atalho L e a ação Girar 90° no inspetor giram a carta sem alterar sua inversão no Tarot. O embaralhamento acompanha um som de papel sintetizado localmente com Web Audio, sem assets externos. Configurações permite desativar o som, com preferência persistida no navegador.
- [Babylon — Default Rendering Pipeline](https://doc.babylonjs.com/features/featuresDeepDive/postProcesses/defaultRenderingPipeline): MSAA, FXAA, bloom e nitidez; bloom com limiar acima de 1 para afetar só as chamas em HDR.
- [Babylon — SSAO Rendering Pipeline](https://doc.babylonjs.com/features/featuresDeepDive/postProcesses/SSAORenderPipeline): oclusão ambiente com razão abaixo de 1 para controlar o custo.
- [Babylon — Lights](https://doc.babylonjs.com/features/featuresDeepDive/lights/lights_introduction): spot e área; a luz de área com textura do Babylon 9 foi avaliada, mas o foco com queda padrão atende ao poço de luz com menos custo.
- [Babylon.js 9.0](https://blogs.windows.com/windowsdeveloper/2026/03/26/announcing-babylon-js-9-0/): luz volumétrica, sombras dinâmicas de IBL e iluminação em clusters foram avaliadas e ficaram de fora por exigirem WebGPU/compute ou não trazerem ganho visível numa cena deste tamanho.

