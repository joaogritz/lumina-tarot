# Lumina Tarot

[![CI](https://github.com/joaogritz/lumina-tarot/actions/workflows/ci.yml/badge.svg)](https://github.com/joaogritz/lumina-tarot/actions/workflows/ci.yml)
[![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-c9a45c)](LICENSE)

**[Abrir o Lumina →](https://luminatarot.app/)**

![Lumina Tarot: a carta A Estrela sobre o verso dourado do baralho](public/og-image.png)

Uma mesa virtual de Tarot e Baralho Cigano para explorar cartas, fazer tiragens e registrar reflexões. A experiência está em português, com artes históricas dos baralhos, temas visuais, animações e trilha sonora.

Desenvolvido com React, Vite e Tailwind CSS. O frontend é estático e é publicado na Vercel; as interpretações online usam um serviço separado em Cloudflare Workers.

## Recursos

- **Dois baralhos:** Tarot com 78 cartas e Baralho Cigano / Petit Lenormand com 36 cartas.
- **Tiragens guiadas:** carta única, passado/presente/futuro e outras disposições de Tarot, incluindo Cruz Céltica. No Cigano, estão disponíveis carta única, três cartas e tiragem livre.
- **Tiragem livre:** escolha de 1 a 10 cartas, sem significados fixos por posição.
- **Escolha manual ou sorteio**, com inversões opcionais no Tarot.
- **Sim ou Não**, com uma carta e interpretação para a pergunta.
- **Carta do dia e grimório**, para consultar os significados das cartas.
- **Diário de leituras**, salvo no navegador, com histórico, estatísticas e backup em arquivo JSON.
- **Mesa Livre 3D**, uma mesa independente para dispor cartas, notas e posições livremente.
- **Temas, áudio e interface adaptada a dispositivos móveis.**

As leituras são propostas de reflexão simbólica. O resultado de Sim ou Não não representa uma probabilidade calculada.

## Executar localmente

Use Node.js 22 e npm.

```sh
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite, normalmente `http://localhost:5173`.

| Comando | Função |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run lint` | Verifica o código com ESLint. |
| `npm test` | Executa os testes de dados, interpretação, histórico e Worker com o runner do Node.js. |
| `npm run typecheck` | Verifica os tipos do código TypeScript da Mesa 3D. |
| `npm run test:mesa` | Executa os testes das regras da Mesa 3D. |
| `npm run test:browser` | Executa os testes de navegador com Playwright (instale antes o Chromium com `npx playwright install chromium`). Requer um build. |
| `npm run build` | Gera o site estático em `dist/`. |
| `npm run preview` | Serve o build localmente para conferência. |

## Interpretações e privacidade

Ao consultar uma tiragem ou o Sim ou Não, a aplicação gera uma interpretação online por meio de um Cloudflare Worker. O Worker consulta primeiro um modelo do Cloudflare Workers AI e, se ele falhar, o Google Gemini. Não há leitura gerada localmente: se nenhum dos dois responder, o site avisa que não foi possível consultar e oferece **Tentar novamente**, mantendo as cartas tiradas. As salvaguardas éticas (temas como autolesão) respondem localmente, sem consultar o serviço.

A interface não menciona a IA; a [política de privacidade](public/privacidade.html), publicada em `/privacidade.html` e linkada no rodapé e na janela da interpretação, explica que a pergunta e as cartas são enviadas ao Worker, ao Google Gemini e, quando necessário, ao Workers AI.

O endereço padrão do Worker fica em [`src/config.js`](src/config.js). Para usar seu próprio serviço, copie [`.env.example`](.env.example) para `.env.local` na raiz do projeto e ajuste o endereço:

```dotenv
VITE_ORACLE_API_URL=https://seu-worker.seu-subdominio.workers.dev
```

Reinicie o servidor de desenvolvimento após alterar a variável. Em produção, ela precisa estar definida durante o build. Sem essa variável, o navegador usa o endpoint padrão; deixá-la vazia não desativa as consultas online.

O diário e as preferências ficam no `localStorage` do navegador, sem conta, sincronização ou criptografia. Limpar os dados do site pode apagar esses registros; bloquear o armazenamento pode impedir sua persistência.

Para guardar ou levar o diário a outro aparelho, use **Exportar** no Diário: o arquivo JSON contém todas as leituras, com perguntas e notas. **Importar** mescla um backup ao diário atual sem duplicar leituras e sem sobrescrever notas editadas depois do backup. O diário mantém as 100 leituras mais recentes.

O service worker permite reutilizar recursos já carregados quando não há conexão. A primeira visita e recursos ainda não armazenados precisam de internet.

## Configurar seu próprio Worker

O backend está no arquivo independente [`cloudflare_worker_code.js`](cloudflare_worker_code.js). Ele **recusa por padrão**: sem as configurações abaixo, responde 403 ou 503 e não chama nenhum provedor.

1. Copie [`wrangler.example.toml`](wrangler.example.toml) para `wrangler.toml` (ignorado pelo git) e ajuste `ALLOWED_ORIGINS`.
2. Cadastre a chave como segredo: `npx wrangler secret put GEMINI_API_KEY`. O binding `AI` (Workers AI) já vem no `wrangler.example.toml`; no painel, fica em **Settings → Bindings → Add binding → Workers AI**.
3. Publique: `npx wrangler deploy`.
4. Confira: `curl https://seu-worker.workers.dev/health` deve responder `{"status":"ok"}`.
5. No Google Cloud, defina um orçamento com alerta para o projeto da chave da API.

| Configuração | Obrigatória | Uso |
| --- | --- | --- |
| `GEMINI_API_KEY` | Um dos dois | Segredo com a chave do Gemini, mantido somente no Worker. |
| `AI` | Um dos dois | Binding do Workers AI, consultado primeiro; o Gemini fica como reserva. Recomendado: o plano gratuito do Gemini fica lento ou indisponível em horários de pico. |
| `ALLOWED_ORIGINS` | Sim | Origens separadas por vírgula, como `https://luminatarot.app`. Aceita curinga de subdomínio (`https://*.exemplo.com`); `*` sozinho é ignorado. |
| `ORACLE_RATE_LIMITER` | Sim | Binding de rate limit por IP. Se faltar ou falhar, o Worker responde 503. |
| `GEMINI_MODEL` | Não | Modelo do Gemini (padrão `gemini-3.5-flash-lite`), tentado uma vez, por até 12 s, quando o Workers AI falha. Prefira versões fixas a apelidos `-latest`. |
| `WORKERS_AI_MODEL` | Não | Modelo do Workers AI (padrão `@cf/meta/llama-3.3-70b-instruct-fp8-fast`), com até 16 s. Precisa começar com `@cf/`. |
| `ALLOW_LOCALHOST` | Não | `true` libera `localhost` e `127.0.0.1`. Use só em desenvolvimento. |
| `ALLOW_UNLIMITED` | Não | `true` dispensa o rate limiter. Use só em desenvolvimento. |

O Worker responde apenas a `POST /` (consultas) e `GET /health`. CORS impede que outros sites o usem pelo navegador, mas não impede scripts que forjem o cabeçalho `Origin`: o rate limiter e o orçamento no Google Cloud são a defesa para esse caso. Veja o [SECURITY.md](SECURITY.md).

> **Atualizando de uma versão anterior:** antes de publicar este Worker, confirme que `ALLOWED_ORIGINS` lista a origem do site e que o binding `ORACLE_RATE_LIMITER` existe. Versões anteriores aceitavam qualquer origem e funcionavam sem rate limiter; esta recusa as consultas nesses casos.

Nunca coloque a chave do Gemini em variáveis `VITE_*`: elas ficam expostas no JavaScript entregue ao navegador.

## Publicação

O site oficial fica em <https://luminatarot.app/>, hospedado na Vercel. O `www.luminatarot.app` redireciona para ele, e o Worker de interpretação responde em `https://api.luminatarot.app` (domínio personalizado do Worker na Cloudflare). O DNS do domínio fica na Cloudflare, com os registros da Vercel em modo "DNS only".

- **Vercel** publica pela integração com o GitHub: cada push na `main` gera a produção, e cada pull request gera uma prévia. O comando de build é `npm run build` e a pasta publicada é `dist/`.
- **[`vercel.json`](vercel.json)** envia cabeçalhos de segurança (proteção contra o site ser embutido em outro, `nosniff`, `Referrer-Policy`, `Permissions-Policy`), cache longo para os arquivos com hash em `/assets/` e `no-cache` para o service worker. A CSP completa continua na tag `<meta>` gerada no build.
- **CI** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) roda em todo pull request e push na `main`: lint, testes Node, typecheck e testes da Mesa 3D, build, conferência das duas páginas e testes de navegador. Se falhar, as evidências do Playwright ficam no artefato `mesa-browser-results`. A `main` exige que o job `test` passe.

Para usar um Worker próprio, defina `VITE_ORACLE_API_URL` nas variáveis de ambiente do projeto na Vercel e inclua a origem do site em `ALLOWED_ORIGINS`. As prévias de pull request usam endereços próprios da Vercel; como o Worker só aceita origens listadas, nelas a interpretação fica indisponível. Não use curinga como `https://lumina-tarot-*.vercel.app`, porque qualquer pessoa pode criar um projeto com esse prefixo.

O GitHub Pages foi descontinuado: ele limita requisições por endereço IP e bloqueava o site em redes com IP compartilhado.

A publicação do frontend não publica nem configura o Cloudflare Worker.

## Mesa Livre 3D

Acesse **Mesa 3D** no cabeçalho ou abra `/mesa-3d/`. É uma aplicação independente com Tarot e Baralho Cigano, manipulação de cartas, notas, posições, significados, histórico reversível e mesas salvas no navegador. Importação e exportação usam JSON; as leituras do diário tradicional permanecem independentes.

Desenvolvimento: `npm run dev`. Verificações: `npm run typecheck`, `npm run test:mesa`, `npm run build` e `npm run test:browser` (instale antes o Chromium com `npx playwright install chromium`). Consulte [implementação, controles, assets e limitações de validação](docs/mesa-3d/IMPLEMENTACAO.md).

## Estrutura

Veja [ARCHITECTURE.md](ARCHITECTURE.md) para entender o fluxo de estado, a interpretação, a persistência e o cache offline.

```text
src/components/             Interface, mesa, cartas e janelas
src/data/                   Baralhos, artes e configurações das tiragens
src/utils/                  Interpretação, histórico, temas e áudio
public/tarot/               Artes dos baralhos e informações de origem
public/sw.js                Cache para uso offline
public/privacidade.html     Política de privacidade
src/config.js               Endereço padrão do Worker
cloudflare_worker_code.js   Serviço de interpretação online
mesa-3d/                    Mesa Livre 3D (TypeScript + Babylon.js)
tests/                      Testes Node, da Mesa 3D e de navegador
```

## Artes dos baralhos

As imagens são servidas pelo próprio projeto. As fontes e condições de uso estão documentadas em [`public/tarot/sources.json`](public/tarot/sources.json) e nos arquivos dos conjuntos:

- [Rider–Waite](public/tarot/rider-waite/LICENSE.md)
- [Petit Lenormand](public/tarot/lenormand-hope/LICENSE.md)
- [Verso das cartas](public/tarot/backs/LICENSE.md)

## Segurança e contribuição

- Vulnerabilidades: siga o [SECURITY.md](SECURITY.md); não abra issues públicas.
- Contribuições: veja o [CONTRIBUTING.md](CONTRIBUTING.md).
- Histórico de versões: [CHANGELOG.md](CHANGELOG.md).

## Licença

O código do projeto está sob a [licença MIT](LICENSE). As fontes e condições de uso das artes estão nos documentos dos conjuntos acima.
