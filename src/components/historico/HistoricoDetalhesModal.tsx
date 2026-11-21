import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar, Layers } from 'lucide-react';
import { ChecklistHistoricoItem } from '../../types';
import { formatNumero } from '../../services/calculator';
import { gerarChecklistPDF } from '../../services/pdf';
import { Modal } from '../common/Modal';

interface HistoricoDetalhesModalProps {
  isOpen: boolean;
  item: ChecklistHistoricoItem | null;
  onClose: () => void;
}

export const HistoricoDetalhesModal: React.FC<HistoricoDetalhesModalProps> = ({
  isOpen,
  item,
  onClose,
}) => {
  const [cachedItem, setCachedItem] = useState<ChecklistHistoricoItem | null>(item);

  useEffect(() => {
    if (item) {
      setCachedItem(item);
    }
  }, [item]);

  const displayedItem = item || cachedItem;

  const dataFormatada = displayedItem
    ? new Date(displayedItem.dataHora).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    : '';

  const handleBaixarPdf = () => {
    if (!displayedItem) return;
    gerarChecklistPDF({
      pedidoId: displayedItem.pedidoId,
      acabamento: displayedItem.acabamento,
      dataEmissao: displayedItem.dataHora,
      quantidadePecas: displayedItem.quantidadePecas,
      pecasPorPack: displayedItem.pecasPorPack,
      quantidadePacks: displayedItem.quantidadePacks,
      itens: displayedItem.itens,
    });
  };

  return (
    <Modal
      isOpen={isOpen && !!item}
      onClose={onClose}
      maxWidth="max-w-2xl"
      className="flex flex-col max-h-[90vh]"
    >
      {displayedItem && (
        <>
          {/* Topo do Modal */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-slate-900 text-white rounded-lg">
                <FileText className="w-5 h-5 text-sky-400" />
              </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {displayedItem.pedidoId?.trim() ? `Pedido ${displayedItem.pedidoId}` : 'Checklist de Separação'}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>Gerado em {dataFormatada}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informações Gerais do Pedido */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Acabamento
              </span>
              <span className="text-sm font-bold text-sky-800 mt-0.5 block">
                {displayedItem.acabamento?.trim() ? displayedItem.acabamento : '—'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total de Peças
              </span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">
                {formatNumero(displayedItem.quantidadePecas)} un.
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Peças / Pack
              </span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">
                {displayedItem.pecasPorPack ? `${formatNumero(displayedItem.pecasPorPack)} un.` : '—'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Packs
              </span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">
                {displayedItem.quantidadePacks ? `${formatNumero(displayedItem.quantidadePacks)}` : '—'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Insumos
              </span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">
                {displayedItem.itens.length} itens
              </span>
            </div>
          </div>

          {/* Tabela de Itens Separados */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-500" />
              Itens a Separar
            </h3>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                    <th className="py-2.5 px-4 w-24">Código</th>
                    <th className="py-2.5 px-4">Insumo</th>
                    <th className="py-2.5 px-4 text-right">Separar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedItem.itens.map((it, idx) => {
                    const isPack = it.insumo.baseCalculo === 'pack';
                    const tipoEmbalagemPlural =
                      it.calculo.quantidadeEmbalagens === 1
                        ? it.insumo.tipoEmbalagem.toLowerCase()
                        : `${it.insumo.tipoEmbalagem.toLowerCase()}s`;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          {it.insumo.codigo || '—'}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>{it.insumo.nome}</span>
                            {isPack && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                                Pack
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                          {formatNumero(it.calculo.quantidadeEmbalagens)} {tipoEmbalagemPlural}{' '}
                          <span className="text-xs text-slate-500 font-normal">
                            ({formatNumero(it.calculo.quantidadeSeparada)} {it.insumo.unidade})
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Fechar
          </button>

          <button
            type="button"
            onClick={handleBaixarPdf}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Abrir PDF</span>
          </button>
        </div>
      </>
      )}
    </Modal>
  );
};
