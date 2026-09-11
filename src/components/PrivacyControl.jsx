import React, { useState } from 'react';
import { isOnlineEnabled } from '../utils/privacy';
export function PrivacyControl() {
  const [enabled, setEnabled] = useState(isOnlineEnabled);
  const configured = !!import.meta.env.VITE_ORACLE_API_URL;
  return <div className="max-w-3xl mx-auto mb-4 text-xs text-slate-300 leading-relaxed w-full">
    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={enabled} disabled={!configured}
      onChange={e => { try { localStorage.setItem('lumina_online_ai', String(e.target.checked)); setEnabled(e.target.checked); } catch { setEnabled(false); } }} />
      Usar interpretação por IA online {configured ? '' : '(não configurada)'}</label>
    <p className="mt-1">{enabled && configured ? 'Ao consultar, sua pergunta e as cartas serão enviadas ao servidor do site e ao Google Gemini.' : 'Modo local: perguntas e cartas são interpretadas neste dispositivo.'} O diário fica salvo neste navegador. As leituras são reflexões simbólicas.</p>
  </div>;
}
