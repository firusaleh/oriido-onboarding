'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Contract } from '@/lib/types/contract';

const STATUS_COLORS = {
  entwurf: 'bg-gray-500',
  versandt: 'bg-blue-500',
  teilweise_unterzeichnet: 'bg-yellow-500',
  vollstaendig_unterzeichnet: 'bg-green-500',
  abgelaufen: 'bg-red-500',
  storniert: 'bg-gray-700',
};

const STATUS_LABELS = {
  entwurf: 'Entwurf',
  versandt: 'Versandt',
  teilweise_unterzeichnet: 'Teilweise unterzeichnet',
  vollstaendig_unterzeichnet: 'Vollständig unterzeichnet',
  abgelaufen: 'Abgelaufen',
  storniert: 'Storniert',
};

export default function ContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await fetch('/api/contracts');
      if (response.ok) {
        const data = await response.json();
        setContracts(data);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesFilter = filter === 'all' || contract.status === filter;
    const matchesSearch = searchTerm === '' || 
      contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: contracts.length,
    entwurf: contracts.filter(c => c.status === 'entwurf').length,
    versandt: contracts.filter(c => c.status === 'versandt').length,
    unterzeichnet: contracts.filter(c => 
      c.status === 'vollstaendig_unterzeichnet' || c.status === 'teilweise_unterzeichnet'
    ).length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Verträge</h1>
            <p className="text-secondary mt-1">Verwalten Sie digitale Verträge</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/contracts/templates"
              className="px-4 py-2 bg-surface-hover border border-border rounded-lg hover:bg-border transition-colors"
            >
              Vorlagen
            </Link>
            <button
              onClick={() => router.push('/contracts/new')}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
            >
              + Neuer Vertrag
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface-dark rounded-lg p-4 border border-border">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-secondary text-sm">Gesamt</div>
          </div>
          <div className="bg-surface-dark rounded-lg p-4 border border-border">
            <div className="text-3xl font-bold text-gray-500">{stats.entwurf}</div>
            <div className="text-secondary text-sm">Entwürfe</div>
          </div>
          <div className="bg-surface-dark rounded-lg p-4 border border-border">
            <div className="text-3xl font-bold text-blue-500">{stats.versandt}</div>
            <div className="text-secondary text-sm">Versandt</div>
          </div>
          <div className="bg-surface-dark rounded-lg p-4 border border-border">
            <div className="text-3xl font-bold text-green-500">{stats.unterzeichnet}</div>
            <div className="text-secondary text-sm">Unterzeichnet</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Suchen nach Vertragsnummer oder Typ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 bg-surface-dark border border-border rounded-lg focus:border-accent focus:outline-none"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-surface-dark border border-border rounded-lg focus:border-accent focus:outline-none"
          >
            <option value="all">Alle Status</option>
            <option value="entwurf">Entwurf</option>
            <option value="versandt">Versandt</option>
            <option value="teilweise_unterzeichnet">Teilweise unterzeichnet</option>
            <option value="vollstaendig_unterzeichnet">Vollständig unterzeichnet</option>
            <option value="abgelaufen">Abgelaufen</option>
            <option value="storniert">Storniert</option>
          </select>
        </div>

        {/* Contracts List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-secondary">Lade Verträge...</div>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="bg-surface-dark rounded-lg p-12 text-center border border-border">
            <div className="text-secondary mb-4">Keine Verträge gefunden</div>
            <button
              onClick={() => router.push('/contracts/new')}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
            >
              Ersten Vertrag erstellen
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContracts.map((contract) => (
              <div
                key={contract._id}
                className="bg-surface-dark rounded-lg p-6 border border-border hover:border-accent/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/contracts/${contract._id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {contract.contractNumber}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs text-white ${STATUS_COLORS[contract.status]}`}>
                        {STATUS_LABELS[contract.status]}
                      </span>
                    </div>
                    <div className="text-secondary text-sm">
                      Typ: {contract.type} • 
                      Erstellt: {new Date(contract.createdAt!).toLocaleDateString('de-DE')}
                      {contract.validUntil && ` • Gültig bis: ${new Date(contract.validUntil).toLocaleDateString('de-DE')}`}
                    </div>
                    {contract.requiredSignatures && (
                      <div className="mt-2 flex gap-4 text-sm">
                        <span className="text-secondary">
                          Unterschriften: {contract.requiredSignatures.filter(s => s.signed).length}/{contract.requiredSignatures.length}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {contract.pdfUrl && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(contract.pdfUrl, '_blank');
                        }}
                        className="px-3 py-1 bg-surface-hover rounded hover:bg-border transition-colors text-sm"
                      >
                        PDF
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}