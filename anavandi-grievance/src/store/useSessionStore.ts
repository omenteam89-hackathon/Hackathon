import { create } from 'zustand';

type Role = 'PASSENGER' | 'DEPOT' | 'REGIONAL' | 'HQ';

interface SessionState {
  role: Role;
  depotId: string | null;
  regionId: string | null;
  
  setRole: (role: Role) => void;
  setDepotId: (depotId: string | null) => void;
  setRegionId: (regionId: string | null) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  role: 'DEPOT', // default
  depotId: 'TVM-CTY',
  regionId: null,
  
  setRole: (role) => set({ role }),
  setDepotId: (depotId) => set({ depotId }),
  setRegionId: (regionId) => set({ regionId })
}));
