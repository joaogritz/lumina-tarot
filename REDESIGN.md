# Redesign do Lumina Tarot

## Escopo

Implementação sobre o frontend existente em React 19, Vite 6, Tailwind 4, Framer Motion e Lucide. A aplicação tem uma única página; TarotTable mantém o estado das oito tiragens, dos dois baralhos e das janelas carregadas sob demanda. Não existem páginas de autenticação ou pagamento neste projeto.

O catálogo, as regras de escolha e inversão, as interpretações, os contratos HTTP, o Worker, o histórico e as chaves de persistência foram preservados. As alterações em theme.js são valores de apresentação. Nenhuma dependência foi adicionada ao projeto.

## Sistema visual

- Tokens em src/index.css: obsidiana, ouro antigo, marfim, pergaminho, superfícies, bordas, movimento e profundidade.
- Cormorant Garamond para a composição editorial; Outfit para texto e controles, com fontes de sistema como alternativa.
- Entrada com a artwork clássica Rider–Waite–Smith da Estrela, perspectiva por CSS e instrumento astronômico SVG reutilizável.
- Mesa aberta, navegação discreta, cartas sobrepostas em fileiras, novos versos gravados e revelação do destino sem explosões ou confete.
- Janelas, diário, grimório, formulários, resultados e estados de erro integrados à mesma paleta.
- Poeira de baixa densidade, textura estática e cursor complementar, mantendo o cursor nativo. Movimento reduzido e toque desativam os efeitos correspondentes.
- O canvas pausa em abas ocultas e desenha apenas uma imagem quando movimento reduzido está ativo. Listeners e quadros são removidos no desmontar.

## Verificação

- npm test: 14 testes (11 existentes e 3 de integridade, mapeamento e compatibilidade das artworks) de catálogos, interpretações, histórico e contrato do Worker.
- npm run build: geração de produção com os chunks existentes e modais sob demanda.
- Chromium/Playwright: entrada, filtros, busca e estado vazio, seleção, inspeção por teclado, restauração de foco, interpretação local após falha simulada de rede, salvamento e consulta do diário, troca e cancelamento de baralho, preservação da pergunta, bloqueio de inversões em Lenormand, sorteio do destino, temas e formulário de sim/não.
- Oito tiragens preenchidas em 360 e 768 pixels; revisão adicional em 390 e 1440 pixels. Sem excesso de largura da página nos casos verificados.
- Inspeção visual da entrada, mesa, interpretação, detalhes e Cruz Céltica; ajustes de dimensões, rótulos e altura útil das ilustrações.
- Axe-core, critérios WCAG 2 A/AA: nenhuma violação automática nas telas verificadas de entrada, mesa desktop/mobile, interpretação e detalhes. Isso não substitui uma auditoria manual com tecnologias assistivas.

O serviço externo de IA não foi alterado. A regressão utiliza falha de rede simulada para verificar o fallback; não comprova disponibilidade ou qualidade do provedor em produção. Áudio, compartilhamento nativo e comportamento offline continuam dependentes dos recursos e permissões do navegador.

## Executar

Com Node e npm disponíveis, use npm ci e npm run dev. Para produção, use npm run build; a saída permanece em dist.

## Segunda etapa: artwork real das cartas

A representação programática foi substituída em todo o site pelo componente `src/components/cards/TarotCard.jsx`, com estilos próprios em `tarot-card.css`. O adaptador `CardArt` mantém os pontos de integração existentes. Foram removidos o antigo renderer de SVGs/ícones e `LenormandSymbol`.

São 78 digitalizações clássicas Rider–Waite–Smith e 36 cartas históricas de Das Spiel der Hofnung para o Petit Lenormand. As imagens e miniaturas são WebP locais. A artwork inteira é preservada com `object-fit: contain`; apenas as margens entre cartas da prancha Lenormand foram separadas. Fontes, condições de uso, dimensões, retângulos de extração e hashes estão em `public/tarot/sources.json`, com documentação por coleção nos arquivos LICENSE.md correspondentes.

O verso SVG é original do Lumina. O objeto físico possui moldura dupla, espessura simulada, textura baixa e foil limitado às bordas. O movimento usa eventos delegados do React e `requestAnimationFrame` para propriedades CSS, sem atualizar estado React a cada movimento do ponteiro. O tilt é limitado a ±4°/±5° e desativado em toque ou movimento reduzido. O flip existente dura 900 ms e tem frente e verso separados; a inversão continua aplicada apenas à artwork.

As variantes pequenas priorizam imagem e numeral; resultados e detalhes usam arte maior. Abertura carrega somente a carta de destaque, cartas sorteadas são carregadas imediatamente e imagens de catálogo/diário são lazy. O carregamento faz uma transição entre verso e artwork; falha de imagem mantém uma indicação legível sem voltar a emojis. Leituras antigas recebem a arte pelo mesmo ID, sem migração de armazenamento.

A verificação adicional inclui decodificação dos 114 arquivos e miniaturas, renderização das 114 cartas no Chromium, carregamento inicial de uma única artwork, alt text, inversões, imagem ausente, comportamento de ponteiro/toque/movimento reduzido e revisão visual de contato das duas coleções. A comparação integral dos catálogos confirmou que todos os campos anteriores, exceto a nova referência visual, permanecem iguais.
