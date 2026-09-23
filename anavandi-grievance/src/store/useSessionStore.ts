import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'PASSENGER' | 'DEPOT' | 'REGIONAL' | 'HQ';

interface SessionState {
  role: Role;
  depotId: string | null;
  regionId: string | null;
  
  setRole: (role: Role) => void;
  setDepotId: (depotId: string | null) => void;
  setRegionId: (regionId: string | null) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      role: 'DEPOT', // default
      depotId: 'TVM-CTY',
      regionId: null,
      
      setRole: (role) => set({ role }),
      setDepotId: (depotId) => set({ depotId }),
      setRegionId: (regionId) => set({ regionId })
    }),
    { name: 'grievance-session-v1' }
  )
);
