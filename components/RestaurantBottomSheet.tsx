'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface RestaurantBottomSheetProps {
  restaurant: any;
  onClose: () => void;
  onAddToPipeline: (restaurant: any, notiz?: string) => void;
}

export default function RestaurantBottomSheet({
  restaurant,
  onClose,
  onAddToPipeline
}: RestaurantBottomSheetProps) {
  const router = useRouter();
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');

  const handleAddToPipeline = () => {
    if (showNoteInput) {
      onAddToPipeline(restaurant, note);
    } else {
      setShowNoteInput(true);
    }
  };

  const getStatusBadge = (status?: string) => {
    const statusColors: { [key: string]: string } = {
      lead: 'bg-blue-500',
      kontaktiert: 'bg-yellow-500',
      termin: 'bg-orange-500',
      angebot: 'bg-purple-500',
      gewonnen: 'bg-green-500',
      verloren: 'bg-red-500'
    };

    const statusLabels: { [key: string]: string } = {
      lead: 'Lead',
      kontaktiert: 'Kontaktiert',
      termin: 'Termin',
      angebot: 'Angebot',
      gewonnen: 'Gewonnen',
      verloren: 'Verloren'
    };

    if (!status) return null;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs text-white ${statusColors[status]}`}>
        {statusLabels[status]}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25 }}
      className="fixed inset-x-0 bottom-0 bg-surface border-t border-border rounded-t-2xl shadow-xl z-50 max-h-[80vh] overflow-hidden"
    >
      <div className="p-4 space-y-4 overflow-y-auto max-h-[80vh] pb-20">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-primary">{restaurant.name}</h3>
            {restaurant.art && (
              <p className="text-sm text-secondary mt-1">{restaurant.art}</p>
            )}
            <p className="text-sm text-secondary mt-1">{restaurant.adresse}</p>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {restaurant.bewertung && (
          <div className="flex items-center gap-2">
            <span className="text-lg">⭐</span>
            <span className="font-semibold text-primary">{restaurant.bewertung}</span>
            {restaurant.anzahlBewertungen && (
              <span className="text-sm text-secondary">({restaurant.anzahlBewertungen} Bewertungen)</span>
            )}
          </div>
        )}

        {restaurant.status && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-secondary">Status:</span>
            {getStatusBadge(restaurant.status)}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {restaurant.telefon && (
            <a
              href={`tel:${restaurant.telefon}`}
              className="px-3 py-2 bg-surface border border-border rounded-lg text-sm hover:bg-surface-hover transition-colors text-center"
            >
              📞 Anrufen
            </a>
          )}
          
          {restaurant.telefon && (
            <a
              href={`https://wa.me/${restaurant.telefon.replace(/[^0-9+]/g, '')}`}
              className="px-3 py-2 bg-surface border border-border rounded-lg text-sm hover:bg-surface-hover transition-colors text-center"
            >
              💬 WhatsApp
            </a>
          )}
          
          {restaurant.website && (
            <a
              href={restaurant.website}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-surface border border-border rounded-lg text-sm hover:bg-surface-hover transition-colors text-center"
            >
              🌐 Website
            </a>
          )}
          
          {restaurant.googleMapsUrl && (
            <a
              href={restaurant.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-surface border border-border rounded-lg text-sm hover:bg-surface-hover transition-colors text-center"
            >
              📍 Route
            </a>
          )}
        </div>

        {restaurant.oeffnungszeiten && restaurant.oeffnungszeiten.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-semibold text-primary">Öffnungszeiten:</p>
            {restaurant.oeffnungszeiten.map((zeit: string, index: number) => (
              <p key={index} className="text-sm text-secondary">{zeit}</p>
            ))}
          </div>
        )}

        {restaurant.fotos && restaurant.fotos.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {restaurant.fotos.map((foto: string, index: number) => (
              <div key={index} className="relative h-24 w-32 flex-shrink-0">
                <Image
                  src={foto}
                  alt={`${restaurant.name} Foto ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                  unoptimized
                />
              </div>
            ))}
          </div>
        )}

        {!restaurant.status && (
          <div className="space-y-3">
            {showNoteInput && (
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Kurze Notiz (optional)..."
                className="w-full px-3 py-2 rounded-lg border bg-surface-hover border-border text-primary placeholder:text-secondary focus:border-accent outline-none"
                rows={3}
                autoFocus
              />
            )}
            
            <button
              onClick={handleAddToPipeline}
              className="w-full py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent-hover transition-colors"
            >
              {showNoteInput ? '💾 Speichern & zur Pipeline hinzufügen' : '➕ Zur Pipeline hinzufügen'}
            </button>
          </div>
        )}

        {restaurant.crmId && (
          <button
            onClick={() => router.push(`/crm/${restaurant.crmId}`)}
            className="w-full py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent-hover transition-colors"
          >
            📋 Im CRM öffnen
          </button>
        )}
      </div>
    </motion.div>
  );
}