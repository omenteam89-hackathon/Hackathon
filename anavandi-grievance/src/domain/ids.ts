const COUNTER_KEY = 'anavandi_id_counter';

export function generateComplaintId(): string {
  const currentYear = new Date().getFullYear();
  let counter = 1;
  
  const stored = localStorage.getItem(COUNTER_KEY);
  if (stored) {
    const parsed = parseInt(stored, 10);
    if (!isNaN(parsed)) {
      counter = parsed + 1;
    }
  }
  
  localStorage.setItem(COUNTER_KEY, counter.toString());
  
  // Format: GRV-YYYY-NNNNNN
  const paddedCounter = counter.toString().padStart(6, '0');
  return `GRV-${currentYear}-${paddedCounter}`;
}

export function resetIdCounter(): void {
  localStorage.removeItem(COUNTER_KEY);
}
