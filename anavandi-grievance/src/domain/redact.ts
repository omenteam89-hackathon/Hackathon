import type { Complaint } from './types';

export interface PublicDashboardData {
  total: number;
  percentResolved: number;
  percentWithinSLA: number;
  avgResolutionHours: number;
  byCategory: Record<string, number | '<3'>;
  byDepot: Record<string, number | '<3'>;
  byStatus: Record<string, number | '<3'>;
  last30Days: { date: string; count: number }[];
}

export function buildPublicDataset(complaints: Complaint[]): PublicDashboardData {
  const total = complaints.length;
  
  if (total === 0) {
    return {
      total: 0,
      percentResolved: 0,
      percentWithinSLA: 0,
      avgResolutionHours: 0,
      byCategory: {},
      byDepot: {},
      byStatus: {},
      last30Days: []
    };
  }

  let resolvedCount = 0;
  let withinSlaCount = 0;
  let totalResolutionHours = 0;

  const rawByCategory: Record<string, number> = {};
  const rawByDepot: Record<string, number> = {};
  const rawByStatus: Record<string, number> = {};
  
  // Last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const rawDaily: Record<string, number> = {};

  complaints.forEach(c => {
    // Categorical counts
    rawByCategory[c.category] = (rawByCategory[c.category] || 0) + 1;
    
    if (c.depotId) {
      rawByDepot[c.depotId] = (rawByDepot[c.depotId] || 0) + 1;
    }

    rawByStatus[c.status] = (rawByStatus[c.status] || 0) + 1;

    // SLA & Resolution
    if (c.status === 'RESOLVED') {
      resolvedCount++;
      const resolveEvent = c.timeline.slice().reverse().find(t => t.type === 'RESOLVED');
      if (resolveEvent) {
        const resolvedAt = new Date(resolveEvent.at).getTime();
        const deadline = new Date(c.resolveDeadline).getTime();
        if (resolvedAt <= deadline) {
          withinSlaCount++;
        }
        
        const createdTime = new Date(c.createdAt).getTime();
        totalResolutionHours += (resolvedAt - createdTime) / (1000 * 60 * 60);
      }
    }

    // Daily trends
    const createdDate = new Date(c.createdAt);
    if (createdDate >= thirtyDaysAgo) {
      const dateString = createdDate.toISOString().split('T')[0];
      rawDaily[dateString] = (rawDaily[dateString] || 0) + 1;
    }
  });

  const percentResolved = Math.round((resolvedCount / total) * 100);
  const percentWithinSLA = resolvedCount > 0 ? Math.round((withinSlaCount / resolvedCount) * 100) : 0;
  const avgResolutionHours = resolvedCount > 0 ? Math.round((totalResolutionHours / resolvedCount) * 10) / 10 : 0;

  const suppress = (records: Record<string, number>): Record<string, number | '<3'> => {
    const result: Record<string, number | '<3'> = {};
    for (const [k, v] of Object.entries(records)) {
      if (v < 3) {
        result[k] = '<3';
      } else {
        result[k] = v;
      }
    }
    return result;
  };

  const last30Days = Object.entries(rawDaily)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }));

  return {
    total,
    percentResolved,
    percentWithinSLA,
    avgResolutionHours,
    byCategory: suppress(rawByCategory),
    byDepot: suppress(rawByDepot),
    byStatus: suppress(rawByStatus),
    last30Days
  };
}
