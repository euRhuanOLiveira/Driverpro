
import React, { useState } from 'react';
import { createDriverProfile } from '../services/supabaseService';

interface Props {
  onSuccess: () => void;
}

const CompleteProfile: React.FC<Props> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    driver_id_99: '',
    city_name: '',
    driver_name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createDriverProfile({
        driver_id_99: formData.driver_id_99,
        city_name: formData.city_name,
        // driver_name: formData.driver_name, // Opcional se sua tabela suportar
        current_status: 'Ativo',
        star_rating: 5.0,
        audit_passed: true
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 p-10 rounded-[48px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] -mr-16 -mt-16"></div>
        
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner border border-emerald-500/20">👋</div>
          <h2 className="text-4xl font-black text-white tracking-tighter">Bem-vindo ao DriverPro</h2>
          <p className="text-slate-400 mt-2 font-medium">Precisamos de alguns detalhes básicos para começar.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">ID do Motorista (99)</label>
            <input
              type="text"
              required
              value={formData.driver_id_99}
              onChange={(e) => setFormData({ ...formData, driver_id_99: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              placeholder="Ex: 99-123456"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Cidade Principal</label>
            <input
              type="text"
              required
              value={formData.city_name}
              onChange={(e) => setFormData({ ...formData, city_name: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              placeholder="Ex: Campinas"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs text-center font-bold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-[28px] shadow-xl shadow-emerald-900/20 transition-all active:scale-95 disabled:opacity-50 text-sm uppercase tracking-widest"
          >
            {loading ? 'Sincronizando...' : 'FINALIZAR CADASTRO'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
