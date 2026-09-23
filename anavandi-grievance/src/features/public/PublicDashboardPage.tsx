import { useMemo } from 'react';
import { useComplaintStore } from '../../store/useComplaintStore';
import { useDataStore } from '../../store/useDataStore';
import { buildPublicDataset } from '../../domain/redact';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid 
} from 'recharts';
import { ShieldCheck } from 'lucide-react';
import KpiCard from '../../shared/KpiCard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function PublicDashboardPage() {
  const complaintsMap = useComplaintStore(state => state.complaints);
  const categories = useDataStore(state => state.categories);
  const depots = useDataStore(state => state.depots);

  const dataset = useMemo(() => {
    return buildPublicDataset(Object.values(complaintsMap));
  }, [complaintsMap]);

  // Format data for charts
  const categoryData = useMemo(() => {
    return Object.entries(dataset.byCategory).map(([catId, val]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        name: cat ? cat.label.en : catId,
        count: val === '<3' ? 0 : val,
        displayLabel: val === '<3' ? '<3' : val.toString()
      };
    }).sort((a, b) => b.count - a.count);
  }, [dataset.byCategory, categories]);

  const depotData = useMemo(() => {
    return Object.entries(dataset.byDepot).map(([depotId, val]) => {
      const depot = depots.find(d => d.id === depotId);
      return {
        name: depot ? depot.name : depotId,
        count: val === '<3' ? 0 : val,
        displayLabel: val === '<3' ? '<3' : val.toString()
      };
    }).sort((a, b) => b.count - a.count);
  }, [dataset.byDepot, depots]);

  const statusData = useMemo(() => {
    return Object.entries(dataset.byStatus).map(([status, val]) => {
      return {
        name: status,
        value: val === '<3' ? 0 : val,
        displayLabel: val === '<3' ? '<3' : val.toString()
      };
    }).filter(d => d.value > 0);
  }, [dataset.byStatus]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-border shadow-sm rounded text-sm">
          <p className="font-semibold text-ink">{label || data.name}</p>
          <p className="text-primary">Count: {data.displayLabel || data.value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Public Transparency Dashboard</h1>
        <div className="flex items-center gap-1.5 mt-2 text-sm text-green-700 bg-green-50 w-fit px-3 py-1.5 rounded-md border border-green-200">
          <ShieldCheck className="w-4 h-4" />
          <span>Figures are aggregated. No personal information is shown.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Complaints" value={dataset.total.toString()} />
        <KpiCard label="Resolution Rate" value={`${dataset.percentResolved}%`} />
        <KpiCard label="Within SLA" value={`${dataset.percentWithinSLA}%`} />
        <KpiCard label="Avg Resolution" value={`${dataset.avgResolutionHours}h`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-border shadow-sm">
          <h3 className="font-semibold text-ink mb-6">Complaints by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-border shadow-sm">
          <h3 className="font-semibold text-ink mb-6">Status Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-border shadow-sm lg:col-span-2">
          <h3 className="font-semibold text-ink mb-6">30-Day Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataset.last30Days} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tickMargin={10} style={{ fontSize: '12px' }} />
                <YAxis axisLine={false} tickLine={false} tickMargin={10} style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }} 
                />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-border shadow-sm lg:col-span-2">
          <h3 className="font-semibold text-ink mb-6">Complaints by Depot</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={depotData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={10} style={{ fontSize: '12px' }} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#0f172a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
