import React, { useEffect, useState } from 'react';
import { isOnlineEnabled, setOnlineEnabled, onPrivacyChange, PRIVACY_POLICY_URL } from '../utils/privacy';

// Shown under the question field: says plainly where the question goes and lets the person keep it local.
export function PrivacyControl() {
  const [enabled, setEnabled] = useState(isOnlineEnabled);
  useEffect(() => onPrivacyChange(() => setEnabled(isOnlineEnabled())), []);
  return (
    <div className="privacy-control">
      <label className="privacy-toggle">
        <input
          type="checkbox"
          checked={enabled}
          onChange={e => { setOnlineEnabled(e.target.checked); setEnabled(e.target.checked); }}
        />
        <span>Interpretação online com IA</span>
      </label>
      <p>
        {enabled
          ? 'Ao pedir a interpretação, sua pergunta e as cartas são enviadas ao nosso servidor e ao Google Gemini para gerar o texto. Desmarque para interpretar só neste aparelho.'
          : 'Modo local: a pergunta e as cartas são interpretadas neste aparelho e não saem dele.'}
        {' '}<a href={PRIVACY_POLICY_URL} target="_blank" rel="noopener">Privacidade</a>
      </p>
    </div>
  );
}
