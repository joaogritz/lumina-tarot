# Changelog

Mudanças relevantes do projeto. O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e as versões seguem [SemVer](https://semver.org/lang/pt-BR/).

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

[1.1.0]: https://github.com/joaogritz/lumina-tarot/compare/20522f3...HEAD
[1.0.2]: https://github.com/joaogritz/lumina-tarot/pull/2
[1.0.1]: https://github.com/joaogritz/lumina-tarot/pull/1
