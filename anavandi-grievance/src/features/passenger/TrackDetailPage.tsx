import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { repository } from '../../data/repository';
import { useClockStore } from '../../store/useClockStore';
import { useComplaintStore } from '../../store/useComplaintStore';
import { useDataStore } from '../../store/useDataStore';
import Timeline from '../../shared/Timeline';
import StatusBadge from '../../shared/StatusBadge';
import CategoryIcon from '../../shared/CategoryIcon';
import { ArrowLeft, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn, formatAppDate } from '../../lib/utils';
import type { TimelineEvent } from '../../domain/types';

export default function TrackDetailPage() {
  const { id } = useParams<{ id: string }>();
  const simNow = useClockStore(s => s.simNow);
  const complaint = useComplaintStore(s => id ? s.complaints[id] : null);
  
  const categories = useDataStore(s => s.categories);
  const routeMap = useDataStore(s => s.routeMap);
  const [infoReply, setInfoReply] = useState('');
  
  if (!complaint) {
    return (
      <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-lg border border-border text-center">
        <p className="text-muted">Complaint not found.</p>
        <Link to="/track" className="text-primary mt-4 inline-block hover:underline">Go back to Tracking</Link>
      </div>
    );
  }

  // Stepper Logic
  const getStepStatus = (stepName: string) => {
    const s = complaint.status;
    
    switch (stepName) {
      case 'Submitted':
        return 'completed';
      case 'With depot':
        if (s === 'UNROUTED') return 'active';
        return 'completed';
      case 'In progress':
        if (['RESOLVED', 'REJECTED'].includes(s)) return 'completed';
        if (['IN_PROGRESS', 'AWAITING_INFO', 'ACKNOWLEDGED'].includes(s)) return 'active';
        if (s === 'REOPENED') return 'active';
        return 'pending';
      case 'Resolved':
        if (['RESOLVED', 'REJECTED'].includes(s)) return 'completed';
        return 'pending';
      default:
        return 'pending';
    }
  };

  const steps = [
    { name: 'Submitted', status: getStepStatus('Submitted') },
    { name: 'With depot', status: getStepStatus('With depot') },
    { name: 'In progress', status: getStepStatus('In progress') },
    { name: 'Resolved', status: getStepStatus('Resolved') }
  ];

  const passengerTimeline = complaint.timeline
    .filter(t => !t.internal)
    .map(t => {
      let actorName = t.actorName;
      if (t.actor === 'DEPOT') actorName = 'Depot officer';
      if (t.actor === 'REGIONAL') actorName = 'Regional officer';
      if (t.actor === 'HQ') actorName = 'Headquarters';
      return { ...t, actorName } as TimelineEvent;
    });

  const handleSubmitInfo = () => {
    if (!infoReply.trim() || !id) return;
    repository.addTimelineEvent(id, {
      at: simNow,
      actor: 'PASSENGER',
      actorName: 'Passenger',
      type: 'NOTE',
      message: `Provided information: ${infoReply}`
    });
    repository.update(id, { status: 'IN_PROGRESS' });
    setInfoReply('');
  };

  const handleReopen = () => {
    if (!id) return;
    repository.addTimelineEvent(id, {
      at: simNow,
      actor: 'PASSENGER',
      actorName: 'Passenger',
      type: 'REOPENED',
      message: 'Passenger reopened the complaint'
    });
    repository.update(id, { status: 'REOPENED' });
  };

  const isResolvedWithin7Days = () => {
    if (complaint.status !== 'RESOLVED') return false;
    const resolveEvent = complaint.timeline.slice().reverse().find(t => t.type === 'RESOLVED');
    if (!resolveEvent) return false;
    
    const resolveTime = new Date(resolveEvent.at).getTime();
    const now = new Date(simNow).getTime();
    const diff = now - resolveTime;
    return diff <= 7 * 24 * 60 * 60 * 1000;
  };

  return (
    <div className="max-w-3xl mx-auto mt-6 space-y-6 pb-12">
      <Link to="/track" className="inline-flex items-center text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to tracking
      </Link>

      <div className="bg-white p-6 rounded-lg border border-border shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold font-mono text-ink tracking-tight">{complaint.id}</h1>
            <p className="text-muted text-sm mt-1">Reported on {formatAppDate(complaint.createdAt)}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={complaint.status} className="text-base px-3 py-1.5 self-start md:self-auto" />
            {complaint.category && (
              <div className="text-sm font-medium flex items-center gap-1.5 text-muted bg-surface px-2 py-1 rounded">
                <CategoryIcon category={complaint.category as any} className="w-4 h-4" />
                {categories.find(c => c.id === complaint.category)?.label.en || complaint.category}
              </div>
            )}
            {complaint.routeNo && (
              <div className="text-sm font-medium text-muted bg-surface px-2 py-1 rounded">
                {routeMap.find(r => r.routeNo === complaint.routeNo)?.routeName || complaint.routeNo}
              </div>
            )}
          </div>
        </div>

        {/* Stepper */}
        <div className="relative pt-2 pb-6">
          <div className="flex justify-between relative z-10">
            {steps.map((step, idx) => (
              <div key={step.name} className="flex flex-col items-center gap-2 flex-1 relative">
                {idx !== steps.length - 1 && (
                  <div className={cn(
                    "absolute top-4 left-[50%] right-[-50%] h-0.5",
                    step.status === 'completed' ? "bg-primary" : "bg-border"
                  )} />
                )}
                
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center z-10 bg-white border-2",
                  step.status === 'completed' ? "border-primary bg-primary text-white" : 
                  step.status === 'active' ? "border-primary text-primary" : 
                  "border-border text-muted"
                )}>
                  {step.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : 
                   step.status === 'active' ? <Clock className="w-5 h-5" /> : 
                   <div className="w-2.5 h-2.5 rounded-full bg-border" />}
                </div>
                <span className={cn(
                  "text-xs md:text-sm font-medium whitespace-nowrap",
                  step.status === 'completed' || step.status === 'active' ? "text-ink" : "text-muted"
                )}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>

          {/* Escalation branch */}
          {complaint.escalationLevel > 0 && (
            <div className="absolute left-[50%] right-[25%] -bottom-4 md:-bottom-2 flex items-center justify-center">
              <div className="bg-red-50 text-brand text-xs font-semibold px-2 py-1 rounded-md border border-red-200 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Escalated to Regional Officer
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-border shadow-sm">
        <h2 className="font-semibold text-lg mb-6 border-b border-border pb-2">Timeline</h2>
        <Timeline events={passengerTimeline} />
      </div>

      {complaint.status === 'AWAITING_INFO' && (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg shadow-sm">
          <div className="flex gap-2 items-start mb-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">More information requested</h3>
              <p className="text-sm text-blue-800 mt-1">Please provide the requested information to help us resolve your complaint.</p>
            </div>
          </div>
          <textarea 
            className="w-full border border-blue-200 rounded px-3 py-2 text-sm h-24 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            placeholder="Type your response here..."
            value={infoReply}
            onChange={e => setInfoReply(e.target.value)}
          />
          <div className="mt-3 flex justify-end">
            <button 
              onClick={handleSubmitInfo}
              disabled={!infoReply.trim()}
              className="px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Information
            </button>
          </div>
        </div>
      )}

      {isResolvedWithin7Days() && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div>
            <h3 className="font-semibold text-amber-900">Not satisfied with the resolution?</h3>
            <p className="text-sm text-amber-800 mt-1">You can reopen this case within 7 days of resolution.</p>
          </div>
          <button 
            onClick={handleReopen}
            className="px-4 py-2 bg-white border border-amber-300 text-amber-900 font-medium text-sm rounded hover:bg-amber-100 whitespace-nowrap"
          >
            Reopen Complaint
          </button>
        </div>
      )}
    </div>
  );
}
