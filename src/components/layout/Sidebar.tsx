import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Boxes, 
  Home, 
  History, 
  Inbox, 
  Menu, 
  X,
  LogOut,
  Shirt,
  ShieldCheck,
  UserCheck,
  Users,
  RotateCw,
  CloudOff,
  Cloud
} from 'lucide-react';
import { PaginaAtual } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  paginaAtual: PaginaAtual;
  setPaginaAtual: (pagina: PaginaAtual) => void;
  nuvemConectada?: boolean;
  sincronizando?: boolean;
  itensPendentes?: number;
  onForcarSincronizacao?: () => void;
  onLimparPendencias?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  paginaAtual,
  setPaginaAtual,
  nuvemConectada = false,
  sincronizando = false,
  itensPendentes = 0,
  onForcarSincronizacao,
  onLimparPendencias,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { usuarioAtual, fazerLogout } = useAuth();

  const todosMenuItems = [
    {
      id: 'home' as PaginaAtual,
      label: 'Início',
      icon: Home,
      roles: ['almoxarife', 'acabamento', 'admin'],
    },
    {
      id: 'solicitacoes' as PaginaAtual,
      label: 'Minhas solicitações',
      icon: Inbox,
      roles: ['almoxarife', 'acabamento', 'admin'],
    },
    {
      id: 'checklist' as PaginaAtual,
      label: 'Gerar Checklist',
      icon: ClipboardCheck,
      roles: ['almoxarife', 'admin'], // Almoxarife e Admin
    },
    {
      id: 'historico' as PaginaAtual,
      label: 'Histórico',
      icon: History,
      roles: ['almoxarife', 'acabamento', 'admin'],
    },
    {
      id: 'insumos' as PaginaAtual,
      label: 'Insumos',
      icon: Boxes,
      roles: ['almoxarife', 'admin'], // Almoxarife e Admin
    },
    {
      id: 'usuarios' as PaginaAtual,
      label: 'Usuários & Permissões',
      icon: Users,
      roles: ['admin'], // Exclusivo Administrador
    },
  ];

  // Filtra itens de menu de acordo com o perfil
  const menuItems = todosMenuItems.filter((item) =>
    usuarioAtual ? item.roles.includes(usuarioAtual.cargo) : true
  );

  const handleSelectPage = (id: PaginaAtual) => {
    setPaginaAtual(id);
    setMobileMenuOpen(false);
  };

  const getRoleBadge = () => {
    if (!usuarioAtual) return null;
    switch (usuarioAtual.cargo) {
      case 'almoxarife':
        return { label: 'Almoxarife', color: 'bg-sky-50 text-sky-800 border-sky-200' };
      case 'acabamento':
        return { label: 'Acabamento', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'admin':
        return { label: 'Administrador', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    }
  };

  const badge = getRoleBadge();

  return (
    <>
      {/* Topo para Mobile (< md) */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div 
          onClick={() => handleSelectPage('home')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <ClipboardCheck className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <span className="font-bold text-base text-slate-900 leading-tight block">
              Checklist de Insumos
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">
              {usuarioAtual ? usuarioAtual.nome : 'Logística Têxtil'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {usuarioAtual && (
            <button
              onClick={fazerLogout}
              title="Trocar de Operador"
              className="p-2 text-slate-500 hover:text-red-600 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Overlay do menu Mobile */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Menu Lateral (Desktop fixo e Drawer no mobile) */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 flex-1 flex flex-col">
          {/* Logo e Nome do Sistema */}
          <div 
            onClick={() => handleSelectPage('home')}
            className="flex items-center gap-3 cursor-pointer group pb-5 border-b border-slate-100"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm group-hover:bg-slate-800 transition-colors flex-shrink-0">
              <ClipboardCheck className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <span className="font-extrabold text-base text-slate-900 tracking-tight leading-tight block">
                Checklist de Insumos
              </span>
              <span className="text-xs text-slate-500 font-medium block">
                Logística Têxtil
              </span>
            </div>
          </div>

          {/* Lista de Navegação Vertical */}
          <nav className="mt-5 space-y-1.5 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = paginaAtual === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectPage(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 active:scale-[0.98] text-left ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Rodapé do Menu Lateral */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-3">
          {/* Identificação do Usuário Logado */}
          {usuarioAtual && (
            <div className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <span className="font-bold text-xs text-slate-900 truncate block">
                  {usuarioAtual.nome}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {badge && (
                    <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border ${badge.color}`}>
                      {badge.label}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">
                    @{usuarioAtual.usuario}
                  </span>
                </div>
              </div>

              <button
                onClick={fazerLogout}
                title="Sair / Desconectar"
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Status da Conexão e Sincronização */}
          <div className="pt-1 border-t border-slate-200/60 space-y-2">
            <div className="px-1 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    nuvemConectada ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  {nuvemConectada ? (
                    <>
                      <Cloud className="w-3.5 h-3.5 text-sky-600 inline" />
                      Supabase Nuvem
                    </>
                  ) : (
                    <>
                      <CloudOff className="w-3.5 h-3.5 text-amber-600 inline" />
                      Modo Local
                    </>
                  )}
                </span>
              </div>

              {onForcarSincronizacao && (
                <button
                  onClick={onForcarSincronizacao}
                  disabled={sincronizando}
                  title="Sincronizar com a nuvem agora"
                  className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 rounded transition-colors"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${sincronizando ? 'animate-spin text-sky-600' : ''}`} />
                </button>
              )}
            </div>

            {itensPendentes > 0 && (
              <div className="px-2 py-1.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-[10px] text-amber-800">
                <div className="min-w-0 pr-1">
                  <span className="font-medium block truncate">
                    {itensPendentes} pendência{itensPendentes > 1 ? 's' : ''}
                  </span>
                  <span className="text-[9px] text-amber-600 block">
                    {sincronizando ? 'Sincronizando...' : 'Aguardando rede'}
                  </span>
                </div>
                {onLimparPendencias && (
                  <button
                    onClick={onLimparPendencias}
                    title="Descartar pendências corrompidas"
                    className="p-1 text-amber-600 hover:text-red-700 hover:bg-amber-100 rounded transition-colors text-[10px] font-semibold flex-shrink-0"
                  >
                    Limpar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
