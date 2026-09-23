import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Complaint } from '../domain/types';

interface ComplaintState {
  complaints: Record<string, Complaint>;
  isLoaded: boolean;
  seeded: boolean;
  setComplaints: (complaints: Complaint[]) => void;
  upsertComplaint: (complaint: Complaint) => void;
  clear: () => void;
}

export const useComplaintStore = create<ComplaintState>()(
  persist(
    (set) => ({
      complaints: {},
      isLoaded: false,
      seeded: false,
      setComplaints: (complaints) => {
        // Merge with existing complaints (do not drop user data)
        const map: Record<string, Complaint> = { ...useComplaintStore.getState().complaints };
        complaints.forEach(c => {
          if (!map[c.id]) {
             map[c.id] = c;
          }
        });
        set({ complaints: map, isLoaded: true, seeded: true });
      },
      upsertComplaint: (complaint) => set((state) => ({
        complaints: { ...state.complaints, [complaint.id]: complaint }
      })),
      clear: () => set({ complaints: {}, isLoaded: false, seeded: false }),
    }),
    { name: 'grievance-store-v3' }
  )
);
