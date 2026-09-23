import { create } from 'zustand';

type Role = 'PASSENGER' | 'DEPOT' | 'REGIONAL' | 'HQ';

interface SessionState {
  role: Role;
  depotId: string | null;
  region: string | null;
  
  setRole: (role: Role) => void;
  setDepotId: (depotId: string | null) => void;
  setRegion: (region: string | null) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  role: 'PASSENGER', // default
  depotId: null,
  region: null,
  
  setRole: (role) => set({ role }),
  setDepotId: (depotId) => set({ depotId }),
  setRegion: (region) => set({ region })
}));
