# Changelog

Mudanças relevantes do projeto. O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e as versões seguem [SemVer](https://semver.org/lang/pt-BR/).

## [Não lançado]

### Adicionado
- A interpretação surge enquanto é escrita: as primeiras palavras aparecem em cerca de 1 s, cada uma
  emergindo de um brilho dourado, em vez de a leitura inteira chegar depois de ~9 s. O Worker
  transmite a resposta do Gemma por server-sent events quando o site pede (`Accept: text/event-stream`);
  o Sim ou Não continua em JSON.
- **Gerar Imagem**: cria uma imagem 1080×1920 (formato dos Stories) com a pergunta, as cartas e o
  conselho do oráculo, assinada com luminatarot.app. No celular abre o menu de compartilhar; no
  computador, salva o arquivo. Tudo é desenhado no navegador.

### Alterado
- O botão que remove uma carta da tiragem segue o visual do site (dourado sobre obsidiana).

### Corrigido
- Cartas do Baralho Cigano recortadas de novo da prancha original, cada uma pela própria borda: antes
  algumas vinham com o topo cortado, fundo branco ou um pedaço da carta vizinha. No site, a imagem
  ocupa a moldura na proporção da carta, e o número, já impresso na arte, não se repete acima dela.
- Interpretações mais confiáveis e rápidas: o Worker usa o Cloudflare Workers AI (Gemma 4 26B, com
  gpt-oss-120b de reserva) e deixa o Gemini como último recurso, dentro de um prazo único de 29 s.
  Uma Cruz Céltica sai em ~9 s. O Gemini 2.5 não está mais disponível para chaves novas, e o plano
  gratuito do Gemini 3 recusa ou atrasa consultas em horários de pico.
- O site não gera mais leituras locais: se o serviço não responder, mostra um aviso com
  **Tentar novamente**, mantendo as cartas. As salvaguardas éticas continuam locais.

## [1.2.1] - 2026-11-04

### Alterado
- Domínio próprio: o site oficial passa a ser https://luminatarot.app (Vercel), com
  `www.luminatarot.app` redirecionando para ele.
- O Worker de interpretação responde em https://api.luminatarot.app; o endereço antigo em
  `workers.dev`, que expunha o usuário de email do mantenedor, deixa de ser usado pelo site.
- Prévia em redes sociais, sitemap, robots, CSP e documentação apontam para o domínio novo.
- GitHub Pages descontinuado; publicação somente pela Vercel, com cabeçalhos de segurança em `vercel.json`.

## [1.2.0] - 2026-11-04

### Alterado
- Mesa 3D: cartas, monte e descartes com espessura, cantos arredondados e bordas douradas; notas como
  fichas de pergaminho; castiçais torneados, velas de cera translúcida com escorridos, chamas em gota,
  aglomerado de cristais facetados, esfera armilar completa e couro com pesponto.
- Mesa 3D: luz principal mais inclinada, foco de leitura, poço de luz no tecido e sombras de contato em
  todos os perfis; pós-processamento (MSAA, FXAA, bloom, nitidez) no perfil médio e oclusão ambiente no alto.
- Mesa 3D: clima de luz de velas, com ambiente escuro, foco de leitura forte, velas aquecendo o canto da
  mesa e vinheta; antisserrilhamento em todos os perfis (FXAA no baixo, MSAA 4× no médio, supersampling
  e MSAA 8× no alto) e nitidez desligada.
- Mesa 3D: animações de voo, virada pela borda, deslize em comandos e ao soltar, inclinação no arrasto,
  embaralhamento riffle, chamas tremulando e esfera armilar girando (perfis médio e alto).

## [1.1.1] - 2026-11-03

### Alterado
- A interpretação online é sempre usada; removida a opção de interpretar só no aparelho.
- O site não menciona mais a IA em títulos, descrições, manifest e imagem de prévia. O envio
  de dados ao Google Gemini continua descrito na política de privacidade, linkada no rodapé e
  na janela da interpretação.

## [1.1.0] - 2026-11-03

### Segurança
- O Worker passou a recusar por padrão: exige origem listada em `ALLOWED_ORIGINS` (sem exceção
  para requisições sem `Origin`, painel da Cloudflare ou localhost), exige o rate limiter e recusa
  se ele falhar, tenta no máximo dois modelos por consulta e lê o corpo com limite de tamanho.
- Removidas as rotas que listavam modelos com a chave do Gemini; `GET /health` substitui o teste.
- Mensagens de erro do Worker não revelam mais a configuração.
- Content-Security-Policy e Referrer-Policy em todas as páginas do build.
- Fontes servidas pelo próprio site, sem chamadas ao Google Fonts.
- A importação do diário descarta referências de imagem vindas do arquivo.
- Dependências de desenvolvimento atualizadas (`npm audit`: 0 vulnerabilidades).
- Actions do CI fixadas por SHA; Dependabot para npm e actions.

### Adicionado
- Aviso de privacidade sob o campo de pergunta, com opção de interpretação só no aparelho.
- [Política de privacidade](public/privacidade.html) e aviso de que as leituras não substituem
  orientação profissional.
- Ícones PNG para instalação como app (Android e iOS).
- ESLint no projeto e no CI.
- SECURITY.md, CONTRIBUTING.md, modelos de issue e de pull request, `wrangler.example.toml`.

### Corrigido
- O detalhe da carta chamava um hook do React condicionalmente, o que podia derrubar a página.
- Mesa 3D: a gravação da câmera podia ficar adiada indefinidamente enquanto a inércia mexia a
  câmera; agora as gravações acontecem no máximo 450 ms depois da mudança. Isso também tornava o
  teste de pinça intermitente no CI.

## [1.0.2] - 2026-11-03

### Adicionado
- Exportar e importar o diário em JSON.
- Testes em todo pull request; publicação só a partir da `main`.

## [1.0.1] - 2026-11-03

### Corrigido
- Mesa 3D: um segundo arrasto logo após cancelar (Escape) errava a carta e girava a câmera.

### Alterado
- Cartas, grade do baralho, legibilidade, posições vazias e prévia em redes sociais.

[1.2.1]: https://github.com/joaogritz/lumina-tarot/compare/f6abb1c...HEAD
[1.2.0]: https://github.com/joaogritz/lumina-tarot/pull/16
[1.1.1]: https://github.com/joaogritz/lumina-tarot/pull/11
[1.1.0]: https://github.com/joaogritz/lumina-tarot/pull/3
[1.0.2]: https://github.com/joaogritz/lumina-tarot/pull/2
[1.0.1]: https://github.com/joaogritz/lumina-tarot/pull/1
