import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification } from '../domain/types';

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  clear: () => void;
}

// Persisted so the outbox survives page reloads during the demo.
export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      addNotification: (notification: Notification) => set((state) => ({
        notifications: [notification, ...state.notifications].slice(0, 200),
      })),
      clear: () => set({ notifications: [] }),
    }),
    { name: 'grievance-notifications-v1' }
  )
);
