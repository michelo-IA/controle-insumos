import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, PackageSearch, Shirt, PackageOpen } from 'lucide-react';
import { Insumo } from '../types';
import { InsumoModal } from '../components/insumos/InsumoModal';
import { DeleteConfirmModal } from '../components/insumos/DeleteConfirmModal';
import { formatNumero } from '../services/calculator';

interface InsumosProps {
  insumos: Insumo[];
  onAddInsumo: (insumo: Omit<Insumo, 'id'>) => void;
  onUpdateInsumo: (insumo: Insumo) => void;
  onDeleteInsumo: (id: string) => void;
}

export const Insumos: React.FC<InsumosProps> = ({
  insumos,
  onAddInsumo,
  onUpdateInsumo,
  onDeleteInsumo,
}) => {
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [insumoEditando, setInsumoEditando] = useState<Insumo | null>(null);
  const [insumoParaExcluir, setInsumoParaExcluir] = useState<Insumo | null>(null);

  // Filtragem em tempo real (incluindo busca por código)
  const insumosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return insumos;
    return insumos.filter(
      (item) =>
        (item.codigo && item.codigo.toLowerCase().includes(termo)) ||
        item.nome.toLowerCase().includes(termo) ||
        item.unidade.toLowerCase().includes(termo) ||
        item.tipoEmbalagem.toLowerCase().includes(termo) ||
        (item.baseCalculo === 'pack' ? 'pack' : 'peça').includes(termo)
    );
  }, [insumos, busca]);

  const handleOpenNovo = () => {
    setInsumoEditando(null);
    setModalAberto(true);
  };

  const handleOpenEditar = (insumo: Insumo) => {
    setInsumoEditando(insumo);
    setModalAberto(true);
  };

  const handleSalvar = (dados: Omit<Insumo, 'id'> | Insumo) => {
    if ('id' in dados) {
      onUpdateInsumo(dados as Insumo);
    } else {
      onAddInsumo(dados);
    }
  };

  const handleConfirmarExclusao = () => {
    if (insumoParaExcluir) {
      onDeleteInsumo(insumoParaExcluir.id);
      setInsumoParaExcluir(null);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Topo da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Insumos
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Cadastre e gerencie os materiais utilizados nas peças ou nos packs.
          </p>
        </div>

        <button
          onClick={handleOpenNovo}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Insumo</span>
        </button>
      </div>

      {/* Barra de Busca */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por código, nome, unidade ou embalagem..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Lista de Insumos */}
      {insumosFiltrados.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <PackageSearch className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 mb-1">Nenhum insumo encontrado</h3>
          <p className="text-sm text-slate-500">
            {busca ? 'Tente buscar por outro código ou termo.' : 'Cadastre o primeiro insumo clicando no botão acima.'}
          </p>
        </div>
      ) : (
        <>
          {/* Tabela para Desktop e Tablet */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3.5 px-5 w-28">Código</th>
                  <th className="py-3.5 px-6">Nome</th>
                  <th className="py-3.5 px-6">Unidade</th>
                  <th className="py-3.5 px-6">Base / Consumo</th>
                  <th className="py-3.5 px-6">Tipo de Embalagem</th>
                  <th className="py-3.5 px-6 text-right">Qtd. por Embalagem</th>
                  <th className="py-3.5 px-6 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {insumosFiltrados.map((insumo) => {
                  const isPack = insumo.baseCalculo === 'pack';

                  return (
                    <tr key={insumo.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-5">
                        {insumo.codigo ? (
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                            {insumo.codigo}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900">{insumo.nome}</td>
                      <td className="py-4 px-6 text-slate-600">{insumo.unidade}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {formatNumero(insumo.quantidadePorPeca)} {insumo.unidade}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
                              isPack
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isPack ? (
                              <>
                                <PackageOpen className="w-3 h-3" />
                                / pack
                              </>
                            ) : (
                              <>
                                <Shirt className="w-3 h-3" />
                                / peça
                              </>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 text-slate-700">
                          {insumo.tipoEmbalagem}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-medium">
                        {formatNumero(insumo.quantidadePorEmbalagem)} {insumo.unidade}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditar(insumo)}
                            title="Editar"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setInsumoParaExcluir(insumo)}
                            title="Excluir"
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
            {insumosFiltrados.map((insumo) => {
              const isPack = insumo.baseCalculo === 'pack';

              return (
                <div
                  key={insumo.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {insumo.codigo && (
                          <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {insumo.codigo}
                          </span>
                        )}
                        <h3 className="font-bold text-slate-900 text-base">{insumo.nome}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Unidade: {insumo.unidade}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700">
                        {insumo.tipoEmbalagem}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                          isPack
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isPack ? 'Por Pack' : 'Por Peça'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-500 block">
                        {isPack ? 'Qtd / Pack' : 'Qtd / Peça'}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {formatNumero(insumo.quantidadePorPeca)} {insumo.unidade}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Qtd / Embalagem</span>
                      <span className="font-semibold text-slate-800">
                        {formatNumero(insumo.quantidadePorEmbalagem)} {insumo.unidade}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenEditar(insumo)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-lg transition-all duration-150"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button
                      onClick={() => setInsumoParaExcluir(insumo)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 active:scale-95 rounded-lg transition-all duration-150"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modais */}
      <InsumoModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSave={handleSalvar}
        insumoEditando={insumoEditando}
      />

      <DeleteConfirmModal
        isOpen={!!insumoParaExcluir}
        insumo={insumoParaExcluir}
        onClose={() => setInsumoParaExcluir(null)}
        onConfirm={handleConfirmarExclusao}
      />
    </div>
  );
};
