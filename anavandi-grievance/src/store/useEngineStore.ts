import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EngineLogEntry {
  id: string;
  timestamp: string;
  message: string;
}

interface EngineState {
  logs: EngineLogEntry[];
  addLog: (message: string, timestamp: string) => void;
  clear: () => void;
}

// Persisted so the engine log survives page reloads during the demo.
export const useEngineStore = create<EngineState>()(
  persist(
    (set) => ({
      logs: [],
      addLog: (message, timestamp) => set((state) => ({
        logs: [{ id: Math.random().toString(36).substring(7), timestamp, message }, ...state.logs].slice(0, 30),
      })),
      clear: () => set({ logs: [] }),
    }),
    { name: 'grievance-engine-log-v1' }
  )
);
