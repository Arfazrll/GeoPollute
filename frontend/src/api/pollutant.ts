import type { FilterMode, PollutantResponse, SensorReading } from '@/types';
import { STATIC_SENSORS } from '@/constants/sensors';

const URL_V2_HOURLY = 'https://api-gateway.langit-biru.com/api/v1/datavsnew/average/hourly';
const URL_V2_DAILY = 'https://api-gateway.langit-biru.com/api/v1/datavsnew/average/daily';
const URL_V1_HOURLY = 'https://api-gateway.langit-biru.com/api/v1/datavs/average/hourly';
const URL_V1_DAILY = 'https://api-gateway.langit-biru.com/api/v1/datavs/average/daily';

interface ExternalApiResponse {
  data: {
    results: {
      buckets: {
        avg_pm2_5?: number;
        avg_co2?: number;
        avg_co?: number;
        avg_no2?: number;
        value?: number;
        avg_value?: number;
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

  let mode: 'hourly' | 'daily' = filter === '1d' ? 'daily' : 'hourly';

  let startDate = filter === '1d' ? dates.startOfMonth : dates.yesterday;
  let endDate = dates.today;

  if (customRange) {
    startDate = customRange.start.split('T')[0];
    endDate = customRange.end.split('T')[0];
    mode = 'daily';
  } else if (!isV2) {

    endDate = dates.yesterday;
    if (filter === '1d') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      startDate = formatDate(sevenDaysAgo);
    } else {
      startDate = dates.yesterday;
    }
  }

  const buildUrl = (s: string, e: string) => {
    const base = isV2
      ? (mode === 'daily' ? URL_V2_DAILY : URL_V2_HOURLY)
      : (mode === 'daily' ? URL_V1_DAILY : URL_V1_HOURLY);
    return `${base}?start=${s}&end=${e}&${idParamKey}=${sensor.uuid}`;
  };

  try {
    let url = buildUrl(startDate, endDate);
    let res = await fetch(url);

    if (!customRange) {
      if (!res.ok && res.status === 500 && endDate !== dates.yesterday) {
        endDate = dates.yesterday;
        url = buildUrl(startDate, endDate);
        res = await fetch(url);
      }
      if (!res.ok && res.status === 500) {
        startDate = dates.yesterday;
        endDate = dates.yesterday;
        url = buildUrl(startDate, endDate);
        res = await fetch(url);
      }
    }

    if (!res.ok) return null;
    const result: ExternalApiResponse = await res.json();
    const buckets = result.data.results[0]?.buckets || [];
    if (buckets.length === 0) return null;

    const history = buckets
      .map(b => {
        const val = b.avg_pm2_5 ?? b.avg_value ?? b.value ?? 0;
        return { value: val, timestamp: b.start.replace(' ', 'T') + 'Z' };
      })
      .filter(h => h.value > 0);

    let pm25 = 0, co = 0, no2 = 0;

    if (customRange && buckets.length > 0) {
      let sumPm25 = 0, sumCo = 0, sumNo2 = 0, count = 0;
      buckets.forEach(b => {
        const p = b.avg_pm2_5 ?? b.avg_value ?? b.value;
        if (p !== undefined && p > 0) {
          sumPm25 += p;
          sumCo += (b.avg_co ?? b.avg_co2 ?? 0);
          sumNo2 += (b.avg_no2 ?? 0);
          count++;
        }
      });
      if (count > 0) {
        pm25 = sumPm25 / count;
        co = sumCo / count;
        no2 = sumNo2 / count;
      }
    } else {
      for (let i = buckets.length - 1; i >= 0; i--) {
        const b = buckets[i];
        if (b.avg_pm2_5 !== undefined || b.avg_value !== undefined || b.value !== undefined) {
          pm25 = b.avg_pm2_5 ?? b.avg_value ?? b.value ?? 0;
          co = b.avg_co ?? b.avg_co2 ?? 0;
          no2 = b.avg_no2 ?? 0;
          if (pm25 > 0) break;
        }
      }
    }

    return {
      id: sensor.id,
      lat: sensor.latitude,
      lng: sensor.longitude,
      pm25,
      co,
      no2,
      timestamp: new Date().toISOString(),
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