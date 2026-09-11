# Lumina Tarot

Aplicação React para reflexão simbólica com Tarot (78 cartas) e Baralho Cigano / Petit Lenormand (36 cartas). Inclui escolha manual ou sorteio, grimório, carta do dia, diário local, temas, áudio e interpretação local; IA online é opcional.

## Executar e validar

Requer Node.js 20.19+ ou 22.12+ e npm.

```sh
npm ci
npm test
npm run dev
npm run build
```

O fluxo de GitHub Pages executa os testes antes de compilar. O build estático fica em `dist/`.

## Baralhos

O seletor preserva a preferência no navegador. Se houver cartas na mesa, a troca pede confirmação; o diário permanece intacto. Tarot oferece as oito tiragens existentes e inversões opcionais. O cigano oferece carta única e linha de três cartas, sempre diretas, com interpretação de pares adjacentes. Sim ou Não é uma adaptação simbólica, não uma probabilidade. Não há Grande Mesa de 36 cartas nesta versão.

## Privacidade e IA opcional

Por padrão, as interpretações são locais. Para oferecer IA, configure `VITE_ORACLE_API_URL` no ambiente de compilação e publique seu próprio Worker. A pessoa ainda precisa ativar a opção de IA online na interface. Pergunta e cartas serão enviadas ao Worker e ao Google Gemini. Não coloque chaves em variáveis `VITE_*`.

O diário é armazenado no navegador, sem criptografia nem sincronização. Não prometa privacidade absoluta em um dispositivo compartilhado. Se armazenamento estiver bloqueado, a mesa funciona, mas preferências e diário podem não persistir.

## Configurar o Cloudflare Worker

O arquivo independente `cloudflare_worker_code.js` pode ser copiado para o editor do Worker. Defina:

- Secret `GEMINI_API_KEY`.
- `ALLOWED_ORIGINS`: origens exatas separadas por vírgula, sem caminhos nem barra final. Exemplo: `https://usuario.github.io,http://localhost:5173`.
- `GEMINI_MODEL`: modelo disponível em sua conta; o padrão do código é `gemini-2.5-flash-lite`.
- Binding de rate limiting `ORACLE_RATE_LIMITER`. Exemplo de trecho Wrangler:

```toml
[[ratelimits]]
name = "ORACLE_RATE_LIMITER"
namespace_id = "1001"
simple = { limit = 10, period = 60 }
```

Escolha um namespace adequado à conta. Sem segredo ou binding, o Worker retorna 503 e o frontend usa a leitura local. São aceitos apenas POST JSON e OPTIONS de origens autorizadas; limite de 24 KB, até 10 cartas e pergunta de até 1.000 caracteres. O provedor tem timeout de 15 s, o cliente de 20 s.

CORS não autentica clientes fora do navegador. Rate limiting por IP/localidade não é um teto global de gastos: configure também limites e alertas no provedor. A configuração e o deploy do serviço real não são feitos automaticamente ao publicar o frontend no GitHub Pages.

## Documentação

- [Arquitetura](ARCHITECTURE.md)
- [Relatório de revisão e alterações](RELATORIO_REVISAO.md)
