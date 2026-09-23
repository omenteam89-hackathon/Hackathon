import Papa from 'papaparse';
import type { Category, SlaRule, Depot, RouteDepotMap, Complaint } from '../domain/types';

export type LoadStatus = 'LOADED' | 'FALLBACK' | 'ERROR';

export interface LoadReportItem {
  file: string;
  status: LoadStatus;
  unmappedColumns: string[];
  error?: string;
}

export interface AppData {
  categories: Category[];
  slaRules: SlaRule[];
  depots: Depot[];
  routeMap: RouteDepotMap[];
  complaints: Complaint[];
  regions: any[];
  timetable: any[];
  redactionChecklist: any;
}

export interface LoadResult {
  data: AppData;
  report: LoadReportItem[];
}

async function fetchJson<T>(url: string, filename: string, report: LoadReportItem[], fallback: T | null = null): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    report.push({ file: filename, status: 'LOADED', unmappedColumns: [] });
    return data as T;
  } catch (err) {
    report.push({ file: filename, status: fallback !== null ? 'FALLBACK' : 'ERROR', unmappedColumns: [], error: String(err) });
    if (fallback !== null) return fallback;
    throw err;
  }
}

async function fetchCsv<T>(url: string, filename: string, report: LoadReportItem[], fallbackCsv: string = ''): Promise<T[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    return parseCsv<T>(text, filename, 'LOADED', report);
  } catch (err) {
    if (fallbackCsv) {
      return parseCsv<T>(fallbackCsv, filename, 'FALLBACK', report, String(err));
    }
    report.push({ file: filename, status: 'ERROR', unmappedColumns: [], error: String(err) });
    throw err;
  }
}

function parseCsv<T>(csvText: string, filename: string, status: LoadStatus, report: LoadReportItem[], errStr?: string): T[] {
  const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  
  const mappedData = result.data.map((row: any) => {
    if (filename === 'route_depot_map.csv') {
      return {
        routeNo: row.route_no || row.routeNo,
        routeName: row.route_name || row.routeName,
        serviceType: row.service_type || row.serviceType,
        depotId: row.depot_id || row.depotId
      } as unknown as T;
    }
    return row as T;
  });

  report.push({ file: filename, status, unmappedColumns: [], error: errStr });
  return mappedData;
}

export async function loadAppData(): Promise<LoadResult> {
  const report: LoadReportItem[] = [];
  
  const categories = await fetchJson<Category[]>('/data/categories.json', 'categories.json', report, []);
  
  // sla_rules.json has rules under the "rules" key
  const slaRulesRaw = await fetchJson<{rules: SlaRule[]}>('/data/sla_rules.json', 'sla_rules.json', report, {rules: []});
  const slaRules = slaRulesRaw.rules || [];
  
  const depots = await fetchJson<Depot[]>('/data/depots.json', 'depots.json', report, []);
  const complaints = await fetchJson<Complaint[]>('/data/sample_complaints.json', 'sample_complaints.json', report, []);
  const routeMap = await fetchCsv<RouteDepotMap>('/data/route_depot_map.csv', 'route_depot_map.csv', report, '');
  
  const regions = await fetchJson<any[]>('/data/regions.json', 'regions.json', report, []);
  const timetable = await fetchCsv<any>('/data/timetable.csv', 'timetable.csv', report, '');
  const redactionChecklist = await fetchJson<any>('/data/redaction_checklist.json', 'redaction_checklist.json', report, {});
  
  return {
    data: { categories, slaRules, depots, routeMap, complaints, regions, timetable, redactionChecklist },
    report
  };
}
