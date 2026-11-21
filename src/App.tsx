import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { Insumos } from './pages/Insumos';
import { GerarChecklist } from './pages/GerarChecklist';
import { Historico } from './pages/Historico';
import { Solicitacoes } from './pages/Solicitacoes';
import { Usuarios } from './pages/Usuarios';
import { Login } from './pages/Login';
import { Insumo, ChecklistHistoricoItem, Solicitacao, PaginaAtual, NotificacaoRealtime } from './types';
import { storageService } from './services/storage';
import { supabaseService } from './services/supabaseService';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from './components/common/ToastContainer';
import { AcessoRestrito } from './components/common/AcessoRestrito';

const AppContent: React.FC = () => {
  const { usuarioAtual, estaAutenticado, carregandoAuth } = useAuth();
  const [paginaAtual, setPaginaAtual] = useState<PaginaAtual>('home');
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [historico, setHistorico] = useState<ChecklistHistoricoItem[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [solicitacaoEmAtendimento, setSolicitacaoEmAtendimento] = useState<Solicitacao | null>(null);
  const [nuvemConectada, setNuvemConectada] = useState<boolean>(false);
  const [sincronizando, setSincronizando] = useState<boolean>(false);
  const [itensPendentes, setItensPendentes] = useState<number>(0);
  const [notificacoes, setNotificacoes] = useState<NotificacaoRealtime[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Sistema de Notificações Toast
  const adicionarNotificacao = useCallback((notif: Omit<NotificacaoRealtime, 'id'>) => {
    const id = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const nova: NotificacaoRealtime = { ...notif, id };

    setNotificacoes((prev) => [...prev, nova]);

    // Tenta emitir bipe sonoro suave se permitido
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Navegadores que bloqueiam áudio automático
    }

    // Auto-remover após 5 segundos
    setTimeout(() => {
      setNotificacoes((prev) => prev.filter((n) => n.id !== id));
    }, notif.tempo || 5000);
  }, []);

  const removerNotificacao = useCallback((id: string) => {
    setNotificacoes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Processa a fila de alterações offline acumuladas
  const processarFilaOffline = useCallback(async () => {
    const fila = storageService.getFilaSincronizacao();
    if (fila.length === 0) {
      setItensPendentes(0);
      return;
    }

    let sucessos = 0;
    for (const item of fila) {
      const ok = await supabaseService.processarItemOffline(item);
      if (ok) {
        storageService.removerItemFilaSincronizacao(item.id);
        sucessos++;
      }
    }

    const restantes = storageService.getFilaSincronizacao().length;
    setItensPendentes(restantes);

    if (sucessos > 0) {
      adicionarNotificacao({
        titulo: 'Sincronização Concluída',
        mensagem: `${sucessos} alteração(ões) offline gravada(s) no banco de dados.`,
        tipo: 'sucesso',
      });
    }
  }, [adicionarNotificacao]);

  // Recarregar dados do Supabase
  const carregarDadosNuvem = useCallback(async () => {
    try {
      // 1. Carrega dados da nuvem
      const [insumosRemotos, solicitacoesRemotas, historicoRemoto] = await Promise.all([
        supabaseService.getInsumos(),
        supabaseService.getSolicitacoes(),
        supabaseService.getHistorico(),
      ]);

      // 2. Se o banco estiver vazio mas houver dados locais, faz a migração automática
      const insumosLocais = storageService.getInsumos();
      const solicitacoesLocais = storageService.getSolicitacoes();
      const historicoLocal = storageService.getHistorico();

      if (
        (insumosRemotos.length === 0 && insumosLocais.length > 0) ||
        (solicitacoesRemotas.length === 0 && solicitacoesLocais.length > 0) ||
        (historicoRemoto.length === 0 && historicoLocal.length > 0)
      ) {
        console.log('Realizando migração inicial de dados do localStorage para o Supabase...');
        await supabaseService.migrarDadosLocais(insumosLocais, solicitacoesLocais, historicoLocal);
        
        // Recarrega após migração
        const [novosInsumos, novasSolicitacoes, novoHistorico] = await Promise.all([
          supabaseService.getInsumos(),
          supabaseService.getSolicitacoes(),
          supabaseService.getHistorico(),
        ]);
        setInsumos(novosInsumos);
        setSolicitacoes(novasSolicitacoes);
        setHistorico(novoHistorico);

        storageService.saveInsumos(novosInsumos);
        storageService.saveSolicitacoes(novasSolicitacoes);
        storageService.saveHistorico(novoHistorico);
      } else {
        setInsumos(insumosRemotos);
        setSolicitacoes(solicitacoesRemotas);
        setHistorico(historicoRemoto);

        // Atualiza cache local
        storageService.saveInsumos(insumosRemotos);
        storageService.saveSolicitacoes(solicitacoesRemotas);
        storageService.saveHistorico(historicoRemoto);
      }

      setNuvemConectada(true);
    } catch (err) {
      console.warn('Conexão com a nuvem indisponível no momento, operando com cache local:', err);
      setNuvemConectada(false);
    }
  }, []);

  // Forçar sincronização manual a partir do botão no rodapé
  const handleForcarSincronizacao = useCallback(async () => {
    setSincronizando(true);
    try {
      await processarFilaOffline();
      await carregarDadosNuvem();
      adicionarNotificacao({
        titulo: 'Sistema Atualizado',
        mensagem: 'Os dados foram atualizados com a nuvem.',
        tipo: 'sucesso',
      });
    } catch (err) {
      console.error('Falha na sincronização manual:', err);
      adicionarNotificacao({
        titulo: 'Aviso de Sincronização',
        mensagem: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
        tipo: 'aviso',
      });
    } finally {
      setSincronizando(false);
    }
  }, [processarFilaOffline, carregarDadosNuvem, adicionarNotificacao]);

  // Limpar fila de alterações offline acumuladas manualmente
  const handleLimparPendencias = useCallback(() => {
    storageService.limparFilaSincronizacao();
    setItensPendentes(0);
    adicionarNotificacao({
      titulo: 'Pendências Limpas',
      mensagem: 'A fila de sincronização foi esvaziada.',
      tipo: 'sucesso',
    });
  }, [adicionarNotificacao]);

  // Monitoramento de conexão Online / Offline do Navegador
  useEffect(() => {
    const handleOnline = async () => {
      setNuvemConectada(true);
      adicionarNotificacao({
        titulo: 'Conexão Restaurada',
        mensagem: 'A internet voltou. Sincronizando dados pendentes com a nuvem...',
        tipo: 'sucesso',
      });
      await processarFilaOffline();
      await carregarDadosNuvem();
    };

    const handleOffline = () => {
      setNuvemConectada(false);
      adicionarNotificacao({
        titulo: 'Modo Offline Ativado',
        mensagem: 'Sem conexão de internet. Os registros serão guardados no dispositivo e enviados ao reconectar.',
        tipo: 'aviso',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [processarFilaOffline, carregarDadosNuvem, adicionarNotificacao]);

  // Inicialização e Subscrição em Tempo Real (Realtime)
  useEffect(() => {
    // 1. Renderiza imediatamente com cache do localStorage para evitar telas vazias
    setInsumos(storageService.getInsumos());
    setSolicitacoes(storageService.getSolicitacoes());
    setHistorico(storageService.getHistorico());
    setItensPendentes(storageService.getFilaSincronizacao().length);

    // 2. Sincroniza com o Supabase e processa pendências
    processarFilaOffline().then(() => {
      carregarDadosNuvem();
    });

    // 3. Subscrições em Tempo Real (quando outro usuário ou dispositivo alterar algo)
    const unsubSolicitacoes = supabaseService.subscribe('solicitacoes', async (payload) => {
      try {
        const atualizadas = await supabaseService.getSolicitacoes();
        setSolicitacoes(atualizadas);
        storageService.saveSolicitacoes(atualizadas);

        if (payload?.eventType === 'INSERT' && payload.new) {
          const item = payload.new;
          // Se não foi gerado pelo próprio usuário logado, exibe notificação
          if (item.solicitante_id !== usuarioAtual?.id && item.solicitante_nome !== usuarioAtual?.nome) {
            adicionarNotificacao({
              titulo: 'Nova Solicitação de Insumos',
              mensagem: `Ref: ${item.referencia} • ${item.acabamento || 'Geral'} (${item.quantidade} pçs)`,
              tipo: 'info',
              acao: {
                label: 'Abrir Solicitações',
                onClick: () => setPaginaAtual('solicitacoes'),
              },
            });
          }
        }
      } catch (err) {
        console.error('Erro ao atualizar solicitações via Realtime:', err);
      }
    });

    const unsubInsumos = supabaseService.subscribe('insumos', async () => {
      try {
        const atualizados = await supabaseService.getInsumos();
        setInsumos(atualizados);
        storageService.saveInsumos(atualizados);
      } catch (err) {
        console.error('Erro ao atualizar insumos via Realtime:', err);
      }
    });

    const unsubHistorico = supabaseService.subscribe('checklists_historico', async (payload) => {
      try {
        const atualizados = await supabaseService.getHistorico();
        setHistorico(atualizados);
        storageService.saveHistorico(atualizados);

        if (payload?.eventType === 'INSERT' && payload.new) {
          const item = payload.new;
          if (item.criado_por && item.criado_por !== usuarioAtual?.nome) {
            adicionarNotificacao({
              titulo: 'Checklist Concluído',
              mensagem: `Pedido ${item.pedido_id || 'avulso'} finalizado por ${item.criado_por}.`,
              tipo: 'sucesso',
            });
          }
        }
      } catch (err) {
        console.error('Erro ao atualizar histórico via Realtime:', err);
      }
    });

    return () => {
      unsubSolicitacoes();
      unsubInsumos();
      unsubHistorico();
    };
  }, [carregarDadosNuvem, processarFilaOffline, usuarioAtual, adicionarNotificacao]);

  // --- Gerenciamento de Insumos ---
  const handleAddInsumo = async (novo: Omit<Insumo, 'id'>) => {
    try {
      const criado = await supabaseService.addInsumo(novo);
      setInsumos((prev) => [...prev, criado]);
      storageService.addInsumo(criado);
    } catch (error) {
      console.warn('Falha ao salvar insumo na nuvem, enfileirando offline:', error);
      const criado = storageService.addInsumo(novo);
      setInsumos((prev) => [...prev, criado]);
      storageService.adicionarFilaSincronizacao('add_insumo', novo);
      setItensPendentes(storageService.getFilaSincronizacao().length);
      adicionarNotificacao({
        titulo: 'Insumo Salvo Localmente',
        mensagem: 'Cadastrado no dispositivo. Será sincronizado assim que a conexão retornar.',
        tipo: 'aviso',
      });
    }
  };

  const handleUpdateInsumo = async (atualizado: Insumo) => {
    try {
      const salvo = await supabaseService.updateInsumo(atualizado);
      setInsumos((prev) =>
        prev.map((item) => (item.id === salvo.id ? salvo : item))
      );
      storageService.updateInsumo(salvo);
    } catch (error) {
      console.warn('Falha ao atualizar insumo na nuvem, enfileirando offline:', error);
      storageService.updateInsumo(atualizado);
      setInsumos((prev) =>
        prev.map((item) => (item.id === atualizado.id ? atualizado : item))
      );
      storageService.adicionarFilaSincronizacao('update_insumo', atualizado);
      setItensPendentes(storageService.getFilaSincronizacao().length);
      adicionarNotificacao({
        titulo: 'Insumo Atualizado Localmente',
        mensagem: 'Alteração salva no aparelho. Será enviada à nuvem em breve.',
        tipo: 'aviso',
      });
    }
  };

  const handleDeleteInsumo = async (id: string) => {
    try {
      await supabaseService.deleteInsumo(id);
      setInsumos((prev) => prev.filter((item) => item.id !== id));
      storageService.deleteInsumo(id);
    } catch (error) {
      console.warn('Falha ao excluir insumo na nuvem, enfileirando offline:', error);
      storageService.deleteInsumo(id);
      setInsumos((prev) => prev.filter((item) => item.id !== id));
      storageService.adicionarFilaSincronizacao('delete_insumo', { id });
      setItensPendentes(storageService.getFilaSincronizacao().length);
    }
  };

  // --- Gerenciamento de Histórico ---
  const handleSalvarHistorico = async (novoItem: Omit<ChecklistHistoricoItem, 'id' | 'dataHora'>) => {
    try {
      const criado = await supabaseService.addHistorico({
        ...novoItem,
        criadoPor: usuarioAtual?.nome || 'Operador',
      });
      setHistorico((prev) => [criado, ...prev]);
      storageService.addHistorico(criado);
    } catch (error) {
      console.warn('Falha ao salvar checklist no Supabase, enfileirando offline:', error);
      const criado = storageService.addHistorico(novoItem);
      setHistorico((prev) => [criado, ...prev]);
      storageService.adicionarFilaSincronizacao('add_historico', {
        ...novoItem,
        criadoPor: usuarioAtual?.nome || 'Operador',
      });
      setItensPendentes(storageService.getFilaSincronizacao().length);
      adicionarNotificacao({
        titulo: 'Checklist Registrado Localmente',
        mensagem: 'Salvo com segurança no aparelho. Sincronização automática pendente.',
        tipo: 'aviso',
      });
    }
  };

  const handleDeleteHistorico = async (id: string) => {
    try {
      await supabaseService.deleteHistorico(id);
      setHistorico((prev) => prev.filter((item) => item.id !== id));
      storageService.deleteHistorico(id);
    } catch (error) {
      console.warn('Falha ao excluir checklist na nuvem, enfileirando offline:', error);
      storageService.deleteHistorico(id);
      setHistorico((prev) => prev.filter((item) => item.id !== id));
      storageService.adicionarFilaSincronizacao('delete_historico', { id });
      setItensPendentes(storageService.getFilaSincronizacao().length);
    }
  };

  // --- Gerenciamento de Solicitações ---
  const handleAddSolicitacao = async (nova: Omit<Solicitacao, 'id' | 'dataHora'>) => {
    try {
      const criada = await supabaseService.addSolicitacao({
        ...nova,
        solicitanteNome: nova.solicitanteNome || usuarioAtual?.nome,
        solicitanteId: nova.solicitanteId || usuarioAtual?.id,
      });
      setSolicitacoes((prev) => {
        const jaExiste = prev.some((s) => s.id === criada.id);
        if (jaExiste) return prev;
        return [criada, ...prev];
      });
      storageService.addSolicitacao(criada);
    } catch (error: any) {
      console.error('Falha ao salvar solicitação no Supabase, enfileirando offline:', error);
      const criada = storageService.addSolicitacao(nova);
      setSolicitacoes((prev) => [criada, ...prev]);
      storageService.adicionarFilaSincronizacao('add_solicitacao', {
        ...nova,
        solicitanteNome: nova.solicitanteNome || usuarioAtual?.nome,
        solicitanteId: nova.solicitanteId || usuarioAtual?.id,
      });
      setItensPendentes(storageService.getFilaSincronizacao().length);
      adicionarNotificacao({
        titulo: 'Solicitação Criada Localmente',
        mensagem: error?.message || 'A solicitação foi gravada no aparelho e será transmitida à nuvem assim que houver rede.',
        tipo: 'aviso',
      });
    }
  };

  const handleDeleteSolicitacao = async (id: string) => {
    try {
      await supabaseService.deleteSolicitacao(id);
      setSolicitacoes((prev) => prev.filter((item) => item.id !== id));
      storageService.deleteSolicitacao(id);
      if (solicitacaoEmAtendimento?.id === id) {
        setSolicitacaoEmAtendimento(null);
      }
    } catch (error) {
      console.warn('Falha ao deletar solicitação na nuvem, enfileirando offline:', error);
      storageService.deleteSolicitacao(id);
      setSolicitacoes((prev) => prev.filter((item) => item.id !== id));
      storageService.adicionarFilaSincronizacao('delete_solicitacao', { id });
      setItensPendentes(storageService.getFilaSincronizacao().length);
      if (solicitacaoEmAtendimento?.id === id) {
        setSolicitacaoEmAtendimento(null);
      }
    }
  };

  // Atender solicitação: carrega os dados e redireciona para a tela de checklist
  const handleAtenderSolicitacao = (solicitacao: Solicitacao) => {
    setSolicitacaoEmAtendimento(solicitacao);
    setPaginaAtual('checklist');
  };

  // Finalizar solicitação: assim que o PDF for gerado, atualiza o status ou remove da lista
  const handleFinalizarSolicitacao = async (solicitacaoId: string) => {
    try {
      await supabaseService.updateSolicitacaoStatus(solicitacaoId, 'finalizado');
      setSolicitacoes((prev) => prev.filter((item) => item.id !== solicitacaoId));
      storageService.deleteSolicitacao(solicitacaoId);
      setSolicitacaoEmAtendimento(null);
    } catch (error) {
      console.warn('Falha ao finalizar solicitação na nuvem, enfileirando offline:', error);
      storageService.deleteSolicitacao(solicitacaoId);
      setSolicitacoes((prev) => prev.filter((item) => item.id !== solicitacaoId));
      storageService.adicionarFilaSincronizacao('status_solicitacao', { id: solicitacaoId, status: 'finalizado' });
      setItensPendentes(storageService.getFilaSincronizacao().length);
      setSolicitacaoEmAtendimento(null);
    }
  };

  const handleCancelarAtendimentoSolicitacao = () => {
    setSolicitacaoEmAtendimento(null);
  };

  // Se estiver carregando autenticação inicial
  if (carregandoAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-sky-400/20 border-t-sky-400 rounded-full animate-spin mb-4" />
        <p className="text-white text-sm font-semibold tracking-wide animate-pulse">
          Carregando Controle de Insumos...
        </p>
      </div>
    );
  }

  // Se não estiver autenticado, exibe tela de login / seleção de operador
  if (!estaAutenticado) {
    return <Login />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100/60 font-sans text-slate-900">
      {/* Sistema de Notificações Toast em Tempo Real */}
      <ToastContainer notificacoes={notificacoes} onRemover={removerNotificacao} />

      {/* Menu Lateral */}
      <Sidebar
        paginaAtual={paginaAtual}
        nuvemConectada={nuvemConectada}
        sincronizando={sincronizando}
        itensPendentes={itensPendentes}
        onForcarSincronizacao={handleForcarSincronizacao}
        onLimparPendencias={handleLimparPendencias}
        setPaginaAtual={(pagina) => {
          if (pagina !== 'checklist') {
            setSolicitacaoEmAtendimento(null);
          }
          setPaginaAtual(pagina);
        }}
      />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 pb-16">
          <div key={paginaAtual} className="animate-pageEnter">
            {paginaAtual === 'home' && (
              <Home
                setPaginaAtual={setPaginaAtual}
                onAddSolicitacao={handleAddSolicitacao}
                solicitacoesPendentesCount={solicitacoes.length}
                minhasSolicitacoesCount={
                  solicitacoes.filter(
                    (s) =>
                      s.solicitanteId === usuarioAtual?.id ||
                      s.solicitanteNome === usuarioAtual?.nome ||
                      (usuarioAtual?.acabamentoPadrao && s.acabamento === usuarioAtual.acabamentoPadrao)
                  ).length
                }
              />
            )}

            {paginaAtual === 'solicitacoes' && (
              <Solicitacoes
                solicitacoes={solicitacoes}
                onAddSolicitacao={handleAddSolicitacao}
                onDeleteSolicitacao={handleDeleteSolicitacao}
                onAtenderSolicitacao={handleAtenderSolicitacao}
              />
            )}

            {paginaAtual === 'checklist' && (
              usuarioAtual?.cargo === 'acabamento' ? (
                <AcessoRestrito
                  cargoNecessario="Almoxarife ou Administrador"
                  paginaDestinoRecomendada="solicitacoes"
                  setPaginaAtual={setPaginaAtual}
                />
              ) : (
                <GerarChecklist
                  insumos={insumos}
                  onSalvarHistorico={handleSalvarHistorico}
                  solicitacaoAtiva={solicitacaoEmAtendimento}
                  onFinalizarSolicitacao={handleFinalizarSolicitacao}
                  onCancelarAtendimentoSolicitacao={handleCancelarAtendimentoSolicitacao}
                />
              )
            )}

            {paginaAtual === 'historico' && (
              <Historico
                historico={historico}
                onDeleteHistorico={handleDeleteHistorico}
                setPaginaAtual={setPaginaAtual}
              />
            )}

            {paginaAtual === 'insumos' && (
              usuarioAtual?.cargo === 'acabamento' ? (
                <AcessoRestrito
                  cargoNecessario="Almoxarife ou Administrador"
                  paginaDestinoRecomendada="solicitacoes"
                  setPaginaAtual={setPaginaAtual}
                />
              ) : (
                <Insumos
                  insumos={insumos}
                  onAddInsumo={handleAddInsumo}
                  onUpdateInsumo={handleUpdateInsumo}
                  onDeleteInsumo={handleDeleteInsumo}
                />
              )
            )}

            {paginaAtual === 'usuarios' && (
              usuarioAtual?.cargo !== 'admin' ? (
                <AcessoRestrito
                  cargoNecessario="Administrador Geral"
                  paginaDestinoRecomendada="home"
                  setPaginaAtual={setPaginaAtual}
                />
              ) : (
                <Usuarios />
              )
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
