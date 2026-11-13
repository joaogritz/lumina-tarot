// AI readings through the Cloudflare Worker proxy (no login, no user keys).
// When the Worker cannot answer, the result is { source: 'unavailable' } and the UI offers a retry:
// readings are never replaced by locally generated text. Ethical safeguards still answer locally.

import { getYesNoEvaluation, generateOfflineYesNoReading } from './yesNoOracle.js';
import { DEFAULT_ORACLE_URL } from '../config.js';
import { t, getLocale } from '../i18n/index.js';
import { SELF_HARM_REGEX, NECROMANCY_REGEX } from './safety.js';

// Must exceed the Worker's shared provider deadline (29 s) so its answer is not cut off.
const ORACLE_TIMEOUT_MS = 32000;
// While a reading streams in, the wait restarts with every piece; silence this long ends it.
const STREAM_IDLE_MS = 20000;

/* global process */
// Cloudflare Worker Endpoint
const DEFAULT_WORKER_URL = (typeof window === 'undefined')
  ? (typeof process !== 'undefined' ? process.env?.VITE_ORACLE_API_URL || '' : '')
  : (import.meta.env?.VITE_ORACLE_API_URL || DEFAULT_ORACLE_URL);

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
      advice = fallbackData?.advice || t('oracle.fill.advice2');
    } else if (paragraphs.length === 1 && paragraphs[0].length > 20) {
      diagnosis = paragraphs[0].trim();
      dynamics = fallbackData?.dynamics || t('oracle.fill.dynamics1');
      advice = fallbackData?.advice || t('oracle.fill.advice1');
    }
  }

  return {
    diagnosis: diagnosis || text.trim(),
    dynamics: dynamics || (fallbackData?.dynamics || t('oracle.fill.dynamics')),
    advice: advice || (fallbackData?.advice || t('oracle.fill.advice')),
    text: text.trim()
  };
};

// Sections of a reading still being written: only what has arrived, never filler text.
// Uses the same section markers as parseAiSections so the final text replaces it seamlessly.
export const parsePartialSections = (text) => {
  const tidy = (part) => cleanHeader(part || '').replace(/#+\s*$/, '').trim();
  const diag = text.match(/(?:###\s*(?:🔍|🌌)|(?:🔍|🌌))[^\n]*\n([\s\S]*?)(?=(?:###\s*(?:💡|🔮)|(?:💡|🔮))|$)/i);
  const dyn = text.match(/(?:###\s*(?:💡|🔮)|(?:💡|🔮))[^\n]*\n([\s\S]*?)(?=(?:###\s*(?:🧭|🗝️)|(?:🧭|🗝️))|$)/i);
  const adv = text.match(/(?:###\s*(?:🧭|🗝️)|(?:🧭|🗝️))[^\n]*\n([\s\S]*?)$/i);
  const sections = { diagnosis: tidy(diag?.[1]), dynamics: tidy(dyn?.[1]), advice: tidy(adv?.[1]) };
  // A reply without the expected headings is shown as plain text while it streams.
  if (!diag && !dyn && !adv && text.length > 120) sections.diagnosis = tidy(text.replace(/^#+[^\n]*$/gm, ''));
  return { ...sections, text };
};

// Reads the Worker's server-sent events (delta / reset / done / error) and returns the full text.
// onText gets the text so far after every change; onActivity is called whenever bytes arrive.
export const readOracleStream = async (body, { onText, onActivity } = {}) => {
  const reader = body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  let text = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) throw new Error('stream ended early');
    onActivity?.();
    buffer += value;
    let end;
    while ((end = buffer.indexOf('\n\n')) >= 0) {
      const block = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);
      const data = block.split('\n').filter(l => l.startsWith('data:')).map(l => l.slice(5).trim()).join('');
      if (!data) continue;
      let event;
      try { event = JSON.parse(data); } catch { continue; }
      if (event.t === 'delta' && typeof event.v === 'string') { text += event.v; onText?.(text); }
      else if (event.t === 'reset') { text = ''; onText?.(text); }
      else if (event.t === 'done') { reader.cancel().catch(() => {}); return text; }
      else if (event.t === 'error') { reader.cancel().catch(() => {}); throw new Error('oracle unavailable'); }
    }
  }
};

// Verdict vocabulary in Portuguese, English, Spanish and French (the oracle answers in the
// visitor's language). \p{L} lookarounds keep accented words whole.
const wordsIn = (list) => new RegExp(`(?<!\\p{L})(?:${list.join('|')})(?!\\p{L})`, 'iu');
const NO_WORDS = wordsIn(['NÃO', 'NAO', 'NO', 'NOT', 'NON', 'PAS', 'BLOQUEIO', 'BLOCKED', 'BLOQUEO', 'BLOCAGE', 'CAUTELA', 'CAUTION', 'PRUDENCE']);
const YES_WORDS = wordsIn(['SIM', 'YES', 'SÍ', 'SI', 'OUI']);
const MAYBE_WORDS = wordsIn(['DEPENDE', 'DEPENDS', 'DÉPEND', 'TALVEZ', 'MAYBE', 'QUIZÁS', 'QUIZAS', 'PEUT-ÊTRE', 'PEUT-ETRE', 'NEUTRO', 'NEUTRAL', 'NEUTRE', 'PAUSA', 'PAUSE']);
const CONDITION_WORDS = wordsIn(['CONDIÇÃO', 'CONDICAO', 'CONDITION', 'CONDICIÓN', 'CONDICION', 'MAS', 'BUT', 'PERO', 'MAIS']);
const ANSWER_OPENS_NO = /^(?:não|nao|no|non)(?!\p{L})/iu;
const ANSWER_OPENS_YES = /^(?:sim|com certeza|yes|of course|sí|si|claro|oui|bien sûr)(?!\p{L})/iu;
const SAFEGUARD_VERDICTS = () => [...new Set(['BUSQUE ', 'FOCO NO AUTOCONHECIMENTO', t('yn.v.support'), t('yn.v.self'), t('yn.v.facts')])].map((v) => v.toUpperCase());

// Parse structured Yes/No AI responses with bulletproof format recovery
export const parseYesNoAiResponse = (text, fallbackData) => {
  if (!text) return fallbackData;

  let verdict = '';
  let answer = '';
  let tip = '';

  // Match structured labels
  const verdictMatch = text.match(/(?:VEREDITO|VEREDICTO|VERDICT|RESULTADO)\s*:\s*([^\n]+)/i);
  const answerMatch = text.match(/(?:RESPOSTA|EXPLICAÇÃO|SÍNTESE|ANSWER|RESPUESTA|RÉPONSE|REPONSE)\s*:\s*([\s\S]*?)(?=(?:DICA|CONSELHO|TIP|CONSEJO|CONSEIL|VEREDITO|$))/i);
  const tipMatch = text.match(/(?:DICA|CONSELHO|ORIENTAÇÃO|TIP|CONSEJO|CONSEIL)\s*:\s*([\s\S]*?)$/i);

  if (verdictMatch && verdictMatch[1]) {
    verdict = verdictMatch[1].replace(/[*_#[\]]/g, '').trim();
  }

  if (answerMatch && answerMatch[1]) {
    answer = answerMatch[1].replace(/[*_#[\]]/g, '').trim();
  }

  if (tipMatch && tipMatch[1]) {
    tip = tipMatch[1].replace(/[*_#[\]]/g, '').trim();
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
  if (!verdict) verdict = fallbackData?.verdict || t('yn.v.yes');
  if (!answer) {
    const lines = text.replace(/[*_#]/g, '').split('\n').map(l => l.trim()).filter(Boolean);
    answer = lines[0] || fallbackData?.answer || t('oracle.fill.ynAnswer');
  }
  if (!tip) tip = fallbackData?.tip || t('oracle.fill.ynTip');

  // Preserve a complete AI answer as a unit; do not append a conflicting local tip.
  // This catches only explicit opening contradictions, not semantic equivalence.
  const lowerAnswer = answer.toLowerCase().trim();
  let vUpper = verdict.toUpperCase();

  // If the answer explicitly opens against the verdict, the answer wins: align the verdict.
  const saysNo = NO_WORDS.test(vUpper);
  if (ANSWER_OPENS_NO.test(lowerAnswer) && YES_WORDS.test(vUpper) && !saysNo) {
    verdict = t('yn.v.noAlert').split(' /')[0];
    vUpper = verdict.toUpperCase();
  } else if (ANSWER_OPENS_YES.test(lowerAnswer) && saysNo) {
    verdict = t('yn.v.yes');
    vUpper = verdict.toUpperCase();
  }

  // Determine styling based on final verified verdict text
  let type = 'yes';
  let color = 'text-emerald-400';
  let badgeBg = 'bg-emerald-500/20 border-emerald-400/60';

  if (SAFEGUARD_VERDICTS().some((v) => vUpper.startsWith(v))) {
    type = 'maybe';
    color = 'text-amber-400';
    badgeBg = 'bg-amber-500/20 border-amber-400/60';
  } else if (NO_WORDS.test(vUpper)) {
    type = 'no';
    color = 'text-rose-400';
    badgeBg = 'bg-rose-500/20 border-rose-400/60';
  } else if (MAYBE_WORDS.test(vUpper)) {
    type = 'maybe';
    color = 'text-amber-400';
    badgeBg = 'bg-amber-500/20 border-amber-400/60';
  } else if (CONDITION_WORDS.test(vUpper)) {
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

const lower = (text) => (text || '').toLocaleLowerCase();
// The Devil, the Tower, Death, the Moon, the Hanged Man and the hardest minor cards.
const SHADOW_CARD_IDS = ['major_15', 'major_16', 'major_13', 'major_18', 'major_12', 'swords_3', 'swords_10', 'swords_7', 'pentacles_5', 'cups_5'];

/** Returned when the Worker could not produce a reading; the UI shows a retry instead. */
export const UNAVAILABLE = Object.freeze({ source: 'unavailable' });

export const aiOracleService = {
  // Call Cloudflare Worker AI Proxy for Standard Multi-Card Spreads
  // With onProgress, the reading streams in: onProgress receives the partial sections as they arrive.
  async generateRealAiReading({ spreadConfig, chosenCards, userQuestion, onProgress }) {
    const validCards = chosenCards.filter(Boolean);
    if (validCards.length === 0) return null;

    const fallback = this.generateOfflineFallback({ spreadConfig, chosenCards, userQuestion });
    const workerUrl = DEFAULT_WORKER_URL;

    if (fallback.source === 'ethical_safeguard') return fallback;
    if (workerUrl) {
      const controller = new AbortController();
      let timer;
      const wait = (ms) => { clearTimeout(timer); timer = setTimeout(() => controller.abort(), ms); };
      wait(ORACLE_TIMEOUT_MS);
      try {
        const response = await fetch(workerUrl, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...(onProgress ? { Accept: 'text/event-stream, application/json' } : {})
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
              positionName: spreadConfig.positions?.[i]?.name || t('slot.position', { position: i + 1 })
            })),
            userQuestion: (userQuestion || '').trim(),
            locale: getLocale()
          })
        });

        if (response.ok) {
          let generatedText;
          // A Worker without streaming answers JSON even when a stream was requested.
          if (onProgress && response.body && (response.headers.get('Content-Type') || '').includes('text/event-stream')) {
            generatedText = await readOracleStream(response.body, {
              onActivity: () => wait(STREAM_IDLE_MS),
              onText: (text) => onProgress({ source: 'cloudflare_workers_ai', streaming: true, ...parsePartialSections(text) }),
            });
          } else {
            const data = await response.json();
            generatedText = data.text || data.reading || data.content || '';
          }
          if (typeof generatedText === 'string' && generatedText.length > 25) {
            const parsed = parseAiSections(generatedText, fallback);
            return {
              source: 'cloudflare_workers_ai',
              ...parsed
            };
          }
        }
      } catch (err) {
        console.warn('Oracle unavailable:', err);
      } finally {
        clearTimeout(timer);
      }
    }

    return UNAVAILABLE;
  },

  // Direct, Concise & Objective Yes/No AI Reading with Actionable Practical Tips
  async generateYesNoAiReading({ card, userQuestion }) {
    if (!card) return null;

    const evalData = getYesNoEvaluation(card, card.isReversed);
    const fallback = generateOfflineYesNoReading({ card, userQuestion, evaluation: evalData });
    const workerUrl = DEFAULT_WORKER_URL;

    if (fallback.source === 'ethical_safeguard') return fallback;
    if (workerUrl) {
      try {
        const response = await fetch(workerUrl, {
          method: 'POST',
          signal: AbortSignal.timeout(ORACLE_TIMEOUT_MS),
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            mode: 'yes_no',
            spreadConfig: {
              name: t('yesno.title'),
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
            userQuestion: (userQuestion || '').trim(),
            locale: getLocale()
          })
        });

        if (response.ok) {
          const data = await response.json();
          const generatedText = data.text || data.reading || data.content || '';
          if (typeof generatedText === 'string' && generatedText.length > 10) {
            const parsed = parseYesNoAiResponse(generatedText, fallback);
            return {
              source: 'cloudflare_workers_ai',
              ...parsed
            };
          }
        }
      } catch (err) {
        console.warn('Oracle unavailable:', err);
      }
    }

    return UNAVAILABLE;
  },

  // Local text: used for the ethical safeguards and to fill sections the AI left empty.
  generateOfflineFallback({ chosenCards, userQuestion }) {
    const validCards = chosenCards.filter(Boolean);
    const first = validCards[0] || {};
    const middle = validCards[Math.floor(validCards.length / 2)] || first;
    const last = validCards[validCards.length - 1] || first;
    const q = (userQuestion || '').trim();

    // Ethical safeguards: no reading for self-harm (crisis lines instead) or contact with the dead.
    const sectioned = (diagnosis, dynamics, advice) => ({
      source: 'ethical_safeguard',
      diagnosis,
      dynamics,
      advice,
      text: `### 🌌 ${t('reading.section1')}\n${diagnosis}\n\n### 💡 ${t('reading.section2')}\n${dynamics}\n\n### 🧭 ${t('reading.section3')}\n${advice}`,
    });
    if (SELF_HARM_REGEX.test(q)) {
      return sectioned(t('safety.read.diagnosis'), t('safety.read.dynamics'), t('safety.read.advice', { crisis: t('safety.crisis') }));
    }
    if (NECROMANCY_REGEX.test(q)) {
      return sectioned(t('safety.necro.diagnosis'), t('safety.necro.dynamics'), t('safety.necro.advice'));
    }

    if (first.deckId === 'lenormand') {
      const diagnosis = t('oracle.fb.lenormandIntro', { cards: validCards.map(c => c.name + ' — ' + c.light).join(' ') });
      const dynamics = validCards.length > 1
        ? validCards.slice(0, -1).map((c, i) => t('oracle.fb.lenormandPair', { a: c.name, b: validCards[i + 1].name, x: lower(c.keywords[0]), y: lower(validCards[i + 1].keywords[0]) })).join(' ')
        : t('oracle.fb.lenormandSingle');
      const advice = t('oracle.fb.lenormandAdvice', { advice: last.advice });
      return { source: 'local_fallback', diagnosis, dynamics, advice, text: diagnosis + '\n\n' + dynamics + '\n\n' + advice };
    }
    // Clean text helper to prevent double punctuation
    const cleanAttr = (str) => (str || '').replace(/[.!?]+$/, '').trim();
    const firstLight = lower(cleanAttr(first.light || first.keywords?.slice(0, 2).join(', ') || t('oracle.fb.defaultLight')));
    const firstShadow = lower(cleanAttr(first.shadow || t('oracle.fb.defaultShadow')));
    const middleLight = lower(cleanAttr(middle.light || middle.keywords?.slice(0, 2).join(', ') || t('oracle.fb.defaultMiddle')));
    const reversed = t('common.reversed');

    // Shadow or warning cards, by id so it works in every language.
    const shadowCard = validCards.find(c => c.isReversed || SHADOW_CARD_IDS.includes(c.id));

    let diagnosis;
    if (q) {
      diagnosis = first.isReversed
        ? t('oracle.fb.qReversed', { question: q, name: first.name, reversed, shadow: firstShadow })
        : t('oracle.fb.q', { question: q, name: first.name, light: firstLight });
    } else {
      diagnosis = first.isReversed
        ? t('oracle.fb.reversed', { name: first.name, reversed, shadow: firstShadow })
        : t('oracle.fb.plain', { name: first.name, light: firstLight });
    }

    let dynamics;
    if (shadowCard && shadowCard.id !== first.id) {
      const name = shadowCard.isReversed ? `${shadowCard.name} (${reversed})` : shadowCard.name;
      const meaning = lower(cleanAttr(shadowCard.isReversed ? shadowCard.shadow : shadowCard.light || t('oracle.fb.defaultShadowMeaning')));
      dynamics = t('oracle.fb.shadow', { name, meaning, middle: middle.name });
    } else {
      dynamics = t('oracle.fb.pair', { first: first.name, middle: middle.name, light: middleLight });
    }

    const advice = t('oracle.fb.advice', { name: last.name, advice: cleanAttr(last.advice || t('oracle.fb.defaultAdvice')) });

    return {
      source: 'local_fallback',
      diagnosis,
      dynamics,
      advice,
      text: `### 🌌 ${t('reading.section1')}\n${diagnosis}\n\n### 💡 ${t('reading.section2')}\n${dynamics}\n\n### 🧭 ${t('reading.section3')}\n${advice}`
    };
  }
};
