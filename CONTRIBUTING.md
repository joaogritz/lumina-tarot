# Como contribuir

Obrigado pelo interesse! Este guia resume o necessário para propor uma mudança.

## Preparar o ambiente

Use Node.js 22 e npm.

```sh
npm ci
npm run dev                       # http://localhost:5173 e /mesa-3d/
npx playwright install chromium   # uma vez, para os testes de navegador
```

## Antes de abrir um pull request

Rode as mesmas verificações do CI:

```sh
npm run lint
npm test
npm run typecheck
npm run test:mesa
npm run build
npm run test:browser
```

Todas precisam passar. O job `test` do GitHub Actions roda em todo PR, e a `main` só publica
o site depois que ele passa.

## Diretrizes

- **Uma mudança por PR**, com descrição do que mudou, por quê e como foi testado.
- **Mensagens de commit** no formato `tipo(escopo): descrição`, como `fix(mesa): …`,
  `feat(diary): …` ou `docs: …`.
- **Testes:** inclua ou atualize testes para mudanças de comportamento. Regras do Worker e do
  diário ficam em `tests/*.test.mjs`; a Mesa 3D tem `tests/mesa-3d.test.ts` e testes de navegador.
- **Interface em português**, com textos claros e sem jargão técnico para quem usa o site.
- **Acessibilidade:** mantenha foco visível, rótulos em botões só com ícone e suporte a
  movimento reduzido.
- **Segurança e privacidade:** nunca coloque segredos em `VITE_*`. Mudanças que enviem novos
  dados para fora do navegador precisam atualizar a [política de privacidade](public/privacidade.html).
- **Artes:** só inclua imagens com licença compatível e documente a origem em `public/tarot/`.

## Reportar problemas

Use os modelos de issue para bugs e sugestões. Vulnerabilidades seguem o [SECURITY.md](SECURITY.md).
