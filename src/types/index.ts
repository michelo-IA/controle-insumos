export type UnidadeMedida = 'Unidade' | 'Metro' | 'Quilograma' | 'Par' | 'Rolo';

export type TipoEmbalagem = 'Caixa' | 'Pacote' | 'Rolo' | 'Fardo' | 'Unidade';

export type BaseConsumo = 'peca' | 'pack';

export type UserCargo = 'almoxarife' | 'acabamento' | 'admin';

export interface PerfilUsuario {
  id: string;
  userId?: string;
  nome: string;
  usuario: string;
  senha?: string;
  email?: string;
  cargo: UserCargo;
  acabamentoPadrao?: string;
  ativo: boolean;
  criadoEm?: string;
}

export interface Insumo {
  id: string;
  codigo?: string; // Código de referência/SKU do insumo (ex: CAB-001, 10204)
  nome: string;
  unidade: UnidadeMedida;
  baseCalculo?: BaseConsumo; // 'peca' | 'pack' (default: 'peca')
  quantidadePorPeca: number; // quantidade utilizada por peça ou por pack
  tipoEmbalagem: TipoEmbalagem;
  quantidadePorEmbalagem: number;
  ativo: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface ChecklistItemSelection {
  insumoId: string;
  quantidadePorPecaTemp: number;
}

export interface CalculoResultado {
  quantidadeNecessaria: number;
  quantidadeEmbalagens: number;
  quantidadeSeparada: number;
  sobra: number;
}

export interface ItemCalculado {
  insumo: Insumo;
  quantidadePorPecaUtilizada: number;
  calculo: CalculoResultado;
}

export interface ChecklistHistoricoItem {
  id: string;
  dataHora: string; // Formato ISO para ordenação e formatação consistente
  pedidoId?: string;
  acabamento?: string;
  quantidadePecas: number;
  pecasPorPack?: number;
  quantidadePacks?: number;
  itens: ItemCalculado[];
  solicitacaoId?: string;
  criadoPor?: string;
}

export interface Solicitacao {
  id: string;
  referencia: string;
  quantidade: number;
  acabamento?: string;
  dataHora: string;
  observacao?: string;
  status?: 'pendente' | 'em_separacao' | 'finalizado' | 'cancelado';
  solicitanteNome?: string;
  solicitanteId?: string;
}

export interface ItemFilaSincronizacao {
  id: string;
  tipo: 
    | 'add_solicitacao' 
    | 'delete_solicitacao' 
    | 'status_solicitacao'
    | 'add_historico' 
    | 'delete_historico' 
    | 'add_insumo' 
    | 'update_insumo' 
    | 'delete_insumo';
  dados: any;
  criadoEm: string;
}

export interface NotificacaoRealtime {
  id: string;
  titulo: string;
  mensagem: string;
  tipo?: 'info' | 'sucesso' | 'aviso';
  acao?: {
    label: string;
    onClick: () => void;
  };
  tempo?: number;
}

export type PaginaAtual = 'home' | 'solicitacoes' | 'checklist' | 'historico' | 'insumos' | 'usuarios' | 'login';
