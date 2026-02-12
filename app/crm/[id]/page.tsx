'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, differenceInDays, isBefore, isToday } from 'date-fns';
import { de } from 'date-fns/locale';
import Link from 'next/link';

export default function CrmDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteForm, setNoteForm] = useState({ text: '', typ: 'notiz' });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadRestaurant();
  }, []);

  const loadRestaurant = async () => {
    try {
      const res = await fetch(`/api/crm/${params.id}`);
      if (!res.ok) {
        router.push('/crm');
        return;
      }
      const data = await res.json();
      setRestaurant(data);
    } catch (error) {
      console.error('Error:', error);
      router.push('/crm');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteForm.text.trim()) return;

    try {
      const res = await fetch(`/api/crm/${params.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteForm)
      });

      if (res.ok) {
        await loadRestaurant();
        setNoteForm({ text: '', typ: 'notiz' });
        setShowNoteForm(false);
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const body: any = { status: newStatus };
      if (newStatus === 'verloren') {
        const grund = prompt('Grund für die Absage:');
        if (!grund) return;
        body.absageGrund = grund;
      }

      const res = await fetch(`/api/crm/${params.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        await loadRestaurant();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Restaurant wirklich löschen?')) return;

    try {
      const res = await fetch(`/api/crm/${params.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        router.push('/crm');
      }
    } catch (error) {
      console.error('Error deleting restaurant:', error);
    }
  };

  const getFollowUpStatus = () => {
    if (!restaurant?.naechsterKontakt) return null;
    
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

  const getNoteIcon = (typ: string) => {
    const icons: { [key: string]: string } = {
      notiz: '📝',
      anruf: '📞',
      besuch: '🚶',
      email: '📧',
      whatsapp: '💬'
    };
    return icons[typ] || '📝';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!restaurant) return null;

  const followUp = getFollowUpStatus();

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="pt-4">
          <Link href="/crm" className="text-secondary hover:text-primary mb-4 inline-block">
            ← Zurück zur Pipeline
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">{restaurant.name}</h1>
              {restaurant.art && (
                <span className="inline-block px-2 py-1 text-sm bg-secondary/20 text-secondary rounded-md mt-2">
                  {restaurant.art}
                </span>
              )}
            </div>
            
            <select
              value={restaurant.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-1 rounded-lg border bg-surface-hover border-border text-primary text-sm focus:border-accent outline-none"
            >
              <option value="lead">Lead</option>
              <option value="kontaktiert">Kontaktiert</option>
              <option value="termin">Termin</option>
              <option value="angebot">Angebot</option>
              <option value="gewonnen">Gewonnen</option>
              <option value="verloren">Verloren</option>
              <option value="spaeter">Später</option>
            </select>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-4">
            {restaurant.telefon && (
              <a
                href={`tel:${restaurant.telefon}`}
                className="px-3 py-2 bg-surface border border-border rounded-lg text-sm hover:bg-surface-hover transition-colors"
              >
                📞 Anrufen
              </a>
            )}
            {restaurant.telefon && (
              <a
                href={`https://wa.me/${restaurant.telefon.replace(/[^0-9+]/g, '')}`}
                className="px-3 py-2 bg-surface border border-border rounded-lg text-sm hover:bg-surface-hover transition-colors"
              >
                💬 WhatsApp
              </a>
            )}
            {restaurant.googleMapsLink && (
              <a
                href={restaurant.googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-surface border border-border rounded-lg text-sm hover:bg-surface-hover transition-colors"
              >
                📍 Maps
              </a>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-primary">Informationen</h3>
          
          {restaurant.adresse && (
            <div className="text-sm">
              <span className="text-secondary">Adresse:</span>
              <span className="text-primary ml-2">{restaurant.adresse}</span>
            </div>
          )}
          
          {restaurant.ansprechpartner && (
            <div className="text-sm">
              <span className="text-secondary">Ansprechpartner:</span>
              <span className="text-primary ml-2">{restaurant.ansprechpartner}</span>
            </div>
          )}
          
          {restaurant.telefon && (
            <div className="text-sm">
              <span className="text-secondary">Telefon:</span>
              <span className="text-primary ml-2">{restaurant.telefon}</span>
            </div>
          )}
          
          {restaurant.email && (
            <div className="text-sm">
              <span className="text-secondary">E-Mail:</span>
              <span className="text-primary ml-2">{restaurant.email}</span>
            </div>
          )}
          
          {restaurant.anzahlTische && (
            <div className="text-sm">
              <span className="text-secondary">Anzahl Tische:</span>
              <span className="text-primary ml-2">{restaurant.anzahlTische}</span>
            </div>
          )}
          
          {restaurant.kassensystem && (
            <div className="text-sm">
              <span className="text-secondary">Kassensystem:</span>
              <span className="text-primary ml-2">{restaurant.kassensystem}</span>
            </div>
          )}
        </div>

        {/* Follow-Up Section */}
        {followUp && (
          <div className="bg-surface border border-border rounded-xl p-4">
            <h3 className="font-semibold text-primary mb-2">Follow-Up</h3>
            <div className={`text-sm font-medium ${followUp.color}`}>
              {followUp.text}
            </div>
            <div className="text-sm text-secondary mt-1">
              {format(new Date(restaurant.naechsterKontakt), 'dd.MM.yyyy', { locale: de })}
            </div>
          </div>
        )}

        {/* Notes Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-primary">Notizen & Aktivitäten</h3>
            <button
              onClick={() => setShowNoteForm(!showNoteForm)}
              className="text-accent hover:text-accent-hover text-sm font-medium"
            >
              + Notiz hinzufügen
            </button>
          </div>

          {/* Note Form */}
          {showNoteForm && (
            <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
              <div className="flex gap-2">
                {['notiz', 'anruf', 'besuch', 'email', 'whatsapp'].map(typ => (
                  <button
                    key={typ}
                    onClick={() => setNoteForm({ ...noteForm, typ })}
                    className={`p-2 rounded-lg transition-colors ${
                      noteForm.typ === typ
                        ? 'bg-accent text-white'
                        : 'bg-surface-hover text-secondary hover:bg-border'
                    }`}
                  >
                    {getNoteIcon(typ)}
                  </button>
                ))}
              </div>
              
              <textarea
                value={noteForm.text}
                onChange={(e) => setNoteForm({ ...noteForm, text: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border bg-surface-hover border-border text-primary focus:border-accent outline-none"
                rows={3}
                placeholder="Was ist passiert?"
                autoFocus
              />
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowNoteForm(false);
                    setNoteForm({ text: '', typ: 'notiz' });
                  }}
                  className="flex-1 py-2 px-4 bg-surface border border-border rounded-lg text-secondary hover:bg-surface-hover transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleAddNote}
                  className="flex-1 py-2 px-4 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
                >
                  Speichern
                </button>
              </div>
            </div>
          )}

          {/* Notes List */}
          <div className="space-y-3">
            {restaurant.notizen?.length === 0 ? (
              <div className="text-center py-8 text-secondary">
                Noch keine Notizen vorhanden
              </div>
            ) : (
              restaurant.notizen?.map((note: any, index: number) => (
                <div key={index} className="bg-surface border border-border rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getNoteIcon(note.typ)}</span>
                    <div className="flex-1">
                      <div className="text-sm text-secondary mb-1">
                        {format(new Date(note.datum), 'dd.MM.yyyy HH:mm', { locale: de })}
                      </div>
                      <div className="text-primary">{note.text}</div>
                    </div>
                  </div>
                </div>
              )).reverse()
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {restaurant.status === 'gewonnen' && (
            <Link
              href={`/neu?restaurant=${encodeURIComponent(restaurant.name)}`}
              className="block w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-4 rounded-xl text-center transition-colors"
            >
              🚀 Onboarding starten
            </Link>
          )}
          
          <button
            onClick={handleDelete}
            className="w-full bg-error/20 text-error hover:bg-error/30 font-medium py-3 px-4 rounded-xl transition-colors"
          >
            🗑️ Restaurant löschen
          </button>
        </div>
      </div>
    </div>
  );
}