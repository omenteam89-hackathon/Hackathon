import { useComplaintStore } from '../store/useComplaintStore';
import type { Complaint, TimelineEvent } from '../domain/types';

export const repository = {
  list(): Complaint[] {
    return Object.values(useComplaintStore.getState().complaints)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  get(id: string): Complaint | undefined {
    return useComplaintStore.getState().complaints[id];
  },
  
  create(complaint: Complaint): void {
    useComplaintStore.getState().upsertComplaint(complaint);
  },
  
  update(id: string, updates: Partial<Complaint>): void {
    const existing = this.get(id);
    if (!existing) return;
    const updated = { ...existing, ...updates };
    useComplaintStore.getState().upsertComplaint(updated);
  },
  
  addTimelineEvent(id: string, event: TimelineEvent): void {
    const existing = this.get(id);
    if (!existing) return;
    const updated = { 
      ...existing, 
      timeline: [...existing.timeline, event]
    };
    useComplaintStore.getState().upsertComplaint(updated);
  },
  
  // For initialization
  seed(complaints: Complaint[]): void {
    useComplaintStore.getState().setComplaints(complaints);
  }
};
