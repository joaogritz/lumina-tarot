# Lumina Tarot

Uma mesa virtual de Tarot e Baralho Cigano para explorar cartas, fazer tiragens e registrar reflexões. A experiência está em português, com artes históricas dos baralhos, temas visuais, animações e trilha sonora.

Desenvolvido com React, Vite e Tailwind CSS. O frontend é estático e pode ser publicado no GitHub Pages; as interpretações online usam um serviço separado em Cloudflare Workers.

## Recursos

- **Dois baralhos:** Tarot com 78 cartas e Baralho Cigano / Petit Lenormand com 36 cartas.
- **Tiragens guiadas:** carta única, passado/presente/futuro e outras disposições de Tarot, incluindo Cruz Céltica. No Cigano, estão disponíveis carta única, três cartas e tiragem livre.
- **Tiragem livre:** escolha de 1 a 10 cartas, sem significados fixos por posição.
- **Escolha manual ou sorteio**, com inversões opcionais no Tarot.
- **Sim ou Não**, com uma carta e interpretação para a pergunta.
- **Carta do dia e grimório**, para consultar os significados das cartas.
- **Diário de leituras**, salvo no navegador, com histórico e estatísticas.
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
| `npm test` | Executa os testes automatizados com o runner do Node.js. |
| `npm run build` | Gera o site estático em `dist/`. |
| `npm run preview` | Serve o build localmente para conferência. |

## Interpretações e dados

Na versão atual, ao consultar uma tiragem ou o Sim ou Não, a aplicação tenta gerar uma interpretação online por meio de um Cloudflare Worker conectado ao Google Gemini. Se o serviço falhar ou não retornar uma resposta utilizável, o frontend recorre à interpretação local.

O código inclui um endpoint padrão em `src/utils/aiOracle.js`. Para usar seu próprio serviço, crie um arquivo `.env.local` na raiz do projeto:

```dotenv
VITE_ORACLE_API_URL=https://seu-worker.seu-subdominio.workers.dev
```

Reinicie o servidor de desenvolvimento após alterar a variável. Em produção, ela precisa estar definida durante o build. Sem essa variável, o navegador usa o endpoint padrão; deixá-la vazia não desativa as consultas online.

Nas consultas online, a pergunta e os dados das cartas são enviados ao Worker e ao provedor de interpretação. O diário e as preferências ficam no `localStorage` do navegador, sem conta, sincronização ou criptografia. Limpar os dados do site pode apagar esses registros; bloquear o armazenamento pode impedir sua persistência.

O service worker permite reutilizar recursos já carregados quando não há conexão. A primeira visita e recursos ainda não armazenados precisam de internet.

## Configurar seu próprio Worker

O backend está no arquivo independente [`cloudflare_worker_code.js`](cloudflare_worker_code.js). Publique-o como um Cloudflare Worker e configure:

| Configuração | Uso |
| --- | --- |
| `GEMINI_API_KEY` | Secret com a chave do provedor, mantida somente no Worker. |
| `ALLOWED_ORIGINS` | Origens separadas por vírgula, como `https://usuario.github.io,http://localhost:5173`. |
| `GEMINI_MODEL` | Modelo a tentar primeiro. O código também tenta uma lista de modelos alternativos. |
| `ORACLE_RATE_LIMITER` | Binding opcional para limitar consultas por IP. |

Exemplo de binding em uma configuração Wrangler:

```toml
[[ratelimits]]
name = "ORACLE_RATE_LIMITER"
namespace_id = "1001"
simple = { limit = 10, period = 60 }
```

Adapte o namespace à sua conta. Na implementação atual, a ausência do binding não impede consultas, e `ALLOWED_ORIGINS` vazio permite qualquer origem. O Worker também aceita localhost, requisições sem cabeçalho `Origin` e o painel do Cloudflare. CORS não substitui autenticação nem define um limite global de uso.

Nunca coloque a chave do Gemini em variáveis `VITE_*`: elas ficam expostas no JavaScript entregue ao navegador.

## Publicar no GitHub Pages

O workflow em [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) instala as dependências, executa os testes, compila e publica `dist/` quando há um push em `main`. Também pode ser iniciado manualmente pelo GitHub Actions.

Nas configurações do repositório, selecione **GitHub Actions** como origem do GitHub Pages. Para usar um Worker próprio no build automatizado, adicione `VITE_ORACLE_API_URL` ao ambiente da etapa de build; o workflow atual não injeta essa variável.

A publicação do frontend não publica nem configura o Cloudflare Worker.

## Estrutura

Veja [ARCHITECTURE.md](ARCHITECTURE.md) para entender o fluxo de estado, a interpretação, a persistência e o cache offline.

```text
src/components/             Interface, mesa, cartas e janelas
src/data/                   Baralhos, artes e configurações das tiragens
src/utils/                  Interpretação, histórico, temas e áudio
public/tarot/               Artes dos baralhos e informações de origem
public/sw.js                Cache para uso offline
cloudflare_worker_code.js   Serviço de interpretação online
tests/                      Testes automatizados
```

## Artes dos baralhos

As imagens são servidas pelo próprio projeto. As fontes e condições de uso estão documentadas em [`public/tarot/sources.json`](public/tarot/sources.json) e nos arquivos dos conjuntos:

- [Rider–Waite](public/tarot/rider-waite/LICENSE.md)
- [Petit Lenormand](public/tarot/lenormand-hope/LICENSE.md)
- [Verso das cartas](public/tarot/backs/LICENSE.md)

## Licença

O código do projeto está sob a [licença MIT](LICENSE). As fontes e condições de uso das artes estão nos documentos dos conjuntos acima.

## Mesa Livre 3D

Acesse **Mesa 3D** no cabeçalho ou abra `/mesa-3d/`. É uma aplicação independente com Tarot e Baralho Cigano, manipulação de cartas, notas, posições, significados, histórico reversível e mesas salvas no navegador. Importação e exportação usam JSON; as leituras do diário tradicional permanecem independentes.

Desenvolvimento: `npm run dev`. Verificações: `npm run typecheck`, `npm run test:mesa`, `npm run build` e `npm run test:browser` (instale antes o Chromium com `npx playwright install chromium`). Consulte [implementação, controles, assets e limitações de validação](docs/mesa-3d/IMPLEMENTACAO.md).
