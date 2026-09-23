import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Complaint } from '../domain/types';

interface ComplaintState {
  complaints: Record<string, Complaint>;
  isLoaded: boolean;
  setComplaints: (complaints: Complaint[]) => void;
  upsertComplaint: (complaint: Complaint) => void;
  clear: () => void;
}

export const useComplaintStore = create<ComplaintState>()(
  persist(
    (set) => ({
      complaints: {},
      isLoaded: false,
      setComplaints: (complaints) => {
        const map: Record<string, Complaint> = {};
        complaints.forEach(c => map[c.id] = c);
        set({ complaints: map, isLoaded: true });
      },
      upsertComplaint: (complaint) => set((state) => ({
        complaints: { ...state.complaints, [complaint.id]: complaint }
      })),
      clear: () => set({ complaints: {}, isLoaded: false }),
    }),
    { name: 'grievance-store-v3' }
  )
);
