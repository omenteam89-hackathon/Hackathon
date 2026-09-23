import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { repository } from '../../data/repository';

export default function TrackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [refNo, setRefNo] = useState(searchParams.get('id') || '');
  const [phoneLast4, setPhoneLast4] = useState('');
  const [error, setError] = useState('');

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!refNo.trim()) {
      setError('Please enter a reference number');
      return;
    }

    const complaint = repository.get(refNo.trim());
    if (!complaint) {
      setError('Complaint not found. Please check the reference number.');
      return;
    }

    if (complaint.complainant?.phone) {
      const actualLast4 = complaint.complainant.phone.slice(-4);
      if (phoneLast4 !== actualLast4) {
        setError('The last 4 digits of the phone number do not match our records.');
        return;
      }
    }

    navigate(`/track/${complaint.id}`);
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto bg-white p-6 rounded-lg border border-border shadow-sm mt-8">
      <h1 className="text-xl font-semibold text-ink">Track complaint</h1>
      <p className="text-sm text-muted">Enter your complaint reference number to check its status.</p>
      
      <form onSubmit={handleTrack} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Reference Number <span className="text-brand">*</span></label>
          <input 
            type="text" 
            className="w-full border border-border rounded px-3 py-2 text-sm bg-surface font-mono uppercase focus:outline-none focus:border-primary" 
            placeholder="e.g. GRV-2026-000123" 
            value={refNo}
            onChange={e => setRefNo(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Last 4 digits of Phone</label>
          <p className="text-xs text-muted mb-2">Only required if you provided a phone number.</p>
          <input 
            type="text" 
            maxLength={4}
            className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" 
            placeholder="e.g. 1234" 
            value={phoneLast4}
            onChange={e => setPhoneLast4(e.target.value.replace(/\D/g, ''))}
          />
        </div>

        {error && <p className="text-brand text-sm">{error}</p>}

        <button type="submit" className="w-full py-2 bg-primary text-white font-medium rounded hover:opacity-90">
          Check Status
        </button>
      </form>
    </div>
  );
}
