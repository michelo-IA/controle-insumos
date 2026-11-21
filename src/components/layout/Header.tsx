import React from 'react';
import { ClipboardCheck, Boxes, Home, History } from 'lucide-react';
import { PaginaAtual } from '../../types';

interface HeaderProps {
  paginaAtual: PaginaAtual;
  setPaginaAtual: (pagina: PaginaAtual) => void;
  totalHistorico?: number;
}

export const Header: React.FC<HeaderProps> = ({ paginaAtual, setPaginaAtual, totalHistorico }) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Nome */}
          <div 
            onClick={() => setPaginaAtual('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-sm group-hover:bg-slate-800 transition-colors">
              <ClipboardCheck className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                Checklist de Insumos
              </span>
              <span className="text-xs text-slate-500 font-medium block">
                Logística Têxtil
              </span>
            </div>
          </div>

          {/* Navegação */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setPaginaAtual('home')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                paginaAtual === 'home'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Início</span>
            </button>

            <button
              onClick={() => setPaginaAtual('checklist')}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md transition-all ${
                paginaAtual === 'checklist'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Gerar Checklist</span>
            </button>

            <button
              onClick={() => setPaginaAtual('historico')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                paginaAtual === 'historico'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Histórico</span>
              {typeof totalHistorico === 'number' && totalHistorico > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-slate-200 text-slate-800">
                  {totalHistorico}
                </span>
              )}
            </button>

            <button
              onClick={() => setPaginaAtual('insumos')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                paginaAtual === 'insumos'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Insumos</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
