import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Boxes, 
  Shirt, 
  Edit2, 
  Trash2, 
  KeyRound, 
  Eye, 
  EyeOff, 
  X, 
  AlertCircle,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PerfilUsuario, UserCargo } from '../types';
import { Modal } from '../components/common/Modal';

export const Usuarios: React.FC = () => {
  const { perfisDisponiveis, cadastrarUsuario, atualizarUsuario, excluirUsuario, usuarioAtual } = useAuth();

  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<PerfilUsuario | null>(null);
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState<PerfilUsuario | null>(null);

  // Estados do formulário
  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [cargo, setCargo] = useState<UserCargo>('almoxarife');
  const [acabamentoPadrao, setAcabamentoPadrao] = useState('');
  const [mostrarSenhasTabela, setMostrarSenhasTabela] = useState<{ [id: string]: boolean }>({});
  const [mostrarSenhaForm, setMostrarSenhaForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const toggleMostrarSenha = (id: string) => {
    setMostrarSenhasTabela((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAbrirCriar = () => {
    setUsuarioEditando(null);
    setNome('');
    setUsuario('');
    setSenha('');
    setCargo('almoxarife');
    setAcabamentoPadrao('');
    setErro(null);
    setMostrarSenhaForm(false);
    setModalAberto(true);
  };

  const handleAbrirEditar = (perfil: PerfilUsuario) => {
    setUsuarioEditando(perfil);
    setNome(perfil.nome);
    setUsuario(perfil.usuario);
    setSenha(perfil.senha || '');
    setCargo(perfil.cargo);
    setAcabamentoPadrao(perfil.acabamentoPadrao || '');
    setErro(null);
    setMostrarSenhaForm(false);
    setModalAberto(true);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const nomeFormatado = nome.trim();
    const usuarioFormatado = usuario.trim().toLowerCase();
    const senhaFormatada = senha.trim();

    if (!nomeFormatado) {
      setErro('O nome do operador é obrigatório.');
      return;
    }

    if (!usuarioFormatado) {
      setErro('O nome de usuário para login é obrigatório.');
      return;
    }

    if (!senhaFormatada) {
      setErro('A senha de acesso é obrigatória.');
      return;
    }

    try {
      setSalvando(true);
      if (usuarioEditando) {
        await atualizarUsuario({
          ...usuarioEditando,
          nome: nomeFormatado,
          usuario: usuarioFormatado,
          senha: senhaFormatada,
          cargo,
          acabamentoPadrao: cargo === 'acabamento' ? acabamentoPadrao.trim() || undefined : undefined,
        });
      } else {
        await cadastrarUsuario({
          nome: nomeFormatado,
          usuario: usuarioFormatado,
          senha: senhaFormatada,
          cargo,
          acabamentoPadrao: cargo === 'acabamento' ? acabamentoPadrao.trim() || undefined : undefined,
          ativo: true,
        });
      }
      setModalAberto(false);
    } catch (err: any) {
      setErro(err.message || 'Erro ao salvar usuário.');
    } finally {
      setSalvando(false);
    }
  };

  const handleConfirmarExclusao = async () => {
    if (!usuarioParaExcluir) return;

    if (usuarioParaExcluir.id === usuarioAtual?.id) {
      alert('Você não pode excluir seu próprio usuário administrador!');
      setUsuarioParaExcluir(null);
      return;
    }

    try {
      await excluirUsuario(usuarioParaExcluir.id);
      setUsuarioParaExcluir(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir usuário.');
    }
  };

  const getCargoBadge = (c: UserCargo) => {
    switch (c) {
      case 'almoxarife':
        return {
          label: 'Almoxarife / Expedição',
          badge: 'bg-sky-50 text-sky-800 border-sky-200',
          icon: Boxes,
        };
      case 'acabamento':
        return {
          label: 'Acabamento',
          badge: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: Shirt,
        };
      case 'admin':
        return {
          label: 'Administrador',
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: ShieldCheck,
        };
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      {/* Topo da Tela */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-sky-600" />
            Usuários e Permissões
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Gerenciamento exclusivo de operadores, credenciais de acesso (usuários e senhas) e níveis de permissão.
          </p>
        </div>

        <button
          onClick={handleAbrirCriar}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 active:scale-[0.98] transition-all shadow-sm self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Tabela de Usuários para Desktop */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <th className="py-3.5 px-6">Operador / Setor</th>
              <th className="py-3.5 px-6">Usuário (Login)</th>
              <th className="py-3.5 px-6">Senha</th>
              <th className="py-3.5 px-6">Permissão / Cargo</th>
              <th className="py-3.5 px-6">Acabamento</th>
              <th className="py-3.5 px-6 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
            {perfisDisponiveis.map((perfil) => {
              const info = getCargoBadge(perfil.cargo);
              const Icon = info.icon;
              const isSenhaVisivel = mostrarSenhasTabela[perfil.id] || false;

              return (
                <tr key={perfil.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Nome */}
                  <td className="py-4 px-6 font-bold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span>{perfil.nome}</span>
                        {perfil.id === usuarioAtual?.id && (
                          <span className="ml-2 text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                            Você
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Usuário de Login */}
                  <td className="py-4 px-6">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-1 rounded border border-slate-200">
                      {perfil.usuario}
                    </span>
                  </td>

                  {/* Senha */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-700">
                        {isSenhaVisivel ? perfil.senha : '••••••••'}
                      </span>
                      <button
                        onClick={() => toggleMostrarSenha(perfil.id)}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                        title={isSenhaVisivel ? 'Ocultar senha' : 'Ver senha'}
                      >
                        {isSenhaVisivel ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>

                  {/* Cargo */}
                  <td className="py-4 px-6">
                    <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full border ${info.badge}`}>
                      {info.label}
                    </span>
                  </td>

                  {/* Acabamento */}
                  <td className="py-4 px-6 text-xs text-slate-600">
                    {perfil.acabamentoPadrao || '—'}
                  </td>

                  {/* Ações */}
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleAbrirEditar(perfil)}
                        title="Editar Usuário e Senha"
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {perfil.id !== usuarioAtual?.id && (
                        <button
                          onClick={() => setUsuarioParaExcluir(perfil)}
                          title="Excluir Usuário"
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cards para Mobile */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {perfisDisponiveis.map((perfil) => {
          const info = getCargoBadge(perfil.cargo);
          const Icon = info.icon;
          const isSenhaVisivel = mostrarSenhasTabela[perfil.id] || false;

          return (
            <div
              key={perfil.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{perfil.nome}</h3>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border mt-1 ${info.badge}`}>
                      {info.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleAbrirEditar(perfil)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {perfil.id !== usuarioAtual?.id && (
                    <button
                      onClick={() => setUsuarioParaExcluir(perfil)}
                      className="p-1.5 text-red-500 hover:text-red-700 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Usuário:</span>
                  <span className="font-mono font-bold text-slate-800">{perfil.usuario}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Senha:</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span>{isSenhaVisivel ? perfil.senha : '••••••••'}</span>
                    <button
                      onClick={() => toggleMostrarSenha(perfil.id)}
                      className="text-slate-400 p-0.5"
                    >
                      {isSenhaVisivel ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                {perfil.acabamentoPadrao && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Acabamento:</span>
                    <span className="font-medium text-slate-800">{perfil.acabamentoPadrao}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Cadastro / Edição */}
      <Modal isOpen={modalAberto} onClose={() => setModalAberto(false)} maxWidth="max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-slate-900 text-white rounded-lg">
                <KeyRound className="w-5 h-5 text-sky-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                {usuarioEditando ? 'Editar Usuário e Senha' : 'Novo Usuário do Sistema'}
              </h2>
            </div>
            <button
              onClick={() => setModalAberto(false)}
              className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSalvar} className="space-y-4">
            {erro && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{erro}</span>
              </div>
            )}

            {/* Nome do Operador */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Nome do Operador ou Setor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Carlos (Conferência), Facção Alfa..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all font-medium"
              />
            </div>

            {/* Nome de Usuário (Login) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Nome de Usuário (Login) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                autoCapitalize="none"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                placeholder="Ex: carlos, faccao.alfa, almoxarife"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Utilizado para acessar o sistema (letras minúsculas e sem espaços).
              </p>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Senha de Acesso <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={mostrarSenhaForm ? 'text' : 'password'}
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Defina a senha"
                  className="w-full px-3.5 py-2.5 pr-10 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenhaForm(!mostrarSenhaForm)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {mostrarSenhaForm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Permissão / Cargo */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Nível de Permissão <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                <label
                  onClick={() => setCargo('almoxarife')}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    cargo === 'almoxarife'
                      ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="cargo"
                    checked={cargo === 'almoxarife'}
                    onChange={() => setCargo('almoxarife')}
                    className="mt-1"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">Almoxarife / Conferente</span>
                    <span className="text-xs text-slate-500 block">
                      Acesso a separar insumos, emitir checklists em PDF e gerenciar catálogo de insumos.
                    </span>
                  </div>
                </label>

                <label
                  onClick={() => setCargo('acabamento')}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    cargo === 'acabamento'
                      ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="cargo"
                    checked={cargo === 'acabamento'}
                    onChange={() => setCargo('acabamento')}
                    className="mt-1"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">Acabamento / Facção</span>
                    <span className="text-xs text-slate-500 block">
                      Acesso restrito a criar solicitações de insumos e consultar histórico de pedidos.
                    </span>
                  </div>
                </label>

                <label
                  onClick={() => setCargo('admin')}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    cargo === 'admin'
                      ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="cargo"
                    checked={cargo === 'admin'}
                    onChange={() => setCargo('admin')}
                    className="mt-1"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">Administrador Geral</span>
                    <span className="text-xs text-slate-500 block">
                      Acesso total ao sistema e permissão para cadastrar e gerenciar outros usuários e senhas.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Acabamento Padrão */}
            {cargo === 'acabamento' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Nome do Acabamento Padrão <span className="text-xs text-slate-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={acabamentoPadrao}
                  onChange={(e) => setAcabamentoPadrao(e.target.value)}
                  placeholder="Ex: Acabamento Interno, Facção Alfa..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all font-medium"
                />
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
              >
                {salvando ? 'Salvando...' : usuarioEditando ? 'Salvar Alterações' : 'Cadastrar Usuário'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal de Exclusão de Usuário */}
      <Modal isOpen={!!usuarioParaExcluir} onClose={() => setUsuarioParaExcluir(null)} maxWidth="max-w-md">
        {usuarioParaExcluir && (
          <div className="p-6">
            <div className="flex items-center gap-3 text-amber-600 mb-4">
              <div className="p-2 bg-amber-50 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Desativar Usuário</h3>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed mb-3">
              Tem certeza que deseja inativar o acesso deste usuário?
            </p>

            <div className="text-sm font-semibold text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <div>Operador: <strong>{usuarioParaExcluir.nome}</strong></div>
              <div className="text-xs font-mono text-slate-500">Usuário: {usuarioParaExcluir.usuario}</div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setUsuarioParaExcluir(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleConfirmarExclusao}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                Inativar Usuário
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
