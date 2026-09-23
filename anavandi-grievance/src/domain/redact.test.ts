import { describe, it, expect } from 'vitest';
import { buildPublicDataset } from './redact';
import type { Complaint } from './types';

const mockComplaints: Complaint[] = [
  {
    id: 'GRV-2026-000001',
    complainant: {
      phone: '9876543210',
      lang: 'en'
    },
    category: 'UNSAFE_DRIVING',
    routeNo: '13A',
    busNo: 'KL-15-1234',
    incidentAt: new Date().toISOString(),
    location: {
      stopName: 'Pattom',
      lat: 8.5241,
      lng: 76.9366
    },
    description: 'Driver was speeding heavily near the school zone and ignored the stop.',
    status: 'IN_PROGRESS',
    escalationLevel: 0,
    depotId: 'TVM-CTY',
    ackDeadline: new Date().toISOString(),
    resolveDeadline: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    verified: false,
    slaPausedTotalMs: 0,
    evidence: [],
    timeline: []
  },
  {
    id: 'GRV-2026-000002',
    complainant: {
      phone: '9988776655',
      lang: 'ml'
    },
    category: 'CLEANLINESS',
    routeNo: '25A',
    busNo: 'KL-15-9999',
    incidentAt: new Date().toISOString(),
    location: {
      stopName: 'East Fort',
      lat: 8.4831,
      lng: 76.9458
    },
    description: 'The bus was extremely dirty and seats were torn.',
    status: 'RESOLVED',
    escalationLevel: 0,
    depotId: 'TVM-CTY',
    ackDeadline: new Date().toISOString(),
    resolveDeadline: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    verified: false,
    slaPausedTotalMs: 0,
    evidence: [],
    timeline: [
      {
        at: new Date().toISOString(),
        actor: 'DEPOT',
        actorName: 'Inspector Ram',
        type: 'RESOLVED',
        message: 'Bus cleaned at depot.'
      }
    ]
  }
];

describe('redact', () => {
  it('buildPublicDataset strictly returns aggregated data without PII', () => {
    const dataset = buildPublicDataset(mockComplaints);
    const jsonStr = JSON.stringify(dataset);

    // 1. Should not contain phone patterns
    expect(jsonStr).not.toMatch(/\d{10}/);
    expect(jsonStr).not.toContain('9876543210');
    expect(jsonStr).not.toContain('9988776655');

    // 2. Should not contain specific descriptions
    expect(jsonStr).not.toContain('Driver was speeding');
    expect(jsonStr).not.toContain('dirty');

    // 3. Should not contain location specifics
    expect(jsonStr).not.toContain('lat');
    expect(jsonStr).not.toContain('lng');
    expect(jsonStr).not.toContain('Pattom');

    // 4. Should not contain staff names
    expect(jsonStr).not.toContain('Inspector Ram');
    
    // 5. Should not contain bus numbers
    expect(jsonStr).not.toContain('KL-15');

    // 6. Should correctly aggregate totals
    expect(dataset.total).toBe(2);
    
    // 7. Should correctly apply <3 logic since there is only 1 of each category
    expect(dataset.byCategory['UNSAFE_DRIVING']).toBe('<3');
    expect(dataset.byCategory['CLEANLINESS']).toBe('<3');
    expect(dataset.byStatus['IN_PROGRESS']).toBe('<3');
    expect(dataset.byStatus['RESOLVED']).toBe('<3');
    expect(dataset.byDepot['TVM-CTY']).toBe('<3'); // Wait, both are TVM-CTY, so count is 2, which is < 3
  });
});
