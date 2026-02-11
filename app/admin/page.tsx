'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Onboarding {
  _id: string;
  status: string;
  erstelltAm: string;
  eingereichtAm?: string;
  verkaeuferId: string;
  restaurant?: {
    name?: string;
    stadt?: string;
  };
  kontakt?: {
    inhaberName?: string;
  };
  tische?: {
    anzahlGesamt?: number;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const [onboardings, setOnboardings] = useState<Onboarding[]>([]);
  const [filteredOnboardings, setFilteredOnboardings] = useState<Onboarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('alle');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOnboardings();
  }, []);

  useEffect(() => {
    filterOnboardings();
  }, [onboardings, activeFilter, searchTerm]);

  const fetchOnboardings = async () => {
    try {
      const res = await fetch('/api/admin/onboardings');
      if (res.ok) {
        const data = await res.json();
        setOnboardings(data);
      }
    } catch (error) {
      console.error('Error fetching onboardings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOnboardings = () => {
    let filtered = onboardings;

    if (activeFilter !== 'alle') {
      filtered = filtered.filter(o => o.status === activeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(o => 
        o.restaurant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.restaurant?.stadt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOnboardings(filtered);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      entwurf: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      eingereicht: 'bg-accent/20 text-accent border-accent/30',
      in_bearbeitung: 'bg-info/20 text-info border-info/30',
      abgeschlossen: 'bg-success/20 text-success border-success/30',
    };

    const labels = {
      entwurf: 'Entwurf',
      eingereicht: 'Eingereicht',
      in_bearbeitung: 'In Bearbeitung',
      abgeschlossen: 'Abgeschlossen',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const stats = {
    gesamt: onboardings.length,
    eingereicht: onboardings.filter(o => o.status === 'eingereicht').length,
    in_bearbeitung: onboardings.filter(o => o.status === 'in_bearbeitung').length,
    abgeschlossen: onboardings.filter(o => o.status === 'abgeschlossen').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-accent">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="text-sm text-secondary hover:text-primary"
            >
              Abmelden
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-surface-hover border border-border rounded-lg p-3">
              <p className="text-xs text-secondary">Gesamt</p>
              <p className="text-2xl font-bold">{stats.gesamt}</p>
            </div>
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
              <p className="text-xs text-accent">Eingereicht</p>
              <p className="text-2xl font-bold text-accent">{stats.eingereicht}</p>
            </div>
            <div className="bg-info/10 border border-info/30 rounded-lg p-3">
              <p className="text-xs text-info">In Bearbeitung</p>
              <p className="text-2xl font-bold text-info">{stats.in_bearbeitung}</p>
            </div>
            <div className="bg-success/10 border border-success/30 rounded-lg p-3">
              <p className="text-xs text-success">Abgeschlossen</p>
              <p className="text-2xl font-bold text-success">{stats.abgeschlossen}</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {['alle', 'eingereicht', 'in_bearbeitung', 'abgeschlossen'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                  activeFilter === filter
                    ? 'bg-accent text-white border-accent'
                    : 'bg-surface-hover border-border hover:bg-border'
                }`}
              >
                {filter === 'alle' ? 'Alle' : 
                 filter === 'eingereicht' ? 'Eingereicht' :
                 filter === 'in_bearbeitung' ? 'In Bearbeitung' : 'Abgeschlossen'}
              </button>
            ))}
          </div>

          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Suche nach Restaurant oder Stadt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border bg-surface-hover"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
          </div>
        ) : filteredOnboardings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-secondary">Keine Einreichungen gefunden</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface-hover">
                    <th className="text-left px-4 py-3 text-sm font-medium text-secondary">Restaurant</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-secondary">Stadt</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-secondary">Kontakt</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-secondary">Verkäufer</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-secondary">Tische</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-secondary">Datum</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-secondary">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-secondary"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOnboardings.map((onboarding) => (
                    <tr key={onboarding._id} className="border-b border-border hover:bg-surface-hover">
                      <td className="px-4 py-3 font-medium">
                        {onboarding.restaurant?.name || 'Unbenannt'}
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary">
                        {onboarding.restaurant?.stadt || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary">
                        {onboarding.kontakt?.inhaberName || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary">
                        {onboarding.verkaeuferId}
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary">
                        {onboarding.tische?.anzahlGesamt || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary">
                        {format(new Date(onboarding.erstelltAm), 'dd.MM.yy', { locale: de })}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(onboarding.status)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/${onboarding._id}`}
                          className="text-accent hover:text-accent-hover font-medium"
                        >
                          Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}