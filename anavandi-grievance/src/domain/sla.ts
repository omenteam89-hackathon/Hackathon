import { repository } from '../data/repository';
import { useEngineStore } from '../store/useEngineStore';
import { useNotificationStore } from '../store/useNotificationStore';
import type { EscalationLevel } from './types';

const HOUR = 3600000;
/** Extra time a Level-1 (regional) case gets before it goes to Head Office. */
const L2_GRACE_HOURS: Record<string, number> = { UNSAFE_DRIVING: 24 };
const DEFAULT_L2_GRACE_HOURS = 48;

/** Statuses where the SLA clock is not running. */
const STOPPED = ['RESOLVED', 'REJECTED', 'AWAITING_INFO', 'UNROUTED'];
/** Statuses that still need the depot to acknowledge. */
const NOT_ACKNOWLEDGED = ['SUBMITTED', 'ASSIGNED_TO_DEPOT'];

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

function notify(complaintId: string, at: string, audience: 'PASSENGER' | 'DEPOT' | 'REGIONAL' | 'HQ',
                channel: 'SMS' | 'EMAIL', to: string, body: string) {
  useNotificationStore.getState().addNotification({
    id: Math.random().toString(36).substring(2, 9),
    at, channel, to, audience, complaintId, template: 'ESCALATED', body,
  });
}

export const sla = {
  /** Deadline shifted by any time the SLA was paused (waiting for the passenger). */
  effectiveDeadline(deadlineIso: string, pausedTotalMs = 0, pausedAt?: string, nowMs?: number) {
    let ms = new Date(deadlineIso).getTime() + (pausedTotalMs || 0);
    if (pausedAt && nowMs) ms += Math.max(0, nowMs - new Date(pausedAt).getTime());
    return ms;
  },

  tick(simNowIso: string) {
    const now = new Date(simNowIso).getTime();

    repository.list().forEach((c) => {
      if (STOPPED.includes(c.status)) return;
      const level = (c.escalationLevel || 0) as number;
      if (level >= 2) return;

      const ack = sla.effectiveDeadline(c.ackDeadline, c.slaPausedTotalMs, c.slaPausedAt, now);
      const resolve = sla.effectiveDeadline(c.resolveDeadline, c.slaPausedTotalMs, c.slaPausedAt, now);
      const l2At = resolve + (L2_GRACE_HOURS[c.category] ?? DEFAULT_L2_GRACE_HOURS) * HOUR;

      let reason: string | null = null;
      let newLevel = level;

      if (level === 0 && NOT_ACKNOWLEDGED.includes(c.status) && now > ack) {
        newLevel = 1; reason = `Depot did not acknowledge by ${fmt(new Date(ack).toISOString())}`;
      } else if (level === 0 && now > resolve) {
        newLevel = 1; reason = `Depot did not resolve by ${fmt(new Date(resolve).toISOString())}`;
      } else if (level === 1 && now > l2At) {
        newLevel = 2; reason = `Still unresolved at regional level by ${fmt(new Date(l2At).toISOString())}`;
      }
      if (!reason) return; // idempotent: nothing to do

      const owner = newLevel === 1 ? 'Regional Officer (Level 1)' : 'Head Office (Level 2)';

      repository.update(c.id, { status: 'ESCALATED', escalationLevel: newLevel as EscalationLevel });
      repository.addTimelineEvent(c.id, {
        at: simNowIso, actor: 'SYSTEM', type: 'ESCALATED',
        message: `Escalated to ${owner}. ${reason}.`,
        internal: false, // passengers should see that their complaint was escalated
      });

      useEngineStore.getState().addLog(`${c.id} escalated L${level} → L${newLevel} (${reason})`, simNowIso);

      const phone = c.complainant?.phone;
      if (phone) notify(c.id, simNowIso, 'PASSENGER', 'SMS', phone,
        `KSRTC Grievance: your complaint ${c.id} has been escalated to the ${owner.replace(/ \(Level \d\)/, '')}.`);
      notify(c.id, simNowIso, newLevel === 1 ? 'REGIONAL' : 'HQ', 'EMAIL',
        newLevel === 1 ? 'regional-officer@ksrtc.example' : 'head-office@ksrtc.example',
        `Escalation: complaint ${c.id} is now with you (${owner}). ${reason}.`);
      notify(c.id, simNowIso, 'DEPOT', 'EMAIL', 'depot@ksrtc.example',
        `SLA breach: complaint ${c.id} was escalated to ${owner}. ${reason}.`);
    });
  },
};
