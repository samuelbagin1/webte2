import { useEffect, useState } from 'react';

interface GameRecord {
  id: number;
  player1: string;
  player2: string;
  winner: string | null;
  played_at: string;
}

interface StatsPageProps {
  onBack: () => void;
}

export function StatsPage({ onBack }: StatsPageProps) {
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => {
        setRecords(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load statistics.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen bg-page px-4 py-10 gap-6">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Game History</h2>
          <button
            className="text-text-muted underline text-sm hover:text-text-secondary transition"
            onClick={onBack}
          >
            ← Back
          </button>
        </div>

        {loading && <p className="text-text-muted text-center py-12">Loading…</p>}
        {error && <p className="text-red-400 text-center py-12">{error}</p>}

        {!loading && !error && records.length === 0 && (
          <p className="text-text-muted text-center py-12">No games played yet.</p>
        )}

        {!loading && !error && records.length > 0 && (
          <div className="rounded-xl border border-border-default overflow-hidden bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default text-text-muted">
                  <th className="px-4 py-3 text-left font-medium">Player 1</th>
                  <th className="px-4 py-3 text-left font-medium">Player 2</th>
                  <th className="px-4 py-3 text-left font-medium">Winner</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-border-default last:border-0 hover:bg-subtle transition">
                    <td className="px-4 py-3 text-text-primary">{r.player1}</td>
                    <td className="px-4 py-3 text-text-primary">{r.player2}</td>
                    <td className="px-4 py-3 text-text-secondary font-medium">
                      {r.winner ?? <span className="text-text-muted">Draw</span>}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {new Date(r.played_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
