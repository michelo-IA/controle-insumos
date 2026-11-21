import React, { useState, useEffect } from 'react';
import { X, AlertCircle, PlusCircle } from 'lucide-react';
import { Solicitacao } from '../../types';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';

interface NovaSolicitacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (solicitacao: Omit<Solicitacao, 'id' | 'dataHora'>) => void;
}

export const NovaSolicitacaoModal: React.FC<NovaSolicitacaoModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const { usuarioAtual } = useAuth();
  const [referencia, setReferencia] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [acabamento, setAcabamento] = useState('');
  const [observacao, setObservacao] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && usuarioAtual?.acabamentoPadrao && !acabamento) {
      setAcabamento(usuarioAtual.acabamentoPadrao);
    }
  }, [isOpen, usuarioAtual]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const refFormatada = referencia.trim();
    if (!refFormatada) {
      setErro('A referência ou identificação do pedido é obrigatória.');
      return;
    }

    const qtdNum = parseFloat(quantidade.replace(',', '.'));
    if (isNaN(qtdNum) || qtdNum <= 0) {
      setErro('A quantidade de peças deve ser um número maior que zero.');
      return;
    }

    const acabamentoFormatado = acabamento.trim();
    if (!acabamentoFormatado) {
      setErro('Informe para qual acabamento vão os insumos.');
      return;
    }

    onSave({
      referencia: refFormatada,
      quantidade: qtdNum,
      acabamento: acabamentoFormatado,
      observacao: observacao.trim() || undefined,
      solicitanteNome: usuarioAtual?.nome,
      solicitanteId: usuarioAtual?.id,
    });

    setReferencia('');
    setQuantidade('');
    setAcabamento('');
    setObservacao('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="w-full">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 text-white rounded-lg">
              <PlusCircle className="w-5 h-5 text-sky-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Nova Solicitação de Separação</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {erro && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* Referência */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Referência do pedido <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              placeholder="Ex: REF-2045, Vestido Floral, Lote 88..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all font-medium"
            />
          </div>

          {/* Quantidade de Peças */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Quantidade de peças <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="1"
                required
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="Ex: 1500"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-medium text-slate-400">
                peças
              </div>
            </div>
          </div>

          {/* Acabamento (Para onde vão os insumos) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Acabamento (Para onde vão os insumos) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={acabamento}
              onChange={(e) => setAcabamento(e.target.value)}
              placeholder="Ex: Acabamento Interno, Facção Silva, Setor 01..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all font-medium"
            />
          </div>

          {/* Observações (Opcional) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Observação <span className="text-xs text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea
              rows={2}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: Urgente para expedição matutina, cliente especial..."
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all resize-none"
            />
          </div>

          {/* Rodapé com Botões */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
            >
              Salvar Solicitação
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
