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

Média é a escolha inicial quando não existe preferência salva. Baixa mantém a mesma composição, usa sombras de contato e resolução reduzida; média acrescenta sombras PCF e brilho seletivo; alta aumenta resolução e qualidade das sombras. Movimento reduzido aplica os estados finais sem os voos e giros.

`engine/framePacer.ts` usa um fence WebGL2 com consulta de tempo zero para limitar a um o número de quadros pendentes na GPU. A interface não é bloqueada esperando a GPU. Em WebGL1, o caminho segue sem fences. A medição inclui o número de quadros adiados por pressão da GPU. Isso impede que uma animação curta gere uma longa fila de quadros em renderizadores lentos; não certifica uma taxa de FPS em aparelhos físicos.

O carregamento espera materiais, imagens e a conclusão de um quadro visível, em vez de esconder o carregador antes da primeira apresentação. Trocas de perfil e resize invalidam a apresentação até haver um novo quadro completo. A aba oculta continua pausada e a cena ociosa não envia novos quadros.

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
