import { Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../store/useSessionStore';
import { useClockStore } from '../../store/useClockStore';
import { useDataStore } from '../../store/useDataStore';
import { formatAppDate } from '../../lib/utils';

export default function TopBar() {
  const navigate = useNavigate();
  const depotId = useSessionStore(s => s.depotId);
  const regionId = useSessionStore(s => s.regionId);
  const role = useSessionStore(s => s.role);
  const setRole = useSessionStore(s => s.setRole);
  const setDepotId = useSessionStore(s => s.setDepotId);
  const setRegionId = useSessionStore(s => s.setRegionId);
  
  const simNow = useClockStore(state => state.simNow);
  const speed = useClockStore(state => state.speed);
  const depotsData = useDataStore(state => state.depots);
  const regionsData = useDataStore(state => state.regions);
  
  const depot = depotsData.find(d => d.id === depotId);
  const region = regionsData.find(r => r.id === regionId);
  
  let headerName = 'Console';
  if (role === 'DEPOT' && depot) {
    headerName = `${depot.name} depot`;
  } else if (role === 'REGIONAL' && region) {
    headerName = `${region.name} – Regional officer`;
  } else if (role === 'HQ') {
    headerName = 'HQ';
  }

  const currentValue = role === 'DEPOT' ? `DEPOT_${depotId}` : role === 'REGIONAL' ? `REGIONAL_${regionId}` : role;

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'PASSENGER') {
      setRole('PASSENGER');
      navigate('/');
    } else if (val === 'HQ') {
      setRole('HQ');
      navigate('/dashboard');
    } else if (val.startsWith('DEPOT_')) {
      setRole('DEPOT');
      setDepotId(val.replace('DEPOT_', ''));
      navigate('/console/depot');
    } else if (val.startsWith('REGIONAL_')) {
      setRole('REGIONAL');
      setRegionId(val.replace('REGIONAL_', ''));
      navigate('/console/regional');
    }
  };

  return (
    <header className="h-14 border-b border-border bg-white flex items-center justify-between px-4 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <span className="font-semibold">{headerName}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="bg-muted/20 text-xs px-2 py-1 rounded-md text-muted font-mono flex items-center gap-2">
          <span>Sim time: {formatAppDate(simNow)} (×{speed})</span>
        </div>
        
        <select 
          className="text-sm bg-surface border border-border rounded px-2 py-1 max-w-[200px]" 
          value={currentValue}
          onChange={handleRoleChange}
        >
          <option value="PASSENGER">Passenger view</option>
          <optgroup label="Depot">
            {depotsData.map(d => (
              <option key={d.id} value={`DEPOT_${d.id}`}>
                {d.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Regional officer">
            {regionsData.map(r => (
              <option key={r.id} value={`REGIONAL_${r.id}`}>
                {r.name}
              </option>
            ))}
          </optgroup>
          <option value="HQ">HQ (all regions)</option>
        </select>
        
        <button className="relative p-2 text-muted hover:text-ink">
          <Bell className="w-5 h-5" />
        </button>

        <button className="p-2 text-muted hover:text-ink bg-muted/10 rounded-full">
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
