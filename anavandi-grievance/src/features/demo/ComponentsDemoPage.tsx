import StatusBadge from '../../shared/StatusBadge';
import CategoryIcon from '../../shared/CategoryIcon';
import EscalationLevelChip from '../../shared/EscalationLevelChip';
import KpiCard from '../../shared/KpiCard';
import MaskedPhone from '../../shared/MaskedPhone';
import Timeline from '../../shared/Timeline';
import EmptyState from '../../shared/EmptyState';
import SlaTimer from '../../shared/SlaTimer';
import EvidenceThumb from '../../shared/EvidenceThumb';
import { Inbox } from 'lucide-react';

export default function ComponentsDemoPage() {
  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Shared Components Demo</h1>

      <section>
        <h2 className="text-lg font-semibold mb-4">StatusBadge</h2>
        <div className="flex flex-wrap gap-4">
          {(['SUBMITTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED'] as const).map(s => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">CategoryIcon</h2>
        <div className="flex gap-4">
          {(['CLEANLINESS', 'UNSAFE_DRIVING', 'OVERCROWDING', 'MISSED_STOP', 'CONCESSION_DENIAL'] as const).map(c => (
            <CategoryIcon key={c} category={c} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">EscalationLevelChip</h2>
        <div className="flex gap-4">
          {[0, 1, 2].map(l => (
            <EscalationLevelChip key={l} level={l} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">KpiCard</h2>
        <div className="grid grid-cols-3 gap-4">
          <KpiCard label="Open Cases" value={42} delta="+5" tone="negative" />
          <KpiCard label="Resolved" value="89%" delta="+2%" tone="positive" />
          <KpiCard label="Avg Response" value="2h 15m" />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">MaskedPhone</h2>
        <MaskedPhone phone="9876543210" />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">SlaTimer</h2>
        <div className="flex gap-4">
          <SlaTimer deadline="2026-09-24T10:00Z" />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">EvidenceThumb</h2>
        <div className="flex gap-4">
          <EvidenceThumb file={{ kind: 'image', dataUrl: 'https://placehold.co/100x100', name: 'photo.jpg' }} />
          <EvidenceThumb file={{ kind: 'video', dataUrl: '', name: 'video.mp4' }} />
          <EvidenceThumb file={{ kind: 'audio', dataUrl: '', name: 'audio.m4a' }} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Timeline</h2>
        <Timeline events={[
          { at: '2026-09-23T10:00:00Z', actor: 'PASSENGER', type: 'CREATED', message: 'Reported unsafe driving' },
          { at: '2026-09-23T10:05:00Z', actor: 'DEPOT', actorName: 'Depot Officer TVM', type: 'ACK', message: 'Assigned to investigation', internal: true },
        ]} />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">EmptyState</h2>
        <EmptyState icon={Inbox} title="No complaints" hint="Your inbox is currently empty. Great job!" />
      </section>
    </div>
  );
}
