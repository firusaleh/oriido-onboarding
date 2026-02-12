'use client';

interface ProspectingStatsProps {
  stats: {
    total: number;
    leads: number;
    gewonnen: number;
  };
}

export default function ProspectingStats({ stats }: ProspectingStatsProps) {
  return (
    <div className="absolute top-2 left-2 right-2 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-2 z-10">
      <div className="flex justify-around text-sm">
        <div className="text-center">
          <span className="text-secondary">📍</span>
          <span className="ml-1 font-semibold text-primary">{stats.total}</span>
          <span className="ml-1 text-secondary">gefunden</span>
        </div>
        <div className="text-center">
          <span className="text-secondary">🔵</span>
          <span className="ml-1 font-semibold text-primary">{stats.leads}</span>
          <span className="ml-1 text-secondary">Leads</span>
        </div>
        <div className="text-center">
          <span className="text-secondary">🟢</span>
          <span className="ml-1 font-semibold text-primary">{stats.gewonnen}</span>
          <span className="ml-1 text-secondary">gewonnen</span>
        </div>
      </div>
    </div>
  );
}