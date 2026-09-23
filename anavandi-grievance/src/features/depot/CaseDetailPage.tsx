import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useComplaintStore } from '../../store/useComplaintStore';
import { useDataStore } from '../../store/useDataStore';
import { useSessionStore } from '../../store/useSessionStore';
import { useClockStore } from '../../store/useClockStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { repository } from '../../data/repository';
import StatusBadge from '../../shared/StatusBadge';
import EscalationLevelChip from '../../shared/EscalationLevelChip';
import SlaTimer from '../../shared/SlaTimer';
import Timeline from '../../shared/Timeline';
import MaskedPhone from '../../shared/MaskedPhone';
import CategoryIcon from '../../shared/CategoryIcon';
import { capitalize } from '../../lib/utils';
import { useFormatters } from '../../lib/formatters';
import { toast } from 'sonner';
import { MessageSquare, Lock, AlertCircle, UserCircle } from 'lucide-react';
import type { CategoryId, TimelineEvent } from '../../domain/types';

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const simNow = useClockStore(s => s.simNow);
  const sessionDepotId = useSessionStore(s => s.depotId);
  const addNotification = useNotificationStore(s => s.addNotification);
  
  const complaintsMap = useComplaintStore(state => state.complaints);
  const depots = useDataStore(state => state.depots);
  const { categoryLabel, routeName, formatDate } = useFormatters();

  const complaint = id ? complaintsMap[id] : null;

  // Dialog states
  const [activeDialog, setActiveDialog] = useState<null | 'assign' | 'requestInfo' | 'resolve' | 'reject' | 'transfer' | 'note' | 'contact'>(null);
  
  // Form states
  const [assignee, setAssignee] = useState('');
  const [infoQuestion, setInfoQuestion] = useState('');
  const [resolveAction, setResolveAction] = useState('');
  const [resolveNote, setResolveNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [transferDepotId, setTransferDepotId] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  if (!complaint) return <div className="p-4 sm:p-6 text-muted">Case not found</div>;
  if (complaint.depotId !== sessionDepotId) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-100 text-brand p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>This complaint belongs to another depot.</span>
        </div>
      </div>
    );
  }

  const displayRoute = routeName(complaint.routeNo);
  const displayCategory = categoryLabel(complaint.category);

  const handleAction = (statusUpdate: Partial<typeof complaint>, timelineEvent: { type: TimelineEvent['type'], message: string, internal?: boolean }, notificationBody?: string) => {
    if (!id) return;
    
    // Update repository
    repository.update(id, statusUpdate);
    repository.addTimelineEvent(id, {
      at: simNow,
      actor: 'DEPOT',
      actorName: depots.find(d => d.id === sessionDepotId)?.name,
      ...timelineEvent
    });

    if (notificationBody && complaint.complainant?.phone) {
      addNotification({
        id: Math.random().toString(36).substring(7),
        at: simNow,
        channel: 'SMS',
        to: complaint.complainant.phone,
        audience: 'PASSENGER',
        complaintId: id,
        template: 'CUSTOM',
        body: notificationBody
      });
    }

    toast.success(`Action applied: ${timelineEvent.message}`);
    setActiveDialog(null);
    resetForms();
  };

  const resetForms = () => {
    setAssignee(''); setInfoQuestion(''); setResolveAction(''); setResolveNote(''); setRejectReason(''); setRejectNote(''); setTransferDepotId(''); setTransferReason(''); setInternalNote(''); setContactMessage('');
  };

  const onAcknowledge = () => {
    handleAction({ status: 'ACKNOWLEDGED' }, { type: 'ACK', message: 'Case acknowledged by depot' }, 'Your complaint has been acknowledged by the depot.');
  };

  const onAssign = () => {
    if (!assignee) return toast.error('Select a staff member');
    handleAction({ status: 'IN_PROGRESS', assignedTo: assignee }, { type: 'ASSIGNED', message: `Assigned to ${assignee}` });
  };

  const onRequestInfo = () => {
    handleAction({ status: 'AWAITING_INFO', slaPausedTotalMs: complaint.slaPausedTotalMs }, { type: 'INFO_REQUEST', message: `Requested info: ${infoQuestion}` }, `Additional information required for your complaint: ${infoQuestion}`);
  };

  const onResolve = () => {
    handleAction({ status: 'RESOLVED' }, { type: 'RESOLVED', message: `Resolved (${resolveAction}): ${resolveNote}` }, `Your complaint has been resolved. Action: ${resolveAction}`);
  };

  const onReject = () => {
    handleAction({ status: 'REJECTED' }, { type: 'REJECTED', message: `Rejected (${rejectReason}): ${rejectNote}` }, `Your complaint was closed. Reason: ${rejectReason}`);
  };

  const onTransfer = () => {
    if (!transferDepotId || !transferReason) return toast.error('Depot and reason required');
    handleAction({ depotId: transferDepotId }, { type: 'TRANSFERRED', message: `Transferred to another depot: ${transferReason}` });
  };

  const onAddNote = () => {
    if (!internalNote) return toast.error('Note cannot be empty');
    handleAction({}, { type: 'NOTE', message: internalNote, internal: true });
  };

  const onContact = () => {
    if (!contactMessage) return toast.error('Message cannot be empty');
    handleAction({}, { type: 'NOTIFIED', message: `Sent SMS: ${contactMessage}`, internal: true }, contactMessage);
  };

  // Predict escalation
  const escTarget = new Date(complaint.resolveDeadline).getTime();
  const escDiff = escTarget - new Date(simNow).getTime();
  const escHours = Math.floor(Math.abs(escDiff) / 3600000);
  const escMins = Math.floor((Math.abs(escDiff) % 3600000) / 60000);
  const escText = escDiff > 0 ? `Will escalate to Regional Officer in ${escHours}h ${escMins}m` : `Escalated ${escHours}h ${escMins}m ago`;

  return (
    <div className="space-y-6">
      {/* Left and Right Columns */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Column */}
        <div className="flex-1 w-full space-y-6">
          <div className="bg-white p-6 rounded-lg border border-border shadow-sm">
            <div className="flex flex-wrap items-center gap-4 border-b border-border pb-4 mb-4">
              <h1 className="text-2xl font-semibold font-mono text-ink">{complaint.id}</h1>
              <StatusBadge status={complaint.status} />
              <EscalationLevelChip level={complaint.escalationLevel} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div>
                <span className="text-muted block mb-1">Category</span>
                <div className="flex items-center gap-2 font-medium">
                  <CategoryIcon category={complaint.category as CategoryId} className="w-5 h-5" />
                  {displayCategory}
                </div>
              </div>
              <div>
                <span className="text-muted block mb-1">Route & Bus</span>
                <div className="font-medium">{displayRoute}</div>
                {complaint.busNo && <div className="text-muted mt-0.5">{complaint.busNo}</div>}
              </div>
              <div>
                <span className="text-muted block mb-1">Incident Time</span>
                <div className="font-medium">{formatDate(complaint.incidentAt)}</div>
              </div>
              <div>
                <span className="text-muted block mb-1">Stop / Location</span>
                <div className="font-medium">{complaint.location.stopName ? capitalize(complaint.location.stopName) : ''}</div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <span className="text-muted block mb-2 text-sm">Description</span>
              <p className="text-ink text-sm whitespace-pre-wrap leading-relaxed">{complaint.description}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-border shadow-sm flex items-start gap-4">
            <UserCircle className="w-10 h-10 text-muted shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-ink">Passenger</h3>
              <div className="text-sm mt-2 flex flex-wrap gap-x-6 gap-y-2">
                <div>
                  <span className="text-muted">Phone:</span> <MaskedPhone phone={complaint.complainant?.phone} className="font-medium ml-1" />
                </div>
                <div>
                  <span className="text-muted">Language:</span> <span className="font-medium uppercase ml-1">{complaint.complainant?.lang || 'EN'}</span>
                </div>
              </div>
              <button onClick={() => setActiveDialog('contact')} className="mt-3 text-sm flex items-center gap-1.5 text-primary hover:underline font-medium">
                <MessageSquare className="w-4 h-4" /> Contact via system
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-border shadow-sm">
            <h3 className="font-semibold text-ink mb-6 border-b border-border pb-2">Timeline & Audit</h3>
            <Timeline events={complaint.timeline} />
          </div>
        </div>

        {/* Right Column (SLA & Actions) */}
        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
          
          <div className="bg-white p-5 rounded-lg border border-border shadow-sm">
            <h3 className="font-semibold text-ink mb-4">SLA Deadlines</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-muted block mb-1.5">Acknowledge By</span>
                {complaint.status === 'ASSIGNED_TO_DEPOT' ? (
                  <SlaTimer deadline={complaint.ackDeadline} />
                ) : (
                  <span className="text-sm font-medium text-ink flex items-center gap-1.5"><StatusBadge status="ACKNOWLEDGED" /></span>
                )}
              </div>
              <div>
                <span className="text-xs text-muted block mb-1.5">Resolve By</span>
                {!['RESOLVED', 'REJECTED'].includes(complaint.status) ? (
                  <SlaTimer deadline={complaint.resolveDeadline} pausedAt={complaint.status === 'AWAITING_INFO' ? simNow : undefined} />
                ) : (
                  <span className="text-sm font-medium text-ink flex items-center gap-1.5"><StatusBadge status={complaint.status} /></span>
                )}
                {complaint.escalationLevel === 0 && !['RESOLVED', 'REJECTED'].includes(complaint.status) && (
                  <p className="text-xs text-muted mt-2">{escText}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-border shadow-sm sticky top-6">
            <h3 className="font-semibold text-ink mb-4">Actions</h3>
            <div className="space-y-2">
              
              {complaint.status === 'ASSIGNED_TO_DEPOT' && (
                <button onClick={onAcknowledge} className="w-full py-2 bg-primary text-white text-sm font-medium rounded hover:opacity-90">
                  Acknowledge
                </button>
              )}

              {['ACKNOWLEDGED', 'IN_PROGRESS'].includes(complaint.status) && (
                <>
                  <button onClick={() => setActiveDialog('assign')} className="w-full py-2 bg-surface border border-border text-ink text-sm font-medium rounded hover:bg-muted/5">
                    Assign to staff
                  </button>
                  <button onClick={() => setActiveDialog('requestInfo')} className="w-full py-2 bg-surface border border-border text-ink text-sm font-medium rounded hover:bg-muted/5">
                    Request info
                  </button>
                </>
              )}

              {['IN_PROGRESS', 'ESCALATED'].includes(complaint.status) && (
                <button onClick={() => setActiveDialog('resolve')} className="w-full py-2 bg-green-600 text-white text-sm font-medium rounded hover:opacity-90">
                  Resolve
                </button>
              )}

              {!['RESOLVED', 'REJECTED'].includes(complaint.status) && (
                <>
                  <button onClick={() => setActiveDialog('reject')} className="w-full py-2 bg-surface border border-border text-brand text-sm font-medium rounded hover:bg-muted/5 mt-4">
                    Reject
                  </button>
                  <button onClick={() => setActiveDialog('transfer')} className="w-full py-2 bg-surface border border-border text-ink text-sm font-medium rounded hover:bg-muted/5">
                    Transfer depot
                  </button>
                </>
              )}

              <div className="pt-4 mt-4 border-t border-border">
                <button onClick={() => setActiveDialog('note')} className="w-full py-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium rounded hover:bg-amber-100 flex justify-center items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Add internal note
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Dialog Overlays */}
      {activeDialog && (
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            
            {activeDialog === 'assign' && (
              <>
                <h3 className="font-semibold text-lg mb-4">Assign to staff</h3>
                <select className="w-full border border-border rounded px-3 py-2 text-sm mb-4" value={assignee} onChange={e => setAssignee(e.target.value)}>
                  <option value="">Select staff member...</option>
                  <option value="Inspector A">Inspector A</option>
                  <option value="Inspector B">Inspector B</option>
                  <option value="Station Master">Station Master</option>
                  <option value="Duty Officer">Duty Officer</option>
                </select>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setActiveDialog(null)} className="px-4 py-2 text-sm font-medium bg-surface border border-border rounded">Cancel</button>
                  <button onClick={onAssign} className="px-4 py-2 text-sm font-medium bg-primary text-white rounded">Assign</button>
                </div>
              </>
            )}

            {activeDialog === 'requestInfo' && (
              <>
                <h3 className="font-semibold text-lg mb-4">Request info</h3>
                <textarea className={`w-full border rounded px-3 py-2 text-sm mb-1 h-24 ${!infoQuestion.trim() ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-border focus:ring-brand'}`} placeholder="Type your question..." value={infoQuestion} onChange={e => setInfoQuestion(e.target.value)} />
                {!infoQuestion.trim() && <p className="text-red-500 text-xs mb-4">Add a short note</p>}
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => setActiveDialog(null)} className="px-4 py-2 text-sm font-medium bg-surface border border-border rounded">Cancel</button>
                  <button onClick={onRequestInfo} disabled={!infoQuestion.trim()} className="px-4 py-2 text-sm font-medium bg-primary text-white rounded disabled:opacity-50">Send Request</button>
                </div>
              </>
            )}

            {activeDialog === 'resolve' && (
              <>
                <h3 className="font-semibold text-lg mb-4">Resolve Complaint</h3>
                <select className={`w-full border rounded px-3 py-2 text-sm mb-1 ${!resolveAction ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-border focus:ring-brand'}`} value={resolveAction} onChange={e => setResolveAction(e.target.value)}>
                  <option value="">Select action taken...</option>
                  <option value="Staff Warned">Staff Warned</option>
                  <option value="Penalty Imposed">Penalty Imposed</option>
                  <option value="Bus Repaired">Bus Repaired</option>
                  <option value="Other">Other</option>
                </select>
                {!resolveAction && <p className="text-red-500 text-xs mb-3">Choose the action taken</p>}
                
                <textarea className={`w-full border rounded px-3 py-2 text-sm mb-1 h-24 mt-2 ${!resolveNote.trim() ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-border focus:ring-brand'}`} placeholder="Detailed note..." value={resolveNote} onChange={e => setResolveNote(e.target.value)} />
                {!resolveNote.trim() && <p className="text-red-500 text-xs mb-4">Add a short note</p>}
                
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => setActiveDialog(null)} className="px-4 py-2 text-sm font-medium bg-surface border border-border rounded">Cancel</button>
                  <button onClick={onResolve} disabled={!resolveAction || !resolveNote.trim()} className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded disabled:opacity-50">Resolve Case</button>
                </div>
              </>
            )}

            {activeDialog === 'reject' && (
              <>
                <h3 className="font-semibold text-lg mb-4 text-brand">Reject Complaint</h3>
                <select className={`w-full border rounded px-3 py-2 text-sm mb-1 ${!rejectReason ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-border focus:ring-brand'}`} value={rejectReason} onChange={e => setRejectReason(e.target.value)}>
                  <option value="">Select rejection reason...</option>
                  <option value="Duplicate">Duplicate</option>
                  <option value="Insufficient Evidence">Insufficient Evidence</option>
                  <option value="False Claim">False Claim</option>
                  <option value="Out of Jurisdiction">Out of Jurisdiction</option>
                </select>
                {!rejectReason && <p className="text-red-500 text-xs mb-3">Choose the reason for rejection</p>}
                
                <textarea className="w-full border border-border rounded px-3 py-2 text-sm mb-4 h-24 mt-2" placeholder="Add a note (optional)..." value={rejectNote} onChange={e => setRejectNote(e.target.value)} />
                
                <div className="flex justify-end gap-2">
                  <button onClick={() => setActiveDialog(null)} className="px-4 py-2 text-sm font-medium bg-surface border border-border rounded">Cancel</button>
                  <button onClick={onReject} disabled={!rejectReason} className="px-4 py-2 text-sm font-medium bg-brand text-white rounded disabled:opacity-50">Reject Case</button>
                </div>
              </>
            )}

            {activeDialog === 'transfer' && (
              <>
                <h3 className="font-semibold text-lg mb-4">Transfer Depot</h3>
                <select className="w-full border border-border rounded px-3 py-2 text-sm mb-3" value={transferDepotId} onChange={e => setTransferDepotId(e.target.value)}>
                  <option value="">Select destination depot...</option>
                  {depots.map(d => (
                    <option key={d.id} value={d.id} disabled={d.id === sessionDepotId}>{d.name} ({d.id})</option>
                  ))}
                </select>
                <textarea className="w-full border border-border rounded px-3 py-2 text-sm mb-4 h-20" placeholder="Reason for transfer..." value={transferReason} onChange={e => setTransferReason(e.target.value)} />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setActiveDialog(null)} className="px-4 py-2 text-sm font-medium bg-surface border border-border rounded">Cancel</button>
                  <button onClick={onTransfer} className="px-4 py-2 text-sm font-medium bg-primary text-white rounded">Transfer</button>
                </div>
              </>
            )}

            {activeDialog === 'note' && (
              <>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-amber-600" /> Internal Note</h3>
                <textarea className="w-full border border-border rounded px-3 py-2 text-sm mb-4 h-24" placeholder="Type internal note..." value={internalNote} onChange={e => setInternalNote(e.target.value)} />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setActiveDialog(null)} className="px-4 py-2 text-sm font-medium bg-surface border border-border rounded">Cancel</button>
                  <button onClick={onAddNote} className="px-4 py-2 text-sm font-medium bg-amber-600 text-white rounded">Add Note</button>
                </div>
              </>
            )}

            {activeDialog === 'contact' && (
              <>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" /> Contact Passenger</h3>
                <p className="text-xs text-muted mb-3">This will send an SMS to the passenger's registered mobile number.</p>
                <textarea className="w-full border border-border rounded px-3 py-2 text-sm mb-4 h-24" placeholder="Type your message..." value={contactMessage} onChange={e => setContactMessage(e.target.value)} />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setActiveDialog(null)} className="px-4 py-2 text-sm font-medium bg-surface border border-border rounded">Cancel</button>
                  <button onClick={onContact} className="px-4 py-2 text-sm font-medium bg-primary text-white rounded">Send SMS</button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
