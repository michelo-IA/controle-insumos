import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Insumo } from '../../types';
import { Modal } from '../common/Modal';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  insumo: Insumo | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  insumo,
  onClose,
  onConfirm,
}) => {
  const [cachedInsumo, setCachedInsumo] = useState<Insumo | null>(insumo);

  useEffect(() => {
    if (insumo) {
      setCachedInsumo(insumo);
    }
  }, [insumo]);

  const displayedInsumo = insumo || cachedInsumo;

  return (
    <Modal isOpen={isOpen && !!insumo} onClose={onClose} maxWidth="max-w-md">
      {displayedInsumo && (
        <div className="p-6">
          <div className="flex items-center gap-3 text-amber-600 mb-4">
            <div className="p-2 bg-amber-50 rounded-full">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Confirmar Exclusão</h3>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed mb-1">
            Tem certeza que deseja excluir este insumo?
          </p>
          <p className="text-sm font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-2">
            {displayedInsumo.nome} ({displayedInsumo.tipoEmbalagem} com {displayedInsumo.quantidadePorEmbalagem} {displayedInsumo.unidade})
          </p>

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
              Excluir
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
