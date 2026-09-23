import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedDir = path.join(__dirname, 'src/data/seed');

if (!fs.existsSync(seedDir)) {
  fs.mkdirSync(seedDir, { recursive: true });
}

// 1. Categories
const categories = [
  { id: 'CLEANLINESS', label: { en: 'Cleanliness', ml: 'വൃത്തിയാക്കൽ', hi: 'सफाई', ta: 'சுத்தம்' }, severity: 'LOW', icon: 'Brush' },
  { id: 'UNSAFE_DRIVING', label: { en: 'Unsafe Driving', ml: 'അപകടകരമായ ഡ്രൈവിംഗ്', hi: 'असुरक्षित ड्राइविंग', ta: 'பாதுகாப்பற்ற ஓட்டுதல்' }, severity: 'CRITICAL', icon: 'AlertTriangle' },
  { id: 'OVERCROWDING', label: { en: 'Overcrowding', ml: 'തിരക്ക്', hi: 'भीड़', ta: 'கூட்டம்' }, severity: 'MEDIUM', icon: 'Users' },
  { id: 'MISSED_STOP', label: { en: 'Missed Stop', ml: 'സ്റ്റോപ്പ് നിർത്തിയില്ല', hi: 'स्टॉप छूट गया', ta: 'நிறுத்தம் தவறப்பட்டது' }, severity: 'MEDIUM', icon: 'MapPinOff' },
  { id: 'CONCESSION_DENIAL', label: { en: 'Concession Denial', ml: 'ഇളവ് നിഷേധിച്ചു', hi: 'छूट इनकार', ta: 'சலுகை மறுப்பு' }, severity: 'HIGH', icon: 'TicketX' },
  { id: 'OTHER', label: { en: 'Other', ml: 'മറ്റ്', hi: 'अन्य', ta: 'மற்றவை' }, severity: 'LOW', icon: 'HelpCircle' }
];
fs.writeFileSync(path.join(seedDir, 'categories.json'), JSON.stringify(categories, null, 2));

// 2. SLA Rules
const slaRules = [
  { category: 'UNSAFE_DRIVING', ackWithinHours: 2, resolveWithinHours: 24, escalateTo: [{ level: 1, role: 'Regional Officer', afterHours: 24 }, { level: 2, role: 'HQ', afterHours: 48 }] },
  { category: 'CONCESSION_DENIAL', ackWithinHours: 4, resolveWithinHours: 48, escalateTo: [{ level: 1, role: 'Regional Officer', afterHours: 48 }] },
  { category: 'OVERCROWDING', ackWithinHours: 8, resolveWithinHours: 72, escalateTo: [{ level: 1, role: 'Regional Officer', afterHours: 72 }] },
  { category: 'MISSED_STOP', ackWithinHours: 8, resolveWithinHours: 72, escalateTo: [{ level: 1, role: 'Regional Officer', afterHours: 72 }] },
  { category: 'CLEANLINESS', ackWithinHours: 12, resolveWithinHours: 72, escalateTo: [{ level: 1, role: 'Regional Officer', afterHours: 72 }, { level: 2, role: 'HQ', afterHours: 96 }] },
  { category: 'OTHER', ackWithinHours: 24, resolveWithinHours: 168, escalateTo: [{ level: 1, role: 'Regional Officer', afterHours: 168 }] }
];
fs.writeFileSync(path.join(seedDir, 'sla_rules.json'), JSON.stringify(slaRules, null, 2));

// 3. Depots
const depots = [
  { id: 'TVM-CTY', name: 'Thiruvananthapuram City', region: 'South', officerName: 'Rajeev Nair', email: 'tvm-cty@ksrtc.mock', phone: '9000000001' },
  { id: 'KLM-01', name: 'Kollam', region: 'South', officerName: 'Suresh Kumar', email: 'klm@ksrtc.mock', phone: '9000000002' },
  { id: 'EKM-01', name: 'Ernakulam', region: 'Central', officerName: 'Priya V', email: 'ekm@ksrtc.mock', phone: '9000000003' },
  { id: 'ALV-01', name: 'Aluva', region: 'Central', officerName: 'Mohammed Ali', email: 'alv@ksrtc.mock', phone: '9000000004' },
  { id: 'TCR-01', name: 'Thrissur', region: 'Central', officerName: 'Fatima N', email: 'tcr@ksrtc.mock', phone: '9000000005' },
  { id: 'KKD-01', name: 'Kozhikode', region: 'North', officerName: 'Gopi K', email: 'kkd@ksrtc.mock', phone: '9000000006' }
];
fs.writeFileSync(path.join(seedDir, 'depots.json'), JSON.stringify(depots, null, 2));

// 4. Routes CSV
let csv = 'routeNo,routeName,depotId\n';
const routesList = [];
for (let i = 1; i <= 30; i++) {
  const depot = depots[i % depots.length].id;
  const routeNo = `${i}A`;
  routesList.push(routeNo);
  csv += `${routeNo},Route ${i}A City to Suburb,${depot}\n`;
}
fs.writeFileSync(path.join(seedDir, 'route_depot_map.csv'), csv);

// 5. 60 Sample Complaints
const statuses = ['SUBMITTED', 'UNROUTED', 'ASSIGNED_TO_DEPOT', 'ACKNOWLEDGED', 'IN_PROGRESS', 'AWAITING_INFO', 'ESCALATED', 'RESOLVED', 'REJECTED', 'REOPENED'];

const complaints = [];
const now = Date.now();
const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

for (let i = 1; i <= 60; i++) {
  const randomOffset = Math.random() * thirtyDaysMs;
  const createdAt = new Date(now - randomOffset).toISOString();
  
  const category = categories[i % categories.length].id;
  const status = statuses[i % statuses.length];
  const depot = depots[i % depots.length].id;
  const route = routesList[i % routesList.length];
  
  // padding for ID
  const paddedId = i.toString().padStart(6, '0');
  
  const comp = {
    id: `GRV-2026-${paddedId}`,
    createdAt,
    incidentAt: createdAt,
    busNo: `BUS-${100 + i}`,
    routeNo: route,
    category,
    location: { stopName: 'Central Station', lat: 8.5, lng: 76.9, areaBucket: 'City Limits' },
    description: `Sample complaint description for ${category} on route ${route}. The passenger experienced issues.`,
    evidence: [],
    complainant: { name: 'Passenger Name', phone: `9000000${100 + i}`, lang: 'en' },
    depotId: status === 'UNROUTED' ? null : depot,
    status,
    escalationLevel: status === 'ESCALATED' ? 1 : 0,
    ackDeadline: new Date(new Date(createdAt).getTime() + 4 * 3600000).toISOString(),
    resolveDeadline: new Date(new Date(createdAt).getTime() + 48 * 3600000).toISOString(),
    slaPausedTotalMs: 0,
    verified: status === 'RESOLVED' || status === 'IN_PROGRESS' || status === 'ESCALATED',
    timeline: [
      { at: createdAt, actor: 'SYSTEM', type: 'CREATED', message: 'Complaint filed' }
    ]
  };
  complaints.push(comp);
}
// Sort by createdAt desc
complaints.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

fs.writeFileSync(path.join(seedDir, 'sample_complaints.json'), JSON.stringify(complaints, null, 2));

console.log('Seed data generated.');
