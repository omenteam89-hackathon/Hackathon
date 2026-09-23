import { useState } from 'react';
import { useClockStore } from '../../store/useClockStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useEngineStore } from '../../store/useEngineStore';
import { useDataStore } from '../../store/useDataStore';
import { useComplaintStore } from '../../store/useComplaintStore';
import { repository } from '../../data/repository';
import { generateComplaintId } from '../../domain/ids';
import { loadAppData } from '../../data/loaders';
import { Play, Pause, FastForward, RotateCcw, Plus, Mail, MessageSquare, ShieldAlert } from 'lucide-react';

export default function DemoPanel() {
  const { simNow, speed, running, setSpeed, toggleRunning, jump, reset: resetClock } = useClockStore();
  const { notifications } = useNotificationStore();
  const { logs } = useEngineStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleString('en-US', {
      day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', second: '2-digit'
    });
  };

  const createComplaint = () => {
    const id = generateComplaintId();
    repository.create({
      id,
      createdAt: simNow,
      incidentAt: simNow,
      routeNo: 'TVM-KZK-ORD',
      busNo: 'KL-15-A-1234',
      category: 'UNSAFE_DRIVING',
      location: { stopName: 'Pattom' },
      description: 'The driver was speeding and driving recklessly near Pattom stop.',
      evidence: [],
      complainant: { phone: '9000000001', lang: 'en' },
      depotId: 'TVM-CTY',
      status: 'ASSIGNED_TO_DEPOT',
      escalationLevel: 0,
      ackDeadline: new Date(new Date(simNow).getTime() + 12 * 60 * 60 * 1000).toISOString(),
      resolveDeadline: new Date(new Date(simNow).getTime() + 72 * 60 * 60 * 1000).toISOString(),
      slaPausedTotalMs: 0,
      verified: false,
      timeline: [
        {
          at: simNow,
          actor: 'PASSENGER',
          type: 'CREATED',
          message: 'Complaint submitted'
        },
        {
          at: simNow,
          actor: 'SYSTEM',
          type: 'ROUTED',
          message: `Routed to Thiruvananthapuram City depot using route TVM-KZK-ORD`
        }
      ]
    });
    alert(`Created complaint ${id}`);
  };

  const resetData = async () => {
    const res = await loadAppData();
    useComplaintStore.getState().clear();
    repository.seed(res.data.complaints);
    useDataStore.getState().setRouteMap(res.data.routeMap);
    useDataStore.getState().setDepots(res.data.depots);
    useDataStore.getState().setCategories(res.data.categories);
    resetClock();
    useNotificationStore.getState().clear();
    useEngineStore.getState().clear();
    setShowConfirm(false);
    alert('Data reset to sample data successfully.');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
          <ClockIcon /> Simulated Clock
        </h2>
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div>
            <div className="text-3xl font-mono font-bold text-ink">
              {formatTime(simNow)}
            </div>
            <div className="text-sm text-muted mt-1">Current Speed: {speed}x</div>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button onClick={toggleRunning} className="px-3 py-1.5 bg-surface border border-border rounded flex items-center gap-1 hover:bg-muted/10 text-sm">
                {running ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Play</>}
              </button>
              <button onClick={() => setSpeed(1)} className="px-3 py-1.5 bg-surface border border-border rounded hover:bg-muted/10 text-sm">1x</button>
              <button onClick={() => setSpeed(60)} className="px-3 py-1.5 bg-surface border border-border rounded hover:bg-muted/10 text-sm">60x</button>
              <button onClick={() => setSpeed(600)} className="px-3 py-1.5 bg-surface border border-border rounded hover:bg-muted/10 text-sm">600x</button>
              <button onClick={() => setSpeed(3600)} className="px-3 py-1.5 bg-surface border border-border rounded hover:bg-muted/10 text-sm">3600x</button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => jump(60 * 60 * 1000)} className="px-3 py-1.5 bg-surface border border-border rounded flex items-center gap-1 hover:bg-muted/10 text-sm">
                <FastForward className="w-4 h-4" /> +1h
              </button>
              <button onClick={() => jump(6 * 60 * 60 * 1000)} className="px-3 py-1.5 bg-surface border border-border rounded hover:bg-muted/10 text-sm">+6h</button>
              <button onClick={() => jump(24 * 60 * 60 * 1000)} className="px-3 py-1.5 bg-surface border border-border rounded hover:bg-muted/10 text-sm">+24h</button>
              <button onClick={() => jump(3 * 24 * 60 * 60 * 1000)} className="px-3 py-1.5 bg-surface border border-border rounded hover:bg-muted/10 text-sm">+3d</button>
              <button onClick={resetClock} className="px-3 py-1.5 bg-surface border border-border rounded flex items-center gap-1 hover:bg-muted/10 text-sm">
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-ink mb-4">Scenarios</h2>
        <div className="flex flex-wrap gap-4">
          <button onClick={createComplaint} className="px-4 py-2 bg-primary text-white rounded font-medium hover:opacity-90 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create unsafe-driving complaint on East Fort - Kazhakuttam
          </button>
          
          <div className="relative">
            {showConfirm ? (
              <div className="flex items-center gap-2">
                <button onClick={resetData} className="px-4 py-2 bg-brand text-white rounded font-medium">Confirm Reset</button>
                <button onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-surface border border-border rounded">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setShowConfirm(true)} className="px-4 py-2 bg-brand/10 text-brand rounded font-medium hover:bg-brand/20">
                Reset all data to sample data
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg border border-border p-6 shadow-sm h-96 flex flex-col">
          <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" /> Notification Outbox
          </h2>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {notifications.length === 0 ? (
              <p className="text-muted text-sm italic">No notifications sent yet.</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="p-3 bg-surface border border-border rounded-lg text-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold flex items-center gap-1">
                      {n.channel === 'SMS' ? <MessageSquare className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                      {n.channel} to {n.audience}
                    </span>
                    <span className="text-xs text-muted">{formatTime(n.at)}</span>
                  </div>
                  <div className="text-xs text-muted mb-1">To: {n.to} | Case: <span className="font-mono">{n.complaintId}</span></div>
                  <p className="text-ink mt-2 whitespace-pre-wrap">{n.body}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-6 shadow-sm h-96 flex flex-col">
          <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" /> Engine Log
          </h2>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 font-mono text-xs">
            {logs.length === 0 ? (
              <p className="text-muted italic">No escalations or engine events yet.</p>
            ) : (
              logs.map(log => (
                <div key={log.id} className="p-2 border-b border-border/50">
                  <span className="text-muted block mb-1">{formatTime(log.timestamp)}</span>
                  <span className="text-ink">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
