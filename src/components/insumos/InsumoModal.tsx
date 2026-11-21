import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Shirt, PackageOpen } from 'lucide-react';
import { Insumo, TipoEmbalagem, UnidadeMedida, BaseConsumo } from '../../types';
import { Modal } from '../common/Modal';

interface InsumoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (insumo: Omit<Insumo, 'id'> | Insumo) => void;
  insumoEditando: Insumo | null;
}

const UNIDADES: UnidadeMedida[] = ['Unidade', 'Metro', 'Quilograma', 'Par', 'Rolo'];
const TIPOS_EMBALAGEM: TipoEmbalagem[] = ['Caixa', 'Pacote', 'Rolo', 'Fardo', 'Unidade'];

export const InsumoModal: React.FC<InsumoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  insumoEditando,
}) => {
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [unidade, setUnidade] = useState<UnidadeMedida>('Unidade');
  const [baseCalculo, setBaseCalculo] = useState<BaseConsumo>('peca');
  const [quantidadePorPeca, setQuantidadePorPeca] = useState<string>('1');
  const [tipoEmbalagem, setTipoEmbalagem] = useState<TipoEmbalagem>('Caixa');
  const [quantidadePorEmbalagem, setQuantidadePorEmbalagem] = useState<string>('50');
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (insumoEditando) {
      setCodigo(insumoEditando.codigo || '');
      setNome(insumoEditando.nome);
      setUnidade(insumoEditando.unidade);
      setBaseCalculo(insumoEditando.baseCalculo || 'peca');
      setQuantidadePorPeca(insumoEditando.quantidadePorPeca.toString());
      setTipoEmbalagem(insumoEditando.tipoEmbalagem);
      setQuantidadePorEmbalagem(insumoEditando.quantidadePorEmbalagem.toString());
    } else {
      setCodigo('');
      setNome('');
      setUnidade('Unidade');
      setBaseCalculo('peca');
      setQuantidadePorPeca('1');
      setTipoEmbalagem('Caixa');
      setQuantidadePorEmbalagem('50');
    }
    setErro(null);
  }, [insumoEditando, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const nomeFormatado = nome.trim();
    if (!nomeFormatado) {
      setErro('O nome do insumo é obrigatório.');
      return;
    }

    const qtdPeca = parseFloat(quantidadePorPeca.replace(',', '.'));
    if (isNaN(qtdPeca) || qtdPeca <= 0) {
      setErro(`A quantidade por ${baseCalculo === 'peca' ? 'peça' : 'pack'} deve ser maior que zero.`);
      return;
    }

    const qtdEmbalagem = parseFloat(quantidadePorEmbalagem.replace(',', '.'));
    if (isNaN(qtdEmbalagem) || qtdEmbalagem <= 0) {
      setErro('A quantidade por embalagem deve ser maior que zero.');
      return;
    }

    const codigoLimpo = codigo.trim() || undefined;

    if (insumoEditando) {
      onSave({
        ...insumoEditando,
        codigo: codigoLimpo,
        nome: nomeFormatado,
        unidade,
        baseCalculo,
        quantidadePorPeca: qtdPeca,
        tipoEmbalagem,
        quantidadePorEmbalagem: qtdEmbalagem,
      });
    } else {
      onSave({
        codigo: codigoLimpo,
        nome: nomeFormatado,
        unidade,
        baseCalculo,
        quantidadePorPeca: qtdPeca,
        tipoEmbalagem,
        quantidadePorEmbalagem: qtdEmbalagem,
        ativo: true,
      });
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-900">
          {insumoEditando ? 'Editar Insumo' : 'Novo Insumo'}
        </h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {erro && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {/* Código e Nome do Insumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Código <span className="text-xs text-slate-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="Ex: CAB-01"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Nome do insumo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Cabide, Caixa, Pino..."
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
            />
          </div>
        </div>

        {/* Base de Consumo (Por Peça ou Por Pack) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Base de consumo do insumo <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setBaseCalculo('peca')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
                baseCalculo === 'peca'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shirt className="w-3.5 h-3.5 text-sky-600" />
              <span>Por Peça</span>
            </button>
            <button
              type="button"
              onClick={() => setBaseCalculo('pack')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
                baseCalculo === 'pack'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PackageOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>Por Pack (Pacote de Peças)</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {baseCalculo === 'peca'
              ? 'Calculado com base na quantidade individual de peças (ex: cabide, pino, etiqueta).'
              : 'Calculado com base no número de packs do pedido (ex: 1 caixa por pack, fardo por pack).'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Unidade */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Unidade de medida <span className="text-red-500">*</span>
            </label>
            <select
              value={unidade}
              onChange={(e) => setUnidade(e.target.value as UnidadeMedida)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all bg-white"
            >
              {UNIDADES.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Quantidade por Peça ou por Pack */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              {baseCalculo === 'peca' ? 'Qtd. por peça' : 'Qtd. por pack'}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              min="0.001"
              required
              value={quantidadePorPeca}
              onChange={(e) => setQuantidadePorPeca(e.target.value)}
              placeholder={baseCalculo === 'peca' ? 'Ex: 1 ou 0.5' : 'Ex: 1'}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tipo de Embalagem */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Tipo de embalagem <span className="text-red-500">*</span>
            </label>
            <select
              value={tipoEmbalagem}
              onChange={(e) => setTipoEmbalagem(e.target.value as TipoEmbalagem)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all bg-white"
            >
              {TIPOS_EMBALAGEM.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          {/* Quantidade por Embalagem */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Qtd. por embalagem <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              min="0.001"
              required
              value={quantidadePorEmbalagem}
              onChange={(e) => setQuantidadePorEmbalagem(e.target.value)}
              placeholder="Ex: 50"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
            />
          </div>
        </div>

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
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {insumoEditando ? 'Salvar Alterações' : 'Salvar Insumo'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
