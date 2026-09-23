import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sla } from '../domain/sla';

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

export const useClockStore = create<ClockState>()(
  persist(
    (set, get) => ({
      simNow: new Date().toISOString(),
      speed: DEFAULT_SPEED,
      running: true,
      
      setSpeed: (speed: number) => set({ speed }),
      toggleRunning: () => set((state) => ({ running: !state.running })),
      
      jump: (ms: number) => {
        const nextTime = new Date(new Date(get().simNow).getTime() + ms).toISOString();
        set({ simNow: nextTime });
        sla.tick(nextTime);
      },
      
      jumpTo: (isoString: string) => {
        set({ simNow: isoString });
        sla.tick(isoString);
      },
      
      reset: () => {
        const now = new Date().toISOString();
        set({ simNow: now, speed: DEFAULT_SPEED, running: true });
        sla.tick(now);
      },
      
      tick: () => {
        const { running, speed, simNow } = get();
        if (!running) return;
        
        const nextMs = new Date(simNow).getTime() + (speed * 1000);
        const nextTime = new Date(nextMs).toISOString();
        set({ simNow: nextTime });
        sla.tick(nextTime);
      }
    }),
    { name: 'grievance-clock-v1' }
  )
);
