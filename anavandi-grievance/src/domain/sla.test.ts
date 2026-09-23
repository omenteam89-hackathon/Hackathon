import { describe, it, expect, beforeEach } from 'vitest';
import { sla } from './sla';
import { useComplaintStore } from '../store/useComplaintStore';
import { useEngineStore } from '../store/useEngineStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { repository } from '../data/repository';

describe('SLA Engine', () => {
  beforeEach(() => {
    useComplaintStore.getState().clear();
    useEngineStore.getState().clear();
    useNotificationStore.getState().clear();
  });

  it('should escalate a complaint when the time jumps past the deadline', () => {
    const T = new Date('2026-09-24T10:00:00Z').getTime();
    const T_iso = new Date(T).toISOString();
    const T_plus_3h = new Date(T + 3 * 3600000).toISOString();

    repository.create({
      id: 'GRV-2026-000001',
      complainant: { phone: '9876543210', lang: 'en' },
      category: 'UNSAFE_DRIVING',
      routeNo: '13A',
      busNo: 'KL-15-1234',
      incidentAt: T_iso,
      location: { stopName: 'Pattom', lat: 8.5241, lng: 76.9366 },
      description: 'Test',
      status: 'IN_PROGRESS',
      escalationLevel: 0,
      depotId: 'TVM-CTY',
      ackDeadline: new Date(T + 3600000).toISOString(),
      resolveDeadline: new Date(T + 2 * 3600000).toISOString(),
      createdAt: T_iso,
      verified: false,
      slaPausedTotalMs: 0,
      evidence: [],
      timeline: []
    });

    sla.tick(T_plus_3h);

    const c = repository.get('GRV-2026-000001');
    expect(c?.status).toBe('ESCALATED');
    expect(c?.escalationLevel).toBe(1);

    const logs = useEngineStore.getState().logs;
    expect(logs.length).toBe(1);
    expect(logs[0].message).toContain('escalated L0 → L1');

    const outbox = useNotificationStore.getState().notifications;
    expect(outbox.length).toBe(1);
  });
});
