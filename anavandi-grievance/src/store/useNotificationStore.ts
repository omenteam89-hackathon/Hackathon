import { create } from 'zustand';
import type { Notification } from '../domain/types';

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  
  addNotification: (notification: Notification) => set((state) => ({
    notifications: [notification, ...state.notifications]
  })),
  
  clear: () => set({ notifications: [] })
}));
