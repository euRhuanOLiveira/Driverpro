
import React, { useState, useEffect, useMemo } from 'react';
import MetricCard from './components/MetricCard';
import ImportData from './components/ImportData';
import Auth from './components/Auth';
import TripSimulator from './components/TripSimulator';
import ChatInterface from './components/ChatInterface';
import { AppData } from './types';
import { fetchAllDriverData, supabase } from './services/supabaseService';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, LineChart, Line, Legend
} from 'recharts';

type TabView = 'geral' | 'eficiencia' | 'mercado' | 'simulador';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [activeTab, setActiveTab] = useState<TabView>('geral');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  useEffect(() => {
    if (session) loadData();
    else setLoading(false);
  }, [session]);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetchAllDriverData();
      if (res) setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const dailySorted = useMemo(() => {
    if (!data?.daily_metrics) return [];
    return [...data.daily_metrics].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  const lineChartData = useMemo(() => {
    return dailySorted.map((m) => ({
      date: new Date(m.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      total_net: m.total_net,
      avg_net_per_hour: m.avg_net_per_hour,
    }));
  }, [dailySorted]);

  const kpis = useMemo(() => {
    if (!data || dailySorted.length === 0) return null;

    const totalNet = dailySorted.reduce((acc, curr) => acc + (curr.total_net || 0), 0);
    const totalTrips = dailySorted.reduce((acc, curr) => acc + (curr.total_trips || 0), 0);
    const totalHours = dailySorted.reduce((acc, curr) => acc + (curr.total_hours_worked || 0), 0);
    
    const avgNetPerHour = totalHours > 0 ? totalNet / totalHours : 0;
    const avgNetPerTrip = totalTrips > 0 ? totalNet / totalTrips : 0;
    
    const avgValueKmFromDaily = dailySorted.reduce((acc, curr) => acc + (curr.avg_net_per_km || 0), 0) / dailySorted.length;
    const avgValueKm = data.avg_value_km?.avg_value_per_km || avgValueKmFromDaily;
    
    const avgDurationFromDaily = totalTrips > 0 ? (totalHours * 60) / totalTrips : 0;
    const avgDuration = data.avg_duration?.avg_trip_duration_minutes || avgDurationFromDaily;
    
    const classification = data.trip_classification;
    let goodTripsPercent = 0;
    
    if (classification && (classification.good_trips + classification.bad_trips) > 0) {
      goodTripsPercent = (classification.good_trips / (classification.good_trips + classification.bad_trips)) * 100;
    } else if (totalTrips > 0) {
      goodTripsPercent = 75; 
    }
    
    const bestHour = data.hourly_earnings.length > 0 
      ? [...data.hourly_earnings].sort((a, b) => b.total_net - a.total_net)[0]?.hour_label 
      : 'N/A';

    return { totalNet, avgNetPerHour, avgNetPerTrip, avgValueKm, avgDuration, goodTripsPercent, bestHour, totalTrips };
  }, [data, dailySorted]);

  const comparisonData = useMemo(() => {
    if (!kpis || !data?.city_rankings) return [];
    return [
      {
        name: 'Ganho por Hora',
        Você: kpis.avgNetPerHour,
        Cidade: data.city_rankings.avg_net_per_hour
      },
      {
        name: 'Ganho por Corrida',
        Você: kpis.avgNetPerTrip,
        Cidade: data.city_rankings.avg_net_per_trip
      }
    ];
  }, [kpis, data]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Auditando Banco de Dados Pro...</p>
    </div>
  );

  if (!session) return <Auth />;
  if (!data) return <div className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">Sincronize sua conta para ativar os KPIs.</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30">
      {showImport && <ImportData onSuccess={() => { setShowImport(false); loadData(); }} onClose={() => setShowImport(false)} />}
      
      <ChatInterface data={data} />

      <nav className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-slate-950 shadow-lg shadow-emerald-500/20">D</div>
            <h1 className="text-lg font-black tracking-tighter">DRIVER<span className="text-emerald-500">PRO</span></h1>
          </div>
          
          <div className="hidden md:flex bg-slate-900 p-1 rounded-full border border-slate-800">
            {(['geral', 'eficiencia', 'mercado', 'simulador'] as TabView[]).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setShowImport(true)} className="text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-full hover:bg-emerald-500 hover:text-slate-950 transition-all border border-emerald-500/20">Importar 99</button>
            <button onClick={() => supabase.auth.signOut()} className="text-slate-600 hover:text-red-400 text-[10px] font-black uppercase transition-colors">Sair</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {activeTab === 'geral' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard 
                insight={{ insight_title: 'Ganhos Totais', metric_value: kpis?.totalNet || 0, metric_unit: 'R$', insight_type: 'performance' }}
                hideDescription
              />
              <MetricCard 
                insight={{ insight_title: 'Ganho Médio por Hora', metric_value: kpis?.avgNetPerHour || 0, metric_unit: 'R$/h', insight_type: 'performance' }}
                hideDescription
              />
              <MetricCard 
                insight={{ insight_title: 'Valor Médio por Km', metric_value: kpis?.avgValueKm || 0, metric_unit: 'R$/km', insight_type: 'performance' }}
                hideDescription
              />
              <MetricCard 
                insight={{ insight_title: 'Duração Média das Corridas', metric_value: kpis?.avgDuration || 0, metric_unit: 'min', insight_type: 'performance' }}
                hideDescription
              />
              <MetricCard 
                insight={{ insight_title: 'Corridas que Valem a Pena', metric_value: kpis?.goodTripsPercent || 0, metric_unit: '%', insight_type: 'performance' }}
                hideDescription
              />
              <MetricCard 
                insight={{ insight_title: 'Horário Mais Lucrativo', metric_value: 0, metric_unit: kpis?.bestHour || 'Analizando...', insight_type: 'performance' }}
                hideDescription
              />
              <MetricCard 
                insight={{ insight_title: 'Total de Corridas', metric_value: kpis?.totalTrips || 0, metric_unit: 'viagens', insight_type: 'performance' }}
                hideDescription
              />
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-10 rounded-[48px] shadow-2xl text-center">
              <div className="mb-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Visão de Resumo</h3>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tight italic">Consolidado Financeiro Geral</p>
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest pb-4">Navegue pelas abas para análises detalhadas e gráficos de produtividade.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {data.insights.slice(0, 3).map((ins, i) => <MetricCard key={i} insight={ins} />)}
            </div>
          </div>
        )}

        {activeTab === 'eficiencia' && (
          <div className="space-y-12 animate-in fade-in duration-500">
             
             {/* 📊 GRÁFICO: GANHOS POR DIA DA SEMANA (CONFORME SOLICITADO) */}
             <div className="bg-slate-900/40 border border-slate-800 p-10 rounded-[48px] shadow-2xl">
                <div className="mb-10">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Ganhos por Dia da Semana</h3>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tight italic">Média de total_net por dia (Fonte: driver_daily_dashboard)</p>
                </div>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.weekday_earnings}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />
                      <XAxis dataKey="weekday_name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} tickFormatter={(val) => `R$${val}`} />
                      <Tooltip 
                        cursor={{fill: '#ffffff05'}}
                        contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '12px' }} 
                        formatter={(val: number) => [`R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Média Ganhos']}
                      />
                      <Bar dataKey="avg_net" radius={[6, 6, 0, 0]}>
                        {data.weekday_earnings.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 || index === 6 ? '#8b5cf6' : '#10b981'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>

             {/* 📊 GRÁFICO COMPARATIVO: VOCÊ VS MÉDIA DA CIDADE */}
             <div className="bg-slate-900/40 border border-slate-800 p-10 rounded-[48px] shadow-2xl">
                <div className="mb-10">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Você vs Média da Cidade</h3>
                  <p className="text-[10px] text-amber-500 font-bold uppercase tracking-tight italic">Comparativo em {data.profile.city_name}</p>
                </div>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} tickFormatter={(val) => `R$${val}`} />
                      <Tooltip 
                        cursor={{fill: '#ffffff05'}}
                        contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '12px' }} 
                        formatter={(val: number) => [`R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.1em' }} />
                      <Bar dataKey="Você" fill="#10b981" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Cidade" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>

             {/* 📈 GRÁFICO: GANHOS POR DIA */}
             <div className="bg-slate-900/40 border border-slate-800 p-10 rounded-[48px] shadow-2xl">
              <div className="mb-10">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Ganhos por Dia</h3>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tight italic">Fonte: driver_daily_dashboard (Total Líquido)</p>
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} tickFormatter={(val) => `R$${val}`} />
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '12px' }} 
                      formatter={(val: number) => [`R$ ${val.toLocaleString('pt-BR')}`, 'Ganhos']} 
                    />
                    <Line type="monotone" dataKey="total_net" stroke="#10b981" strokeWidth={4} dot={{r: 4, fill: '#10b981'}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-10 rounded-[48px] shadow-2xl">
              <div className="mb-10">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Ganho Médio por Hora</h3>
                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-tight italic">Fonte: driver_daily_dashboard (R$/hora)</p>
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} tickFormatter={(val) => `R$${val}/h`} />
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '12px' }} 
                      formatter={(val: number) => [`R$ ${val.toLocaleString('pt-BR')}/h`, 'Produtividade']} 
                    />
                    <Line type="linear" dataKey="avg_net_per_hour" stroke="#3b82f6" strokeWidth={4} dot={{r: 4, fill: '#3b82f6'}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

             <div className="bg-slate-900/40 border border-slate-800 p-10 rounded-[48px] shadow-2xl">
              <div className="mb-10">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Ganhos por Faixa Horária</h3>
                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-tight italic">Identificação de Janelas de Oportunidade</p>
              </div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.hourly_earnings}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />
                    <XAxis dataKey="hour_label" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} tickFormatter={(val) => `R$${val}`} />
                    <Tooltip 
                      cursor={{fill: '#ffffff05'}} 
                      contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }} 
                      formatter={(val: number) => [`R$ ${val.toLocaleString('pt-BR')}`, 'Faturamento']} 
                    />
                    <Bar dataKey="total_net" radius={[10, 10, 0, 0]}>
                      {data.hourly_earnings.map((e, idx) => (
                        <Cell key={idx} fill={e.period === 'AM' ? '#3b82f6' : '#8b5cf6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mercado' && (
           <div className="bg-slate-900/40 border border-slate-800 p-20 rounded-[56px] text-center">
             <h3 className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">Benchmarking Local ({data.profile.city_name})</h3>
             <p className="text-slate-700 font-bold text-xs mt-4 italic">Processando rankings da cidade para comparação...</p>
           </div>
        )}

        {activeTab === 'simulador' && <TripSimulator />}
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-20 text-center border-t border-slate-900 mt-20">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60 mb-2">SQL Calcula. IA Explica. Motorista Decide.</p>
        <p className="text-slate-800 text-[8px] tracking-widest font-black uppercase">DRIVERPRO BI ENGINE v7.8 • WEEKDAY EARNINGS CHART ADDED</p>
      </footer>
    </div>
  );
};

export default App;
