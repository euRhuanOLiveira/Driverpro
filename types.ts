
export interface DriverProfile {
  id: string;
  user_id: string;
  driver_id_99: string;
  city_name: string;
  current_status: string;
  star_rating: number;
  audit_passed: boolean;
  vehicle_type?: 'Carro' | 'Moto';
}

export interface DriverDailyDashboard {
  driver_profile_id: string;
  date: string;
  total_trips: number;
  total_net: number;
  total_hours_worked: number;
  avg_net_per_hour: number;
  avg_net_per_trip: number;
  avg_net_per_km: number;
}

export interface DriverInsight {
  insight_type: 'performance' | 'comparacao' | 'recomendacao';
  insight_title: string;
  insight_description: string;
  metric_value: number;
  metric_unit: string;
}

export interface CityRanking {
  city_name: string;
  state: string;
  avg_net_per_hour: number;
  avg_net_per_trip: number;
  avg_net_per_km: number;
  total_drivers: number;
}

export interface HourlyRanking {
  city_name: string;
  hour_start: number;
  hour_end: number;
  hour_range: string;
  avg_net_per_hour: number;
  avg_net_per_trip: number;
  total_trips: number;
}

export interface DriverHourlyEarnings {
  hour: number;
  period: 'AM' | 'PM';
  hour_label: string;
  total_trips: number;
  total_net: number;
}

export interface FuelCostPerKm {
  car_cost_per_km: number;
  moto_cost_per_km: number;
}

export interface DriverAvgValuePerKm {
  avg_value_per_km: number;
}

export interface DriverAvgTripDuration {
  avg_trip_duration_minutes: number;
}

export interface DriverTripValueClassification {
  good_trips: number;
  bad_trips: number;
}

export interface DriverWeekdayEarnings {
  weekday_index: number;
  weekday_name: string;
  avg_net: number;
}

export interface AppData {
  profile: DriverProfile;
  insights: DriverInsight[];
  city_rankings: CityRanking;
  hourly_rankings: HourlyRanking[];
  hourly_earnings: DriverHourlyEarnings[];
  daily_metrics: DriverDailyDashboard[];
  fuel_costs?: FuelCostPerKm;
  avg_value_km?: DriverAvgValuePerKm;
  avg_duration?: DriverAvgTripDuration;
  trip_classification?: DriverTripValueClassification;
  weekday_earnings: DriverWeekdayEarnings[];
}

export interface TripSimulation {
  distance_km: number;
  fuel_type: 'Gasolina' | 'Álcool' | 'GNV';
  consumption_kml: number;
  fuel_price: number;
}

export interface SimulationResult {
  fuel_cost: number;
  depreciation_est: number;
  total_cost: number;
  min_fair_price: number;
  net_profit_est: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
