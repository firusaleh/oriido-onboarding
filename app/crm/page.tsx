'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CrmPipelineStats from '@/components/CrmPipelineStats';
import CrmRestaurantCard from '@/components/CrmRestaurantCard';
import CrmQuickAdd from '@/components/CrmQuickAdd';

export default function CrmPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('alle');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [draggedRestaurant, setDraggedRestaurant] = useState<any>(null);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          router.push('/');
          return;
        }
        const userData = await authRes.json();
        setUser(userData);

        // Load CRM data
        const crmRes = await fetch('/api/crm');
        if (crmRes.ok) {
          const data = await crmRes.json();
          setRestaurants(data);
          setFilteredRestaurants(data);
        }
      } catch (error) {
        console.error('Error:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [router]);

  useEffect(() => {
    let filtered = [...restaurants];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.adresse?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (activeFilter) {
      case 'leads':
        filtered = filtered.filter(r => r.status === 'lead');
        break;
      case 'inGespraech':
        filtered = filtered.filter(r => ['kontaktiert', 'termin', 'angebot'].includes(r.status));
        break;
      case 'gewonnen':
        filtered = filtered.filter(r => r.status === 'gewonnen');
        break;
      case 'verloren':
        filtered = filtered.filter(r => r.status === 'verloren');
        break;
      case 'followUp':
        filtered = filtered.filter(r => {
          if (!r.naechsterKontakt) return false;
          return new Date(r.naechsterKontakt) <= new Date();
        });
        break;
    }

    setFilteredRestaurants(filtered);
  }, [searchQuery, activeFilter, restaurants]);

  const calculateStats = () => {
    return {
      leads: restaurants.filter(r => r.status === 'lead').length,
      inGespraech: restaurants.filter(r => ['kontaktiert', 'termin', 'angebot'].includes(r.status)).length,
      gewonnen: restaurants.filter(r => r.status === 'gewonnen').length,
      verloren: restaurants.filter(r => r.status === 'verloren').length
    };
  };

  const handleAddRestaurant = async (data: any) => {
    try {
      const res = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        const newRestaurant = await res.json();
        setRestaurants([newRestaurant, ...restaurants]);
        setShowQuickAdd(false);
      }
    } catch (error) {
      console.error('Error adding restaurant:', error);
    }
  };

  const handleStatusUpdate = async (restaurantId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/crm/${restaurantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        const updatedRestaurant = await res.json();
        setRestaurants(restaurants.map(r => 
          r._id === restaurantId ? updatedRestaurant : r
        ));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDragStart = (restaurant: any) => {
    setDraggedRestaurant(restaurant);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (draggedRestaurant) {
      handleStatusUpdate(draggedRestaurant._id, status);
      setDraggedRestaurant(null);
    }
  };

  const getRestaurantsByStatus = (status: string) => {
    return filteredRestaurants.filter(r => r.status === status);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-primary">
              Meine <span className="text-accent">Pipeline</span>
            </h1>
            <button
              onClick={() => setShowQuickAdd(true)}
              className="bg-accent hover:bg-accent-hover text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold transition-colors"
            >
              +
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Restaurant suchen..."
              className="w-full px-4 py-3 pl-10 rounded-lg border bg-surface-hover border-border text-primary placeholder-secondary focus:border-accent outline-none"
            />
            <span className="absolute left-3 top-3.5 text-secondary">🔍</span>
          </div>
        </div>

        {/* Pipeline Stats */}
        <CrmPipelineStats stats={stats} />

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-accent text-white'
                : 'bg-surface border border-border text-secondary hover:bg-surface-hover'
            }`}
          >
            📋 Liste
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              viewMode === 'kanban'
                ? 'bg-accent text-white'
                : 'bg-surface border border-border text-secondary hover:bg-surface-hover'
            }`}
          >
            📊 Kanban
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'alle', label: 'Alle' },
            { id: 'leads', label: 'Leads' },
            { id: 'inGespraech', label: 'In Gespräch' },
            { id: 'gewonnen', label: 'Gewonnen' },
            { id: 'verloren', label: 'Verloren' },
            { id: 'followUp', label: 'Follow-Up fällig' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter.id
                  ? 'bg-accent text-white'
                  : 'bg-surface border border-border text-secondary hover:bg-surface-hover'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Restaurant List or Kanban Board */}
        {viewMode === 'list' ? (
          <div className="space-y-3">
            {filteredRestaurants.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🍽️</div>
                <h3 className="text-lg font-semibold text-primary mb-2">
                  {searchQuery || activeFilter !== 'alle' 
                    ? 'Keine Restaurants gefunden' 
                    : 'Noch keine Restaurants'}
                </h3>
                <p className="text-secondary">
                  {searchQuery || activeFilter !== 'alle'
                    ? 'Versuche andere Suchbegriffe oder Filter'
                    : 'Füge dein erstes Restaurant hinzu'}
                </p>
              </div>
            ) : (
              filteredRestaurants.map(restaurant => (
                <CrmRestaurantCard key={restaurant._id} restaurant={restaurant} />
              ))
            )}
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4">
            <div className="flex gap-3 min-w-[800px] pb-4">
              {[
                { status: 'lead', label: 'Neu', color: 'bg-blue-50 border-blue-200', emoji: '🆕' },
                { status: 'kontaktiert', label: 'Kontaktiert', color: 'bg-yellow-50 border-yellow-200', emoji: '📞' },
                { status: 'termin', label: 'Demo', color: 'bg-purple-50 border-purple-200', emoji: '🎯' },
                { status: 'angebot', label: 'Verhandlung', color: 'bg-orange-50 border-orange-200', emoji: '💬' },
                { status: 'gewonnen', label: 'Gewonnen', color: 'bg-green-50 border-green-200', emoji: '🎉' },
                { status: 'verloren', label: 'Verloren', color: 'bg-red-50 border-red-200', emoji: '❌' }
              ].map(column => (
                <div 
                  key={column.status}
                  className={`flex-1 min-w-[200px] ${column.color} border-2 rounded-lg p-3`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.status)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm text-gray-700">
                      {column.emoji} {column.label}
                    </h3>
                    <span className="bg-white px-2 py-0.5 rounded-full text-xs font-medium">
                      {getRestaurantsByStatus(column.status).length}
                    </span>
                  </div>
                  <div className="space-y-2 min-h-[200px]">
                    {getRestaurantsByStatus(column.status).map(restaurant => (
                      <div
                        key={restaurant._id}
                        draggable
                        onDragStart={() => handleDragStart(restaurant)}
                        className="bg-white p-3 rounded-lg shadow-sm cursor-move hover:shadow-md transition-shadow"
                        onClick={() => router.push(`/crm/${restaurant._id}`)}
                      >
                        <h4 className="font-medium text-sm text-gray-900 mb-1">
                          {restaurant.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {restaurant.adresse}
                        </p>
                        {restaurant.naechsterKontakt && (
                          <p className="text-xs text-orange-600 mt-2">
                            📅 {new Date(restaurant.naechsterKontakt).toLocaleDateString('de-DE')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <CrmQuickAdd
          onAdd={handleAddRestaurant}
          onClose={() => setShowQuickAdd(false)}
        />
      )}
    </div>
  );
}