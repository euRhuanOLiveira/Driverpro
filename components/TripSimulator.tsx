
import React, { useState, useMemo } from 'react';
import { TripSimulation, SimulationResult } from '../types';

const TripSimulator: React.FC = () => {
  const [inputs, setInputs] = useState<TripSimulation>({
    distance_km: 10,
    fuel_type: 'Gasolina',
    consumption_kml: 10,
    fuel_price: 5.80,
  });

  const result = useMemo<SimulationResult>(() => {
    const fuel_cost = (inputs.distance_km / inputs.consumption_kml) * inputs.fuel_price;
    const depreciation_est = inputs.distance_km * 0.25; // R$ 0.25 por KM médio
    const total_cost = fuel_cost + depreciation_est;
    const min_fair_price = total_cost * 1.6; // Margem de 60% para ser "justo"
    
    return {
      fuel_cost,
      depreciation_est,
      total_cost,
      min_fair_price,
      net_profit_est: min_fair_price - total_cost
    };
  }, [inputs]);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-[56px] shadow-2xl p-10 lg:p-16">
      <div className="mb-12">
        <h2 className="text-4xl font-black text-white tracking-tighter">Simulador de Lucratividade</h2>
        <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-2">Evite aceitar corridas que geram prejuízo real</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Painel de Inputs */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Distância da Corrida (KM)</label>
              <input 
                type="number" 
                value={inputs.distance_km}
                onChange={(e) => setInputs({...inputs, distance_km: Number(e.target.value)})}
                className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-6 py-4 text-xl font-black text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Preço Combustível (R$)</label>
              <input 
                type="number" 
                step="0.01"
                value={inputs.fuel_price}
                onChange={(e) => setInputs({...inputs, fuel_price: Number(e.target.value)})}
                className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-6 py-4 text-xl font-black text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tipo Combustível</label>
              <select 
                value={inputs.fuel_type}
                onChange={(e) => setInputs({...inputs, fuel_type: e.target.value as any})}
                className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-6 py-4 text-sm font-black text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all appearance-none"
              >
                <option>Gasolina</option>
                <option>Álcool</option>
                <option>GNV</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Consumo (KM/L)</label>
              <input 
                type="number" 
                value={inputs.consumption_kml}
                onChange={(e) => setInputs({...inputs, consumption_kml: Number(e.target.value)})}
                className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-6 py-4 text-xl font-black text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-[32px]">
             <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">O que consideramos</h4>
             <ul className="text-[10px] text-slate-500 space-y-2 font-bold uppercase">
               <li>• Custo variável de combustível</li>
               <li>• R$ 0,25/km de depreciação/manutenção</li>
               <li>• Margem de segurança operacional</li>
             </ul>
          </div>
        </div>

        {/* Painel de Resultados */}
        <div className="bg-slate-950 border border-slate-800 rounded-[48px] p-10 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 blur-[80px] -mr-20 -mt-20 group-hover:bg-emerald-500/10 transition-colors"></div>
          
          <div className="space-y-8 relative z-10">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2">Preço Mínimo Justo</h3>
              <p className="text-6xl font-black text-white tracking-tighter">R$ {result.min_fair_price.toFixed(2)}</p>
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-2">Abaixo disso você está pagando para trabalhar</p>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-900">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">Custo Combustível</span>
                <span className="text-lg font-black text-white">R$ {result.fuel_cost.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">Custo Total (Real)</span>
                <span className="text-lg font-black text-white">R$ {result.total_cost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-3xl">
             <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Lucro Líquido Estimado</span>
                <span className="text-2xl font-black text-emerald-500">R$ {result.net_profit_est.toFixed(2)}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripSimulator;
