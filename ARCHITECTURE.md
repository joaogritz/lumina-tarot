# Arquitetura do Lumina

## Estado e dados

`App.jsx` exibe a entrada e monta a mesa somente depois da interação inicial. `TarotTable.jsx` coordena baralho, tiragem, cartas escolhidas, pergunta, temas e janelas. O catálogo `src/data/decks.js` referencia os 78 registros de Tarot e os 36 de `lenormandDeck.js`.

As cartas do cigano têm IDs próprios (`lenormand_1` a `lenormand_36`). O estado de escolha é uma cópia dos dados, sem mutação dos catálogos. Trocar o baralho limpa as cartas atuais, desativa inversões e volta à tiragem de três posições. A pergunta é preservada. Os componentes de grimório, carta diária e sim/não recebem o catálogo ativo por propriedade e são remontados na troca.

`CardArt` é um adaptador para `cards/TarotCard`, a implementação visual compartilhada de frentes, versos, molduras e tilt. `data/cardArtwork.js` separa o catálogo de imagens dos significados; ambos os baralhos recebem uma referência `artwork`, e leituras antigas são resolvidas pelo ID. As artes históricas otimizadas ficam em `public/tarot`, com miniaturas, origens, checksums e documentação de domínio público. Não há dependência de imagens remotas em tempo de execução.

## Interpretação

`aiOracle.js` tenta solicitar uma interpretação online pelo endpoint definido em `VITE_ORACLE_API_URL` ou pelo endereço padrão incluído no código. O fluxo atual não exige ativação prévia pelo usuário. Quando a consulta falha ou a resposta não pode ser aproveitada, usa uma interpretação local. Lenormand tem composição local própria para pares vizinhos, sem aplicar correspondências de arcanos do Tarot. As respostas não são inseridas como HTML.

`cloudflare_worker_code.js` é independente da aplicação. Valida consultas JSON, limita tamanho e estrutura do corpo, mantém o segredo no servidor e separa instruções de sistema dos dados. Não aceita `customPrompt`. O rate limiter é opcional; uma lista de origens vazia permite qualquer origem, e há exceções para localhost, painel do Cloudflare e requisições sem `Origin`. O Worker tenta modelos alternativos em caso de falha, com timeout de 15 segundos por tentativa; o cliente espera até 20 segundos. Também oferece listagem de modelos por GET ou pelo caminho `/models`. As configurações de implantação estão descritas no README.

## Persistência

`history.js` mantém até 100 leituras no localStorage. Entradas novas incluem `deckId` e `deckName`; entradas antigas continuam identificadas como Tarot. As estatísticas distinguem cartas pelo ID e incluem a contagem Lenormand. Temas e baralho têm fallback quando o armazenamento não está disponível.

## Interface e acessibilidade

O seletor usa botões com estado `aria-pressed`; a confirmação usa `dialog.showModal()`. `useModalAccessibility` gerencia foco, Tab, Escape e restauração de foco nas outras nove janelas, inclusive sobreposição de detalhes. Atalhos globais não atuam sobre campos, botões ou janelas abertas. MotionConfig e CSS respeitam movimento reduzido; animações próprias de canvas ainda precisam de avaliação específica para conformidade integral.

## Build e offline

Vite divide o código em chunks. O service worker usa navegação network-first e cache de assets de mesma origem. A limpeza remove apenas caches com prefixo do Lumina. O fallback offline depende de os recursos terem sido carregados anteriormente; não se garante primeira visita offline nem disponibilidade de todos os chunks ainda não visitados.

## Verificação

`npm test` executa testes Node de dados, regras de interpretação, histórico e contrato de segurança do Worker com provedor simulado. O workflow executa testes e build. A revisão da interface é complementar: não substitui auditoria de acessibilidade assistiva, pentest ou validação do serviço implantado.
