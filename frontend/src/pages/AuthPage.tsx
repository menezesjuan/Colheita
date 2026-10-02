import React, { useState } from 'react';
import { Sprout, Lock, Mail, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { CardDoubleBezel } from '../components/common/CardDoubleBezel.js';
import { apiRequest } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';

export const AuthPage: React.FC = () => {
  const { login } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  
  // Campos do formulário
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isLoginMode) {
        const res = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ login: username || email, password })
        });

        if (!res.success) throw new Error(res.error);

        await login(res.token, res.user);
      } else {
        const res = await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ username, email, password })
        });

        if (!res.success) throw new Error(res.error);

        await login(res.token, res.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#060a08]">
      
      {/* Luzes Volumétricas de Fundo (Awwwards standard) */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Logo Superior */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-600 to-emerald-400 p-[1.5px] flex items-center justify-center shadow-2xl shadow-emerald-950/60 mb-3">
            <div className="w-full h-full rounded-[calc(1.5rem-1.5px)] bg-zinc-950 flex items-center justify-center">
              <Sprout className="w-7 h-7 text-emerald-400" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Colheita dos Sonhos
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Simulador de fazenda social e economia persistente em tempo real
          </p>
        </div>

        {/* Card Double Bezel de Autenticação */}
        <CardDoubleBezel innerClassName="p-8">
          
          {/* Seletor Login / Registro */}
          <div className="flex p-1 rounded-xl bg-black/40 border border-white/5 mb-6">
            <button
              type="button"
              onClick={() => { setIsLoginMode(true); setErrorMsg(null); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isLoginMode
                  ? 'bg-white/10 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { setIsLoginMode(false); setErrorMsg(null); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !isLoginMode
                  ? 'bg-white/10 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Nome de Usuário */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                {isLoginMode ? 'Usuário ou E-mail' : 'Nome de Fazendeiro'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" strokeWidth={1.5} />
                <input
                  type="text"
                  required
                  placeholder={isLoginMode ? 'seu_usuario ou email' : 'ex: fazendeiro_solar'}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors font-medium"
                />
              </div>
            </div>

            {/* E-mail (Apenas Cadastro) */}
            {!isLoginMode && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">E-mail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" strokeWidth={1.5} />
                  <input
                    type="email"
                    required
                    placeholder="seu_email@exemplo.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors font-medium"
                  />
                </div>
              </div>
            )}

            {/* Senha */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" strokeWidth={1.5} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-bold text-xs text-zinc-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
            >
              {loading ? (
                'Autenticando...'
              ) : isLoginMode ? (
                <>
                  Entrar na Fazenda
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </>
              ) : (
                <>
                  Começar Minha Fazenda Grátis
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </>
              )}
            </button>

          </form>

          {/* Dica de Segurança e Integridade */}
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-zinc-500 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Persistência 100% no PostgreSQL com criptografia e sessões seguras</span>
          </div>

        </CardDoubleBezel>

      </div>
    </div>
  );
};
