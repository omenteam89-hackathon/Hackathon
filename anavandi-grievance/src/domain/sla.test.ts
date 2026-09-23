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
    expect(outbox.length).toBe(3); // passenger SMS + regional email + depot email

    // idempotent: ticking again at the same time changes nothing
    sla.tick(T_plus_3h);
    expect(useEngineStore.getState().logs.length).toBe(1);
  });

  const base = (id: string, T: number, status: 'ASSIGNED_TO_DEPOT' | 'IN_PROGRESS') => ({
    id, complainant: { lang: 'en' as const }, category: 'UNSAFE_DRIVING' as const, routeNo: 'TVM-KZK-ORD',
    incidentAt: new Date(T).toISOString(), location: { stopName: 'Pattom' }, description: 'Test',
    status, escalationLevel: 0 as const, depotId: 'TVM-CTY',
    ackDeadline: new Date(T + 2 * 3600000).toISOString(),
    resolveDeadline: new Date(T + 24 * 3600000).toISOString(),
    createdAt: new Date(T).toISOString(), verified: false, slaPausedTotalMs: 0, evidence: [], timeline: [],
  });

  it('escalates when the ACKNOWLEDGE deadline is missed (before the resolve deadline)', () => {
    const T = new Date('2026-09-24T10:00:00Z').getTime();
    repository.create(base('GRV-2026-000500', T, 'ASSIGNED_TO_DEPOT'));
    sla.tick(new Date(T + 1 * 3600000).toISOString());
    expect(repository.get('GRV-2026-000500')?.status).toBe('ASSIGNED_TO_DEPOT');
    sla.tick(new Date(T + 3 * 3600000).toISOString());
    expect(repository.get('GRV-2026-000500')?.status).toBe('ESCALATED');
    expect(repository.get('GRV-2026-000500')?.escalationLevel).toBe(1);
  });

  it('does not use the acknowledge deadline once the depot has acknowledged', () => {
    const T = new Date('2026-09-24T10:00:00Z').getTime();
    repository.create(base('GRV-2026-000501', T, 'IN_PROGRESS'));
    sla.tick(new Date(T + 3 * 3600000).toISOString());
    expect(repository.get('GRV-2026-000501')?.status).toBe('IN_PROGRESS');
  });

  it('escalates to Level 2 (Head Office) if still unresolved after the grace period', () => {
    const T = new Date('2026-09-24T10:00:00Z').getTime();
    repository.create(base('GRV-2026-000502', T, 'IN_PROGRESS'));
    sla.tick(new Date(T + 25 * 3600000).toISOString());
    expect(repository.get('GRV-2026-000502')?.escalationLevel).toBe(1);
    sla.tick(new Date(T + 49 * 3600000).toISOString());
    expect(repository.get('GRV-2026-000502')?.escalationLevel).toBe(2);
  });
});
