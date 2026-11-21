import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Eye, 
  Trash2, 
  Calendar, 
  FileText, 
  ArrowRight,
  PackageSearch,
  Plus
} from 'lucide-react';
import { ChecklistHistoricoItem, PaginaAtual } from '../types';
import { formatNumero } from '../services/calculator';
import { gerarChecklistPDF } from '../services/pdf';
import { HistoricoDetalhesModal } from '../components/historico/HistoricoDetalhesModal';
import { DeleteHistoricoModal } from '../components/historico/DeleteHistoricoModal';
import { useAuth } from '../context/AuthContext';

interface HistoricoProps {
  historico: ChecklistHistoricoItem[];
  onDeleteHistorico: (id: string) => void;
  setPaginaAtual: (pagina: PaginaAtual) => void;
}

export const Historico: React.FC<HistoricoProps> = ({
  historico,
  onDeleteHistorico,
  setPaginaAtual,
}) => {
  const { usuarioAtual } = useAuth();
  const [busca, setBusca] = useState('');
  const [itemDetalhes, setItemDetalhes] = useState<ChecklistHistoricoItem | null>(null);
  const [itemParaExcluir, setItemParaExcluir] = useState<ChecklistHistoricoItem | null>(null);

  const isAcabamento = usuarioAtual?.cargo === 'acabamento';
  const podeExcluir = usuarioAtual?.cargo === 'admin' || usuarioAtual?.cargo === 'almoxarife';

  // Filtragem em tempo real
  const historicoFiltrado = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return historico;

    return historico.filter((item) => {
      const dataStr = new Date(item.dataHora).toLocaleString('pt-BR');
      const pedidoStr = item.pedidoId?.toLowerCase() || '';
      const acabamentoStr = item.acabamento?.toLowerCase() || '';
      const temInsumo = item.itens.some(
        (it) =>
          it.insumo.nome.toLowerCase().includes(termo) ||
          (it.insumo.codigo && it.insumo.codigo.toLowerCase().includes(termo))
      );

      return (
        pedidoStr.includes(termo) ||
        acabamentoStr.includes(termo) ||
        dataStr.toLowerCase().includes(termo) ||
        temInsumo
      );
    });
  }, [historico, busca]);

  // Ação de download direto
  const handleBaixarPdf = (item: ChecklistHistoricoItem) => {
    gerarChecklistPDF({
      pedidoId: item.pedidoId,
      acabamento: item.acabamento,
      dataEmissao: item.dataHora,
      quantidadePecas: item.quantidadePecas,
      pecasPorPack: item.pecasPorPack,
      quantidadePacks: item.quantidadePacks,
      itens: item.itens,
    });
  };

  const handleConfirmarExclusao = () => {
    if (itemParaExcluir) {
      onDeleteHistorico(itemParaExcluir.id);
      setItemParaExcluir(null);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      {/* Topo da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <History className="w-7 h-7 text-sky-600" />
            Histórico de Checklists
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Consulte e reemita os checklists de separação gerados em PDF.
          </p>
        </div>

        {isAcabamento ? (
          <button
            onClick={() => setPaginaAtual('solicitacoes')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Solicitação</span>
          </button>
        ) : (
          <button
            onClick={() => setPaginaAtual('checklist')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Checklist</span>
          </button>
        )}
      </div>

      {/* Barra de Busca e Indicador */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por pedido, data ou insumo..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all shadow-sm"
          />
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 self-start sm:self-auto shadow-sm">
          {historico.length} {historico.length === 1 ? 'checklist registrado' : 'checklists registrados'}
        </div>
      </div>

      {/* Listagem */}
      {historicoFiltrado.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <PackageSearch className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 mb-1">
            {busca ? 'Nenhum checklist encontrado' : 'Nenhum checklist gerado ainda'}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            {busca
              ? 'Tente buscar por outro número de pedido, data ou insumo.'
              : 'Assim que você gerar um checklist em PDF, ele será registrado aqui para reimpressão e consulta.'}
          </p>
          {!busca && (
            isAcabamento ? (
              <button
                onClick={() => setPaginaAtual('solicitacoes')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Criar uma Solicitação</span>
              </button>
            ) : (
              <button
                onClick={() => setPaginaAtual('checklist')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
              >
                <span>Gerar primeiro checklist</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )
          )}
        </div>
      ) : (
        <>
          {/* Tabela para Desktop e Tablet */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-6">Data / Hora</th>
                  <th className="py-3.5 px-6">Pedido</th>
                  <th className="py-3.5 px-6">Acabamento</th>
                  <th className="py-3.5 px-6">Peças & Packs</th>
                  <th className="py-3.5 px-6">Insumos</th>
                  <th className="py-3.5 px-6 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {historicoFiltrado.map((item) => {
                  const dataFormatada = new Date(item.dataHora).toLocaleString('pt-BR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  });

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Data e Hora */}
                      <td className="py-4 px-6 text-slate-600 text-xs font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{dataFormatada}</span>
                        </div>
                      </td>

                      {/* Pedido */}
                      <td className="py-4 px-6">
                        {item.pedidoId?.trim() ? (
                          <span className="font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded border border-slate-200 text-xs font-mono">
                            {item.pedidoId}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Não informado</span>
                        )}
                      </td>

                      {/* Acabamento */}
                      <td className="py-4 px-6">
                        {item.acabamento?.trim() ? (
                          <span className="font-semibold text-sky-900 bg-sky-50 px-2.5 py-1 rounded border border-sky-200 text-xs">
                            {item.acabamento}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">—</span>
                        )}
                      </td>

                      {/* Peças e Packs */}
                      <td className="py-4 px-6">
                        <div className="text-xs">
                          <span className="font-bold text-slate-900 block">
                            {formatNumero(item.quantidadePecas)} peças
                          </span>
                          {item.quantidadePacks && item.quantidadePacks > 0 && (
                            <span className="text-slate-500 font-medium text-[11px] block mt-0.5">
                              {formatNumero(item.quantidadePacks)} packs{' '}
                              {item.pecasPorPack ? `(${formatNumero(item.pecasPorPack)} pç/pack)` : ''}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Insumos */}
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {item.itens.slice(0, 3).map((it, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                            >
                              {it.insumo.codigo ? `${it.insumo.codigo}` : it.insumo.nome}
                            </span>
                          ))}
                          {item.itens.length > 3 && (
                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              +{item.itens.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Ações */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleBaixarPdf(item)}
                            title="Abrir PDF"
                            className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <FileText className="w-4 h-4 text-sky-600" />
                          </button>
                          <button
                            onClick={() => setItemDetalhes(item)}
                            title="Ver Detalhes"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {podeExcluir && (
                            <button
                              onClick={() => setItemParaExcluir(item)}
                              title="Excluir do Histórico"
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards para Mobile */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {historicoFiltrado.map((item) => {
              const dataFormatada = new Date(item.dataHora).toLocaleString('pt-BR', {
                dateStyle: 'short',
                timeStyle: 'short',
              });

              return (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.pedidoId?.trim() ? (
                          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {item.pedidoId}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Sem identificação</span>
                        )}
                        {item.acabamento?.trim() && (
                          <span className="text-xs font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                            {item.acabamento}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {dataFormatada}
                      </p>
                    </div>

                    <span className="text-xs font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                      {formatNumero(item.quantidadePecas)} peças
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-100">
                    {item.itens.map((it, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                      >
                        {it.insumo.codigo || it.insumo.nome}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleBaixarPdf(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 active:scale-95 rounded-lg transition-all duration-150"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Abrir PDF
                    </button>
                    <button
                      onClick={() => setItemDetalhes(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-lg transition-all duration-150"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Detalhes
                    </button>
                    {podeExcluir && (
                      <button
                        onClick={() => setItemParaExcluir(item)}
                        className="p-1.5 text-red-500 hover:bg-red-50 active:scale-95 rounded-lg transition-all duration-150"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modais */}
      <HistoricoDetalhesModal
        isOpen={!!itemDetalhes}
        item={itemDetalhes}
        onClose={() => setItemDetalhes(null)}
      />

      <DeleteHistoricoModal
        isOpen={!!itemParaExcluir}
        item={itemParaExcluir}
        onClose={() => setItemParaExcluir(null)}
        onConfirm={handleConfirmarExclusao}
      />
    </div>
  );
};
