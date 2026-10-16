import React from 'react';
import { Sparkles, RotateCcw, ShieldAlert, Home } from './icons/ArcaneIcons';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lumina Tarot Boundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHardReset = () => {
    try {
      localStorage.removeItem('lumina_current_spread');
      localStorage.removeItem('lumina_user_question');
    } catch (e) {}
    window.location.href = window.location.pathname;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--color-obsidian)] text-slate-100 flex items-center justify-center p-4 selection:bg-amber-400/30 selection:text-amber-200">
          {/* Cosmic Background Radial Glow */}
          <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-900/20 via-[#0a071d]/60 to-[var(--color-obsidian)]" />

          <div className="relative z-10 max-w-lg w-full bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 rounded-sm p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(245,158,11,0.15)]">
            {/* Sacred Glowing Icon */}
            <div className="w-16 h-16 mx-auto mb-5 rounded-sm bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-400/40 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.3)]">
              <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
            </div>

            <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-amber-200 mb-2">
              Os Véus Cósmicos Oscilaram
            </h1>

            <p className="font-outfit text-sm sm:text-base text-slate-300 mb-6 leading-relaxed">
              Uma oscilação sutil desestabilizou o fluxo do altar. Não se preocupe: a sua jornada e o seu histórico sagrado permanecem preservados.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Realinhar a Mesa
              </button>

              <button
                onClick={this.handleHardReset}
                className="w-full sm:w-auto px-4 py-2.5 rounded-sm bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-amber-200 border border-amber-500/30 font-cinzel text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Reiniciar Altar
              </button>
            </div>

            {/* Collapsible Error Debug Details */}
            {this.state.error && (
              <details className="mt-6 text-left border-t border-slate-800/80 pt-4">
                <summary className="text-[11px] font-mono text-slate-300 hover:text-slate-200 cursor-pointer flex items-center gap-1.5 select-none">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Detalhes Técnicos da Oscilação
                </summary>
                <pre className="mt-2 p-3 bg-black/50 border border-slate-800 rounded-sm text-[10px] font-mono text-rose-300 overflow-x-auto max-h-32">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
