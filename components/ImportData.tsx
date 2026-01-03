
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { processImport } from '../services/supabaseService';

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

const ImportData: React.FC<Props> = ({ onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizeTripStatus = (rawStatus: any): string => {
    const s = String(rawStatus || '').toLowerCase().trim();
    if (
      s === 'finished' || s === 'finalizado' || s === 'finalizada' ||
      s === 'concluido' || s === 'concluída' || s === 'completed' ||
      s === 'success' || s === 'sucesso' || s === 'pago' || s === 'paga' ||
      s.includes('conclu')
    ) {
      return 'completed';
    }
    return 'other';
  };

  const parseNumber = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const cleaned = String(val).replace(/R\$/g, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        
        const driverBaseSheet = workbook.Sheets['driver_base'] || workbook.Sheets['Base'];
        if (!driverBaseSheet) throw new Error('Aba "driver_base" não encontrada.');
        const driverRaw: any[] = XLSX.utils.sheet_to_json(driverBaseSheet);
        if (driverRaw.length === 0) throw new Error('Dados do motorista vazios.');
        const d = driverRaw[0]; 
        
        const profileData = {
          driver_id_99: String(d['Driver ID'] || d['driver_id'] || d['ID do Motorista'] || d['ID'] || ''),
          city_name: d['City Name'] || d['city_name'] || d['Cidade'] || 'Não Informada',
          driver_name: d['Driver Name'] || d['driver_name'] || d['Nome'],
          current_status: d['Current Status'] || d['Status Atual'] || 'active',
          star_rating: parseNumber(d['Level/Star rating'] || d['Avaliação']),
          audit_passed: true,
        };

        if (!profileData.driver_id_99) throw new Error('ID do motorista não identificado.');

        const orderSheet = workbook.Sheets['order_info'] || workbook.Sheets['Corridas'];
        if (!orderSheet) throw new Error('Aba "order_info" não encontrada.');
        const ordersRaw: any[] = XLSX.utils.sheet_to_json(orderSheet);
        
        const tripsMap = new Map<string, any>();

        ordersRaw.forEach((o: any, idx: number) => {
          const rawId = o['Order ID'] || o['order_id'] || o['ID da Corrida'] || o['ID'];
          const tripId = rawId ? String(rawId).trim() : `AUTO_${idx}`;
          const normalizedStatus = normalizeTripStatus(o['Order status'] || o['Status']);

          if (normalizedStatus !== 'completed') return;
          if (tripsMap.has(tripId)) return;

          // CORREÇÃO DEFINITIVA NO IMPORTADOR: MAPEAMENTO DE DISTÂNCIA
          const distance =
            parseNumber(o['Charged  Distance']) || // ← dois espaços (principal)
            parseNumber(o['Charged Distance'])  || // fallback
            parseNumber(o['Distance'])          ||
            parseNumber(o['Distância'])         ||
            parseNumber(o['Km'])                ||
            null;

          tripsMap.set(tripId, {
            trip_id_99: tripId,
            trip_status: 'completed',
            start_time: o['Departure Time'] || o['Departure time'] || o['Horário de partida'] || o['Data'],
            end_time: o['Order complete time'] || o['Complete time'] || o['Horário de chegada'],
            trip_date: o['Departure Time'] || o['Departure time'] || o['Data'] || new Date(),
            distance_km: distance,
            trip_type: o['Payment Type'] || o['Tipo de pagamento'] || 'App',
            fare_gross: parseNumber(o['Total fee'] || o['fare'] || o['Valor total']),
            fare_net: parseNumber(o['Total fee'] || o['fare'] || o['Valor total']),
          });
        });

        const mappedTrips = Array.from(tripsMap.values());
        if (mappedTrips.length === 0) throw new Error('Nenhuma corrida concluída identificada.');

        await processImport(profileData, mappedTrips);
        onSuccess();
      } catch (err: any) {
        setError(err.message || 'Falha crítica na importação.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6 z-[100] animate-in fade-in duration-500">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 p-12 rounded-[56px] shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter">Sincronização Pro</h2>
            <p className="text-slate-400 text-sm font-medium mt-1">Carregue seus relatórios do 99 (user_info.xlsx).</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-2xl transition-all">
            <svg className="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-10">
          <label className="group relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-800 rounded-[40px] hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer">
            <div className="flex flex-col items-center justify-center text-center px-8">
              <div className="w-20 h-20 bg-slate-800 rounded-[28px] flex items-center justify-center mb-6 shadow-inner group-hover:scale-105 transition-transform">
                <span className="text-4xl">📊</span>
              </div>
              <p className="text-lg text-slate-200 font-black">Selecionar Relatório 99</p>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-2">Deduplicação e BI automático</p>
            </div>
            <input type="file" className="hidden" accept=".xlsx" onChange={handleFileUpload} disabled={loading} />
            
            {loading && (
              <div className="absolute inset-0 bg-slate-900/98 flex flex-col items-center justify-center z-20">
                <div className="w-12 h-12 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Processando Corridas...</p>
                <p className="text-slate-500 text-[9px] mt-2 italic">Calculando métricas diárias e eficiência</p>
              </div>
            )}
          </label>

          {error && (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[32px] text-red-400 text-[11px] font-bold leading-relaxed">
              <span className="text-red-500 block mb-2 uppercase tracking-tighter">Erro de Importação:</span>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportData;
