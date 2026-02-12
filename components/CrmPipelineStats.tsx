'use client';

interface PipelineStats {
  leads: number;
  inGespraech: number;
  gewonnen: number;
  verloren: number;
}

interface CrmPipelineStatsProps {
  stats: PipelineStats;
}

export default function CrmPipelineStats({ stats }: CrmPipelineStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      <div className="bg-surface border border-border rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-blue-500">{stats.leads}</div>
        <div className="text-xs text-secondary mt-1">Leads</div>
      </div>
      
      <div className="bg-surface border border-border rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-yellow-500">{stats.inGespraech}</div>
        <div className="text-xs text-secondary mt-1">In Gespräch</div>
      </div>
      
      <div className="bg-surface border border-border rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-success">{stats.gewonnen}</div>
        <div className="text-xs text-secondary mt-1">Gewonnen</div>
      </div>
      
      <div className="bg-surface border border-border rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-error">{stats.verloren}</div>
        <div className="text-xs text-secondary mt-1">Verloren</div>
      </div>
    </div>
  );
}