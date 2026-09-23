import { create } from 'zustand';

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

export const useEngineStore = create<EngineState>((set) => ({
  logs: [],
  addLog: (message, timestamp) => set((state) => {
    const newLogs = [
      { id: Math.random().toString(36).substring(7), timestamp, message },
      ...state.logs
    ];
    return { logs: newLogs.slice(0, 30) }; // Keep last 30
  }),
  clear: () => set({ logs: [] })
}));
