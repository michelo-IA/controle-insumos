import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  ArrowRight, 
  Plus, 
  Inbox, 
  Boxes, 
  History, 
  Users, 
  Shirt, 
  PackageCheck,
  Clock,
  Sparkles
} from 'lucide-react';
import { PaginaAtual, Solicitacao } from '../types';
import { NovaSolicitacaoModal } from '../components/solicitacoes/NovaSolicitacaoModal';
import { useAuth } from '../context/AuthContext';

interface HomeProps {
  setPaginaAtual: (pagina: PaginaAtual) => void;
  onAddSolicitacao?: (solicitacao: Omit<Solicitacao, 'id' | 'dataHora'>) => void;
  solicitacoesPendentesCount?: number;
  minhasSolicitacoesCount?: number;
}

export const Home: React.FC<HomeProps> = ({ 
  setPaginaAtual, 
  onAddSolicitacao,
  solicitacoesPendentesCount = 0,
  minhasSolicitacoesCount = 0,
}) => {
  const { usuarioAtual } = useAuth();
  const [modalAberto, setModalAberto] = useState(false);

  const handleSalvarSolicitacao = (dados: Omit<Solicitacao, 'id' | 'dataHora'>) => {
    if (onAddSolicitacao) {
      onAddSolicitacao(dados);
      setPaginaAtual('solicitacoes');
    }
  };

  const cargo = usuarioAtual?.cargo || 'almoxarife';

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 animate-pageEnter">
      {/* Cabeçalho de Boas-Vindas Personalizado */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-sky-300 backdrop-blur-sm border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {cargo === 'acabamento' && (usuarioAtual?.acabamentoPadrao ? `Setor: ${usuarioAtual.acabamentoPadrao}` : 'Setor de Acabamento')}
                {cargo === 'almoxarife' && 'Almoxarifado & Expedição'}
                {cargo === 'admin' && 'Administração Geral do Sistema'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Olá, {usuarioAtual?.nome ? usuarioAtual.nome.split(' ')[0] : 'Operador'}!
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {cargo === 'acabamento' && 'Cadastre suas solicitações de insumos para produção e acompanhe a separação em tempo real pelo almoxarifado.'}
              {cargo === 'almoxarife' && 'Gerencie o atendimento dos pedidos pendentes e emita os checklists com cálculo automático de embalagens.'}
              {cargo === 'admin' && 'Visão completa da operação têxtil: solicitações, checklists, catálogo de insumos e controle de acessos.'}
            </p>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={() => setModalAberto(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm rounded-xl transition-all duration-150 shadow-md hover:-translate-y-0.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Solicitação</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Ações Rápidas por Perfil */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
          Ações e Atalhos Recomendados
        </h2>

        {/* 1. VISÃO DO ACABAMENTO */}
        {cargo === 'acabamento' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card Fazer Solicitação */}
            <div 
              onClick={() => setModalAberto(true)}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                  Solicitar Insumos
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Informe a referência da peça e quantidade para o almoxarife separar.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1 text-xs font-bold text-sky-600">
                <span>Abrir formulário</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card Minhas Solicitações */}
            <div 
              onClick={() => setPaginaAtual('solicitacoes')}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <Inbox className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    Minhas Solicitações
                  </h3>
                  {minhasSolicitacoesCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
                      {minhasSolicitacoesCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Consulte os pedidos enviados e veja se o almoxarifado já iniciou a separação.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1 text-xs font-bold text-amber-600">
                <span>Ver andamento</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card Histórico */}
            <div 
              onClick={() => setPaginaAtual('historico')}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <History className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-900 transition-colors">
                  Histórico de Checklists
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Consulte os PDFs emitidos e detalhes das entregas já finalizadas.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1 text-xs font-bold text-slate-600">
                <span>Consultar histórico</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        )}

        {/* 2. VISÃO DO ALMOXARIFE / CONFERENTE */}
        {cargo === 'almoxarife' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card Atender Solicitações */}
            <div 
              onClick={() => setPaginaAtual('solicitacoes')}
              className="bg-white p-6 rounded-2xl border border-sky-200 bg-sky-50/20 shadow-sm hover:border-sky-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-4 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <Inbox className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                    Solicitações
                  </h3>
                  {solicitacoesPendentesCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-sky-500 text-white rounded-full animate-pulse">
                      {solicitacoesPendentesCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Pedidos pendentes enviados pelo acabamento prontos para serem atendidos.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1 text-xs font-bold text-sky-600">
                <span>Atender fila</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card Gerar Checklist */}
            <div 
              onClick={() => setPaginaAtual('checklist')}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-sky-400 flex items-center justify-center mb-4 group-hover:bg-slate-800 transition-colors">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-900 transition-colors">
                  Gerar Checklist
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Cálculo avulso de embalagens e impressão de PDF com assinaturas.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1 text-xs font-bold text-slate-700">
                <span>Iniciar separação</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card Insumos */}
            <div 
              onClick={() => setPaginaAtual('insumos')}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <Boxes className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-900 transition-colors">
                  Catálogo Insumos
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Cadastro de caixas, cabides, etiquetas e fatores de embalagem.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1 text-xs font-bold text-slate-700">
                <span>Gerenciar</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card Histórico */}
            <div 
              onClick={() => setPaginaAtual('historico')}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <History className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-900 transition-colors">
                  Histórico
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Reimpressão de PDFs e conferência das ordens já expedidas.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1 text-xs font-bold text-slate-700">
                <span>Ver histórico</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        )}

        {/* 3. VISÃO DO ADMINISTRADOR GERAL */}
        {cargo === 'admin' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {/* Solicitações */}
            <div 
              onClick={() => setPaginaAtual('solicitacoes')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-sky-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-3 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <Inbox className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Solicitações</h3>
                  {solicitacoesPendentesCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-sky-500 text-white rounded-full">
                      {solicitacoesPendentesCount}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Fila de pedidos dos acabamentos.</p>
              </div>
              <span className="mt-4 text-xs font-semibold text-sky-600 flex items-center gap-1">Acessar <ArrowRight className="w-3 h-3" /></span>
            </div>

            {/* Checklist */}
            <div 
              onClick={() => setPaginaAtual('checklist')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-sky-400 flex items-center justify-center mb-3 group-hover:bg-slate-800 transition-colors">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Gerar Checklist</h3>
                <p className="text-[11px] text-slate-500 mt-1">Separação de insumos e PDF.</p>
              </div>
              <span className="mt-4 text-xs font-semibold text-slate-600 flex items-center gap-1">Acessar <ArrowRight className="w-3 h-3" /></span>
            </div>

            {/* Insumos */}
            <div 
              onClick={() => setPaginaAtual('insumos')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-3 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <Boxes className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Insumos</h3>
                <p className="text-[11px] text-slate-500 mt-1">Cadastro e regras de cálculo.</p>
              </div>
              <span className="mt-4 text-xs font-semibold text-slate-600 flex items-center gap-1">Acessar <ArrowRight className="w-3 h-3" /></span>
            </div>

            {/* Histórico */}
            <div 
              onClick={() => setPaginaAtual('historico')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-3 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <History className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Histórico</h3>
                <p className="text-[11px] text-slate-500 mt-1">Relatórios e reimpressões.</p>
              </div>
              <span className="mt-4 text-xs font-semibold text-slate-600 flex items-center gap-1">Acessar <ArrowRight className="w-3 h-3" /></span>
            </div>

            {/* Usuários & Permissões */}
            <div 
              onClick={() => setPaginaAtual('usuarios')}
              className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Usuários</h3>
                <p className="text-[11px] text-slate-500 mt-1">Senhas, logins e permissões.</p>
              </div>
              <span className="mt-4 text-xs font-semibold text-emerald-700 flex items-center gap-1">Gerenciar <ArrowRight className="w-3 h-3" /></span>
            </div>
          </div>
        )}
      </div>

      {/* Modal para Cadastrar Solicitação diretamente a partir da Home */}
      <NovaSolicitacaoModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSave={handleSalvarSolicitacao}
      />
    </div>
  );
};
