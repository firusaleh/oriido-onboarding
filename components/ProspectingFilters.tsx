'use client';

import { useState, useRef, useEffect } from 'react';

interface ProspectingFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (query: string) => void;
  filter: string;
  setFilter: (filter: string) => void;
  onLocationClick: () => void;
}

export default function ProspectingFilters({
  searchQuery,
  setSearchQuery,
  onSearch,
  filter,
  setFilter,
  onLocationClick
}: ProspectingFiltersProps) {
  const filters = [
    { id: 'all', label: 'Alle' },
    { id: 'nicht_besucht', label: 'Nicht besucht' },
    { id: 'in_pipeline', label: 'In Pipeline' },
    { id: 'gewonnen', label: 'Gewonnen' },
    { id: 'verloren', label: 'Verloren' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="p-4 space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Restaurants suchen..."
            className="w-full px-4 py-3 rounded-lg border bg-surface border-border text-primary placeholder:text-secondary focus:border-accent outline-none"
          />
        </div>
        <button
          type="button"
          onClick={onLocationClick}
          className="px-4 py-3 bg-surface border border-border rounded-lg hover:bg-surface-hover transition-colors"
          title="Aktueller Standort"
        >
          📍
        </button>
        <button
          type="submit"
          className="px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
        >
          Suchen
        </button>
      </form>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              filter === f.id
                ? 'bg-accent text-white'
                : 'bg-surface border border-border text-secondary hover:bg-surface-hover'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}