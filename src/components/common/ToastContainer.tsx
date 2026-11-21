import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, X, ArrowRight } from 'lucide-react';
import { NotificacaoRealtime } from '../../types';

interface ToastContainerProps {
  notificacoes: NotificacaoRealtime[];
  onRemover: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ notificacoes, onRemover }) => {
  if (notificacoes.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0">
      {notificacoes.map((item) => {
        const isSucesso = item.tipo === 'sucesso';
        const isAviso = item.tipo === 'aviso';

        return (
          <div
            key={item.id}
            className={`pointer-events-auto transform transition-all duration-300 ease-out translate-y-0 opacity-100 flex items-start gap-3 p-3.5 rounded-xl shadow-lg border backdrop-blur-md ${
              isSucesso
                ? 'bg-emerald-950/90 text-white border-emerald-500/30 shadow-emerald-950/20'
                : isAviso
                ? 'bg-amber-950/90 text-white border-amber-500/30 shadow-amber-950/20'
                : 'bg-slate-900/95 text-white border-slate-700/50 shadow-slate-950/30'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {isSucesso ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : isAviso ? (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              ) : (
                <Bell className="w-5 h-5 text-sky-400 animate-bounce" />
              )}
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs font-bold leading-tight tracking-wide">{item.titulo}</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-snug break-words">
                {item.mensagem}
              </p>

              {item.acao && (
                <button
                  onClick={() => {
                    item.acao?.onClick();
                    onRemover(item.id);
                  }}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-sky-300 hover:text-sky-200 transition-colors"
                >
                  <span>{item.acao.label}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              onClick={() => onRemover(item.id)}
              className="text-slate-400 hover:text-white transition-colors p-0.5 rounded-md"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
