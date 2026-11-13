// Yes / No Oracle Polarity, Context & Practical Conditions Engine
// Provides direct verdicts, concise answers, and actionable conditional tips ("Sim, mas depende...", "Não, a não ser que...")

import { t } from '../i18n/index.js';
import { SELF_HARM_REGEX, NECROMANCY_REGEX } from './safety.js';

// The raw text keeps the VEREDITO / RESPOSTA / DICA labels in every language: they are the
// format shared with the oracle Worker and parseYesNoAiResponse, not text shown to the visitor.
const rawYesNo = (verdict, answer, tip) => `VEREDITO: ${verdict}\nRESPOSTA: ${answer}\nDICA: ${tip}`;
const lowerFirst = (text) => text.charAt(0).toLocaleLowerCase() + text.slice(1);
const safeguard = (verdict, answer, tip) => ({
  source: 'ethical_safeguard',
  isAi: false,
  verdict,
  answer,
  tip,
  type: 'maybe',
  color: 'text-amber-400',
  badgeBg: 'bg-amber-500/20 border-amber-400/60',
  percentage: 50,
  rawText: rawYesNo(verdict, answer, tip),
});

export const getYesNoEvaluation = (card, isReversed = false) => {
  if (!card) {
    return {
      verdict: t('yn.v.maybe'),
      type: 'maybe',
      percentage: 50,
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 border-amber-400/60',
      summary: t('yn.none.summary'),
      tip: t('yn.none.tip')
    };
  }

  if (card.deckId === 'lenormand') {
    const positive = [1,2,9,16,17,18,24,25,30,31,33,34,35].includes(card.number);
    const negative = [6,7,8,10,11,21,23,36].includes(card.number);
    return { verdict: positive ? t('yn.v.condYes') : negative ? t('yn.v.noAlert') : t('yn.v.depends'), type: positive ? 'conditional_yes' : negative ? 'no' : 'maybe', percentage: 50, color: 'text-emerald-300', badgeBg: 'bg-emerald-500/20 border-emerald-400/60', summary: t('yn.lenormand.summary', { light: card.light }), tip: card.advice };
  }
  // --- REVERSED CARDS ---
  if (isReversed) {
    // Highly positive majors when reversed (delays rather than absolute "No")
    if (['major_0', 'major_1', 'major_19', 'major_21'].includes(card.id) || [0, 1, 19, 21].includes(card.number)) {
      return {
        verdict: t('yn.v.condYes'),
        type: 'conditional_yes',
        percentage: 60,
        color: 'text-amber-300',
        badgeBg: 'bg-amber-500/20 border-amber-400/60',
        summary: t('yn.revGood.summary', { name: card.name }),
        tip: t('yn.revGood.tip')
      };
    }

    // Heavy majors reversed (deep blockage or inner resistance)
    if (['major_13', 'major_15', 'major_16', 'major_18'].includes(card.id) || [13, 15, 16, 18].includes(card.number)) {
      return {
        verdict: t('yn.v.noAlert'),
        type: 'no',
        percentage: 15,
        color: 'text-rose-400',
        badgeBg: 'bg-rose-500/20 border-rose-400/60',
        summary: t('yn.revHeavy.summary', { name: card.name }),
        tip: t('yn.revHeavy.tip')
      };
    }

    return {
      verdict: t('yn.v.noBlock'),
      type: 'no',
      percentage: 25,
      color: 'text-rose-400',
      badgeBg: 'bg-rose-500/20 border-rose-400/60',
      summary: t('yn.revDefault.summary', { name: card.name }),
      tip: t('yn.revDefault.tip')
    };
  }

  // --- MAJOR ARCANA UPRIGHT ---
  if (card.arcana === 'Major') {
    // Definite Yes Majors
    const majorAbsoluteYes = [1, 3, 4, 6, 7, 8, 10, 14, 17, 19, 21];
    // 0: Louco, 2: Sacerdotisa, 5: Hierofante, 9: Eremita, 11: Justiça, 12: Enforcado
    const majorCautionNo = [13, 15, 16, 18, 20]; // Morte, Diabo, Torre, Lua, Julgamento

    if (card.number === 0) { // O Louco
      return {
        verdict: t('yn.v.yesCourage'),
        type: 'conditional_yes',
        percentage: 85,
        color: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/20 border-emerald-400/60',
        summary: t('yn.fool.summary'),
        tip: t('yn.fool.tip')
      };
    }

    if (card.number === 19) { // O Sol
      return {
        verdict: t('yn.v.yesSure'),
        type: 'yes',
        percentage: 98,
        color: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/20 border-emerald-400/60',
        summary: t('yn.sun.summary'),
        tip: t('yn.sun.tip')
      };
    }

    if (card.number === 21) { // O Mundo
      return {
        verdict: t('yn.v.yesSure'),
        type: 'yes',
        percentage: 95,
        color: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/20 border-emerald-400/60',
        summary: t('yn.world.summary'),
        tip: t('yn.world.tip')
      };
    }

    if (majorAbsoluteYes.includes(card.number)) {
      return {
        verdict: t('yn.v.yes'),
        type: 'yes',
        percentage: 90,
        color: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/20 border-emerald-400/60',
        summary: t('yn.majorYes.summary', { name: card.name }),
        tip: card.advice
          ? t('yn.majorYes.tipAdvice', { advice: card.advice })
          : t('yn.majorYes.tip')
      };
    }

    if (card.number === 11) { // A Justiça
      return {
        verdict: t('yn.v.depends'),
        type: 'maybe',
        percentage: 50,
        color: 'text-amber-400',
        badgeBg: 'bg-amber-500/20 border-amber-400/60',
        summary: t('yn.justice.summary'),
        tip: t('yn.justice.tip')
      };
    }

    if (card.number === 2) { // A Sacerdotisa
      return {
        verdict: t('yn.v.yesSecret'),
        type: 'conditional_yes',
        percentage: 65,
        color: 'text-amber-300',
        badgeBg: 'bg-amber-500/20 border-amber-400/60',
        summary: t('yn.priestess.summary'),
        tip: t('yn.priestess.tip')
      };
    }

    if (card.number === 9) { // O Eremita
      return {
        verdict: t('yn.v.notNow'),
        type: 'conditional_no',
        percentage: 40,
        color: 'text-amber-400',
        badgeBg: 'bg-amber-500/20 border-amber-400/60',
        summary: t('yn.hermit.summary'),
        tip: t('yn.hermit.tip')
      };
    }

    if (card.number === 12) { // O Enforcado
      return {
        verdict: t('yn.v.pause'),
        type: 'maybe',
        percentage: 45,
        color: 'text-amber-400',
        badgeBg: 'bg-amber-500/20 border-amber-400/60',
        summary: t('yn.hanged.summary'),
        tip: t('yn.hanged.tip')
      };
    }

    if (majorCautionNo.includes(card.number)) {
      return {
        verdict: t('yn.v.noCaution'),
        type: 'no',
        percentage: 15,
        color: 'text-rose-400',
        badgeBg: 'bg-rose-500/20 border-rose-400/60',
        summary: t('yn.majorNo.summary', { name: card.name }),
        tip: t('yn.majorNo.tip')
      };
    }
  }

  // --- MINOR ARCANA ---
  // Swords (Mental / Conflicts)
  if (card.suit === 'swords') {
    if (['ace', 'six'].includes(card.rank)) {
      return {
        verdict: t('yn.v.yesClarity'),
        type: 'yes',
        percentage: 80,
        color: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/20 border-emerald-400/60',
        summary: t('yn.swordsYes.summary'),
        tip: t('yn.swordsYes.tip')
      };
    }
    if (['three', 'seven', 'eight', 'nine', 'ten', 'five'].includes(card.rank)) {
      return {
        verdict: t('yn.v.noTension'),
        type: 'no',
        percentage: 20,
        color: 'text-rose-400',
        badgeBg: 'bg-rose-500/20 border-rose-400/60',
        summary: t('yn.swordsNo.summary'),
        tip: t('yn.swordsNo.tip')
      };
    }
    return {
      verdict: t('yn.v.dependsReason'),
      type: 'maybe',
      percentage: 50,
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 border-amber-400/60',
      summary: t('yn.swordsMaybe.summary'),
      tip: t('yn.swordsMaybe.tip')
    };
  }

  // Wands (Fire / Action / Passion)
  if (card.suit === 'wands') {
    if (['five', 'nine', 'ten'].includes(card.rank)) {
      return {
        verdict: t('yn.v.yesEffort'),
        type: 'conditional_yes',
        percentage: 65,
        color: 'text-amber-300',
        badgeBg: 'bg-amber-500/20 border-amber-400/60',
        summary: t('yn.wandsEffort.summary'),
        tip: t('yn.wandsEffort.tip')
      };
    }
    return {
      verdict: t('yn.v.yesEnergy'),
      type: 'yes',
      percentage: 90,
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20 border-emerald-400/60',
      summary: t('yn.wandsYes.summary'),
      tip: t('yn.wandsYes.tip')
    };
  }

  // Cups (Water / Emotions / Relationships)
  if (card.suit === 'cups') {
    if (['five', 'seven', 'eight'].includes(card.rank)) {
      return {
        verdict: t('yn.v.noDisillusion'),
        type: 'no',
        percentage: 30,
        color: 'text-rose-400',
        badgeBg: 'bg-rose-500/20 border-rose-400/60',
        summary: t('yn.cupsNo.summary'),
        tip: t('yn.cupsNo.tip')
      };
    }
    return {
      verdict: t('yn.v.yesHeart'),
      type: 'yes',
      percentage: 90,
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20 border-emerald-400/60',
      summary: t('yn.cupsYes.summary'),
      tip: t('yn.cupsYes.tip')
    };
  }

  // Pentacles (Earth / Material / Stability)
  if (card.suit === 'pentacles') {
    if (['five'].includes(card.rank)) {
      return {
        verdict: t('yn.v.noScarcity'),
        type: 'no',
        percentage: 20,
        color: 'text-rose-400',
        badgeBg: 'bg-rose-500/20 border-rose-400/60',
        summary: t('yn.pentNo.summary'),
        tip: t('yn.pentNo.tip')
      };
    }
    if (['four', 'seven'].includes(card.rank)) {
      return {
        verdict: t('yn.v.yesPatience'),
        type: 'conditional_yes',
        percentage: 70,
        color: 'text-amber-300',
        badgeBg: 'bg-amber-500/20 border-amber-400/60',
        summary: t('yn.pentPatience.summary'),
        tip: t('yn.pentPatience.tip')
      };
    }
    return {
      verdict: t('yn.v.yesSolid'),
      type: 'yes',
      percentage: 90,
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20 border-emerald-400/60',
      summary: t('yn.pentYes.summary'),
      tip: t('yn.pentYes.tip')
    };
  }

  // Default fallback
  return {
    verdict: t('yn.v.yes'),
    type: 'yes',
    percentage: 80,
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/20 border-emerald-400/60',
    summary: t('yn.default.summary'),
    tip: t('yn.default.tip')
  };
};


// Generate an ultra-direct, concise local fallback response matching the AI format
export const generateOfflineYesNoReading = ({ card, userQuestion, evaluation }) => {
  const q = (userQuestion || '').trim();

  // Ethical safeguards: no reading for self-harm (crisis lines instead) or contact with the dead.
  if (SELF_HARM_REGEX.test(q)) {
    return safeguard(t('yn.v.support'), t('safety.yn.answer'), t('safety.yn.tip', { crisis: t('safety.crisis') }));
  }
  if (NECROMANCY_REGEX.test(q)) {
    return safeguard(t('yn.v.self'), t('safety.ynNecro.answer'), t('safety.ynNecro.tip'));
  }

  const evalData = evaluation || getYesNoEvaluation(card, card?.isReversed);

  const name = card ? `${card.name}${card.isReversed ? ` (${t('common.reversed')})` : ''}` : t('yn.offline.revealed');
  const summary = lowerFirst(evalData.summary);
  let directAnswer = q
    ? t('yn.offline.withQuestion', { question: q, name, summary })
    : t('yn.offline.noQuestion', { name, summary });

  if (card?.deckId === 'lenormand') directAnswer = `${card.name}: ${card.light}`;

  return {
    source: 'local_fallback',
    isAi: false,
    verdict: evalData.verdict,
    answer: directAnswer,
    tip: evalData.tip,
    type: evalData.type,
    color: evalData.color,
    badgeBg: evalData.badgeBg,
    percentage: evalData.percentage,
    rawText: rawYesNo(evalData.verdict, directAnswer, evalData.tip)
  };
};
