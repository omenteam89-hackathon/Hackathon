export default function TrackPage() {
  return (
    <div className="space-y-6 max-w-lg mx-auto bg-white p-6 rounded-lg border border-border shadow-sm">
      <h1 className="text-xl font-semibold text-ink">Track complaint</h1>
      <p className="text-sm text-muted">Enter your complaint reference number to check its status.</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Reference Number</label>
          <input type="text" className="w-full border border-border rounded px-3 py-2 text-sm bg-surface font-mono" placeholder="GRV-YYYY-NNNNNN" />
        </div>
        <button className="w-full py-2 bg-primary text-white font-medium rounded hover:opacity-90">
          Check Status
        </button>
      </div>
    </div>
  );
}
