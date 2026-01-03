
import { createClient } from '@supabase/supabase-js';
import { AppData, DriverProfile } from '../types';

const SUPABASE_URL = 'https://ueffktkazhdugjkrMlhY.supabase.co'.toLowerCase();
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZmZrdGthemhkdWdqa3JtbGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNzcxNzIsImV4cCI6MjA4Mjk1MzE3Mn0.aIE9d8gMG95HBWE42gt0z_zCwnFmX_LZEIbtJSX26xY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const toSqlDate = (dateInput: any): string => {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toSqlTime = (dateInput: any): string => {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '00:00:00';
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

export async function fetchAllDriverData(): Promise<AppData | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return null;

    const { data: profile } = await supabase
      .from('driver_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile) {
      return {
        profile: { id: '', user_id: user.id, driver_id_99: 'Pendente', city_name: 'Aguardando', current_status: 'Novo', star_rating: 0, audit_passed: false },
        insights: [],
        city_rankings: { city_name: 'Geral', state: '', avg_net_per_hour: 0, avg_net_per_trip: 0, avg_net_per_km: 0, total_drivers: 0 },
        hourly_rankings: [],
        hourly_earnings: [],
        daily_metrics: [],
        weekday_earnings: []
      };
    }

    const [
      insightsRes, cityRes, hourlyRankRes, hourlyEarningsRes, dailyRes, fuelRes,
      avgKmRes, avgDurationRes, classificationRes, weekdayRes
    ] = await Promise.all([
      supabase.from('driver_insights_view').select('*').eq('driver_profile_id', profile.id),
      supabase.from('city_rankings_view').select('*').ilike('city_name', profile.city_name).maybeSingle(),
      supabase.from('hourly_rankings_view').select('*').order('hour_range', { ascending: true }),
      supabase.from('driver_hourly_earnings').select('*'),
      supabase.from('driver_daily_dashboard').select('*').eq('driver_profile_id', profile.id).order('date', { ascending: false }).limit(30),
      supabase.from('fuel_cost_per_km').select('*').maybeSingle(),
      supabase.from('driver_avg_value_per_km').select('*').eq('driver_profile_id', profile.id).maybeSingle(),
      supabase.from('driver_avg_trip_duration').select('*').eq('driver_profile_id', profile.id).maybeSingle(),
      supabase.from('driver_trip_value_classification').select('*').eq('driver_profile_id', profile.id).maybeSingle(),
      supabase.from('driver_weekday_earnings_view').select('*').eq('driver_profile_id', profile.id).order('weekday_index', { ascending: true })
    ]);

    let cityData = cityRes.data;
    if (!cityData) {
      const { data: generalCity } = await supabase.from('city_rankings_view').select('*').limit(1).maybeSingle();
      cityData = generalCity || { city_name: profile.city_name || 'Geral', state: '', avg_net_per_hour: 0, avg_net_per_trip: 0, avg_net_per_km: 0, total_drivers: 0 };
    }

    return {
      profile,
      insights: insightsRes.data || [],
      city_rankings: cityData,
      hourly_rankings: hourlyRankRes.data || [],
      hourly_earnings: hourlyEarningsRes.data || [],
      daily_metrics: dailyRes.data || [],
      fuel_costs: fuelRes.data,
      avg_value_km: avgKmRes.data,
      avg_duration: avgDurationRes.data,
      trip_classification: classificationRes.data,
      weekday_earnings: weekdayRes.data || []
    };
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    return null;
  }
}

export async function processImport(profileData: Partial<DriverProfile>, trips: any[]) {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error('Usuário não autenticado');

  const { data: profile, error: profileErr } = await supabase
    .from('driver_profiles')
    .upsert({ ...profileData, user_id: user.id }, { onConflict: 'driver_id_99' })
    .select()
    .single();

  if (profileErr) throw new Error("Erro ao salvar perfil: " + profileErr.message);

  const driverProfileId = profile.id;
  
  const tripsToInsert = trips.map(t => ({
    driver_profile_id: driverProfileId,
    trip_id_99: String(t.trip_id_99),
    trip_date: toSqlDate(t.trip_date),
    start_time: toSqlTime(t.start_time || t.trip_date),
    end_time: t.end_time ? toSqlTime(t.end_time) : null,
    city_name: t.city_name || profile.city_name,
    fare_gross: t.fare_gross,
    fare_net: t.fare_net,
    distance_km: t.distance_km,
    trip_type: t.trip_type,
    trip_status: 'completed' 
  }));

  const { error: insertErr } = await supabase
    .from('trips_99')
    .upsert(tripsToInsert, { onConflict: 'driver_profile_id,trip_id_99' });

  if (insertErr) throw new Error("Erro ao inserir corridas: " + insertErr.message);

  await supabase.rpc('calculate_driver_daily_metrics_auto', {
    p_driver_profile_id: driverProfileId
  });

  await supabase.rpc('generate_all_driver_insights', {
    p_driver_profile_id: driverProfileId
  });

  return true;
}

export async function createDriverProfile(profileData: Partial<DriverProfile>) {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error('Usuário não autenticado');
  const { data, error } = await supabase
    .from('driver_profiles')
    .upsert([{ ...profileData, user_id: user.id }], { onConflict: 'driver_id_99' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}
