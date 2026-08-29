// Real AI Oracle Integration via Serverless Cloudflare Worker Proxy (100% Free, Zero Login, Zero User Keys)
// With Full Archetypal Fallback Engine, Bulletproof Section Parser & Direct Yes/No AI Engine

import { getYesNoEvaluation, generateOfflineYesNoReading } from './yesNoOracle';

// Cloudflare Worker Endpoint
const DEFAULT_WORKER_URL = import.meta.env.VITE_ORACLE_API_URL || 'https://lumina-oracle.jpedrooliveiragritz.workers.dev';

const cleanHeader = (str) => {
  if (!str) return '';
  return str
    .replace(/^###\s*[^\n]*\n?/gi, '')
    .replace(/^###\s*🔍[^\n]*/gi, '')
    .replace(/^###\s*💡[^\n]*/gi, '')
    .replace(/^###\s*🧭[^\n]*/gi, '')
    .replace(/^###\s*🌌[^\n]*/gi, '')
    .replace(/^###\s*🔮[^\n]*/gi, '')
    .replace(/^###\s*🗝️[^\n]*/gi, '')
    .trim();
};

// Parse structured markdown sections with total resilience for Standard Readings
const parseAiSections = (text, fallbackData) => {
  if (!text) return null;

  let diagnosis = '';
  let dynamics = '';
  let advice = '';

  // Match sections by modern clean emojis/headers or legacy headers
  const diagMatch = text.match(/(?:###\s*(?:🔍|🌌)|(?:🔍|🌌))[^\n]*\n?([\s\S]*?)(?=(?:###\s*(?:💡|🔮)|(?:💡|🔮))|$)/i);
  const dynMatch = text.match(/(?:###\s*(?:💡|🔮)|(?:💡|🔮))[^\n]*\n?([\s\S]*?)(?=(?:###\s*(?:🧭|🗝️)|(?:🧭|🗝️))|$)/i);
  const advMatch = text.match(/(?:###\s*(?:🧭|🗝️)|(?:🧭|🗝️))[^\n]*\n?([\s\S]*?)$/i);

  if (diagMatch && diagMatch[1]) diagnosis = cleanHeader(diagMatch[1]);
  if (dynMatch && dynMatch[1]) dynamics = cleanHeader(dynMatch[1]);
  if (advMatch && advMatch[1]) advice = cleanHeader(advMatch[1]);

  // Fallback splitting if tokens were cut
  if (!dynamics || !advice || dynamics.length < 10 || advice.length < 10) {
    const rawClean = text.replace(/###\s*[^\n]*\n?/g, '').trim();
    const paragraphs = rawClean.split('\n\n').filter(p => p.trim().length > 15);
    
    if (paragraphs.length >= 3) {
      diagnosis = paragraphs[0].trim();
      dynamics = paragraphs[1].trim();
      advice = paragraphs.slice(2).join('\n\n').trim();
    } else if (paragraphs.length === 2) {
      diagnosis = paragraphs[0].trim();
      dynamics = paragraphs[1].trim();
      advice = fallbackData?.advice || 'O conselho principal é manter a calma, ser honesto com você mesmo e não tomar decisões por impulso.';
    } else if (paragraphs.length === 1 && paragraphs[0].length > 20) {
      diagnosis = paragraphs[0].trim();
      dynamics = fallbackData?.dynamics || 'A situação atual pede paciência para enxergar as coisas com mais clareza.';
      advice = fallbackData?.advice || 'Dê um passo de cada vez e confie na sua intuição.';
    }
  }

  return {
    diagnosis: diagnosis || text.trim(),
    dynamics: dynamics || (fallbackData?.dynamics || 'A situação atual pede calma e observação atenta.'),
    advice: advice || (fallbackData?.advice || 'Mantenha os pés no chão e faça escolhas conscientes.'),
    text: text.trim()
  };
};

// Parse structured Yes/No AI responses with bulletproof format recovery
const parseYesNoAiResponse = (text, fallbackData) => {
  if (!text) return fallbackData;

  let verdict = '';
  let answer = '';
  let tip = '';

  // Match structured labels
  const verdictMatch = text.match(/(?:VEREDITO|VEREDICTO|RESULTADO)\s*:\s*([^\n]+)/i);
  const answerMatch = text.match(/(?:RESPOSTA|EXPLICAÇÃO|SÍNTESE)\s*:\s*([\s\S]*?)(?=(?:DICA|CONSELHO|VEREDITO|$))/i);
  const tipMatch = text.match(/(?:DICA|CONSELHO|ORIENTAÇÃO)\s*:\s*([\s\S]*?)$/i);

  if (verdictMatch && verdictMatch[1]) {
    verdict = verdictMatch[1].replace(/[*_#\[\]]/g, '').trim();
  }

  if (answerMatch && answerMatch[1]) {
    answer = answerMatch[1].replace(/[*_#\[\]]/g, '').trim();
  }

  if (tipMatch && tipMatch[1]) {
    tip = tipMatch[1].replace(/[*_#\[\]]/g, '').trim();
  }

  // Handle older 3-section format if received from older worker versions
  if (!answer && (text.includes('###') || text.includes('Diagnóstico') || text.includes('Conselho'))) {
    const diag = text.match(/(?:###\s*(?:🔍|🌌)|(?:🔍|🌌))[^\n]*\n?([\s\S]*?)(?=(?:###|$))/i);
    const adv = text.match(/(?:###\s*(?:🧭|🗝️)|(?:🧭|🗝️))[^\n]*\n?([\s\S]*?)$/i);

    if (diag && diag[1]) {
      const cleanDiag = diag[1].replace(/[*_#]/g, '').trim();
      const sentences = cleanDiag.match(/[^.!?]+[.!?]+/g) || [cleanDiag];
      answer = sentences.slice(0, 2).join(' ').trim();
    }
    if (adv && adv[1]) {
      const cleanAdv = adv[1].replace(/[*_#]/g, '').trim();
      const advSentences = cleanAdv.match(/[^.!?]+[.!?]+/g) || [cleanAdv];
      tip = advSentences.slice(0, 1).join(' ').trim();
    }
  }

  // Fallback field assignments
  if (!verdict) verdict = fallbackData?.verdict || 'SIM';
  if (!answer) {
    const lines = text.replace(/[*_#]/g, '').split('\n').map(l => l.trim()).filter(Boolean);
    answer = lines[0] || fallbackData?.answer || 'As cartas mostram um movimento direto para a sua questão.';
  }
  if (!tip) tip = fallbackData?.tip || 'Mantenha a firmeza nas suas decisões e observe os detalhes práticos.';

  // Ensure tip starts with practical nuance if missing
  if (fallbackData?.tip && (!tip.toLowerCase().includes('depende') && !tip.toLowerCase().includes('mas') && !tip.toLowerCase().includes('a não ser') && !tip.toLowerCase().includes('sim') && !tip.toLowerCase().includes('não'))) {
    tip = `${fallbackData.tip} (${tip})`;
  }

  // Reconcile and guarantee zero divergence between verdict and answer:
  const lowerAnswer = answer.toLowerCase().trim();
  let vUpper = verdict.toUpperCase();

  // If answer explicitly starts with a negative but verdict is positive, align verdict
  if ((lowerAnswer.startsWith('não') || lowerAnswer.startsWith('nao')) && (vUpper.includes('SIM') && !vUpper.includes('NÃO'))) {
    verdict = fallbackData?.verdict || 'NÃO / CAUTELA';
    vUpper = verdict.toUpperCase();
  }
  // If answer explicitly starts with affirmative but verdict is strictly negative, align verdict
  else if ((lowerAnswer.startsWith('sim') || lowerAnswer.startsWith('com certeza')) && (vUpper.includes('NÃO') || vUpper.includes('NAO'))) {
    verdict = fallbackData?.verdict || 'SIM, COM CONDIÇÃO';
    vUpper = verdict.toUpperCase();
  }

  // Determine styling based on final verified verdict text
  let type = 'yes';
  let color = 'text-emerald-400';
  let badgeBg = 'bg-emerald-500/20 border-emerald-400/60';

  if (vUpper.includes('NÃO') || vUpper.includes('NAO') || vUpper.includes('BLOQUEIO') || vUpper.includes('CAUTELA')) {
    type = 'no';
    color = 'text-rose-400';
    badgeBg = 'bg-rose-500/20 border-rose-400/60';
  } else if (vUpper.includes('DEPENDE') || vUpper.includes('TALVEZ') || vUpper.includes('NEUTRO') || vUpper.includes('PAUSA')) {
    type = 'maybe';
    color = 'text-amber-400';
    badgeBg = 'bg-amber-500/20 border-amber-400/60';
  } else if (vUpper.includes('CONDIÇÃO') || vUpper.includes('CONDICAO') || vUpper.includes('MAS')) {
    type = 'conditional_yes';
    color = 'text-amber-300';
    badgeBg = 'bg-amber-500/20 border-amber-400/60';
  }

  return {
    isAi: true,
    verdict,
    answer,
    tip,
    type,
    color,
    badgeBg,
    percentage: fallbackData?.percentage || (type === 'yes' ? 90 : type === 'no' ? 20 : 55),
    rawText: text.trim()
  };
};

export const aiOracleService = {
  // Call Cloudflare Worker AI Proxy for Standard Multi-Card Spreads
  async generateRealAiReading({ spreadConfig, chosenCards, userQuestion }) {
    const validCards = chosenCards.filter(Boolean);
    if (validCards.length === 0) return null;

    const fallback = this.generateOfflineFallback({ spreadConfig, chosenCards, userQuestion });
    const workerUrl = DEFAULT_WORKER_URL || localStorage.getItem('lumina_worker_url') || '';

    if (workerUrl) {
      try {
        const response = await fetch(workerUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            spreadConfig: {
              name: spreadConfig.name,
              description: spreadConfig.description,
              positions: spreadConfig.positions
            },
            chosenCards: validCards.map((c, i) => ({
              name: c.name,
              arcana: c.arcana,
              suit: c.suit,
              isReversed: Boolean(c.isReversed),
              keywords: c.keywords,
              light: c.light,
              shadow: c.shadow,
              advice: c.advice,
              positionName: spreadConfig.positions?.[i]?.name || `Posição ${i + 1}`
            })),
            userQuestion: (userQuestion || '').trim()
          })
        });

        if (response.ok) {
          const data = await response.json();
          const generatedText = data.text || data.reading || data.content || '';
          if (generatedText && generatedText.length > 25) {
            const parsed = parseAiSections(generatedText, fallback);
            return {
              source: 'cloudflare_gemini_ai',
              ...parsed
            };
          }
        }
      } catch (err) {
        console.warn('Worker proxy unavailable, using clear fallback engine:', err);
      }
    }

    // Seamless Local Fallback
    return fallback;
  },

  // Direct, Concise & Objective Yes/No AI Reading with Actionable Practical Tips
  async generateYesNoAiReading({ card, userQuestion }) {
    if (!card) return null;

    const evalData = getYesNoEvaluation(card, card.isReversed);
    const fallback = generateOfflineYesNoReading({ card, userQuestion, evaluation: evalData });
    const workerUrl = DEFAULT_WORKER_URL || localStorage.getItem('lumina_worker_url') || '';

    if (workerUrl) {
      try {
        const response = await fetch(workerUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            mode: 'yes_no',
            spreadConfig: {
              name: 'Sim ou Não',
              isYesNo: true
            },
            chosenCards: [{
              name: card.name,
              arcana: card.arcana,
              suit: card.suit,
              isReversed: Boolean(card.isReversed),
              light: card.light,
              shadow: card.shadow,
              advice: card.advice,
              traditionalVerdict: evalData.verdict,
              traditionalType: evalData.type,
              traditionalSummary: evalData.summary,
              traditionalTip: evalData.tip
            }],
            userQuestion: (userQuestion || '').trim()
          })
        });

        if (response.ok) {
          const data = await response.json();
          const generatedText = data.text || data.reading || data.content || '';
          if (generatedText && generatedText.length > 10) {
            const parsed = parseYesNoAiResponse(generatedText, fallback);
            return {
              source: 'cloudflare_gemini_ai',
              ...parsed
            };
          }
        }
      } catch (err) {
        console.warn('Worker proxy for Yes/No unavailable, using resilient fallback:', err);
      }
    }

    return fallback;
  },

  // Realistic, Direct & Honest Local Fallback for Spreads (Grammatically Flawless & Natural)
  generateOfflineFallback({ spreadConfig, chosenCards, userQuestion }) {
    const validCards = chosenCards.filter(Boolean);
    const first = validCards[0] || {};
    const middle = validCards[Math.floor(validCards.length / 2)] || first;
    const last = validCards[validCards.length - 1] || first;
    const q = (userQuestion || '').trim();

    // Ethical Safeguard: Suicide and Self-Harm Prevention
    const isSelfHarm = /\b(suic[ií]d|me\s+matar|morrer|automutila|tirar\s+a\s+(minha\s+)?vida|cortar\s+os\s+pulsos|acabar\s+com\s+a\s+(minha\s+)?vida|acabar\s+com\s+tudo|me\s+enforcar|quero\s+morrer)\b/i.test(q);
    if (isSelfHarm) {
      return {
        source: 'ethical_safeguard',
        diagnosis: 'O Lumina Tarot é um oráculo sagrado dedicado à preservação da vida, ao autoconhecimento e à esperança. Não realizamos leituras sobre autodestruição, morte ou ideação suicida. Reconhecemos que o momento pode estar gerando uma dor imensa, mas você não precisa carregar esse sofrimento sozinho.',
        dynamics: 'Momentos de profunda escuridão e desamparo exigem acolhimento humano real, escuta atenta e apoio profissional especializado. Há caminhos de reconstrução e alívio quando permitimos que pessoas qualificadas nos estendam a mão.',
        advice: 'Por favor, busque ajuda humana imediata: no Brasil, ligue gratuitamente para o Centro de Valorização da Vida (CVV) pelo telefone 188 (atendimento sigiloso 24 horas) ou procure um serviço de emergência de saúde mental.',
        text: '### 🌌 O que as cartas mostram\nO Lumina Tarot é um oráculo sagrado dedicado à preservação da vida, ao autoconhecimento e à esperança. Não realizamos leituras sobre autodestruição, morte ou ideação suicida. Reconhecemos que o momento pode estar gerando uma dor imensa, mas você não precisa carregar esse sofrimento sozinho.\n\n### 💡 A Dinâmica das Forças Ocultas\nMomentos de profunda escuridão e desamparo exigem acolhimento humano real, escuta atenta e apoio profissional especializado. Há caminhos de reconstrução e alívio quando permitimos que pessoas qualificadas nos estendam a mão.\n\n### 🧭 O que fazer na prática\nPor favor, busque ajuda humana imediata: no Brasil, ligue gratuitamente para o Centro de Valorização da Vida (CVV) pelo telefone 188 (atendimento sigiloso 24 horas) ou procure um serviço de emergência de saúde mental.'
      };
    }

    // Ethical Safeguard: Necromancy and Contact with Deceased
    const isNecromancy = /\b(parente\s+morto|parente\s+falecid|falar\s+com\s+(o\s+|a\s+)?(morto|falecid|morta|falecida|espirito|espírito)|psicograf|alma\s+do\s+meu|alma\s+da\s+minha|falar\s+com\s+quem\s+morreu|esp[ií]rito\s+do\s+meu|m[eé]dium|incorporar)\b/i.test(q);
    if (isNecromancy) {
      return {
        source: 'ethical_safeguard',
        diagnosis: 'O Tarot atua como um espelho de reflexão e discernimento para a consciência dos seres vivos no plano terreno. Não operamos como canal mediúnico, psicografia ou necromancia para estabelecer comunicação direta com espíritos ou entes já falecidos.',
        dynamics: 'O vínculo com quem partiu permanece vivo na memória afetiva, no respeito ao legado e no amor compartilhado. O simbolismo das cartas convida você a acolher as etapas do luto e cuidar das suas próprias emoções no presente.',
        advice: 'Direcione sua energia para a sua própria cura e paz de espírito. Honre a memória de quem partiu vivendo com dignidade e amor no aqui e agora.',
        text: '### 🌌 O que as cartas mostram\nO Tarot atua como um espelho de reflexão e discernimento para a consciência dos seres vivos no plano terreno. Não operamos como canal mediúnico, psicografia ou necromancia para estabelecer comunicação direta com espíritos ou entes já falecidos.\n\n### 💡 A Dinâmica das Forças Ocultas\nO vínculo com quem partiu permanece vivo na memória afetiva, no respeito ao legado e no amor compartilhado. O simbolismo das cartas convida você a acolher as etapas do luto e cuidar das suas próprias emoções no presente.\n\n### 🧭 O que fazer na prática\nDirecione sua energia para a sua própria cura e paz de espírito. Honre a memória de quem partiu vivendo com dignidade e amor no aqui e agora.'
      };
    }

    // Clean text helper to prevent double punctuation
    const cleanAttr = (str) => (str || '').replace(/[.!?]+$/, '').trim();
    const firstLight = cleanAttr(first.light || first.keywords?.slice(0, 2).join(', ') || 'recomeço e clareza');
    const firstShadow = cleanAttr(first.shadow || 'dúvidas e bloqueios');
    const middleLight = cleanAttr(middle.light || middle.keywords?.slice(0, 2).join(', ') || 'estabilidade e ação');
    const middleShadow = cleanAttr(middle.shadow || 'desgaste e indefinição');

    // Identify shadow or warning cards
    const shadowCard = validCards.find(c => 
      c.isReversed || 
      ['O Diabo', 'A Torre', 'A Morte', 'A Lua', 'Três de Espadas', 'Dez de Espadas', 'Sete de Espadas', 'Cinco de Ouros', 'Cinco de Copas', 'O Enforcado'].some(name => c.name.includes(name))
    );

    let diagnosis = '';
    if (q) {
      if (first.isReversed) {
        diagnosis = `Para a sua consulta ("${q}"): o arcano ${first.name} (Invertido) indica que há entraves e falta de transparência no momento. A energia da carta alerta para ${firstShadow.toLowerCase()}.`;
      } else {
        diagnosis = `Para a sua consulta ("${q}"): o arcano ${first.name} traz a energia de ${firstLight.toLowerCase()}. As cartas indicam que os acontecimentos estão diretamente ligados a esse movimento.`;
      }
    } else {
      if (first.isReversed) {
        diagnosis = `O arcano ${first.name} (Invertido) aponta um momento de atenção no seu caminho. A energia atual reflete ${firstShadow.toLowerCase()}.`;
      } else {
        diagnosis = `O arcano ${first.name} destaca que o seu momento atual é movido por ${firstLight.toLowerCase()}.`;
      }
    }

    let dynamics = '';
    if (shadowCard && shadowCard.id !== first.id) {
      const sName = shadowCard.name;
      const sMeaning = cleanAttr(shadowCard.isReversed ? shadowCard.shadow : shadowCard.light || 'desafios operacionais');
      dynamics = `Por trás desse cenário, a presença de ${sName} ${shadowCard.isReversed ? '(Invertida)' : ''} revela o ponto de maior atenção: ${sMeaning.toLowerCase()}. Em conjunto com ${middle.name}, isso mostra a necessidade de analisar os detalhes antes de agir.`;
    } else {
      dynamics = `Na dinâmica das cartas, ${first.name} e ${middle.name} atuam juntas. Enquanto a primeira carta define o tom da situação, ${middle.name} reforça a importância de focar em ${middleLight.toLowerCase()}.`;
    }

    const cleanAdvice = cleanAttr(last.advice || 'Aja com firmeza, clareza e pés no chão.');
    let advice = `Orientação prática do arcano ${last.name}: ${cleanAdvice}. Analise a situação com discernimento e tome sua decisão com base nos fatos concretos.`;

    return {
      source: 'local_fallback',
      diagnosis,
      dynamics,
      advice,
      text: `### 🌌 O que as cartas mostram\n${diagnosis}\n\n### 💡 A Dinâmica das Forças Ocultas\n${dynamics}\n\n### 🧭 O que fazer na prática\n${advice}`
    };
  }
};
