import React, { useState, useMemo, useEffect } from 'react';
import { 
  ClipboardCheck, 
  FileText, 
  AlertCircle, 
  CheckSquare, 
  Square, 
  Package, 
  Layers,
  Shirt,
  PackageOpen,
  Boxes,
  Inbox,
  CheckCircle2
} from 'lucide-react';
import { Insumo, ItemCalculado, ChecklistHistoricoItem, Solicitacao } from '../types';
import { calculateInsumeRequirement, calcularPacksPorPecas, formatNumero } from '../services/calculator';
import { gerarChecklistPDF } from '../services/pdf';
import { Modal } from '../components/common/Modal';

interface GerarChecklistProps {
  insumos: Insumo[];
  onSalvarHistorico?: (item: Omit<ChecklistHistoricoItem, 'id' | 'dataHora'>) => void;
  solicitacaoAtiva?: Solicitacao | null;
  onFinalizarSolicitacao?: (solicitacaoId: string) => void;
  onCancelarAtendimentoSolicitacao?: () => void;
}

export const GerarChecklist: React.FC<GerarChecklistProps> = ({ 
  insumos, 
  onSalvarHistorico,
  solicitacaoAtiva,
  onFinalizarSolicitacao,
  onCancelarAtendimentoSolicitacao,
}) => {
  const [pedidoId, setPedidoId] = useState(solicitacaoAtiva ? solicitacaoAtiva.referencia : '');
  const [acabamento, setAcabamento] = useState(solicitacaoAtiva?.acabamento || '');
  const [quantidadePecas, setQuantidadePecas] = useState<string>(
    solicitacaoAtiva ? solicitacaoAtiva.quantidade.toString() : ''
  );
  const [pecasPorPack, setPecasPorPack] = useState<string>('');
  
  // Mapeia insumoId -> { selecionado: boolean, quantidadePorPecaTemp: number }
  const [selecaoInsumos, setSelecaoInsumos] = useState<
    Record<string, { selecionado: boolean; quantidadePorPecaTemp: number }>
  >(() => {
    const initial: Record<string, { selecionado: boolean; quantidadePorPecaTemp: number }> = {};
    insumos.forEach((ins) => {
      initial[ins.id] = {
        selecionado: false,
        quantidadePorPecaTemp: ins.quantidadePorPeca,
      };
    });
    return initial;
  });

  const [erroValidacao, setErroValidacao] = useState<string | null>(null);
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [pdfParaAbrir, setPdfParaAbrir] = useState<(() => void) | null>(null);

  // Limpa todos os campos do formulário
  const limparFormulario = () => {
    setPedidoId('');
    setAcabamento('');
    setQuantidadePecas('');
    setPecasPorPack('');
    setSelecaoInsumos(() => {
      const initial: Record<string, { selecionado: boolean; quantidadePorPecaTemp: number }> = {};
      insumos.forEach((ins) => {
        initial[ins.id] = {
          selecionado: false,
          quantidadePorPecaTemp: ins.quantidadePorPeca,
        };
      });
      return initial;
    });
    setErroValidacao(null);
  };

  const handleAbrirPdfModal = () => {
    if (pdfParaAbrir) {
      pdfParaAbrir();
    }
    setModalConfirmacaoAberto(false);
    setPdfParaAbrir(null);
  };

  const handleFecharModalConfirmacao = () => {
    setModalConfirmacaoAberto(false);
    setPdfParaAbrir(null);
  };

  // Carrega automaticamente referência, acabamento e quantidade quando uma solicitação é atendida
  useEffect(() => {
    if (solicitacaoAtiva) {
      setPedidoId(solicitacaoAtiva.referencia);
      setAcabamento(solicitacaoAtiva.acabamento || '');
      setQuantidadePecas(solicitacaoAtiva.quantidade.toString());
      // Conforme especificado: não puxar peças por pack e nem insumos, colocar manualmente
      setPecasPorPack('');
      setSelecaoInsumos(() => {
        const initial: Record<string, { selecionado: boolean; quantidadePorPecaTemp: number }> = {};
        insumos.forEach((ins) => {
          initial[ins.id] = {
            selecionado: false,
            quantidadePorPecaTemp: ins.quantidadePorPeca,
          };
        });
        return initial;
      });
      setErroValidacao(null);
    }
  }, [solicitacaoAtiva, insumos]);

  // Toggle seleção
  const handleToggleInsumo = (insumoId: string) => {
    setSelecaoInsumos((prev) => {
      const atual = prev[insumoId] || {
        selecionado: false,
        quantidadePorPecaTemp: insumos.find((i) => i.id === insumoId)?.quantidadePorPeca || 1,
      };
      return {
        ...prev,
        [insumoId]: {
          ...atual,
          selecionado: !atual.selecionado,
        },
      };
    });
    setErroValidacao(null);
  };

  // Alterar temporariamente a quantidade por peça ou por pack
  const handleChangeQtdPorBaseTemp = (insumoId: string, valorStr: string) => {
    const valorNum = parseFloat(valorStr.replace(',', '.'));
    setSelecaoInsumos((prev) => {
      const atual = prev[insumoId] || {
        selecionado: true,
        quantidadePorPecaTemp: 1,
      };
      return {
        ...prev,
        [insumoId]: {
          ...atual,
          quantidadePorPecaTemp: isNaN(valorNum) ? 0 : valorNum,
        },
      };
    });
  };

  // Quantidade de peças numérica
  const pecasNumericas = useMemo(() => {
    const parsed = parseFloat(quantidadePecas.replace(',', '.'));
    return isNaN(parsed) || parsed <= 0 ? 0 : parsed;
  }, [quantidadePecas]);

  // Peças por pack numérico
  const pecasPorPackNumerico = useMemo(() => {
    const parsed = parseFloat(pecasPorPack.replace(',', '.'));
    return isNaN(parsed) || parsed <= 0 ? 0 : parsed;
  }, [pecasPorPack]);

  // Quantidade total de packs calculada automaticamente: Math.ceil(pecas / pecasPorPack)
  const packsNumericos = useMemo(() => {
    if (pecasNumericas <= 0 || pecasPorPackNumerico <= 0) return 0;
    return calcularPacksPorPecas(pecasNumericas, pecasPorPackNumerico);
  }, [pecasNumericas, pecasPorPackNumerico]);

  // Verifica se há algum insumo com cálculo por pack selecionado
  const temInsumoPorPackSelecionado = useMemo(() => {
    return insumos.some(
      (ins) => ins.baseCalculo === 'pack' && selecaoInsumos[ins.id]?.selecionado
    );
  }, [insumos, selecaoInsumos]);

  // Itens calculados em tempo real através da função centralizada de cálculo
  const itensCalculados: ItemCalculado[] = useMemo(() => {
    if (pecasNumericas <= 0) return [];

    const resultado: ItemCalculado[] = [];
    insumos.forEach((ins) => {
      const estado = selecaoInsumos[ins.id];
      if (estado && estado.selecionado) {
        const qtdPorBase = estado.quantidadePorPecaTemp > 0 ? estado.quantidadePorPecaTemp : ins.quantidadePorPeca;
        const isPack = ins.baseCalculo === 'pack';
        const referencia = isPack ? packsNumericos : pecasNumericas;

        const calculo = calculateInsumeRequirement(
          referencia,
          qtdPorBase,
          ins.quantidadePorEmbalagem
        );

        resultado.push({
          insumo: ins,
          quantidadePorPecaUtilizada: qtdPorBase,
          calculo,
        });
      }
    });

    return resultado;
  }, [insumos, selecaoInsumos, pecasNumericas, packsNumericos]);

  // Contagem de selecionados
  const totalSelecionados = useMemo(() => {
    return Object.values(selecaoInsumos).filter((s) => s.selecionado).length;
  }, [selecaoInsumos]);

  // Geração do PDF com validações estritas
  const handleGerarPDF = () => {
    setErroValidacao(null);

    if (!quantidadePecas.trim() || pecasNumericas <= 0) {
      setErroValidacao('Informe uma quantidade de peças válida e maior que zero.');
      return;
    }

    if (totalSelecionados === 0) {
      setErroValidacao('Selecione pelo menos um insumo para gerar o checklist de separação.');
      return;
    }

    // Se houver insumos por pack, validar se as peças por pack foram preenchidas
    if (temInsumoPorPackSelecionado && pecasPorPackNumerico <= 0) {
      setErroValidacao(
        'Você selecionou insumos calculados "Por Pack" (ex: Caixa). Por favor, informe quantas peças vão no pack.'
      );
      return;
    }

    // Verificar se algum insumo selecionado possui quantidade por peça/pack <= 0
    for (const item of itensCalculados) {
      if (item.quantidadePorPecaUtilizada <= 0) {
        const baseNome = item.insumo.baseCalculo === 'pack' ? 'pack' : 'peça';
        setErroValidacao(`A quantidade por ${baseNome} do insumo "${item.insumo.nome}" deve ser maior que zero.`);
        return;
      }
    }

    if (!pedidoId.trim()) {
      setErroValidacao('Informe a referência do pedido.');
      return;
    }

    if (!acabamento.trim()) {
      setErroValidacao('Informe para qual acabamento vão os insumos.');
      return;
    }

    // Gerar o documento PDF (sem abrir automaticamente ainda)
    const { open } = gerarChecklistPDF({
      pedidoId,
      acabamento: acabamento.trim(),
      quantidadePecas: pecasNumericas,
      pecasPorPack: pecasPorPackNumerico > 0 ? pecasPorPackNumerico : undefined,
      quantidadePacks: packsNumericos > 0 ? packsNumericos : undefined,
      itens: itensCalculados,
      autoOpen: false,
    });

    // Registrar no histórico de checklists
    if (onSalvarHistorico) {
      onSalvarHistorico({
        pedidoId: pedidoId.trim() || undefined,
        acabamento: acabamento.trim() || undefined,
        quantidadePecas: pecasNumericas,
        pecasPorPack: pecasPorPackNumerico > 0 ? pecasPorPackNumerico : undefined,
        quantidadePacks: packsNumericos > 0 ? packsNumericos : undefined,
        itens: itensCalculados,
      });
    }

    // Se estiver atendendo uma solicitação, ela é concluída e removida da lista
    if (solicitacaoAtiva && onFinalizarSolicitacao) {
      onFinalizarSolicitacao(solicitacaoAtiva.id);
    }

    // Guarda a função de abertura e abre o modal de confirmação
    setPdfParaAbrir(() => open);
    setModalConfirmacaoAberto(true);

    // Limpa o formulário imediatamente em segundo plano (conforme solicitado)
    limparFormulario();
    if (onCancelarAtendimentoSolicitacao) {
      onCancelarAtendimentoSolicitacao();
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 relative">
      {/* Modal de Confirmação da Geração do PDF */}
      <Modal
        isOpen={modalConfirmacaoAberto}
        onClose={handleFecharModalConfirmacao}
        maxWidth="max-w-sm"
        className="p-6 text-center"
      >
        {/* Ícone de Sucesso */}
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        {/* Título e Mensagem Simples e Direta */}
        <h3 className="text-xl font-extrabold text-slate-900 mb-2">
          Checklist gerado com sucesso!
        </h3>
        <p className="text-sm text-slate-600 mb-6">
          O PDF do checklist de insumos foi gerado e salvo no histórico.
        </p>

        {/* Botões de Ação */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleAbrirPdfModal}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all shadow-md text-sm"
          >
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Abrir PDF</span>
          </button>

          <button
            type="button"
            onClick={handleFecharModalConfirmacao}
            className="w-full py-2.5 px-4 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 active:scale-[0.98] transition-all text-xs"
          >
            Fechar
          </button>
        </div>
      </Modal>
      {/* Título da Página */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <ClipboardCheck className="w-7 h-7 text-sky-600" />
          Gerar Checklist
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Informe as peças do pedido, o acabamento de destino e o tamanho do pack para calcular os insumos e gerar o PDF de conferência.
        </p>
      </div>

      {/* Banner de Solicitação Ativa (quando puxada da tela de solicitações) */}
      {solicitacaoAtiva && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 text-white rounded-lg flex-shrink-0">
              <Inbox className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider">
                  Atendendo solicitação
                </span>
                <span className="text-xs bg-sky-200/70 text-sky-900 font-semibold px-2 py-0.5 rounded">
                  Puxada automaticamente
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {solicitacaoAtiva.referencia} &bull; {formatNumero(solicitacaoAtiva.quantidade)} peças
                {solicitacaoAtiva.acabamento ? ` • Acabamento: ${solicitacaoAtiva.acabamento}` : ''}
              </p>
              <p className="text-xs text-slate-500">
                Referência, acabamento e quantidade carregados. Defina abaixo as peças por pack e os aviamentos necessários.
              </p>
            </div>
          </div>

          {onCancelarAtendimentoSolicitacao && (
            <button
              type="button"
              onClick={onCancelarAtendimentoSolicitacao}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
            >
              Desvincular
            </button>
          )}
        </div>
      )}

      {/* SEÇÃO 1: Dados do Pedido */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          Dados do pedido
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Referência do Pedido */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Referência <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={pedidoId}
              onChange={(e) => {
                setPedidoId(e.target.value);
                setErroValidacao(null);
              }}
              placeholder="Ex: REF-2045, Lote 54..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all shadow-sm"
            />
          </div>

          {/* Acabamento (Para qual acabamento vão os insumos) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Acabamento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={acabamento}
              onChange={(e) => {
                setAcabamento(e.target.value);
                setErroValidacao(null);
              }}
              placeholder="Ex: Acabamento Interno, Facção..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all shadow-sm"
            />
            <p className="mt-1.5 text-[11px] text-slate-500">
              Para qual acabamento serão enviados os aviamentos.
            </p>
          </div>

          {/* Quantidade de Peças (Obrigatório) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Quantidade de peças <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="1"
                required
                value={quantidadePecas}
                onChange={(e) => {
                  setQuantidadePecas(e.target.value);
                  setErroValidacao(null);
                }}
                placeholder="Ex: 1350"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all shadow-sm"
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-medium text-slate-400">
                peças
              </div>
            </div>
          </div>

          {/* Peças por Pack */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <span>Peças por pack</span>
                {temInsumoPorPackSelecionado && (
                  <span className="text-[11px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                    Necessário
                  </span>
                )}
              </label>
            </div>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="any"
                value={pecasPorPack}
                onChange={(e) => {
                  setPecasPorPack(e.target.value);
                  setErroValidacao(null);
                }}
                placeholder="Ex: 30 peças por pack"
                className={`w-full px-3.5 py-2.5 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all shadow-sm ${
                  temInsumoPorPackSelecionado && pecasPorPackNumerico <= 0
                    ? 'bg-amber-50/60 border border-amber-300 text-slate-900'
                    : 'bg-white border border-slate-300 text-slate-900'
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-medium text-slate-400">
                peças / pack
              </div>
            </div>

            {/* Indicador em tempo real da quantidade de packs resultante */}
            {pecasNumericas > 0 && pecasPorPackNumerico > 0 ? (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-700 font-medium bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                <Boxes className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                <span>
                  Total calculado:{' '}
                  <strong className="text-slate-900 font-bold">{formatNumero(packsNumericos)} packs</strong>{' '}
                  <span className="text-slate-400 text-[11px]">
                    ({formatNumero(pecasNumericas)} ÷ {formatNumero(pecasPorPackNumerico)})
                  </span>
                </span>
              </div>
            ) : (
              <p className="mt-1.5 text-[11px] text-slate-500">
                Quantas peças acompanham cada pack neste pedido.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: Insumos do Pedido */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-500" />
              Insumos do pedido
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Selecione os insumos que deverão acompanhar as peças ou packs.
            </p>
          </div>
          <div className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-full text-slate-700 self-start sm:self-auto">
            {totalSelecionados} selecionado{totalSelecionados !== 1 ? 's' : ''}
          </div>
        </div>

        {insumos.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Nenhum insumo cadastrado no sistema. Acesse a tela "Insumos" para cadastrar.
          </div>
        ) : (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            {/* Tabela para Desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                    <th className="py-3 px-4 w-12 text-center">Seleção</th>
                    <th className="py-3 px-4">Insumo</th>
                    <th className="py-3 px-4">Base de Consumo</th>
                    <th className="py-3 px-4 w-44">Qtd. Utilizada</th>
                    <th className="py-3 px-4">Tipo de Embalagem</th>
                    <th className="py-3 px-4 text-right">Qtd. por Embalagem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {insumos.map((ins) => {
                    const estado = selecaoInsumos[ins.id] || {
                      selecionado: false,
                      quantidadePorPecaTemp: ins.quantidadePorPeca,
                    };
                    const isSelected = estado.selecionado;
                    const isPack = ins.baseCalculo === 'pack';

                    return (
                      <tr 
                        key={ins.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-sky-50/40' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleInsumo(ins.id)}
                            className="p-1 rounded text-slate-700 hover:text-slate-900 focus:outline-none"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-slate-900" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-300" />
                            )}
                          </button>
                        </td>

                        {/* Código e Nome do Insumo */}
                        <td 
                          onClick={() => handleToggleInsumo(ins.id)}
                          className="py-3.5 px-4 font-bold text-slate-900 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            {ins.codigo && (
                              <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {ins.codigo}
                              </span>
                            )}
                            <span>{ins.nome}</span>
                          </div>
                        </td>

                        {/* Base de Consumo */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${
                              isPack
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isPack ? (
                              <>
                                <PackageOpen className="w-3.5 h-3.5" />
                                Por Pack
                              </>
                            ) : (
                              <>
                                <Shirt className="w-3.5 h-3.5" />
                                Por Peça
                              </>
                            )}
                          </span>
                        </td>

                        {/* Quantidade Utilizada (editável temporariamente) */}
                        <td className="py-3.5 px-4">
                          {isSelected ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                step="any"
                                min="0.001"
                                value={estado.quantidadePorPecaTemp}
                                onChange={(e) => handleChangeQtdPorBaseTemp(ins.id, e.target.value)}
                                className="w-24 px-2.5 py-1 text-sm bg-white border border-slate-300 rounded font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
                              />
                              <span className="text-xs text-slate-500">
                                {ins.unidade} / {isPack ? 'pack' : 'peça'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-600 font-medium">
                              {formatNumero(ins.quantidadePorPeca)} {ins.unidade} / {isPack ? 'pack' : 'peça'}
                            </span>
                          )}
                        </td>

                        {/* Tipo de Embalagem */}
                        <td className="py-3.5 px-4 text-slate-700">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-xs font-semibold">
                            {ins.tipoEmbalagem}
                          </span>
                        </td>

                        {/* Quantidade por Embalagem */}
                        <td className="py-3.5 px-4 text-right font-medium text-slate-800">
                          {formatNumero(ins.quantidadePorEmbalagem)} {ins.unidade}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Lista em Cards para Mobile */}
            <div className="divide-y divide-slate-100 sm:hidden">
              {insumos.map((ins) => {
                const estado = selecaoInsumos[ins.id] || {
                  selecionado: false,
                  quantidadePorPecaTemp: ins.quantidadePorPeca,
                };
                const isSelected = estado.selecionado;
                const isPack = ins.baseCalculo === 'pack';

                return (
                  <div
                    key={ins.id}
                    className={`p-4 transition-colors ${
                      isSelected ? 'bg-sky-50/40' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleToggleInsumo(ins.id)}
                        className="flex items-center gap-2.5 font-bold text-slate-900 text-left"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-slate-900 flex-shrink-0" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300 flex-shrink-0" />
                        )}
                        {ins.codigo && (
                          <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {ins.codigo}
                          </span>
                        )}
                        <span>{ins.nome}</span>
                      </button>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isPack
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isPack ? 'Por Pack' : 'Por Peça'}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="mt-3 pl-8 flex items-center gap-2">
                        <label className="text-xs font-semibold text-slate-600">
                          Qtd. por {isPack ? 'pack' : 'peça'} neste pedido:
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0.001"
                          value={estado.quantidadePorPecaTemp}
                          onChange={(e) => handleChangeQtdPorBaseTemp(ins.id, e.target.value)}
                          className="w-20 px-2 py-1 text-xs bg-white border border-slate-300 rounded font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                        <span className="text-xs text-slate-500">{ins.unidade}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* SEÇÃO 3: Visualização do Resultado dos Cálculos */}
      {pecasNumericas > 0 && itensCalculados.length > 0 && (
        <section className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-500" />
              Cálculo de separação por insumo
            </h2>
            <span className="text-xs text-slate-500">
              {formatNumero(pecasNumericas)} peças {packsNumericos > 0 ? `• ${formatNumero(packsNumericos)} packs` : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {itensCalculados.map(({ insumo, quantidadePorPecaUtilizada, calculo }) => {
              const isPack = insumo.baseCalculo === 'pack';
              const pluralEmbalagem =
                calculo.quantidadeEmbalagens === 1
                  ? insumo.tipoEmbalagem.toLowerCase()
                  : `${insumo.tipoEmbalagem.toLowerCase()}s`;

              return (
                <div
                  key={insumo.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        {insumo.codigo && (
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {insumo.codigo}
                          </span>
                        )}
                        <h3 className="font-bold text-lg text-slate-900 tracking-tight">
                          {insumo.nome.toUpperCase()}
                        </h3>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isPack ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isPack ? 'Por Pack' : 'Por Peça'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {formatNumero(quantidadePorPecaUtilizada)} por {isPack ? 'pack' : 'peça'} &bull; Base:{' '}
                        {isPack
                          ? `${formatNumero(packsNumericos)} packs (${formatNumero(pecasPorPackNumerico)} peças/pack)`
                          : `${formatNumero(pecasNumericas)} peças`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Embalagem</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {insumo.tipoEmbalagem} com {formatNumero(insumo.quantidadePorEmbalagem)} {insumo.unidade}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    {/* Necessário */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                        Necessário
                      </span>
                      <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                        {formatNumero(calculo.quantidadeNecessaria)}
                      </span>
                      <span className="text-[10px] text-slate-500">{insumo.unidade}</span>
                    </div>

                    {/* Separar (Destaque) */}
                    <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-sm">
                      <span className="text-[11px] font-semibold text-sky-300 block uppercase tracking-wider">
                        Separar
                      </span>
                      <span className="text-sm font-extrabold text-white mt-0.5 block">
                        {formatNumero(calculo.quantidadeEmbalagens)}
                      </span>
                      <span className="text-[10px] text-slate-300">{pluralEmbalagem}</span>
                    </div>

                    {/* Total Separado */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                        Total Separado
                      </span>
                      <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                        {formatNumero(calculo.quantidadeSeparada)}
                      </span>
                      <span className="text-[10px] text-slate-500">{insumo.unidade}</span>
                    </div>

                    {/* Sobra */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                        Sobra
                      </span>
                      <span className={`text-sm font-bold mt-0.5 block ${
                        calculo.sobra > 0 ? 'text-amber-700' : 'text-slate-600'
                      }`}>
                        {formatNumero(calculo.sobra)}
                      </span>
                      <span className="text-[10px] text-slate-500">{insumo.unidade}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SEÇÃO 4: Resumo da Separação e CTA Gerar PDF */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Resumo da separação</h2>
            <div className="flex flex-wrap items-center gap-6 mt-2 text-sm text-slate-600">
              <div>
                Acabamento:{' '}
                <strong className="text-slate-900 font-bold">
                  {acabamento.trim() ? acabamento.trim() : '—'}
                </strong>
              </div>
              <div>
                Quantidade de peças:{' '}
                <strong className="text-slate-900 font-bold">
                  {pecasNumericas > 0 ? formatNumero(pecasNumericas) : '—'}
                </strong>
              </div>
              {pecasPorPackNumerico > 0 && (
                <div>
                  Peças por pack:{' '}
                  <strong className="text-slate-900 font-bold">
                    {formatNumero(pecasPorPackNumerico)}
                  </strong>
                </div>
              )}
              {packsNumericos > 0 && (
                <div>
                  Total de packs:{' '}
                  <strong className="text-slate-900 font-bold">
                    {formatNumero(packsNumericos)}
                  </strong>
                </div>
              )}
              <div>
                Insumos selecionados:{' '}
                <strong className="text-slate-900 font-bold">{totalSelecionados}</strong>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGerarPDF}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 active:scale-[0.99] transition-all shadow-md hover:shadow-lg text-base"
          >
            <FileText className="w-5 h-5 text-sky-400" />
            <span>Gerar PDF</span>
          </button>
        </div>

        {/* Mensagem de Erro de Validação */}
        {erroValidacao && (
          <div className="mt-4 flex items-center gap-2.5 p-3.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg animate-fadeIn">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{erroValidacao}</span>
          </div>
        )}
      </section>
    </div>
  );
};
