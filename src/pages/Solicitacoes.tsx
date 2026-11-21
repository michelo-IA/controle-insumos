import React, { useState, useMemo } from 'react';
import { 
  Inbox, 
  Plus, 
  Search, 
  ArrowRight, 
  Trash2, 
  Calendar, 
  PackageSearch,
  CheckCircle2,
  Clock,
  User
} from 'lucide-react';
import { Solicitacao } from '../types';
import { formatNumero } from '../services/calculator';
import { NovaSolicitacaoModal } from '../components/solicitacoes/NovaSolicitacaoModal';
import { DeleteSolicitacaoModal } from '../components/solicitacoes/DeleteSolicitacaoModal';
import { useAuth } from '../context/AuthContext';

interface SolicitacoesProps {
  solicitacoes: Solicitacao[];
  onAddSolicitacao: (solicitacao: Omit<Solicitacao, 'id' | 'dataHora'>) => void;
  onDeleteSolicitacao: (id: string) => void;
  onAtenderSolicitacao: (solicitacao: Solicitacao) => void;
}

export const Solicitacoes: React.FC<SolicitacoesProps> = ({
  solicitacoes,
  onAddSolicitacao,
  onDeleteSolicitacao,
  onAtenderSolicitacao,
}) => {
  const { usuarioAtual } = useAuth();
  const [busca, setBusca] = useState('');
  const [filtroAba, setFiltroAba] = useState<'todas' | 'minhas'>(
    usuarioAtual?.cargo === 'acabamento' ? 'minhas' : 'todas'
  );
  const [modalAberto, setModalAberto] = useState(false);
  const [solicitacaoParaExcluir, setSolicitacaoParaExcluir] = useState<Solicitacao | null>(null);

  const isMinhaSolicitacao = (sol: Solicitacao) => {
    if (!usuarioAtual) return false;
    return (
      (sol.solicitanteId && sol.solicitanteId === usuarioAtual.id) ||
      (sol.solicitanteNome && sol.solicitanteNome === usuarioAtual.nome) ||
      (usuarioAtual.acabamentoPadrao && sol.acabamento === usuarioAtual.acabamentoPadrao)
    );
  };

  const podeExcluir = (sol: Solicitacao) => {
    if (!usuarioAtual) return false;
    if (usuarioAtual.cargo === 'admin' || usuarioAtual.cargo === 'almoxarife') return true;
    return isMinhaSolicitacao(sol);
  };

  // Filtragem em tempo real por referência, acabamento, data e aba selecionada
  const solicitacoesFiltradas = useMemo(() => {
    let lista = solicitacoes;

    if (filtroAba === 'minhas') {
      lista = lista.filter((item) => isMinhaSolicitacao(item));
    }

    const termo = busca.toLowerCase().trim();
    if (!termo) return lista;

    return lista.filter((item) => {
      const dataStr = new Date(item.dataHora).toLocaleString('pt-BR');
      return (
        item.referencia.toLowerCase().includes(termo) ||
        (item.acabamento && item.acabamento.toLowerCase().includes(termo)) ||
        dataStr.toLowerCase().includes(termo) ||
        (item.observacao && item.observacao.toLowerCase().includes(termo)) ||
        (item.solicitanteNome && item.solicitanteNome.toLowerCase().includes(termo))
      );
    });
  }, [solicitacoes, busca, filtroAba, usuarioAtual]);

  const totalMinhas = useMemo(() => {
    return solicitacoes.filter((item) => isMinhaSolicitacao(item)).length;
  }, [solicitacoes, usuarioAtual]);

  const handleConfirmarExclusao = () => {
    if (solicitacaoParaExcluir) {
      onDeleteSolicitacao(solicitacaoParaExcluir.id);
      setSolicitacaoParaExcluir(null);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      {/* Topo da Tela */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Inbox className="w-7 h-7 text-sky-600" />
            Minhas solicitações
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Acompanhe e atenda os pedidos pendentes de separação de insumos.
          </p>
        </div>

        <button
          onClick={() => setModalAberto(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Solicitação</span>
        </button>
      </div>

      {/* Barra de Busca, Filtro de Abas e Indicador */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por referência, acabamento, solicitante..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all shadow-sm"
            />
          </div>

          {/* Abas para filtrar solicitações */}
          <div className="flex items-center bg-slate-200/70 p-1 rounded-lg self-start text-xs font-semibold">
            <button
              onClick={() => setFiltroAba('todas')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filtroAba === 'todas'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({solicitacoes.length})
            </button>
            <button
              onClick={() => setFiltroAba('minhas')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                filtroAba === 'minhas'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Minhas ({totalMinhas})
            </button>
          </div>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 self-start sm:self-auto shadow-sm flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>
            {solicitacoesFiltradas.length} {solicitacoesFiltradas.length === 1 ? 'visível' : 'visíveis'}
          </span>
        </div>
      </div>

      {/* Lista em Cards */}
      {solicitacoesFiltradas.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <PackageSearch className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 mb-1">
            {busca ? 'Nenhuma solicitação encontrada' : 'Nenhuma solicitação pendente'}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            {busca
              ? 'Tente buscar por outra referência, acabamento ou data.'
              : 'Cadastre as solicitações de peças e pedidos para agilizar a conferência de insumos.'}
          </p>
          {!busca && (
            <button
              onClick={() => setModalAberto(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar primeira solicitação</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {solicitacoesFiltradas.map((sol) => {
            const dataFormatada = new Date(sol.dataHora).toLocaleString('pt-BR', {
              dateStyle: 'short',
              timeStyle: 'short',
            });

            return (
              <div
                key={sol.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Topo do Card: Referência e Botão Excluir */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Referência
                        </span>
                        {isMinhaSolicitacao(sol) && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-sky-100 text-sky-800">
                            Meu Pedido
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
                        {sol.referencia}
                      </h2>
                    </div>

                    {podeExcluir(sol) && (
                      <button
                        onClick={() => setSolicitacaoParaExcluir(sol)}
                        title="Excluir Solicitação"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Quantidade de Peças e Acabamento em Destaque */}
                  <div className="space-y-2 mb-3">
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                      <span className="text-xs text-slate-500 font-medium block">
                        Quantidade solicitada
                      </span>
                      <span className="text-xl font-extrabold text-slate-900 tracking-tight block">
                        {formatNumero(sol.quantidade)}{' '}
                        <span className="text-xs font-semibold text-slate-500">peças</span>
                      </span>
                    </div>

                    <div className="bg-sky-50/70 border border-sky-100 p-3 rounded-lg">
                      <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">
                        Enviar para Acabamento
                      </span>
                      <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                        {sol.acabamento?.trim() ? sol.acabamento : 'Não informado'}
                      </span>
                    </div>
                  </div>

                  {/* Data / Solicitante / Observação */}
                  <div className="space-y-1.5 mb-4 text-xs text-slate-500">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{dataFormatada}</span>
                      </div>
                      {sol.solicitanteNome && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[130px] font-medium">{sol.solicitanteNome}</span>
                        </div>
                      )}
                    </div>

                    {sol.observacao && (
                      <p className="text-slate-600 italic bg-slate-50/50 p-2 rounded border border-slate-100 text-[11px]">
                        "{sol.observacao}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Botão de Ação: Atender Solicitação (Almoxarife/Admin) ou Status (Acabamento) */}
                {usuarioAtual?.cargo === 'acabamento' ? (
                  <div className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-50 text-amber-800 text-xs font-semibold rounded-lg border border-amber-200">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Aguardando separação no Almoxarifado</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onAtenderSolicitacao(sol)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 active:scale-[0.98] transition-all duration-150 shadow-sm group"
                  >
                    <span>Atender / Gerar Checklist</span>
                    <ArrowRight className="w-4 h-4 text-sky-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modais */}
      <NovaSolicitacaoModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSave={onAddSolicitacao}
      />

      <DeleteSolicitacaoModal
        isOpen={!!solicitacaoParaExcluir}
        solicitacao={solicitacaoParaExcluir}
        onClose={() => setSolicitacaoParaExcluir(null)}
        onConfirm={handleConfirmarExclusao}
      />
    </div>
  );
};
