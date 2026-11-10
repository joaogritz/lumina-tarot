// Share image of a reading in the Stories format (1080×1920), drawn in the browser:
// the question, the cards in their positions and the oracle's advice, signed with the site address.
// Nothing leaves the device unless the person shares or saves the file.
import { getCardArtwork, artworkUrl } from '../data/cardArtwork.js';

const W = 1080;
const H = 1920;
const GOLD = '#c9a45c';
const GOLD_BRIGHT = '#e7c878';
const IVORY = '#e9e3d6';
const PARCHMENT = '#beb5a3';
const SERIF = '"Cormorant Garamond", Georgia, serif';
const SANS = 'Outfit, Arial, sans-serif';
// Same aged-paper grade the site applies to card artwork (--m-art-filter in maison.css).
const ART_FILTER = 'sepia(.2) saturate(.78) contrast(1.06) brightness(.94)';

const loadImage = (src) => new Promise((resolve) => {
  const img = new Image();
  img.decoding = 'async';
  img.onload = () => resolve(img);
  img.onerror = () => resolve(null);
  img.src = src;
});

const plain = (text) => String(text || '').replace(/[*_#>`]/g, '').replace(/\s+/g, ' ').trim();

// Splits text into lines that fit maxWidth; the last allowed line ends with an ellipsis if cut.
function wrap(ctx, text, maxWidth, maxLines) {
  const words = plain(text).split(' ').filter(Boolean);
  const lines = [];
  let line = '';
  for (let i = 0; i < words.length; i++) {
    const next = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(next).width <= maxWidth || !line) { line = next; continue; }
    lines.push(line);
    line = words[i];
    if (lines.length === maxLines) {
      let last = lines[maxLines - 1];
      while (last && ctx.measureText(`${last}…`).width > maxWidth) last = last.replace(/\s*\S+$/, '');
      lines[maxLines - 1] = `${last.replace(/[,;:.!?]$/, '')}…`;
      return lines;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// The advice is the most shareable part; it is cut at a sentence end when one fits.
function excerptOf(reading) {
  const source = plain(reading?.advice || reading?.diagnosis || reading?.text);
  const sentences = source.match(/[^.!?]+[.!?]+/g) || [source];
  let out = '';
  for (const sentence of sentences) {
    if ((out + sentence).length > 330 && out) break;
    out += sentence;
  }
  return out.trim();
}

function setFont(ctx, font, spacing = 0) {
  ctx.font = font;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${spacing}px`;
}

function drawBackground(ctx) {
  ctx.fillStyle = '#030303';
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 760, 40, W / 2, 760, 1150);
  glow.addColorStop(0, '#1a1410');
  glow.addColorStop(0.55, '#0c0a09');
  glow.addColorStop(1, '#030303');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  const violet = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, 900);
  violet.addColorStop(0, '#15101f99');
  violet.addColorStop(1, '#15101f00');
  ctx.fillStyle = violet;
  ctx.fillRect(0, 0, W, H);
  // Fixed star field, the same on every image.
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 140; i++) {
    ctx.globalAlpha = 0.15 + rand() * 0.5;
    ctx.fillStyle = rand() > 0.85 ? GOLD_BRIGHT : IVORY;
    ctx.beginPath();
    ctx.arc(rand() * W, rand() * H, rand() * 1.6 + 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // Double hairline frame with diamond corners.
  ctx.strokeStyle = `${GOLD}8c`;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(48, 48, W - 96, H - 96);
  ctx.strokeStyle = `${GOLD}33`;
  ctx.lineWidth = 1;
  ctx.strokeRect(64, 64, W - 128, H - 128);
  ctx.fillStyle = GOLD;
  for (const [x, y] of [[48, 48], [W - 48, 48], [48, H - 48], [W - 48, H - 48]]) {
    ctx.beginPath();
    ctx.moveTo(x, y - 9); ctx.lineTo(x + 9, y); ctx.lineTo(x, y + 9); ctx.lineTo(x - 9, y);
    ctx.closePath();
    ctx.fill();
  }
}

function ornament(ctx, y, width = 300) {
  ctx.strokeStyle = `${GOLD}99`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - width / 2, y); ctx.lineTo(W / 2 - 22, y);
  ctx.moveTo(W / 2 + 22, y); ctx.lineTo(W / 2 + width / 2, y);
  ctx.stroke();
  setFont(ctx, `400 24px ${SERIF}`);
  ctx.fillStyle = GOLD_BRIGHT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✦', W / 2, y + 1);
}

function drawCard(ctx, img, card, x, y, w, h) {
  const r = Math.max(6, w * 0.04);
  ctx.save();
  ctx.shadowColor = `${GOLD}55`;
  ctx.shadowBlur = 34;
  ctx.fillStyle = '#0c0a09';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.clip();
  if (img) {
    if ('filter' in ctx) ctx.filter = ART_FILTER;
    const scale = Math.max(w / img.width, h / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    if (card.isReversed) {
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate(Math.PI);
      ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
    } else {
      ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    }
  }
  ctx.restore();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.stroke();
}

export async function renderReadingImage({ spreadConfig, chosenCards, userQuestion, aiReading }) {
  const cards = chosenCards.filter(Boolean).slice(0, 10);
  const single = cards.length === 1;
  const images = await Promise.all(cards.map(card => {
    const art = getCardArtwork(card);
    if (!art) return null;
    return loadImage(artworkUrl(single || !art.thumbnail ? art.src : art.thumbnail));
  }));
  if (typeof document !== 'undefined' && document.fonts?.load) {
    await Promise.all([
      `500 46px ${SERIF}`, `italic 400 50px ${SERIF}`, `400 24px ${SANS}`,
    ].map(f => document.fonts.load(f).catch(() => null)));
  }

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  drawBackground(ctx);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // Wordmark and spread.
  setFont(ctx, `500 46px ${SERIF}`, 16);
  ctx.fillStyle = GOLD;
  ctx.fillText('✦ LUMINA', W / 2, 172);
  setFont(ctx, `400 23px ${SANS}`, 6);
  ctx.fillStyle = PARCHMENT;
  ctx.fillText(plain(spreadConfig?.name).toUpperCase(), W / 2, 226);

  // Layout first: the question, the cards and the advice are measured, sized to fit and then
  // centred between the header and the footer.
  const top = 262;
  const bottom = 1720;
  const gap = 28;
  const question = plain(userQuestion);
  setFont(ctx, `italic 400 50px ${SERIF}`);
  const questionLines = question ? wrap(ctx, `“${question}”`, 860, 3) : [];
  const questionH = questionLines.length ? questionLines.length * 62 + 26 : 0;
  const ornamentH = 84;
  const rows = cards.length > 5 ? [cards.slice(0, Math.ceil(cards.length / 2)), cards.slice(Math.ceil(cards.length / 2))] : [cards];
  const perRow = rows[0].length;
  // Frames follow the artwork's proportions (Lenormand cards are wider than Tarot ones).
  const sample = images.find(Boolean);
  const ratio = sample ? Math.min(1.8, Math.max(1.3, sample.naturalHeight / sample.naturalWidth)) : 1.72;
  const labelSizeFor = (w) => Math.round(Math.max(16, Math.min(22, w / 9)));
  const rowH = (w) => w * ratio + labelSizeFor(w) * 2 + 46;
  const excerpt = excerptOf(aiReading);
  setFont(ctx, `500 42px ${SERIF}`);
  let excerptLines = excerpt ? wrap(ctx, excerpt, 860, 7) : [];
  const excerptH = (n) => (n ? 56 + n * 56 : 0);
  const space = bottom - top;
  let cardW = Math.min(single ? 400 : perRow <= 3 ? 290 : 250, (860 - gap * (perRow - 1)) / perRow);
  const total = () => questionH + ornamentH + rows.length * rowH(cardW) + excerptH(excerptLines.length);
  while (cardW > 130 && total() > space) cardW -= 6;
  while (excerptLines.length > 2 && total() > space) excerptLines = wrap(ctx, excerpt, 860, excerptLines.length - 1);
  const cardH = cardW * ratio;
  const labelSize = labelSizeFor(cardW);
  let y = top + Math.max(0, (space - total()) / 2);

  // Question.
  if (questionLines.length) {
    setFont(ctx, `italic 400 50px ${SERIF}`);
    ctx.fillStyle = GOLD_BRIGHT;
    for (const line of questionLines) { y += 62; ctx.fillText(line, W / 2, y); }
    y += 26;
  }
  ornament(ctx, y + 34);
  y += ornamentH;

  // Cards: one row up to five, otherwise two rows.
  let index = 0;
  for (const row of rows) {
    const rowW = row.length * cardW + (row.length - 1) * gap;
    let x = (W - rowW) / 2;
    for (const card of row) {
      drawCard(ctx, images[index], card, x, y, cardW, cardH);
      setFont(ctx, `400 ${labelSize}px ${SANS}`, 2);
      ctx.fillStyle = PARCHMENT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      const name = `${card.name}${card.isReversed ? ' (inv.)' : ''}`.toUpperCase();
      wrap(ctx, name, cardW + gap - 6, 2).forEach((line, i) => ctx.fillText(line, x + cardW / 2, y + cardH + labelSize + 14 + i * (labelSize + 6)));
      x += cardW + gap;
      index++;
    }
    y += rowH(cardW);
  }

  // The oracle's advice.
  if (excerptLines.length) {
    y += 22;
    setFont(ctx, `400 22px ${SANS}`, 7);
    ctx.fillStyle = GOLD;
    ctx.fillText('CONSELHO DO ORÁCULO', W / 2, y);
    y += 6;
    setFont(ctx, `500 42px ${SERIF}`);
    ctx.fillStyle = IVORY;
    for (const line of excerptLines) { y += 56; ctx.fillText(line, W / 2, y); }
  }

  // Footer.
  ornament(ctx, 1772, 220);
  setFont(ctx, `400 26px ${SANS}`, 8);
  ctx.fillStyle = GOLD;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('LUMINATAROT.APP', W / 2, 1830);

  return new Promise((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'));
}

// Opens the share sheet on phones and tablets; elsewhere (or if sharing is refused) saves the file.
// Returns 'shared', 'cancelled' or 'downloaded'.
export async function shareReadingImage(reading, preRendered) {
  const blob = preRendered || await renderReadingImage(reading);
  const name = `lumina-leitura-${new Date().toISOString().slice(0, 10)}.png`;
  const file = new File([blob], name, { type: 'image/png' });
  const touch = window.matchMedia?.('(pointer: coarse)').matches;
  if (touch && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Lumina Tarot', text: 'Minha leitura no Lumina Tarot · luminatarot.app' });
      return 'shared';
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled';
    }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return 'downloaded';
}
