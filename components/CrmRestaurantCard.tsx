'use client';

import { format, differenceInDays, isAfter, isBefore, isToday } from 'date-fns';
import { de } from 'date-fns/locale';
import Link from 'next/link';

interface Restaurant {
  _id: string;
  name: string;
  adresse?: string;
  art?: string;
  ansprechpartner?: string;
  telefon?: string;
  status: string;
  naechsterKontakt?: string;
  notizen: Array<{ text: string; datum: string; typ: string }>;
}

interface CrmRestaurantCardProps {
  restaurant: Restaurant;
}

export default function CrmRestaurantCard({ restaurant }: CrmRestaurantCardProps) {
  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: string } = {
      lead: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
      kontaktiert: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      termin: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
      angebot: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
      gewonnen: 'bg-success/20 text-success border-success/30',
      verloren: 'bg-error/20 text-error border-error/30',
      spaeter: 'bg-secondary/20 text-secondary border-secondary/30'
    };
    return badges[status] || 'bg-secondary/20 text-secondary border-secondary/30';
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      lead: 'Lead',
      kontaktiert: 'Kontaktiert',
      termin: 'Termin',
      angebot: 'Angebot',
      gewonnen: 'Gewonnen',
      verloren: 'Verloren',
      spaeter: 'Später'
    };
    return labels[status] || status;
  };

  const getFollowUpStatus = () => {
    if (!restaurant.naechsterKontakt) return null;
    
    const followUpDate = new Date(restaurant.naechsterKontakt);
    const today = new Date();
    
    if (isToday(followUpDate)) {
      return { text: 'Heute', color: 'text-orange-500' };
    } else if (isBefore(followUpDate, today)) {
      const days = Math.abs(differenceInDays(followUpDate, today));
      return { text: `⚠️ Überfällig seit ${days} Tag${days !== 1 ? 'en' : ''}`, color: 'text-error' };
    } else {
      const days = differenceInDays(followUpDate, today);
      return { text: `In ${days} Tag${days !== 1 ? 'en' : ''}`, color: 'text-success' };
    }
  };

  const followUp = getFollowUpStatus();
  const lastNote = restaurant.notizen?.length > 0 ? restaurant.notizen[0] : null;

  return (
    <Link href={`/crm/${restaurant._id}`}>
      <div className="bg-surface border border-border rounded-xl p-4 hover:bg-surface-hover transition-colors cursor-pointer">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-primary">
                {restaurant.name}
              </h3>
              {restaurant.art && (
                <span className="inline-block px-2 py-0.5 text-xs bg-secondary/20 text-secondary rounded-md mt-1">
                  {restaurant.art}
                </span>
              )}
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getStatusBadge(restaurant.status)}`}>
              {getStatusLabel(restaurant.status)}
            </span>
          </div>

          {/* Info */}
          <div className="space-y-1 text-sm">
            {restaurant.adresse && (
              <div className="text-secondary">{restaurant.adresse}</div>
            )}
            {restaurant.ansprechpartner && (
              <div className="flex items-center gap-2">
                <span className="text-secondary">👤 {restaurant.ansprechpartner}</span>
                {restaurant.telefon && (
                  <a 
                    href={`tel:${restaurant.telefon}`} 
                    className="text-accent hover:text-accent-hover"
                    onClick={(e) => e.stopPropagation()}
                  >
                    📞 {restaurant.telefon}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Last Note */}
          {lastNote && (
            <div className="text-sm text-secondary truncate">
              {lastNote.text}
            </div>
          )}

          {/* Follow-Up */}
          {followUp && (
            <div className={`text-sm font-medium ${followUp.color}`}>
              Follow-Up: {followUp.text}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}