# Arquitetura do Lumina

## Estado e dados

`App.jsx` exibe a entrada e monta a mesa somente depois da interação inicial. `TarotTable.jsx` coordena baralho, tiragem, cartas escolhidas, pergunta, temas e janelas. O catálogo `src/data/decks.js` referencia os 78 registros de Tarot e os 36 de `lenormandDeck.js`.

As cartas do cigano têm IDs próprios (`lenormand_1` a `lenormand_36`). O estado de escolha é uma cópia dos dados, sem mutação dos catálogos. Trocar o baralho limpa as cartas atuais, desativa inversões e volta à tiragem de três posições. A pergunta é preservada. Os componentes de grimório, carta diária e sim/não recebem o catálogo ativo por propriedade e são remontados na troca.

`CardArt` mantém a identidade visual do Tarot e delega os símbolos de Lenormand a `LenormandSymbol`. Não são baixadas imagens externas para as novas cartas.

## Interpretação

`aiOracle.js` monta uma interpretação local ou, com endpoint configurado e consentimento salvo, solicita IA. Lenormand tem composição local própria para pares vizinhos, sem aplicar correspondências de arcanos do Tarot. As respostas não são inseridas como HTML.

`cloudflare_worker_code.js` é independente da aplicação. Valida origem, método, tipo, tamanho e estrutura do corpo; exige rate limiter, mantém o segredo no servidor e separa instruções de sistema dos dados. Faz uma única chamada ao modelo, com timeout e erro genérico. Não aceita `customPrompt`, não expõe listagem de modelos e não registra perguntas.

## Persistência

`history.js` mantém até 100 leituras no localStorage. Entradas novas incluem `deckId` e `deckName`; entradas antigas continuam identificadas como Tarot. As estatísticas distinguem cartas pelo ID e incluem a contagem Lenormand. Temas e baralho têm fallback quando o armazenamento não está disponível.

## Interface e acessibilidade

O seletor usa botões com estado `aria-pressed`; a confirmação usa `dialog.showModal()`. `useModalAccessibility` gerencia foco, Tab, Escape e restauração de foco nas outras nove janelas, inclusive sobreposição de detalhes. Atalhos globais não atuam sobre campos, botões ou janelas abertas. MotionConfig e CSS respeitam movimento reduzido; animações próprias de canvas ainda precisam de avaliação específica para conformidade integral.

## Build e offline

Vite divide o código em chunks. O service worker usa navegação network-first e cache de assets de mesma origem. A limpeza remove apenas caches com prefixo do Lumina. O fallback offline depende de os recursos terem sido carregados anteriormente; não se garante primeira visita offline nem disponibilidade de todos os chunks ainda não visitados.

## Verificação

`npm test` executa testes Node de dados, regras de interpretação, histórico e contrato de segurança do Worker com provedor simulado. O workflow executa testes e build. A revisão da interface é complementar: não substitui auditoria de acessibilidade assistiva, pentest ou validação do serviço implantado.
