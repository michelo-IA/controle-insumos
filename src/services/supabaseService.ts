import { supabase } from './supabase';
import { Insumo, Solicitacao, ChecklistHistoricoItem, PerfilUsuario, UserCargo, ItemFilaSincronizacao } from '../types';

export const isUUID = (val: any): boolean => {
  return typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
};

export const supabaseService = {
  // ==========================================
  // PERFIS E AUTENTICAÇÃO DE USUÁRIOS
  // ==========================================
  async getPerfis(): Promise<PerfilUsuario[]> {
    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .not('usuario', 'is', null)
      .eq('ativo', true)
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar perfis:', error);
      throw error;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id || undefined,
      nome: row.nome,
      usuario: row.usuario,
      senha: row.senha,
      email: row.email || undefined,
      cargo: row.cargo as UserCargo,
      acabamentoPadrao: row.acabamento_padrao || undefined,
      ativo: row.ativo ?? true,
      criadoEm: row.criado_em,
    }));
  },

  async addPerfil(perfil: Omit<PerfilUsuario, 'id' | 'criadoEm'>): Promise<PerfilUsuario> {
    const usuarioFormatado = perfil.usuario.trim().toLowerCase();

    // 1. Verifica se já existe qualquer usuário cadastrado com este login
    const { data: existente } = await supabase
      .from('perfis')
      .select('*')
      .ilike('usuario', usuarioFormatado)
      .maybeSingle();

    if (existente) {
      if (existente.ativo) {
        throw new Error(`O nome de usuário "${perfil.usuario}" já está em uso.`);
      }

      // Se já existia no banco mas estava inativo, reativa e atualiza os dados em vez de falhar por chave duplicada
      const { data, error } = await supabase
        .from('perfis')
        .update({
          nome: perfil.nome.trim(),
          usuario: usuarioFormatado,
          senha: perfil.senha?.trim() || '123456',
          email: perfil.email || null,
          cargo: perfil.cargo,
          acabamento_padrao: perfil.acabamentoPadrao ? perfil.acabamentoPadrao.trim() : null,
          ativo: true,
        })
        .eq('id', existente.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao reativar usuário:', error);
        throw error;
      }

      return {
        id: data.id,
        userId: data.user_id || undefined,
        nome: data.nome,
        usuario: data.usuario,
        senha: data.senha,
        email: data.email || undefined,
        cargo: data.cargo as UserCargo,
        acabamentoPadrao: data.acabamento_padrao || undefined,
        ativo: data.ativo,
        criadoEm: data.criado_em,
      };
    }

    // Se não existia, insere normalmente
    const { data, error } = await supabase
      .from('perfis')
      .insert({
        nome: perfil.nome.trim(),
        usuario: usuarioFormatado,
        senha: perfil.senha?.trim() || '123456',
        email: perfil.email || null,
        cargo: perfil.cargo,
        acabamento_padrao: perfil.acabamentoPadrao ? perfil.acabamentoPadrao.trim() : null,
        ativo: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao cadastrar usuário:', error);
      throw error;
    }

    return {
      id: data.id,
      userId: data.user_id || undefined,
      nome: data.nome,
      usuario: data.usuario,
      senha: data.senha,
      email: data.email || undefined,
      cargo: data.cargo as UserCargo,
      acabamentoPadrao: data.acabamento_padrao || undefined,
      ativo: data.ativo,
      criadoEm: data.criado_em,
    };
  },

  async updatePerfil(perfil: PerfilUsuario): Promise<PerfilUsuario> {
    const usuarioFormatado = perfil.usuario.trim().toLowerCase();

    // Valida se o novo usuário colide com outro usuário ativo diferente deste
    const { data: existente } = await supabase
      .from('perfis')
      .select('id')
      .ilike('usuario', usuarioFormatado)
      .neq('id', perfil.id)
      .eq('ativo', true)
      .maybeSingle();

    if (existente) {
      throw new Error(`O nome de usuário "${perfil.usuario}" já está em uso por outro operador.`);
    }

    const { data, error } = await supabase
      .from('perfis')
      .update({
        nome: perfil.nome.trim(),
        usuario: usuarioFormatado,
        senha: perfil.senha?.trim(),
        cargo: perfil.cargo,
        acabamento_padrao: perfil.acabamentoPadrao ? perfil.acabamentoPadrao.trim() : null,
        ativo: perfil.ativo,
      })
      .eq('id', perfil.id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }

    return {
      id: data.id,
      userId: data.user_id || undefined,
      nome: data.nome,
      usuario: data.usuario,
      senha: data.senha,
      email: data.email || undefined,
      cargo: data.cargo as UserCargo,
      acabamentoPadrao: data.acabamento_padrao || undefined,
      ativo: data.ativo,
      criadoEm: data.criado_em,
    };
  },

  async deletePerfil(id: string): Promise<void> {
    const { error } = await supabase
      .from('perfis')
      .update({ ativo: false })
      .eq('id', id);

    if (error) {
      console.error('Erro ao inativar usuário:', error);
      throw error;
    }
  },

  async autenticarUsuario(usuario: string, senha: string): Promise<PerfilUsuario> {
    const usuarioLimpo = usuario.trim().toLowerCase();
    const senhaLimpa = senha.trim();

    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .ilike('usuario', usuarioLimpo)
      .eq('ativo', true)
      .maybeSingle();

    if (error || !data) {
      throw new Error('Usuário não encontrado.');
    }

    if (data.senha !== senhaLimpa) {
      throw new Error('Senha incorreta. Tente novamente.');
    }

    return {
      id: data.id,
      userId: data.user_id || undefined,
      nome: data.nome,
      usuario: data.usuario,
      senha: data.senha,
      email: data.email || undefined,
      cargo: data.cargo as UserCargo,
      acabamentoPadrao: data.acabamento_padrao || undefined,
      ativo: data.ativo,
      criadoEm: data.criado_em,
    };
  },

  async seedPerfisIniciais(): Promise<PerfilUsuario[]> {
    const perfis = await this.getPerfis();
    if (perfis.length === 0) {
      const criado = await this.addPerfil({
        nome: 'Administrador do Sistema',
        usuario: 'admin',
        senha: 'admin123',
        cargo: 'admin',
        ativo: true,
      });
      return [criado];
    }
    return perfis;
  },

  // ==========================================
  // INSUMOS
  // ==========================================
  async getInsumos(): Promise<Insumo[]> {
    const { data, error } = await supabase
      .from('insumos')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar insumos do Supabase:', error);
      throw error;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      codigo: row.codigo || undefined,
      nome: row.nome,
      unidade: row.unidade,
      baseCalculo: row.base_calculo,
      quantidadePorPeca: Number(row.quantidade_por_peca),
      tipoEmbalagem: row.tipo_embalagem,
      quantidadePorEmbalagem: Number(row.quantidade_por_embalagem),
      ativo: row.ativo,
      criadoEm: row.criado_em,
      atualizadoEm: row.atualizado_em,
    }));
  },

  async addInsumo(insumo: Omit<Insumo, 'id'>): Promise<Insumo> {
    const { data, error } = await supabase
      .from('insumos')
      .insert({
        codigo: insumo.codigo || null,
        nome: insumo.nome,
        unidade: insumo.unidade,
        base_calculo: insumo.baseCalculo || 'peca',
        quantidade_por_peca: insumo.quantidadePorPeca,
        tipo_embalagem: insumo.tipoEmbalagem,
        quantidade_por_embalagem: insumo.quantidadePorEmbalagem,
        ativo: insumo.ativo ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar insumo:', error);
      throw error;
    }

    return {
      id: data.id,
      codigo: data.codigo || undefined,
      nome: data.nome,
      unidade: data.unidade,
      baseCalculo: data.base_calculo,
      quantidadePorPeca: Number(data.quantidade_por_peca),
      tipoEmbalagem: data.tipo_embalagem,
      quantidadePorEmbalagem: Number(data.quantidade_por_embalagem),
      ativo: data.ativo,
    };
  },

  async updateInsumo(insumo: Insumo): Promise<Insumo> {
    let targetId = insumo.id;

    // Se o ID não for UUID (ex: 'ins-001' do seed local), procura na nuvem por código ou nome
    if (!isUUID(targetId)) {
      const { data: existente } = await supabase
        .from('insumos')
        .select('*')
        .or(`codigo.eq.${insumo.codigo || ''},nome.ilike.${insumo.nome}`)
        .maybeSingle();

      if (existente) {
        targetId = existente.id;
      } else {
        // Se ainda não existir no banco, cria como novo
        return await this.addInsumo(insumo);
      }
    }

    const { data, error } = await supabase
      .from('insumos')
      .update({
        codigo: insumo.codigo || null,
        nome: insumo.nome,
        unidade: insumo.unidade,
        base_calculo: insumo.baseCalculo || 'peca',
        quantidade_por_peca: insumo.quantidadePorPeca,
        tipo_embalagem: insumo.tipoEmbalagem,
        quantidade_por_embalagem: insumo.quantidadePorEmbalagem,
        ativo: insumo.ativo,
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', targetId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar insumo:', error);
      throw error;
    }

    return {
      id: data.id,
      codigo: data.codigo || undefined,
      nome: data.nome,
      unidade: data.unidade,
      baseCalculo: data.base_calculo,
      quantidadePorPeca: Number(data.quantidade_por_peca),
      tipoEmbalagem: data.tipo_embalagem,
      quantidadePorEmbalagem: Number(data.quantidade_por_embalagem),
      ativo: data.ativo,
    };
  },

  async deleteInsumo(id: string): Promise<void> {
    if (!isUUID(id)) {
      // Se não for UUID, é apenas um dado local que não existe no Supabase
      return;
    }

    const { error } = await supabase
      .from('insumos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar insumo:', error);
      throw error;
    }
  },

  // ==========================================
  // SOLICITAÇÕES
  // ==========================================
  async getSolicitacoes(): Promise<Solicitacao[]> {
    const { data, error } = await supabase
      .from('solicitacoes')
      .select('*')
      .neq('status', 'finalizado')
      .order('data_hora', { ascending: false });

    if (error) {
      console.error('Erro ao buscar solicitações do Supabase:', error);
      throw error;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      referencia: row.referencia,
      quantidade: Number(row.quantidade),
      acabamento: row.acabamento || undefined,
      observacao: row.observacao || undefined,
      status: row.status,
      solicitanteNome: row.solicitante_nome || undefined,
      solicitanteId: row.solicitante_id || undefined,
      dataHora: row.data_hora,
    }));
  },

  async addSolicitacao(sol: Omit<Solicitacao, 'id' | 'dataHora'>): Promise<Solicitacao> {
    const solicitanteIdValido = isUUID(sol.solicitanteId) ? sol.solicitanteId : null;

    const { data, error } = await supabase
      .from('solicitacoes')
      .insert({
        referencia: sol.referencia,
        quantidade: sol.quantidade,
        acabamento: sol.acabamento || 'Geral',
        observacao: sol.observacao || null,
        status: sol.status || 'pendente',
        solicitante_nome: sol.solicitanteNome || null,
        solicitante_id: solicitanteIdValido,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar solicitação:', error);
      throw error;
    }

    return {
      id: data.id,
      referencia: data.referencia,
      quantidade: Number(data.quantidade),
      acabamento: data.acabamento || undefined,
      observacao: data.observacao || undefined,
      status: data.status,
      solicitanteNome: data.solicitante_nome || undefined,
      solicitanteId: data.solicitante_id || undefined,
      dataHora: data.data_hora,
    };
  },

  async updateSolicitacaoStatus(id: string, status: 'pendente' | 'em_separacao' | 'finalizado' | 'cancelado'): Promise<void> {
    if (!isUUID(id)) {
      return;
    }

    const { error } = await supabase
      .from('solicitacoes')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status da solicitação:', error);
      throw error;
    }
  },

  async deleteSolicitacao(id: string): Promise<void> {
    if (!isUUID(id)) {
      return;
    }

    const { error } = await supabase
      .from('solicitacoes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar solicitação:', error);
      throw error;
    }
  },

  // ==========================================
  // HISTÓRICO DE CHECKLISTS
  // ==========================================
  async getHistorico(): Promise<ChecklistHistoricoItem[]> {
    const { data, error } = await supabase
      .from('checklists_historico')
      .select('*')
      .order('data_hora', { ascending: false });

    if (error) {
      console.error('Erro ao buscar histórico do Supabase:', error);
      throw error;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      pedidoId: row.pedido_id || undefined,
      acabamento: row.acabamento,
      quantidadePecas: Number(row.quantidade_pecas),
      pecasPorPack: row.pecas_por_pack ? Number(row.pecas_por_pack) : undefined,
      quantidadePacks: row.quantidade_packs ? Number(row.quantidade_packs) : undefined,
      itens: Array.isArray(row.itens) ? row.itens : [],
      solicitacaoId: row.solicitacao_id || undefined,
      criadoPor: row.criado_por || undefined,
      dataHora: row.data_hora,
    }));
  },

  async addHistorico(item: Omit<ChecklistHistoricoItem, 'id' | 'dataHora'>): Promise<ChecklistHistoricoItem> {
    const solicitacaoIdValido = isUUID(item.solicitacaoId) ? item.solicitacaoId : null;

    let { data, error } = await supabase
      .from('checklists_historico')
      .insert({
        pedido_id: item.pedidoId || null,
        acabamento: item.acabamento || 'Não informado',
        quantidade_pecas: item.quantidadePecas,
        pecas_por_pack: item.pecasPorPack || null,
        quantidade_packs: item.quantidadePacks || null,
        itens: item.itens,
        solicitacao_id: solicitacaoIdValido,
        criado_por: item.criadoPor || null,
      })
      .select()
      .single();

    // Se falhar devido à chave estrangeira (a solicitação não existe ou foi removida), tenta gravar sem o vínculo
    if (error && solicitacaoIdValido) {
      console.warn('Tentando gravar checklist desvinculando solicitacao_id após erro:', error);
      const retry = await supabase
        .from('checklists_historico')
        .insert({
          pedido_id: item.pedidoId || null,
          acabamento: item.acabamento || 'Não informado',
          quantidade_pecas: item.quantidadePecas,
          pecas_por_pack: item.pecasPorPack || null,
          quantidade_packs: item.quantidadePacks || null,
          itens: item.itens,
          solicitacao_id: null,
          criado_por: item.criadoPor || null,
        })
        .select()
        .single();

      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('Erro ao gravar checklist no histórico:', error);
      throw error;
    }

    return {
      id: data.id,
      pedidoId: data.pedido_id || undefined,
      acabamento: data.acabamento,
      quantidadePecas: Number(data.quantidade_pecas),
      pecasPorPack: data.pecas_por_pack ? Number(data.pecas_por_pack) : undefined,
      quantidadePacks: data.quantidade_packs ? Number(data.quantidade_packs) : undefined,
      itens: data.itens,
      solicitacaoId: data.solicitacao_id || undefined,
      criadoPor: data.criado_por || undefined,
      dataHora: data.data_hora,
    };
  },

  async deleteHistorico(id: string): Promise<void> {
    if (!isUUID(id)) {
      return;
    }

    const { error } = await supabase
      .from('checklists_historico')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir item do histórico:', error);
      throw error;
    }
  },

  // ==========================================
  // REALTIME SUBSCRIPTIONS
  // ==========================================
  subscribe(
    table: 'solicitacoes' | 'insumos' | 'checklists_historico' | 'perfis',
    callback: (payload?: any) => void
  ) {
    const channelId = `realtime_${table}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.warn(`[Realtime ${table}] Erro de subscrição:`, err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // ==========================================
  // PROCESSAMENTO DE FILA DE SINCRONIZAÇÃO OFFLINE
  // ==========================================
  async processarItemOffline(item: ItemFilaSincronizacao): Promise<boolean> {
    try {
      switch (item.tipo) {
        case 'add_solicitacao':
          await this.addSolicitacao(item.dados);
          break;
        case 'delete_solicitacao':
          await this.deleteSolicitacao(item.dados.id);
          break;
        case 'status_solicitacao':
          await this.updateSolicitacaoStatus(item.dados.id, item.dados.status);
          break;
        case 'add_historico':
          await this.addHistorico(item.dados);
          break;
        case 'delete_historico':
          await this.deleteHistorico(item.dados.id);
          break;
        case 'add_insumo':
          await this.addInsumo(item.dados);
          break;
        case 'update_insumo':
          await this.updateInsumo(item.dados);
          break;
        case 'delete_insumo':
          await this.deleteInsumo(item.dados.id);
          break;
        default:
          console.warn('Tipo de ação offline não reconhecido:', item.tipo);
      }
      return true;
    } catch (err: any) {
      console.error(`Erro ao processar item offline [${item.tipo}]:`, err);
      // Se for um erro irrecuperável de formato de sintaxe antigo ou chave inválida, descarta para desobstruir a fila
      const msg = err?.message || '';
      if (
        err?.code === '22P02' || 
        err?.code === '23503' || 
        msg.includes('invalid input syntax') || 
        msg.includes('violates foreign key')
      ) {
        console.warn('Item com dados antigos incompatíveis descartado para liberar a fila:', item);
        return true;
      }
      return false;
    }
  },

  // ==========================================
  // MIGRAÇÃO INICIAL DE DADOS LOCAIS (localStorage -> Supabase)
  // ==========================================
  async migrarDadosLocais(
    insumosLocais: Insumo[],
    solicitacoesLocais: Solicitacao[],
    historicoLocal: ChecklistHistoricoItem[]
  ): Promise<{ insumosMigrados: number; solicitacoesMigradas: number; historicoMigrado: number }> {
    let insumosMigrados = 0;
    let solicitacoesMigradas = 0;
    let historicoMigrado = 0;

    // 1. Migra insumos se o banco estiver vazio
    const insumosRemotos = await this.getInsumos();
    if (insumosRemotos.length === 0 && insumosLocais.length > 0) {
      for (const ins of insumosLocais) {
        await this.addInsumo(ins);
        insumosMigrados++;
      }
    }

    // 2. Migra solicitações se o banco estiver vazio
    const solicitacoesRemotas = await this.getSolicitacoes();
    if (solicitacoesRemotas.length === 0 && solicitacoesLocais.length > 0) {
      for (const sol of solicitacoesLocais) {
        await this.addSolicitacao(sol);
        solicitacoesMigradas++;
      }
    }

    // 3. Migra histórico se o banco estiver vazio
    const historicoRemoto = await this.getHistorico();
    if (historicoRemoto.length === 0 && historicoLocal.length > 0) {
      for (const hist of historicoLocal) {
        await this.addHistorico(hist);
        historicoMigrado++;
      }
    }

    return { insumosMigrados, solicitacoesMigradas, historicoMigrado };
  },
};
