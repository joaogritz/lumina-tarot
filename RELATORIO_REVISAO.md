# Relatório de revisão — Lumina Tarot

Data: 10/09/2026. Alterações feitas no projeto local; nenhum deploy ou commit foi realizado.

## Resultado

O projeto agora oferece Tarot (78 cartas) e Baralho Cigano / Petit Lenormand (36 cartas), com troca de baralho integrada aos fluxos principais. A revisão concentrou-se em segurança do servidor de IA, privacidade, coerência entre baralhos, persistência, acessibilidade e uso em telas pequenas.

## O que foi adicionado

- Catálogo das 36 cartas do Petit Lenormand, na ordem tradicional, com IDs independentes, palavras-chave, significados, pontos de atenção e conselhos em português. Os textos são autorais.
- Seletor de baralhos com quantidade, descrição e estado selecionado. A preferência é mantida no navegador.
- Confirmação de troca quando há cartas na mesa. A troca recolhe a tiragem atual, preserva a pergunta e não remove leituras salvas.
- Identidade visual verde-esmeralda para as faces do cigano, com símbolos vetoriais e numeração. A identidade noturna, dourada e violeta do site foi preservada.
- Leitura cigana com uma ou três cartas, sem inversões. A interpretação local considera os pares vizinhos da linha; não reutiliza a polaridade dos arcanos do Tarot.
- Grimório, carta do dia e Sim ou Não usam o catálogo selecionado. O guia explica diferenças entre os sistemas e identifica Sim ou Não como adaptação simbólica.
- Metadados de baralho nas novas entradas do diário, compatíveis com entradas antigas. Estatísticas distinguem cartas homônimas por ID.
- Controle explícito de interpretação online e explicação do envio de pergunta/cartas ao Worker e ao Gemini.
- Sete testes automatizados, executados também no fluxo de publicação antes do build.

## Segurança e privacidade

| Achado no código anterior | Correção |
| --- | --- |
| Worker aceitava qualquer origem por CORS e oferecia GET/listagem de modelos | Allowlist por `ALLOWED_ORIGINS`, somente POST/OPTIONS, remoção da listagem |
| Cliente podia substituir o prompt completo com `customPrompt` | Campo recusado; instruções separadas dos dados em `systemInstruction` |
| Ausência de limites de corpo e estrutura | Leitura limitada a 24 KB, até 10 cartas, pergunta de até 1.000 caracteres, validação de campos |
| Endpoint de geração sem rate limiting | Binding obrigatório `ORACLE_RATE_LIMITER`; 429 com Retry-After; indisponível sem configuração |
| Tentativas sucessivas em vários modelos e falta de timeout | Uma chamada ao modelo configurado, timeout de 15 s no servidor e 20 s no cliente |
| Chave na URL do provedor e mensagens internas devolvidas ao cliente | Chave no cabeçalho `x-goog-api-key`, erros genéricos, respostas sem cache |
| Perguntas enviadas automaticamente a um endpoint fixo | Endpoint explícito por ambiente, modo local padrão e adesão voluntária à IA |
| Documentação prometia privacidade total e IA gratuita/invisível | Documentação corrigida para refletir armazenamento local, terceiros e custos dependentes do provedor |
| Limpeza do service worker removia caches não pertencentes ao projeto | Limpeza limitada ao prefixo Lumina; requisições externas não entram no cache do aplicativo |

A inspeção textual não encontrou uso de `dangerouslySetInnerHTML`, `eval`, construção dinâmica de funções ou chave Gemini embutida nos arquivos de aplicação examinados. Isso não constitui prova de ausência de vulnerabilidades.

CORS não é autenticação: clientes fora do navegador podem forjar Origin. A proteção por IP/localidade reduz abuso, mas não define orçamento global. A aplicação continua pública e sem login; limites de cota e alertas do provedor devem ser configurados na conta responsável.

## Correções de comportamento e design

- Contadores, filtros e grimórios passam a refletir o baralho ativo em vez de assumir 78 cartas em todos os fluxos.
- A Torre do Tarot e A Torre do cigano deixam de se misturar nas estatísticas; o mesmo vale para outras cartas homônimas.
- Fechar a interpretação não limpa automaticamente a tiragem. Nova tiragem e limpar mesa continuam ações explícitas.
- A mesa só é montada após a entrada no santuário, evitando seleção de cartas por trás da tela inicial.
- Atalhos deixam de disparar durante digitação, foco em botões, janelas abertas e animação de sorteio.
- As nove janelas existentes receberam nome acessível, gerenciamento de foco, contenção de Tab, Escape e retorno ao acionador. A confirmação de baralho utiliza dialog nativo.
- As cartas abertas na mesa podem ser inspecionadas pelo teclado.
- Foco visível e seletor com controles amplos, descrições legíveis e disposição vertical no celular.
- Preferência de movimento reduzido aplicada ao Framer Motion e ao CSS.
- Erros de armazenamento não impedem leitura da preferência de tema/baralho. O histórico tolera JSON inválido; salvar deixa de informar sucesso quando a persistência falha.
- Recuperação de chunks não depende mais de interpretar JSON arbitrário do sessionStorage.
- Salvaguardas locais existentes corrigidas para reconhecer palavras completas como suicídio e automutilação, com prioridade antes da consulta online.
- Balanço elemental do Tarot não é exibido vazio em uma leitura cigana.

## Dependências e validação

O lockfile foi atualizado e o mínimo do Vite elevado para 6.4.3, mantendo a linha 6.4 que recebe correções de segurança. Não foi necessário migrar o projeto para uma versão principal nova.

| Verificação | Resultado |
| --- | --- |
| Compilação de produção com Vite 6.4.3 | Aprovada |
| Testes Node | 7 aprovados, 0 falhas |
| Auditoria npm do lockfile final | 162 pacotes auditados; 0 vulnerabilidades reportadas na consulta |
| Verificação de diff / espaços incorretos | Aprovada |
| Integridade dos baralhos | 78 + 36 cartas, 114 IDs únicos e campos essenciais preenchidos |
| Contrato do Worker | Origens, métodos, corpo inválido/grande, customPrompt, limite, configuração ausente e erros do provedor testados |
| Navegador — cigano | Seleção de três cartas, leitura local com pares, salvar e manter mesa ao fechar |
| Navegador — integração | Troca confirmada para Tarot, grimórios com 78/36 cartas, carta diária e Sim ou Não cigano |
| Navegador — acessibilidade | Tab mantido no grimório, Escape fecha e foco retorna ao acionador |
| Navegador — responsividade | Viewport 390 × 844 sem overflow horizontal do documento |
| Console após correções | Sem novos erros/avisos no último ciclo de navegação verificado |

A primeira rodada dos testes revelou a colisão entre nomes no histórico; a primeira compilação revelou um ícone não exportado e um atributo duplicado. Ambos foram corrigidos. A inspeção no navegador revelou chaves React repetidas entre janelas e elas também foram corrigidas antes da verificação final.

## Limitações e configuração pendente

1. As mudanças de segurança do Worker estão no arquivo local. O serviço já publicado não foi alterado nem submetido a testes invasivos. O README descreve segredo, origens, modelo e rate limiter necessários para publicar a nova versão.
2. Não foi chamada a API real do Gemini: testes do Worker usam um provedor simulado. Disponibilidade do modelo, cotas, cobrança e bindings dependem da conta Cloudflare/Google.
3. O modo offline depende do cache existente. Primeira visita offline e chunks nunca carregados não são garantidos.
4. O diário permanece em localStorage, sem criptografia ou sincronização. Limpar dados do navegador remove o diário; dispositivos compartilhados exigem cuidado.
5. A leitura cigana inclui carta única e linha de três. Grande Mesa e combinações extensas de todas as cartas não foram adicionadas.
6. A revisão de acessibilidade melhorou os fluxos principais, mas não é certificação WCAG. Animações próprias de canvas, leitores de tela e todas as combinações de tema/zoom ainda merecem uma rodada específica.
7. Os símbolos novos são ilustrações vetoriais simplificadas, não reproduções de um baralho comercial. As leituras locais são composições determinísticas a partir das cartas; não simulam uma resposta gerada por IA.

## Fontes usadas na pesquisa

- [Schiffer — introdução ao Lenormand](https://content.schifferbooks.com/newcatalogs/Edelweiss%20Uploads/Lenormand.pdf): referência para leitura sem inversões e diferenças do sistema.
- [W3C — padrão de modal](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): foco, teclado e semântica das janelas.
- [W3C — dialog HTML](https://www.w3.org/WAI/WCAG21/Techniques/html/H102): uso da confirmação nativa.
- [Cloudflare — rate limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/): binding e limites por localidade.
- [Google — geração de conteúdo](https://ai.google.dev/api/generate-content): formato de requisição e instruções de sistema.
- [Vite — suporte de versões](https://vite.dev/releases): linha 6.4 com backports de segurança.
