import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PerfilUsuario } from '../types';
import { supabaseService } from '../services/supabaseService';

interface AuthContextData {
  usuarioAtual: PerfilUsuario | null;
  perfisDisponiveis: PerfilUsuario[];
  estaAutenticado: boolean;
  isAdmin: boolean;
  carregandoAuth: boolean;
  fazerLogin: (usuario: string, senha: string) => Promise<void>;
  fazerLogout: () => void;
  recarregarPerfis: () => Promise<void>;
  cadastrarUsuario: (dados: Omit<PerfilUsuario, 'id' | 'criadoEm'>) => Promise<PerfilUsuario>;
  atualizarUsuario: (perfil: PerfilUsuario) => Promise<PerfilUsuario>;
  excluirUsuario: (id: string) => Promise<void>;
}

const STORAGE_KEY_AUTH = 'controle_insumos_sessao_perfil';

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuarioAtual, setUsuarioAtual] = useState<PerfilUsuario | null>(null);
  const [perfisDisponiveis, setPerfisDisponiveis] = useState<PerfilUsuario[]>([]);
  const [carregandoAuth, setCarregandoAuth] = useState(true);

  // Carrega lista de perfis do Supabase
  const recarregarPerfis = useCallback(async () => {
    try {
      const perfis = await supabaseService.getPerfis();
      setPerfisDisponiveis(perfis);

      // Restaura sessão salva se houver
      const sessaoSalva = localStorage.getItem(STORAGE_KEY_AUTH);
      if (sessaoSalva) {
        try {
          const perfilSalvo: PerfilUsuario = JSON.parse(sessaoSalva);
          // Atualiza dados caso o admin tenha alterado cargo ou permissão
          const perfilAtualizado = perfis.find((p) => p.id === perfilSalvo.id);
          if (perfilAtualizado && perfilAtualizado.ativo) {
            setUsuarioAtual(perfilAtualizado);
            localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(perfilAtualizado));
          } else if (!perfilAtualizado) {
            // Se foi desativado ou excluído, desloga
            setUsuarioAtual(null);
            localStorage.removeItem(STORAGE_KEY_AUTH);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY_AUTH);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar lista de usuários:', err);
    } finally {
      setCarregandoAuth(false);
    }
  }, []);

  useEffect(() => {
    recarregarPerfis();

    // Sincronização em tempo real de usuários e permissões
    const unsubPerfis = supabaseService.subscribe('perfis', () => {
      recarregarPerfis();
    });

    return () => {
      unsubPerfis();
    };
  }, [recarregarPerfis]);

  // Autenticação com Usuário e Senha
  const fazerLogin = async (usuario: string, senha: string): Promise<void> => {
    const perfil = await supabaseService.autenticarUsuario(usuario, senha);
    setUsuarioAtual(perfil);
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(perfil));
  };

  // Logout
  const fazerLogout = () => {
    setUsuarioAtual(null);
    localStorage.removeItem(STORAGE_KEY_AUTH);
  };

  // Funções administrativas
  const cadastrarUsuario = async (dados: Omit<PerfilUsuario, 'id' | 'criadoEm'>): Promise<PerfilUsuario> => {
    const novo = await supabaseService.addPerfil(dados);
    setPerfisDisponiveis((prev) => {
      const existe = prev.some((p) => p.id === novo.id);
      if (existe) {
        return prev.map((p) => (p.id === novo.id ? novo : p));
      }
      return [...prev, novo];
    });
    return novo;
  };

  const atualizarUsuario = async (perfil: PerfilUsuario): Promise<PerfilUsuario> => {
    const atualizado = await supabaseService.updatePerfil(perfil);
    setPerfisDisponiveis((prev) =>
      prev.map((p) => (p.id === atualizado.id ? atualizado : p))
    );
    // Se o próprio admin alterou seus dados, atualiza a sessão
    if (usuarioAtual?.id === atualizado.id) {
      setUsuarioAtual(atualizado);
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(atualizado));
    }
    return atualizado;
  };

  const excluirUsuario = async (id: string): Promise<void> => {
    await supabaseService.deletePerfil(id);
    setPerfisDisponiveis((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <AuthContext.Provider
      value={{
        usuarioAtual,
        perfisDisponiveis,
        estaAutenticado: !!usuarioAtual,
        isAdmin: usuarioAtual?.cargo === 'admin',
        carregandoAuth,
        fazerLogin,
        fazerLogout,
        recarregarPerfis,
        cadastrarUsuario,
        atualizarUsuario,
        excluirUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
