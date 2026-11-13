// Questions the oracle never reads: self-harm (answered with crisis-line guidance) and contact
// with the dead. Patterns cover Portuguese, English, Spanish and French whatever the interface
// language, since a visitor may type in any of them. \p{L} keeps accented letters inside words.
const words = (parts) => new RegExp(`(?<!\\p{L})(?:${parts.join('|')})(?!\\p{L})`, 'iu');

export const SELF_HARM_REGEX = words([
  // pt
  'suic[ií]d\\p{L}*', 'me\\s+matar', 'morrer', 'automutila\\p{L}*', 'tirar\\s+a\\s+(?:minha\\s+)?vida',
  'cortar\\s+os\\s+pulsos', 'acabar\\s+com\\s+a\\s+(?:minha\\s+)?vida', 'acabar\\s+com\\s+tudo', 'me\\s+enforcar', 'quero\\s+morrer',
  // en
  'kill\\s+myself', 'killing\\s+myself', 'end\\s+my\\s+(?:own\\s+)?life', 'take\\s+my\\s+(?:own\\s+)?life', 'want\\s+to\\s+die',
  'self[-\\s]?harm\\p{L}*', 'cut(?:ting)?\\s+myself', 'hang\\s+myself', 'end\\s+it\\s+all',
  // es
  'matarme', 'quitarme\\s+la\\s+vida', 'quiero\\s+morir(?:me)?', 'autolesi\\p{L}*', 'acabar\\s+con\\s+mi\\s+vida',
  'cortarme\\s+las\\s+venas', 'ahorcarme',
  // fr
  'me\\s+tuer', 'mettre\\s+fin\\s+[àa]\\s+mes\\s+jours', 'en\\s+finir', 'je\\s+veux\\s+mourir', 'envie\\s+de\\s+mourir',
  'automutil\\p{L}*', 'me\\s+pendre',
]);

export const NECROMANCY_REGEX = words([
  // pt
  'parente\\s+morto', 'parente\\s+falecid\\p{L}*', 'falar\\s+com\\s+(?:o\\s+|a\\s+)?(?:morto|morta|falecid\\p{L}*|esp[ií]rito)',
  'psicograf\\p{L}*', 'alma\\s+do\\s+meu', 'alma\\s+da\\s+minha', 'falar\\s+com\\s+quem\\s+morreu', 'esp[ií]rito\\s+do\\s+meu',
  // "medium" alone also names sizes and time frames (medium-term, médio prazo).
  'm[eé]dium(?![-\\s]*(?:term|prazo|plazo|terme|size|sized|rare|well))', 'incorporar',
  // en
  'talk\\s+(?:to|with)\\s+(?:my\\s+)?(?:dead|deceased|late)\\s+\\p{L}+', 'speak\\s+(?:to|with)\\s+the\\s+dead', 'contact\\s+(?:the\\s+)?dead',
  '(?:dead|deceased)\\s+(?:relative|mother|father|mom|mum|dad|grand\\p{L}+|husband|wife|friend|son|daughter)',
  'spirit\\s+of\\s+my', 's[ée]ance',
  // es
  'hablar\\s+con\\s+(?:mi\\s+|el\\s+|la\\s+)?(?:difunt\\p{L}*|muert\\p{L}*|fallecid\\p{L}*|esp[ií]ritu)', 'familiar\\s+(?:muerto|fallecido)',
  'alma\\s+de\\s+mi', 'esp[ií]ritu\\s+de\\s+mi',
  // fr
  'parler\\s+(?:[àa]|avec)\\s+(?:mon\\s+|ma\\s+|mes\\s+|les\\s+)?(?:d[ée]funt\\p{L}*|morts?|d[ée]c[ée]d[ée]\\p{L}*|esprits?)',
  'contacter\\s+(?:les\\s+)?morts', '[âa]me\\s+de\\s+(?:mon|ma)', 'esprit\\s+de\\s+(?:mon|ma)', 'spiritisme',
]);
