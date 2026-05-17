import type { FilterMode, PollutantResponse, SensorReading } from '@/types';
import { STATIC_SENSORS } from '@/constants/sensors';
const URL_V2_HOURLY = import.meta.env.VITE_API_URL_V2_HOURLY as string;
const URL_V2_DAILY = import.meta.env.VITE_API_URL_V2_DAILY as string;
const URL_V1_HOURLY = import.meta.env.VITE_API_URL_V1_HOURLY as string;
const URL_V1_DAILY = import.meta.env.VITE_API_URL_V1_DAILY as string;
const SAFETY_LIMITS = {
  pm25: { min: 0, max: 500 },
  co: { min: 0, max: 5000 },
  no2: { min: 0, max: 500 }
};
function clamp(value: number, type: keyof typeof SAFETY_LIMITS): number {
  if (value < 0) return value; 
  const { min, max } = SAFETY_LIMITS[type];
  return Math.min(Math.max(value, min), max);
}
interface ExternalApiResponse {
  data: {
    results: {
      device_id?: string;
      id?: string;
      uuid?: string;
      name?: string;
      buckets: {
        avg_pm2_5?: number | null;
        avg_co2?: number | null;
        avg_co?: number | null;
        avg_no2?: number | null;
        value?: number | null;
        avg_value?: number | null;
        start: string;
      }[];
    }[];
  };
}
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
async function fetchSensorData(
  sensor: typeof STATIC_SENSORS[0],
  filter: FilterMode,
  dates: { today: string, yesterday: string, startOfMonth: string },
  customRange?: { start: string, end: string } | null
): Promise<SensorReading | null> {
  const isV2 = sensor.apiVersion === 'v2';
  const idParamKey = isV2 ? 'device_id' : 'device_ids';
  let mode = 'hourly';
  let startDate = '';
  let endDate = '';
  if (customRange) {
    mode = 'hourly';
    startDate = customRange.start.replace('T', ' ');
    if (startDate.length === 16) startDate += ':00'; 
    endDate = customRange.end.replace('T', ' ');
    if (endDate.length === 16) endDate += ':00';
  } else if (filter === '1h') {
    mode = 'hourly';
    startDate = dates.yesterday; 
    endDate = dates.today;
  } else if (filter === '1d') {
    mode = 'daily';
    startDate = dates.yesterday;
    endDate = dates.today;
  }
  const buildUrl = (s: string, e: string) => {
    const base = isV2
      ? (mode === 'daily' ? URL_V2_DAILY : URL_V2_HOURLY)
      : (mode === 'daily' ? URL_V1_DAILY : URL_V1_HOURLY);
    try {
      const url = new URL(base);
      url.searchParams.set('start', s);
      url.searchParams.set('end', e);
      url.searchParams.set(idParamKey, sensor.uuid);
      return url.toString();
    } catch (err) {
      const sep = base.includes('?') ? '&' : '?';
      return `${base}${sep}start=${encodeURIComponent(s)}&end=${encodeURIComponent(e)}&${idParamKey}=${sensor.uuid}`;
    }
  };
  try {
    let url = buildUrl(startDate, endDate);
    let res = await fetch(url);
    if (!res.ok && res.status === 500 && !customRange && filter === '1d') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        startDate = formatDate(sevenDaysAgo);
        url = buildUrl(startDate, endDate);
        res = await fetch(url);
    }
    if (!res.ok) return null;
    const result: ExternalApiResponse = await res.json();
    const targetResult = result.data?.results?.find((r: any) => 
      r.id === sensor.uuid || 
      r.device_id === sensor.uuid || 
      r.uuid === sensor.uuid ||
      r.name === sensor.id
    );
    if (!targetResult) return null;
    const buckets = targetResult.buckets || [];
    if (buckets.length === 0) return null;
    let pm25 = -1, co = -1, no2 = -1;
    let finalTimestamp = new Date().toISOString();
    if (customRange) {
      let sumPm25 = 0, sumCo = 0, sumNo2 = 0;
      let countPm25 = 0, countCo = 0, countNo2 = 0;
      buckets.forEach(b => {
        const p = b.avg_pm2_5 ?? b.avg_value ?? b.value;
        if (p !== undefined && p !== null) {
          sumPm25 += p;
          countPm25++;
        }
        const c = b.avg_co2 ?? b.avg_co; 
        if (c !== undefined && c !== null) {
          sumCo += c;
          countCo++;
        }
        const n = b.avg_no2;
        if (n !== undefined && n !== null) {
          sumNo2 += n;
          countNo2++;
        }
      });
      if (countPm25 > 0) pm25 = sumPm25 / countPm25;
      if (countCo > 0) co = sumCo / countCo;
      if (countNo2 > 0) no2 = sumNo2 / countNo2;
      if (buckets.length > 0) {
        finalTimestamp = buckets[buckets.length - 1].start.replace(' ', 'T') + '+07:00';
      }
    } else {
      let validBucketFound = false;
      for (let i = buckets.length - 1; i >= 0; i--) {
        const b = buckets[i];
        const p = b.avg_pm2_5 ?? b.avg_value ?? b.value;
        const c = b.avg_co2 ?? b.avg_co;
        const n = b.avg_no2;
        if ((p !== undefined && p !== null) || (c !== undefined && c !== null) || (n !== undefined && n !== null)) {
          pm25 = p !== undefined && p !== null ? p : -1;
          co = c !== undefined && c !== null ? c : -1;
          no2 = n !== undefined && n !== null ? n : -1;
          finalTimestamp = b.start.replace(' ', 'T') + '+07:00'; 
          validBucketFound = true;
          break; 
        }
      }
      if (!validBucketFound) return null; 
    }
    const history = buckets
      .map(b => {
        const val = b.avg_pm2_5 ?? b.avg_value ?? b.value;
        return { 
          value: val !== undefined && val !== null ? clamp(val, 'pm25') : -1, 
          timestamp: b.start.replace(' ', 'T') + '+07:00' 
        };
      })
      .filter(h => h.value >= 0);
    return {
      id: sensor.id,
      lat: sensor.latitude,
      lng: sensor.longitude,
      pm25: clamp(pm25, 'pm25'),
      co: clamp(co, 'co'),
      no2: clamp(no2, 'no2'),
      timestamp: finalTimestamp,
      history
    };
  } catch (error) {
    console.error(`Failed to fetch sensor ${sensor.id}:`, error);
    return null;
  }
}
export async function fetchPollutantData(
  filter: FilterMode,
  customRange?: { start: string, end: string } | null
): Promise<PollutantResponse> {
  const now = new Date();
  const today = formatDate(now);
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(now.getDate() - 1);
  const yesterday = formatDate(yesterdayDate);
  const startOfMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfMonth = formatDate(startOfMonthDate);
  const dates = { today, yesterday, startOfMonth };
  const results = await Promise.all(
    STATIC_SENSORS.map(sensor => fetchSensorData(sensor, filter, dates, customRange))
  );
  const data = results.filter((r): r is SensorReading => r !== null);
  return { filter, data };
}