import { useComplaintStore } from '../store/useComplaintStore';

export function generateComplaintId(): string {
  const currentYear = new Date().getFullYear();
  const complaints = useComplaintStore.getState().complaints;
  
  let maxSuffix = 0;
  for (const id of Object.keys(complaints)) {
    if (id.startsWith(`GRV-${currentYear}-`)) {
      const suffix = parseInt(id.split('-')[2], 10);
      if (!isNaN(suffix) && suffix > maxSuffix) {
        maxSuffix = suffix;
      }
    }
  }
  
  const counter = maxSuffix + 1;
  const paddedCounter = counter.toString().padStart(6, '0');
  return `GRV-${currentYear}-${paddedCounter}`;
}

export function resetIdCounter(): void {
  // No longer needed as it calculates dynamically, keeping for compatibility
}
