import { Insumo, ChecklistHistoricoItem, Solicitacao, ItemFilaSincronizacao } from '../types';
import { INITIAL_INSUMOS } from '../data/initialInsumos';

const STORAGE_KEY = 'checklist_insumos_data_v1';
const STORAGE_HISTORICO_KEY = 'checklist_historico_data_v1';
const STORAGE_SOLICITACOES_KEY = 'checklist_solicitacoes_data_v1';
const STORAGE_FILA_OFFLINE_KEY = 'checklist_fila_offline_v1';

export const storageService = {
  // --- INSUMOS ---
  getInsumos(): Insumo[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        // Inicializa com dados padrão
        this.saveInsumos(INITIAL_INSUMOS);
        return INITIAL_INSUMOS;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Normalização garantindo que baseCalculo exista
        const normalizados: Insumo[] = parsed.map((item) => ({
          ...item,
          baseCalculo: item.baseCalculo || (item.nome?.toLowerCase() === 'caixa' ? 'pack' : 'peca'),
        }));
        return normalizados;
      }
      return INITIAL_INSUMOS;
    } catch (err) {
      console.error('Erro ao ler insumos do localStorage:', err);
      return INITIAL_INSUMOS;
    }
  },

  saveInsumos(insumos: Insumo[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(insumos));
    } catch (err) {
      console.error('Erro ao salvar insumos no localStorage:', err);
    }
  },

  addInsumo(novoInsumo: Omit<Insumo, 'id'>): Insumo {
    const insumos = this.getInsumos();
    const id = `ins-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 1000)}`;
    const insumo: Insumo = {
      ...novoInsumo,
      baseCalculo: novoInsumo.baseCalculo || 'peca',
      id,
    };
    const updated = [...insumos, insumo];
    this.saveInsumos(updated);
    return insumo;
  },

  updateInsumo(insumoAtualizado: Insumo): void {
    const insumos = this.getInsumos();
    const updated = insumos.map((item) =>
      item.id === insumoAtualizado.id ? { ...insumoAtualizado, baseCalculo: insumoAtualizado.baseCalculo || 'peca' } : item
    );
    this.saveInsumos(updated);
  },

  deleteInsumo(id: string): void {
    const insumos = this.getInsumos();
    const updated = insumos.filter((item) => item.id !== id);
    this.saveInsumos(updated);
  },

  resetToDefault(): Insumo[] {
    this.saveInsumos(INITIAL_INSUMOS);
    return INITIAL_INSUMOS;
  },

  // --- HISTÓRICO DE CHECKLISTS ---
  getHistorico(): ChecklistHistoricoItem[] {
    try {
      const data = localStorage.getItem(STORAGE_HISTORICO_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        // Ordena do mais recente para o mais antigo
        return parsed.sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());
      }
      return [];
    } catch (err) {
      console.error('Erro ao ler histórico do localStorage:', err);
      return [];
    }
  },

  saveHistorico(historico: ChecklistHistoricoItem[]): void {
    try {
      localStorage.setItem(STORAGE_HISTORICO_KEY, JSON.stringify(historico));
    } catch (err) {
      console.error('Erro ao salvar histórico no localStorage:', err);
    }
  },

  addHistorico(novoItem: Omit<ChecklistHistoricoItem, 'id' | 'dataHora'>): ChecklistHistoricoItem {
    const historico = this.getHistorico();
    const item: ChecklistHistoricoItem = {
      ...novoItem,
      id: `chk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      dataHora: new Date().toISOString(),
    };
    const updated = [item, ...historico];
    this.saveHistorico(updated);
    return item;
  },

  deleteHistorico(id: string): void {
    const historico = this.getHistorico();
    const updated = historico.filter((item) => item.id !== id);
    this.saveHistorico(updated);
  },

  clearHistorico(): void {
    try {
      localStorage.removeItem(STORAGE_HISTORICO_KEY);
    } catch (err) {
      console.error('Erro ao limpar histórico:', err);
    }
  },

  // --- MINHAS SOLICITAÇÕES ---
  getSolicitacoes(): Solicitacao[] {
    try {
      const data = localStorage.getItem(STORAGE_SOLICITACOES_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        // Ordena da mais recente para a mais antiga
        return parsed.sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());
      }
      return [];
    } catch (err) {
      console.error('Erro ao ler solicitações do localStorage:', err);
      return [];
    }
  },

  saveSolicitacoes(solicitacoes: Solicitacao[]): void {
    try {
      localStorage.setItem(STORAGE_SOLICITACOES_KEY, JSON.stringify(solicitacoes));
    } catch (err) {
      console.error('Erro ao salvar solicitações no localStorage:', err);
    }
  },

  addSolicitacao(nova: Omit<Solicitacao, 'id' | 'dataHora'>): Solicitacao {
    const solicitacoes = this.getSolicitacoes();
    const item: Solicitacao = {
      ...nova,
      id: `sol-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      dataHora: new Date().toISOString(),
    };
    const updated = [item, ...solicitacoes];
    this.saveSolicitacoes(updated);
    return item;
  },

  deleteSolicitacao(id: string): void {
    const solicitacoes = this.getSolicitacoes();
    const updated = solicitacoes.filter((item) => item.id !== id);
    this.saveSolicitacoes(updated);
  },

  // --- FILA DE SINCRONIZAÇÃO OFFLINE ---
  getFilaSincronizacao(): ItemFilaSincronizacao[] {
    try {
      const data = localStorage.getItem(STORAGE_FILA_OFFLINE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Erro ao ler fila offline:', err);
      return [];
    }
  },

  salvarFilaSincronizacao(fila: ItemFilaSincronizacao[]): void {
    try {
      localStorage.setItem(STORAGE_FILA_OFFLINE_KEY, JSON.stringify(fila));
    } catch (err) {
      console.error('Erro ao salvar fila offline:', err);
    }
  },

  adicionarFilaSincronizacao(tipo: ItemFilaSincronizacao['tipo'], dados: any): void {
    const fila = this.getFilaSincronizacao();
    const novoItem: ItemFilaSincronizacao = {
      id: `fila-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tipo,
      dados,
      criadoEm: new Date().toISOString(),
    };
    this.salvarFilaSincronizacao([...fila, novoItem]);
  },

  removerItemFilaSincronizacao(id: string): void {
    const fila = this.getFilaSincronizacao();
    this.salvarFilaSincronizacao(fila.filter((item) => item.id !== id));
  },

  limparFilaSincronizacao(): void {
    try {
      localStorage.removeItem(STORAGE_FILA_OFFLINE_KEY);
    } catch (err) {
      console.error('Erro ao limpar fila offline:', err);
    }
  }
};
