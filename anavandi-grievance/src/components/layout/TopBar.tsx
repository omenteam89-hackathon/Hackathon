import { Bell, User } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { useClockStore } from '../../store/useClockStore';
import { useDataStore } from '../../store/useDataStore';

export default function TopBar() {
  const depotId = useSessionStore(s => s.depotId);
  const role = useSessionStore(s => s.role);
  const setRole = useSessionStore(s => s.setRole);
  const simNow = useClockStore(state => state.simNow);
  const speed = useClockStore(state => state.speed);
  const depotsData = useDataStore(state => state.depots);
  
  const depot = depotsData.find(d => d.id === depotId);
  const headerName = depot ? depot.name : (role === 'REGIONAL' ? 'Regional Console' : 'HQ Console');

  return (
    <header className="h-14 border-b border-border bg-white flex items-center justify-between px-4 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <span className="font-semibold">{headerName}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="bg-muted/20 text-xs px-2 py-1 rounded-md text-muted font-mono flex items-center gap-2">
          <span>Sim time: {new Date(simNow).toLocaleDateString()} {new Date(simNow).toLocaleTimeString()} (×{speed})</span>
        </div>
        
        <select 
          className="text-sm bg-surface border border-border rounded px-2 py-1" 
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
        >
          <option value="PASSENGER">Passenger</option>
          <option value="DEPOT">Depot</option>
          <option value="REGIONAL">Regional</option>
          <option value="HQ">HQ</option>
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
