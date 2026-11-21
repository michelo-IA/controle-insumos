import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ChecklistHistoricoItem } from '../../types';
import { Modal } from '../common/Modal';

interface DeleteHistoricoModalProps {
  isOpen: boolean;
  item: ChecklistHistoricoItem | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteHistoricoModal: React.FC<DeleteHistoricoModalProps> = ({
  isOpen,
  item,
  onClose,
  onConfirm,
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

  return (
    <Modal isOpen={isOpen && !!item} onClose={onClose} maxWidth="max-w-md">
      {displayedItem && (
        <div className="p-6">
          <div className="flex items-center gap-3 text-amber-600 mb-4">
            <div className="p-2 bg-amber-50 rounded-full">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Remover do Histórico</h3>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed mb-2">
            Tem certeza que deseja remover este checklist do histórico?
          </p>
          <div className="text-sm font-semibold text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>Pedido: {displayedItem.pedidoId || 'Não informado'}</div>
            <div className="text-xs font-normal text-slate-500 mt-0.5">Gerado em: {dataFormatada}</div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Remover
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
