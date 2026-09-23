import { repository } from '../data/repository';
import { useEngineStore } from '../store/useEngineStore';
import { useNotificationStore } from '../store/useNotificationStore';
import type { EscalationLevel } from './types';

export const sla = {
  tick(simNowIso: string) {
    const complaints = repository.list();
    const simTime = new Date(simNowIso).getTime();
    
    complaints.forEach(c => {
      if (['RESOLVED', 'REJECTED', 'AWAITING_INFO'].includes(c.status)) return;
      
      const deadline = new Date(c.resolveDeadline).getTime();
      const currentEscalation = c.escalationLevel || 0;
      
      if (simTime > deadline && currentEscalation === 0) {
        const newLevel = currentEscalation + 1;
        const msg = `Case escalated to Level ${newLevel}`;
        
        repository.update(c.id, {
          status: 'ESCALATED',
          escalationLevel: newLevel as EscalationLevel
        });
        
        repository.addTimelineEvent(c.id, {
          at: simNowIso,
          actor: 'SYSTEM',
          type: 'ESCALATED',
          message: msg,
          internal: true
        });
        
        useEngineStore.getState().addLog(`${c.id} escalated L${currentEscalation} → L${newLevel} at ${new Date(simNowIso).toLocaleString()}`, simNowIso);
        
        useNotificationStore.getState().addNotification({
          id: Math.random().toString(36).substring(7),
          at: simNowIso,
          channel: 'EMAIL',
          to: 'regional@example.com',
          audience: 'REGIONAL',
          complaintId: c.id,
          template: 'CUSTOM',
          body: `Escalation Alert: Complaint ${c.id} has breached SLA deadline.`
        });
      }
    });
  }
};
