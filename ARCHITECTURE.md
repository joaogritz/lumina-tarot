# Arquitetura do Lumina

## Estado e dados

`App.jsx` exibe a entrada e monta a mesa somente depois da interação inicial. `TarotTable.jsx` coordena baralho, tiragem, cartas escolhidas, pergunta, temas e janelas. O catálogo `src/data/decks.js` referencia os 78 registros de Tarot e os 36 de `lenormandDeck.js`.

As cartas do cigano têm IDs próprios (`lenormand_1` a `lenormand_36`). O estado de escolha é uma cópia dos dados, sem mutação dos catálogos. Trocar o baralho limpa as cartas atuais, desativa inversões e volta à tiragem de três posições. A pergunta é preservada. Os componentes de grimório, carta diária e sim/não recebem o catálogo ativo por propriedade e são remontados na troca.

`CardArt` é um adaptador para `cards/TarotCard`, a implementação visual compartilhada de frentes, versos, molduras e tilt. `data/cardArtwork.js` separa o catálogo de imagens dos significados; ambos os baralhos recebem uma referência `artwork`, e leituras antigas são resolvidas pelo ID. As artes históricas otimizadas ficam em `public/tarot`, com miniaturas, origens, checksums e documentação de domínio público. Não há dependência de imagens remotas em tempo de execução.

## Interpretação

`aiOracle.js` tenta solicitar uma interpretação online pelo endpoint definido em `VITE_ORACLE_API_URL` ou pelo endereço padrão incluído no código. O fluxo atual não exige ativação prévia pelo usuário. Quando a consulta falha ou a resposta não pode ser aproveitada, devolve `{ source: 'unavailable' }`, e as janelas de interpretação e de Sim ou Não mostram um aviso com **Tentar novamente** (no Sim ou Não, com a mesma carta e pergunta). Nenhuma leitura é gerada localmente; só as salvaguardas éticas respondem sem consultar o serviço. As respostas não são inseridas como HTML.

A interface não menciona a IA: o envio de dados ao Worker, ao Google Gemini e ao Workers AI é descrito em `public/privacidade.html`. O endereço padrão do Worker fica em `src/config.js`, compartilhado com a CSP gerada no build.

`cloudflare_worker_code.js` é independente da aplicação e recusa por padrão. Só aceita origens listadas em `ALLOWED_ORIGINS` (com curinga de subdomínio; `*` sozinho é ignorado), sem exceções para requisições sem `Origin`, painel da Cloudflare ou localhost (este só com `ALLOW_LOCALHOST=true`). Exige o binding `ORACLE_RATE_LIMITER` e ao menos um provedor (`GEMINI_API_KEY` ou o binding `AI`), e responde 503 se faltar algum deles. Lê o corpo em streaming com limite de 24 KB, valida cada campo, mantém o segredo no servidor e separa instruções de sistema dos dados; não aceita `customPrompt`. Consulta primeiro o Cloudflare Workers AI: `@cf/google/gemma-4-26b-a4b-it` sem raciocínio (até 15 s; ~9 s e ~35 neurons numa Cruz Céltica, o que dá ~280 leituras por dia na cota gratuita) e, se falhar, responder vazio ou truncado, `@cf/openai/gpt-oss-120b` com raciocínio baixo (até 12 s). Todas as tentativas dividem um prazo de 29 s. Se nenhum responder, faz uma tentativa no Gemini com versão fixa (`gemini-3.5-flash-lite`, no menor nível de raciocínio, por até 12 s). O plano gratuito do Gemini perde prioridade em horários de pico, o que tornava as consultas lentas ou recusadas; o Workers AI roda na própria rede da Cloudflare. O cliente espera até 32 s antes de mostrar o aviso de indisponibilidade. Respostas de erro do provedor são registradas com status e um trecho curto, só nos logs do Worker. As rotas são apenas `POST /` e `GET /health`. Erros detalhados vão para os logs do Worker, nunca para a resposta. As configurações de implantação estão no README e em `wrangler.example.toml`.

## Persistência

`history.js` mantém até 100 leituras no localStorage. Entradas novas incluem `deckId` e `deckName`; entradas antigas continuam identificadas como Tarot. `exportBackup()` serializa o diário em um JSON com `kind: "lumina-tarot-diary"` e `version`; `importBackup()` valida o arquivo com as mesmas regras de leitura, mescla por `id` (a entrada local vence em colisões, preservando notas editadas depois), ordena da mais recente para a mais antiga e aplica o limite de 100. Backups de versões futuras são recusados. As estatísticas distinguem cartas pelo ID e incluem a contagem Lenormand. Temas e baralho têm fallback quando o armazenamento não está disponível.

## Interface e acessibilidade

`DeckSelectionRow` apresenta as cartas restantes em um leque que se ajusta à largura disponível, sem rolagem horizontal. O mouse ou o arraste por toque destaca uma carta; no toque, uma nova pressão na carta destacada confirma a escolha. Setas, Home e End percorrem o leque pelo teclado, e Enter ou Espaço puxam a carta. O sorteio usa as mesmas regras da mesa e reorganiza as cartas restantes.

O seletor usa botões com estado `aria-pressed`; a confirmação usa `dialog.showModal()`. `useModalAccessibility` gerencia foco, Tab, Escape e restauração de foco nas outras nove janelas, inclusive sobreposição de detalhes. Atalhos globais não atuam sobre campos, botões ou janelas abertas. MotionConfig e CSS respeitam movimento reduzido; animações próprias de canvas ainda precisam de avaliação específica para conformidade integral.

## Build e offline

Vite divide o código em chunks. No build, um plugin em `vite.config.js` adiciona a Content-Security-Policy e a Referrer-Policy como `<meta>` nas duas páginas, e `vercel.json` complementa com cabeçalhos HTTP (`frame-ancestors`, `nosniff`, cache dos assets); o servidor de desenvolvimento fica sem CSP porque o HMR usa scripts inline. As fontes são servidas pelo próprio site, a partir de `public/fonts`, compartilhadas pelas duas páginas. O service worker usa navegação network-first e cache de assets de mesma origem. A limpeza remove apenas caches com prefixo do Lumina. O fallback offline depende de os recursos terem sido carregados anteriormente; não se garante primeira visita offline nem disponibilidade de todos os chunks ainda não visitados.

## Verificação

`npm test` executa testes Node de dados, regras de interpretação, histórico, backup do diário e contrato de segurança do Worker com provedor simulado. `npm run test:mesa` cobre as regras da Mesa 3D e `npm run test:browser` exercita as duas páginas no Chromium com Playwright, incluindo arrastos no canvas, armazenamento indisponível, perda de contexto WebGL e navegação offline. O workflow executa tudo isso em pull requests e antes de cada publicação. A revisão da interface é complementar: não substitui auditoria de acessibilidade assistiva, pentest ou validação do serviço implantado.
