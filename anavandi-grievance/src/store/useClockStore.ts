import { create } from 'zustand';

interface ClockState {
  simNow: string; // ISO format
  speed: number;
  running: boolean;
  
  setSpeed: (speed: number) => void;
  toggleRunning: () => void;
  jump: (ms: number) => void;
  jumpTo: (isoString: string) => void;
  reset: () => void;
  tick: () => void;
}

const DEFAULT_SPEED = 60; // 60x real time

export const useClockStore = create<ClockState>((set, get) => ({
  simNow: new Date().toISOString(),
  speed: DEFAULT_SPEED,
  running: true,
  
  setSpeed: (speed: number) => set({ speed }),
  toggleRunning: () => set((state) => ({ running: !state.running })),
  
  jump: (ms: number) => set((state) => ({ 
    simNow: new Date(new Date(state.simNow).getTime() + ms).toISOString() 
  })),
  
  jumpTo: (isoString: string) => set({ simNow: isoString }),
  
  reset: () => set({ 
    simNow: new Date().toISOString(), 
    speed: DEFAULT_SPEED, 
    running: true 
  }),
  
  // Tick advances the clock by `speed` seconds if running.
  // It is expected to be called every 1 real second.
  tick: () => {
    const { running, speed, simNow } = get();
    if (!running) return;
    
    // advance by speed seconds
    const nextMs = new Date(simNow).getTime() + (speed * 1000);
    set({ simNow: new Date(nextMs).toISOString() });
  }
}));
