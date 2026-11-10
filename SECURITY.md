# Política de segurança

## Como reportar uma vulnerabilidade

Não abra uma issue pública para falhas de segurança. Use o **reporte privado** do GitHub:
aba **Security** do repositório → **Report a vulnerability**. Inclua os passos para reproduzir,
o impacto esperado e, se possível, uma sugestão de correção.

Você deve receber uma primeira resposta em até 7 dias. Correções confirmadas são publicadas
na `main` e registradas no [CHANGELOG](CHANGELOG.md).

## Escopo

| Componente | No escopo |
| --- | --- |
| Site publicado em `luminatarot.app` (React e Mesa 3D) | Sim |
| Worker de interpretação (`cloudflare_worker_code.js`) | Sim |
| Workflow de CI/CD (`.github/workflows`) | Sim |
| Contas e infraestrutura da Cloudflare, do Google ou do GitHub | Não: reporte aos respectivos fornecedores |
| Ataques de negação de serviço volumétricos e engenharia social | Não |

## Modelo de segurança, em resumo

- **Sem contas nem servidor de dados.** Diário, preferências e mesas ficam no navegador
  (`localStorage` e IndexedDB). Não há dados pessoais armazenados em servidores do projeto.
- **Sem chaves de API externas.** O Worker gera as interpretações pelo Workers AI, um binding da
  Cloudflare, sem segredos de terceiros. Nada em `VITE_*` pode conter segredos, porque essas
  variáveis vão para o JavaScript público.
- **O Worker recusa por padrão:** só aceita origens listadas em `ALLOWED_ORIGINS`, exige o
  rate limiter por IP (e recusa se ele falhar), tenta no máximo dois modelos por consulta,
  limita o tamanho do corpo e valida cada campo. Não expõe rotas além de `POST /` e `GET /health`.
- **A pergunta é tratada como dado**, nunca como instrução: as diretrizes ficam em
  mensagem de sistema, separadas dos dados da consulta, e o Worker recusa `customPrompt`.
- **O site publica uma Content-Security-Policy** (via `<meta>`, gerada no build) que só permite
  scripts, fontes e imagens do próprio site e conexões ao Worker. A Vercel envia cabeçalhos
  complementares (`vercel.json`): `frame-ancestors 'none'`, `X-Frame-Options`, `nosniff`,
  `Referrer-Policy`, `Permissions-Policy` e `Cross-Origin-Opener-Policy`.
- **Arquivos importados são validados** antes de entrar no armazenamento: backups do diário e
  mesas da Mesa 3D passam por checagem de estrutura, tipos e tamanhos.
- **Dependências e actions** são acompanhadas pelo Dependabot; as actions ficam fixadas por SHA.

## Limitações conhecidas

- CORS impede que outros sites usem o Worker pelo navegador, mas não impede scripts que forjem o
  cabeçalho `Origin`. Para esse caso, a defesa é o rate limiter por IP e a cota diária do
  Workers AI, acompanhada no painel da Cloudflare.
