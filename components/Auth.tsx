
import React, { useState } from 'react';
import { supabase } from '../services/supabaseService';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Cadastro realizado! Verifique seu email para confirmar.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-[40px] shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl font-black text-white shadow-xl shadow-emerald-500/20">D</div>
          <h1 className="text-3xl font-black tracking-tighter text-white mb-2">DRIVER<span className="text-emerald-500">PRO</span></h1>
          <p className="text-slate-400 font-medium">Sua inteligência financeira no 99</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white transition-all"
              placeholder="exemplo@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-medium text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-900/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Processando...' : isRegistering ? 'CRIAR CONTA' : 'ENTRAR'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm font-bold text-slate-400 hover:text-emerald-400 transition-colors"
          >
            {isRegistering ? 'Já tenho uma conta. Fazer Login' : 'Ainda não tem conta? Cadastre-se'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
