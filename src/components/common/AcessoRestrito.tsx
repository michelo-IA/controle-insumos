import React from 'react';
import { ShieldAlert, ArrowLeft, Home, Inbox } from 'lucide-react';
import { PaginaAtual, UserCargo } from '../../types';

interface AcessoRestritoProps {
  cargoNecessario: string;
  paginaDestinoRecomendada?: PaginaAtual;
  setPaginaAtual: (pagina: PaginaAtual) => void;
}

export const AcessoRestrito: React.FC<AcessoRestritoProps> = ({
  cargoNecessario,
  paginaDestinoRecomendada = 'solicitacoes',
  setPaginaAtual,
}) => {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shadow-sm mb-5">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
        Acesso Restrito
      </h2>

      <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-sm">
        Esta seção é restrita a usuários com perfil de <strong className="text-slate-900 font-semibold">{cargoNecessario}</strong>.
      </p>

      <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => setPaginaAtual(paginaDestinoRecomendada)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Inbox className="w-4 h-4" />
          <span>Ir para Minhas Solicitações</span>
        </button>

        <button
          onClick={() => setPaginaAtual('home')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
        >
          <Home className="w-4 h-4 text-slate-400" />
          <span>Tela Inicial</span>
        </button>
      </div>
    </div>
  );
};
