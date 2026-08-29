export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const geminiApiKey = (env.GEMINI_API_KEY || "").trim();
    if (!geminiApiKey) {
      return new Response(JSON.stringify({ 
        error: "A chave GEMINI_API_KEY não foi encontrada nas variáveis de ambiente do Worker." 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const urlObj = new URL(request.url);

    if (urlObj.pathname === "/models" || request.method === "GET") {
      try {
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`);
        const listData = await listRes.json();
        return new Response(JSON.stringify(listData, null, 2), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    try {
      const rawBody = await request.text();
      const { spreadConfig, chosenCards, userQuestion, mode, customPrompt } = JSON.parse(rawBody || '{}');

      const isYesNo = mode === 'yes_no' || spreadConfig?.isYesNo || spreadConfig?.name === 'Sim ou Não';

      let prompt = '';
      if (isYesNo) {
        const card = chosenCards?.[0] || {};
        const baselineVerdict = card.traditionalVerdict || 'SIM';
        prompt = `Você é o Oráculo do Sim ou Não do Lumina Tarot.
Sua missão é dar uma resposta EXTREMAMENTE OBJETIVA, DIRETA, LÚCIDA e CURTA para a pergunta do consulente, com COERÊNCIA ABSOLUTA entre o VEREDITO, a RESPOSTA e a DICA.

DADOS DA CONSULTA:
- PERGUNTA DO CONSULENTE: ${userQuestion ? `"${userQuestion}"` : 'Consulta direta ao Oráculo.'}
- CARTA REVELADA: ${card.name || 'Arcano'} (${card.arcana || ''}${card.suit ? ', ' + card.suit : ''})${card.isReversed ? ' [INVERTIDA]' : ' [DIRETA]'}.
- POLARIDADE TRADICIONAL DA CARTA: ${baselineVerdict} (${card.traditionalSummary || card.light || card.shadow || ''}).
- Luz do Arcano: ${card.light || ''} | Sombra: ${card.shadow || ''} | Conselho: "${card.advice || ''}".

DIRETRIZES ÉTICAS INEGOCIÁVEIS (PRIORIDADE MÁXIMA):
1. PREVENÇÃO AO SUICÍDIO E AUTOMUTILAÇÃO:
   - Se a pergunta envolver ideação suicida, término da própria vida ou automutilação (ex: "devo me matar?", "devo me cortar?"):
     * NUNCA dê veredito de Sim ou Não.
     * Responda RIGOROSAMENTE assim:
       VEREDITO: BUSQUE APOIO PROFISSIONAL
       RESPOSTA: O Tarot não realiza leituras sobre morte ou autodestruição. Sua vida tem valor sagrado e inestimável, e você não precisa enfrentar essa dor sozinho.
       DICA: Por favor, procure ajuda humana imediata: no Brasil, ligue gratuitamente para o CVV no número 188 ou consulte um profissional de saúde mental.
2. VEDAÇÃO DE CONTATO COM MORTOS / OUTRO PLANO ESPIRITUAL:
   - Se a pergunta for sobre falar com espíritos, parentes mortos ou necromancia (ex: "o que meu parente falecido quer dizer?"):
     * VEREDITO: FOCO NO AUTOCONHECIMENTO
     * RESPOSTA: O Tarot é um espelho de orientação e autoconhecimento para os vivos no plano terreno, não uma ferramenta mediúnica de contato com os mortos.
     * DICA: Honre a memória e o amor de quem partiu, focando na sua própria cura, no luto e no presente.

REGRAS RÍGIDAS DE COERÊNCIA TOTAL PARA CONSULTAS PADRÃO:
1. O VEREDITO, A RESPOSTA E A DICA NÃO PODEM DIVERGIR EM HIPÓTESE ALGUMA:
   - Se o VEREDITO for "SIM" ou "SIM, COM CONDIÇÃO": a RESPOSTA DEVE ser afirmativa e favorável. NUNCA comece com "Não" nem desminta a resposta.
   - Se o VEREDITO for "NÃO" ou "NÃO, A NÃO SER QUE": a RESPOSTA DEVE ser negativa, de alerta ou corte. NUNCA comece com "Sim" nem diga que está tudo liberado.
   - Se o VEREDITO for "DEPENDE DE VOCÊ": a RESPOSTA DEVE explicar que a resolução está atrelada à escolha ou atitude do consulente.
2. EXTENSÃO MÁXIMA: Exatamente 1 a 2 frases curtas na RESPOSTA. Seja cirúrgico, sem enrolação.
3. DICA PRÁTICA: Exatamente 1 frase com uma condição de ação clara (ex: "Sim, mas depende de...", "Não, a não ser que...").
4. FORMATO DE SAÍDA OBRIGATÓRIO (RIGOROSAMENTE 3 LINHAS):

VEREDITO: [Defina exatamente: SIM | NÃO | SIM, COM CONDIÇÃO | NÃO, A NÃO SER QUE | DEPENDE DE VOCÊ]
RESPOSTA: [1 ou 2 frases curtas, diretas e em 100% de harmonia com o VEREDITO acima]
DICA: [1 frase curta com a dica prática ou condição fundamental]`;
      } else {
        const cardsText = (chosenCards || []).map(c => 
          `- Posição: ${c.positionName || 'Altar'} | Carta: ${c.name} (${c.arcana || ''}${c.suit ? ', ' + c.suit : ''})${c.isReversed ? ' [INVERTIDA]' : ' [DIRETA]'}. Luz: ${c.light || ''}. Sombra: ${c.shadow || ''}. Conselho: "${c.advice || ''}".`
        ).join('\n');

        prompt = customPrompt || `Você é o Oráculo do Lumina Tarot. Crie uma interpretação clara, direta, concreta, ética, humana e sem enrolação.

CONSULTA:
- Tiragem: ${spreadConfig?.name || 'Tiragem Livre'}
- Pergunta / Intenção Mentalizada: ${userQuestion ? `"${userQuestion}"` : 'Leitura geral de autoconhecimento e caminhos do momento.'}

CARTAS REVELADAS NO ALTAR:
${cardsText}

DIRETRIZES ÉTICAS INEGOCIÁVEIS (ÚNICAS SALVAGUARDAS BLOQUEANTES):
1. PREVENÇÃO AO SUICÍDIO E AUTOMUTILAÇÃO:
   - É ESTRITAMENTE PROIBIDO fazer leituras sobre morte, suicídio ou automutilação (ex: "devo me matar?"). Se houver ideação suicida, recuse com compaixão e oriente a buscar ajuda humana urgente (no Brasil, CVV ligue 188).
2. VEDAÇÃO DE NECROMANCIA E CONTATO COM ESPÍRITOS DE FALECIDOS:
   - É ESTRITAMENTE PROIBIDO fingir incorporar, psicografar ou falar com espíritos de mortos. Explique que o Tarot atua para a vida dos vivos no plano terreno.

REGRAS DE RESPOSTA DIRETA (PROIBIDO EVASIVAS E SERMÃO DE AUTOAJUDA):
1. RESPONDA EXATAMENTE AO QUE FOI PERGUNTADO (PROIBIDO FUGIR OU DAR SERMÃO):
   - Se o consulente perguntou sobre NOMES, PESSOAS, QUEM FEZ ALGO ou OPÇÕES ESPECÍFICAS (ex: "Foi o Carlos, Lucas, João ou Marcos?", "Quem alterou o projeto?", "Devo escolher opção A ou B?"):
     * É ESTRITAMENTE PROIBIDO DAR RESPOSTAS EVASIVAS OU SERMÕES DE AUTOAJUDA!
     * NUNCA DIGA FRASES COMO: "a resposta importa menos do que entender por que você pergunta", "não foque nos outros", "foque em você mesmo", "não perca energia com isso", "não se preocupe com fofocas".
     * RESPONDA O QUE AS CARTAS MOSTRAM SOBRE A PERGUNTA: Relacione o simbolismo e a energia das cartas reveladas diretamente com os nomes, suspeitas ou opções mencionadas. Diga qual perfil/opção mais se alinha com as cartas ou o que o jogo indica sobre a ação daquela pessoa.
2. LINGUAGEM DIRETA, HUMANA E ACESSÍVEL:
   - Use português simples, natural e compreensível para qualquer pessoa comum.
   - Sem floreios poéticos exagerados, arcaísmos ou palestras morais. Seja direto e prático.

DIRETRIZES DE ESTRUTURA:
1. Garanta que TODAS as 3 seções sejam integralmente finalizadas sem cortes, estruturadas EXATAMENTE assim:

### 🌌 O que as cartas mostram
(Responda diretamente à dúvida concreta do consulente, sobre quem/o que foi perguntado, sem esquivas ou frases de autoajuda, em 1 parágrafo claro de 70 a 110 palavras)

### 💡 A Dinâmica das Forças Ocultas
(Explique o que está acontecendo por trás, as intenções, os detalhes ou os desafios reais apontados pelas cartas em 1 parágrafo de 70 a 110 palavras)

### 🧭 O que fazer na prática
(Dê uma orientação prática e direta para a situação real apresentada em 1 parágrafo de 70 a 110 palavras)`;
      }

      // Modelos ativos verificados na conta
      const modelsToTry = [
        "gemini-flash-latest",
        "gemini-flash-lite-latest",
        "gemini-2.5-flash-lite",
        "gemini-pro-latest"
      ];

      let lastError = null;
      let generatedText = null;
      let modelUsed = null;

      for (const model of modelsToTry) {
        const generateUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;

        try {
          const geminiRes = await fetch(generateUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: prompt }]
                }
              ],
              generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 3000 // Limite ampliado para nunca cortar a resposta no meio
              }
            })
          });

          const geminiData = await geminiRes.json();
          if (geminiRes.ok && geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
            generatedText = geminiData.candidates[0].content.parts[0].text;
            modelUsed = model;
            break;
          } else {
            lastError = geminiData.error?.message || `Status ${geminiRes.status}`;
          }
        } catch (e) {
          lastError = e.message;
        }
      }

      if (!generatedText) {
        return new Response(JSON.stringify({ 
          error: "Erro na API do Gemini: " + lastError 
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({ text: generatedText, modelUsed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};
