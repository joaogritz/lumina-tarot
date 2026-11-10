# Experimento: Maison Lumina

Branch `experimento/maison`, separada da `main`. É um teste de direção de arte: a ideia é ver se o site
ganha cara de casa de luxo antes de decidir se fica.

## Princípios

- **Menos por tela.** Um foco de cada vez, muito espaço vazio e capítulos numerados (I A pergunta,
  II A tiragem, III A mesa, IV O baralho).
- **Paleta curta.** Tinta (#0a0908), marfim (#ece6da), pedra (#a39b8c) e um dourado champanhe
  (#b5955c) usado só em filetes e detalhes, nunca como brilho.
- **Tipografia editorial.** Cormorant Garamond grande e alinhada à esquerda nos títulos e na leitura,
  Outfit em caixa alta espaçada nos rótulos. Nenhum texto abaixo de 12 px.
- **Sem marcas de "site genérico".** Nada de brilho em volta de caixas, degradês, pisca-pisca,
  emojis como ícone ou etiquetas em pílula.
- **Tom discreto.** Os textos dizem menos: "Ler as cartas" em vez de "Revelar interpretação",
  "Tirar ao acaso" em vez de "Tiragem do Destino".

## O que mudou

| Onde | Antes | Agora |
|---|---|---|
| Cabeçalho | ~10 botões soltos | Barra com Menu, LUMINA e Diário; menu em tela cheia com índice numerado e preferências |
| Abertura | Título centralizado e campo com brilho | Capítulo I assimétrico: título grande à esquerda, pergunta à direita sobre um filete |
| Tiragens | Abas com ícone, pílula e brilho | Índice em texto, número em itálico, filete dourado na ativa |
| Mesa | Título com marcador, contador em pílula | Título editorial, descrição em itálico, contador e "Recolher" em texto |
| Baralho | Grade de 78 versos ("parede") | Fileiras ordenadas de cartas sobrepostas, como um baralho aberto; a carta sobe ao passar o mouse |
| Leitura | Caixas com emojis 🔍 💡 🧭 | Página impressa: pergunta como título, data, capítulos I, II, III, capitular dourada, conselho como citação |
| Rodapé | Frase mística centralizada | Assinatura, aviso e atalhos em duas colunas |
| Textos | "Consagração", "Destino", "Sagrado" | Linguagem simples e elegante |

Arquivos: `src/maison.css` (todo o visual novo, importado por último em `src/main.jsx`),
`src/components/Header.jsx` (reescrito), e ajustes em `TarotTable`, `InterpretationModal`,
`SpreadArea`, `DeckSelectionGrid` e textos de outros componentes.

**Para voltar ao visual anterior:** basta não fazer merge desta branch. Para manter só parte dela,
`src/maison.css` concentra o estilo; o cabeçalho e os textos são as mudanças de componente.

## Achado à parte

A fonte `public/fonts/cormorant.woff2` desenha os **circunflexos (ê, ô, â) soltos acima da letra**,
enquanto agudo e til saem certos. Isso já acontece no site atual, em qualquer título com "você",
"três" etc. O título do experimento evita a palavra, mas o arquivo da fonte precisa ser trocado
por uma versão correta, nesta branch ou na `main`.

## Próximos passos, se a direção for aprovada

- Revelação cerimonial das cartas antes do texto da leitura.
- Reflexo de folha de ouro que acompanha o mouse nas cartas reveladas.
- Tratamento uniforme das imagens das cartas (cor e moldura próprias).
- Levar a mesma linguagem às outras janelas (Sim ou Não, Grimório, Diário, Carta do dia) e à tela
  de entrada.
- Atmosferas (temas) refeitas como edições: Noir, Ivoire (clara), Bordeaux.
