
import React, { useState } from 'react';
import { DriverInsight } from '../types';

interface Props {
  insight: Partial<DriverInsight>;
  hideDescription?: boolean;
  children?: React.ReactNode;
}

const explanations: Record<string, string> = {
  "Ganhos Totais": "É a soma de todo o dinheiro que entrou no seu bolso após as taxas do aplicativo no período selecionado.",
  "Ganho Médio por Hora": "Mostra quanto você ganha, em média, por cada hora que passa online no aplicativo. É o melhor indicador de produtividade.",
  "Valor Médio por Km": "Indica quanto você recebe por cada quilômetro rodado. Ajuda a entender se as corridas estão pagando bem pela distância.",
  "Custo Médio por Km": "Estimativa de quanto você gasta em combustível para rodar um quilômetro, baseado no consumo do seu veículo.",
  "Horário Mais Lucrativo": "O momento do dia em que seu rendimento histórico foi maior. Ótimo para planejar quando sair de casa.",
  "Total de Corridas": "A contagem total de viagens concluídas com sucesso no período.",
  "Média Cidade (R$/h)": "O ganho por hora médio de outros motoristas na sua região, para você comparar seu desempenho.",
  "Lucratividade por KM": "Seu lucro real por km após descontar os custos estimados de rodagem.",
  "Custo do Combustível": "A porcentagem do seu ganho que está sendo usada apenas para pagar o combustível.",
  "Melhor Horário": "O período do dia em que você costuma ter os melhores resultados financeiros."
};

const MetricCard: React.FC<Props> = ({ insight, hideDescription = false, children }) => {
  const [showHelp, setShowHelp] = useState(false);

  const formattedValue = () => {
    const val = insight.metric_value ?? 0;
    
    if (val === 0 && insight.metric_unit && insight.metric_unit.length > 3) {
      return null;
    }

    if (insight.metric_unit === 'R$' || insight.metric_unit?.startsWith('R$')) {
      return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return val.toLocaleString('pt-BR');
  };

  const mainDisplay = formattedValue();
  const explanation = explanations[insight.insight_title || ""] || "Esta métrica ajuda a entender seu desempenho financeiro como motorista.";

  return (
    <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[40px] hover:border-slate-700 transition-all shadow-xl group relative overflow-hidden flex flex-col justify-between min-h-[220px]">
      {/* Help Popover */}
      {showHelp && (
        <div className="absolute inset-0 z-20 bg-slate-900/95 backdrop-blur-md p-8 flex flex-col justify-center animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-start mb-4">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500">O que significa?</h4>
             <button onClick={() => setShowHelp(false)} className="text-slate-500 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
          <p className="text-sm font-medium text-slate-200 leading-relaxed italic">
            "{explanation}"
          </p>
          <button 
            onClick={() => setShowHelp(false)}
            className="mt-6 text-[9px] font-black uppercase tracking-widest text-slate-400 border border-slate-700 py-2 px-4 rounded-full hover:bg-slate-800 transition-colors self-start"
          >
            Entendi
          </button>
        </div>
      )}

      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-800 group-hover:border-slate-700 transition-colors">
              {insight.insight_type || 'Métrica'}
            </span>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowHelp(true); }}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-emerald-500 hover:border-emerald-500/50 transition-all active:scale-90"
              title="O que é isso?"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
          <div className={`w-2 h-2 rounded-full ${insight.insight_type === 'performance' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`}></div>
        </div>
        
        <div className="flex justify-between items-start">
          <h3 className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mb-3">{insight.insight_title}</h3>
          {children}
        </div>
        
        <div className="flex items-baseline gap-2 mb-4">
          <span className={`${mainDisplay ? 'text-4xl' : 'text-3xl'} font-black text-white tracking-tighter`}>
            {mainDisplay || insight.metric_unit}
          </span>
          {mainDisplay && (
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{insight.metric_unit}</span>
          )}
        </div>
      </div>
      
      {!hideDescription && insight.insight_description && (
        <p className="text-slate-400 text-[11px] leading-relaxed font-bold tracking-tight border-t border-slate-900 pt-6 mt-4 italic">
          {insight.insight_description}
        </p>
      )}
    </div>
  );
};

export default MetricCard;
