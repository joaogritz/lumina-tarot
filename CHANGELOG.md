# Changelog

Mudanças relevantes do projeto. O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e as versões seguem [SemVer](https://semver.org/lang/pt-BR/).

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
