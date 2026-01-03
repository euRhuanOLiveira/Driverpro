
import { AppData } from './types';

// O sistema agora é puramente baseado em dados (BI). 
// As instruções de IA foram removidas para evitar processamento desnecessário.

export const MOCK_DATA: AppData = {
  profile: {
    id: "1",
    user_id: "user-123",
    driver_id_99: "99-88273",
    city_name: "Campinas",
    current_status: 'Ativo',
    star_rating: 4.95,
    audit_passed: true,
    vehicle_type: 'Carro'
  },
  insights: [
    {
      insight_type: "performance",
      insight_title: "Lucratividade por KM",
      insight_description: "Seu ganho líquido por km rodado após custos de combustível estimados.",
      metric_value: 1.85,
      metric_unit: "R$/km"
    },
    {
      insight_type: "comparacao",
      insight_title: "Custo do Combustível",
      insight_description: "Impacto médio do combustível no seu faturamento bruto conforme view do banco.",
      metric_value: 22.4,
      metric_unit: "%"
    },
    {
      insight_type: "recomendacao",
      insight_title: "Melhor Horário",
      insight_description: "Baseado na sua eficiência histórica de faturamento.",
      metric_value: 19,
      metric_unit: "horas"
    }
  ],
  city_rankings: {
    city_name: "Campinas",
    state: "SP",
    avg_net_per_hour: 38.10,
    avg_net_per_trip: 22.40,
    avg_net_per_km: 1.85,
    total_drivers: 1250
  },
  hourly_rankings: [
    {
      city_name: "Campinas",
      hour_start: 18,
      hour_end: 22,
      hour_range: "18:00-22:00",
      avg_net_per_hour: 45.0,
      avg_net_per_trip: 25.5,
      total_trips: 15
    }
  ],
  hourly_earnings: [
    { hour: 8, period: 'AM', hour_label: "8 AM", total_trips: 4, total_net: 50 },
    { hour: 18, period: 'PM', hour_label: "6 PM", total_trips: 8, total_net: 95 }
  ],
  daily_metrics: [
    {
      driver_profile_id: "1",
      date: "2024-10-05",
      total_trips: 12,
      total_net: 340,
      total_hours_worked: 8,
      avg_net_per_hour: 42.5,
      avg_net_per_trip: 28.3,
      avg_net_per_km: 1.9
    }
  ],
  fuel_costs: {
    car_cost_per_km: 0.58,
    moto_cost_per_km: 0.18
  },
  /* Fix: Added missing required weekday_earnings to match AppData interface */
  weekday_earnings: [
    { weekday_index: 0, weekday_name: "Dom", avg_net: 320 },
    { weekday_index: 1, weekday_name: "Seg", avg_net: 280 },
    { weekday_index: 2, weekday_name: "Ter", avg_net: 290 },
    { weekday_index: 3, weekday_name: "Qua", avg_net: 310 },
    { weekday_index: 4, weekday_name: "Qui", avg_net: 330 },
    { weekday_index: 5, weekday_name: "Sex", avg_net: 450 },
    { weekday_index: 6, weekday_name: "Sáb", avg_net: 480 }
  ]
};
