'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { ArrowLeft } from 'lucide-react';

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

export default function AdminOnboardingsPage() {
  const router = useRouter();
  const [onboardings, setOnboardings] = useState<Onboarding[]>([]);
  const [filteredOnboardings, setFilteredOnboardings] = useState<Onboarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('alle');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    checkAuth();
    fetchOnboardings();
  }, []);

  useEffect(() => {
    filterOnboardings();
  }, [onboardings, activeFilter, searchTerm]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        if (data.role !== 'admin') {
          router.push('/dashboard');
        }
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/');
    }
  };

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

  const getStatusBadge = (status: string) => {
    const styles = {
      entwurf: 'bg-gray-100 text-gray-700 border-gray-300',
      eingereicht: 'bg-blue-100 text-blue-700 border-blue-300',
      in_bearbeitung: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      abgeschlossen: 'bg-green-100 text-green-700 border-green-300',
    };

    const labels = {
      entwurf: 'Entwurf',
      eingereicht: 'Eingereicht',
      in_bearbeitung: 'In Bearbeitung',
      abgeschlossen: 'Abgeschlossen',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.entwurf}`}>
        {labels[status as keyof typeof labels] || status}
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
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/admin')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold">Onboarding Verwaltung</h1>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Zurück zum Admin Dashboard
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white border rounded-lg p-3">
              <p className="text-xs text-gray-500">Gesamt</p>
              <p className="text-2xl font-bold">{stats.gesamt}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-600">Eingereicht</p>
              <p className="text-2xl font-bold text-blue-700">{stats.eingereicht}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-600">In Bearbeitung</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.in_bearbeitung}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-600">Abgeschlossen</p>
              <p className="text-2xl font-bold text-green-700">{stats.abgeschlossen}</p>
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
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
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
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredOnboardings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Keine Einreichungen gefunden</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Restaurant</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Stadt</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Kontakt</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Verkäufer</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Tische</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Datum</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOnboardings.map((onboarding) => (
                    <tr key={onboarding._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">
                        {onboarding.restaurant?.name || 'Unbenannt'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {onboarding.restaurant?.stadt || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {onboarding.kontakt?.inhaberName || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {onboarding.verkaeuferId}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {onboarding.tische?.anzahlGesamt || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {format(new Date(onboarding.erstelltAm), 'dd.MM.yy', { locale: de })}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(onboarding.status)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/${onboarding._id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
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