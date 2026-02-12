'use client';

interface RestaurantListCardProps {
  restaurant: any;
  onClick: () => void;
  onAddToPipeline?: () => void;
  selected?: boolean;
  onSelectForRoute?: (id: string) => void;
}

export default function RestaurantListCard({
  restaurant,
  onClick,
  onAddToPipeline,
  selected,
  onSelectForRoute
}: RestaurantListCardProps) {
  const getStatusColor = (status?: string) => {
    switch(status) {
      case 'lead': return 'bg-blue-500';
      case 'kontaktiert':
      case 'termin':
      case 'angebot': return 'bg-orange-500';
      case 'gewonnen': return 'bg-green-500';
      case 'verloren': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div 
      className={`bg-surface border border-border rounded-xl p-4 hover:bg-surface-hover transition-colors cursor-pointer ${
        selected ? 'ring-2 ring-accent' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-3 h-3 rounded-full mt-1.5 ${getStatusColor(restaurant.status)}`} />
        
        <div className="flex-1" onClick={onClick}>
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-primary">{restaurant.name}</h4>
              <p className="text-sm text-secondary mt-1">
                {restaurant.adresse}
                {restaurant.entfernung && ` · ${Math.round(restaurant.entfernung)}m`}
                {restaurant.art && ` · ${restaurant.art}`}
              </p>
              {restaurant.telefon && (
                <p className="text-sm text-secondary mt-1">📞 {restaurant.telefon}</p>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {restaurant.bewertung && (
                <>
                  <span className="text-sm">⭐</span>
                  <span className="text-sm font-medium text-primary">{restaurant.bewertung}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-secondary">
              Status: {restaurant.status || 'Unbekannt'}
            </span>
            
            <div className="flex gap-2">
              {onSelectForRoute && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectForRoute(restaurant.placeId);
                  }}
                  className="p-1.5 hover:bg-border rounded-lg transition-colors"
                  title="Zur Route hinzufügen"
                >
                  {selected ? '✓' : '○'}
                </button>
              )}
              
              {!restaurant.status ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToPipeline?.();
                  }}
                  className="p-1.5 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
                  title="Zur Pipeline hinzufügen"
                >
                  ➕
                </button>
              ) : restaurant.crmId ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                  }}
                  className="p-1.5 bg-surface-hover text-primary rounded-lg hover:bg-border transition-colors"
                  title="Details anzeigen"
                >
                  📋
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}