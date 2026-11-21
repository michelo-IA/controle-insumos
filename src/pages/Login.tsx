import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { fazerLogin } = useAuth();
  
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const usuarioLimpo = usuario.trim();
    if (!usuarioLimpo) {
      setErro('Informe o nome de usuário.');
      return;
    }

    if (!senha) {
      setErro('Informe a senha de acesso.');
      return;
    }

    try {
      setCarregando(true);
      await fazerLogin(usuarioLimpo, senha);
    } catch (err: any) {
      setErro(err.message || 'Erro ao realizar login.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900/95 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Detalhes de fundo sutis com blur */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 opacity-90" />
      <div className="absolute w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-3xl -top-48 -left-48 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-sky-600/10 rounded-full blur-3xl -bottom-32 -right-32 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-auto space-y-8 animate-fadeIn">
        {/* Cabeçalho */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-white/10 text-sky-400 border border-white/10 flex items-center justify-center mx-auto shadow-xl backdrop-blur-md">
            <ClipboardCheck className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Checklist de Insumos
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Logística Têxtil &bull; Controle de Separação
            </p>
          </div>
        </div>

        {/* Card do Formulário de Login */}
        <div className="bg-white rounded-2xl p-7 sm:p-8 shadow-2xl border border-slate-200">
          <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Acesso ao Sistema</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Digite suas credenciais de operador
              </p>
            </div>
            <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-sky-600" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {erro && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg animate-fadeIn">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{erro}</span>
              </div>
            )}

            {/* Campo Usuário */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Nome de Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  autoCapitalize="none"
                  value={usuario}
                  onChange={(e) => {
                    setUsuario(e.target.value);
                    setErro(null);
                  }}
                  placeholder="Ex: admin, carlos, faccao.silva"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:bg-white transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  required
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value);
                    setErro(null);
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:bg-white transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Botão Entrar */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={carregando}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 transition-all shadow-md hover:shadow-lg text-sm"
              >
                <span>{carregando ? 'Validando acesso...' : 'Entrar no Sistema'}</span>
                {!carregando && <ArrowRight className="w-4 h-4 text-sky-400" />}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400 border-t border-slate-100 pt-4">
            Acesso restrito &bull; Usuários e senhas gerenciados pelo Administrador
          </p>
        </div>

        {/* Rodapé com indicador de segurança e nuvem */}
        <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Banco de dados na nuvem ativo &bull; Sincronização em tempo real</span>
        </div>
      </div>
    </div>
  );
};
