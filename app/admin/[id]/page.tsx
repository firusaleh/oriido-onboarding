'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function AdminDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [onboarding, setOnboarding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [interneNotizen, setInterneNotizen] = useState('');

  useEffect(() => {
    fetchOnboarding();
  }, [id]);

  const fetchOnboarding = async () => {
    try {
      const res = await fetch(`/api/onboarding/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOnboarding(data);
        setInterneNotizen(data.interneNotizen || '');
      } else {
        router.push('/admin');
      }
    } catch (error) {
      console.error('Error fetching onboarding:', error);
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/onboardings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        setOnboarding({ ...onboarding, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleNotizenSave = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/onboardings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interneNotizen }),
      });
      
      if (res.ok) {
        alert('Notizen gespeichert');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setUpdating(false);
    }
  };

  const copyVertragsdaten = () => {
    const text = `Firma: ${onboarding.geschaeftsdaten?.firmenname || '-'}
Rechtsform: ${onboarding.geschaeftsdaten?.rechtsform || '-'}
Inhaber: ${onboarding.kontakt?.inhaberName || '-'}
Steuernummer: ${onboarding.geschaeftsdaten?.steuernummer || '-'}
USt-ID: ${onboarding.geschaeftsdaten?.ustId || '-'}
IBAN: ${onboarding.geschaeftsdaten?.iban || '-'}
Adresse: ${onboarding.restaurant?.strasse || ''}, ${onboarding.restaurant?.plz || ''} ${onboarding.restaurant?.stadt || ''}`;
    
    navigator.clipboard.writeText(text);
    alert('Vertragsdaten kopiert!');
  };

  const copyOriidoDaten = () => {
    const text = `Restaurant: ${onboarding.restaurant?.name || '-'}
Adresse: ${onboarding.restaurant?.strasse || ''}, ${onboarding.restaurant?.plz || ''} ${onboarding.restaurant?.stadt || ''}
Kassensystem: ${onboarding.technik?.kassensystem || '-'}
Tische: ${onboarding.tische?.anzahlGesamt || '-'} (${onboarding.tische?.anzahlInnen || 0} Innen, ${onboarding.tische?.anzahlAussen || 0} Außen)
Sprachen: ${onboarding.speisekarte?.sprachen?.join(', ') || '-'}
Kontakt: ${onboarding.kontakt?.inhaberName || '-'}, ${onboarding.kontakt?.handynummer || '-'}`;
    
    navigator.clipboard.writeText(text);
    alert('Oriido-Daten kopiert!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!onboarding) return null;

  const InfoSection = ({ title, children }: any) => (
    <div className="bg-surface border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );

  const InfoRow = ({ label, value, copyable }: any) => {
    if (!value || value === '') return null;
    return (
      <div className="flex justify-between py-1">
        <span className="text-sm text-secondary">{label}:</span>
        <span className="text-sm text-primary font-medium">
          {value}
          {copyable && (
            <button
              onClick={() => navigator.clipboard.writeText(value)}
              className="ml-2 text-accent hover:text-accent-hover"
            >
              📋
            </button>
          )}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-surface border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin" className="text-sm text-secondary hover:text-primary mb-2 block">
                ← Zurück zur Übersicht
              </Link>
              <h1 className="text-xl font-bold">{onboarding.restaurant?.name || 'Unbenannt'}</h1>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={onboarding.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating}
                className="px-4 py-2 rounded-lg border bg-surface-hover"
              >
                <option value="entwurf">Entwurf</option>
                <option value="eingereicht">Eingereicht</option>
                <option value="in_bearbeitung">In Bearbeitung</option>
                <option value="abgeschlossen">Abgeschlossen</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Action Buttons */}
        <div className="bg-surface border border-border rounded-xl p-4 mb-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={copyVertragsdaten}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
            >
              📋 Vertragsdaten kopieren
            </button>
            <button
              onClick={copyOriidoDaten}
              className="px-4 py-2 bg-info hover:bg-info/80 text-white rounded-lg transition-colors"
            >
              📋 Oriido-Daten kopieren
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Restaurant */}
          <InfoSection title="Restaurant">
            <InfoRow label="Name" value={onboarding.restaurant?.name} />
            <InfoRow label="Adresse" value={`${onboarding.restaurant?.strasse || ''}, ${onboarding.restaurant?.plz || ''} ${onboarding.restaurant?.stadt || ''}`} />
            <InfoRow label="Art" value={onboarding.restaurant?.art} />
            <InfoRow label="Sitzplätze Innen" value={onboarding.restaurant?.sitzplaetzeInnen} />
            <InfoRow label="Sitzplätze Außen" value={onboarding.restaurant?.sitzplaetzeAussen} />
            {onboarding.restaurant?.googleMapsLink && (
              <div className="pt-2">
                <a
                  href={onboarding.restaurant.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-hover text-sm"
                >
                  📍 Auf Google Maps anzeigen
                </a>
              </div>
            )}
          </InfoSection>

          {/* Kontakt */}
          <InfoSection title="Kontakt">
            <InfoRow label="Inhaber/GF" value={onboarding.kontakt?.inhaberName} />
            <InfoRow label="Rolle" value={onboarding.kontakt?.inhaberRolle} />
            <InfoRow label="Telefon" value={onboarding.kontakt?.handynummer} copyable />
            <InfoRow label="E-Mail" value={onboarding.kontakt?.email} copyable />
            <InfoRow label="Bevorzugt" value={onboarding.kontakt?.bevorzugterKanal} />
            {onboarding.kontakt?.zweiterKontakt && (
              <>
                <div className="border-t border-border mt-2 pt-2">
                  <p className="text-sm font-medium mb-1">Zweiter Kontakt</p>
                </div>
                <InfoRow label="Name" value={onboarding.kontakt.zweiterKontakt.name} />
                <InfoRow label="Rolle" value={onboarding.kontakt.zweiterKontakt.rolle} />
                <InfoRow label="Telefon" value={onboarding.kontakt.zweiterKontakt.handynummer} copyable />
              </>
            )}
          </InfoSection>

          {/* Geschäftsdaten */}
          <InfoSection title="Geschäftsdaten">
            <InfoRow label="Firma" value={onboarding.geschaeftsdaten?.firmenname} copyable />
            <InfoRow label="Rechtsform" value={onboarding.geschaeftsdaten?.rechtsform} />
            <InfoRow label="Steuernummer" value={onboarding.geschaeftsdaten?.steuernummer} copyable />
            <InfoRow label="USt-ID" value={onboarding.geschaeftsdaten?.ustId} copyable />
            <InfoRow label="HRB" value={onboarding.geschaeftsdaten?.handelsregister} copyable />
            <InfoRow label="IBAN" value={onboarding.geschaeftsdaten?.iban} copyable />
            <InfoRow label="BIC" value={onboarding.geschaeftsdaten?.bic} copyable />
            <InfoRow label="Bank" value={onboarding.geschaeftsdaten?.bankname} />
          </InfoSection>

          {/* Technik */}
          <InfoSection title="Technik">
            <InfoRow label="Kassensystem" value={onboarding.technik?.kassensystem} />
            {onboarding.technik?.kassensystem === 'anderes' && (
              <InfoRow label="Welches" value={onboarding.technik?.kassensystemAnderes} />
            )}
            <InfoRow label="API-Zugang" value={onboarding.technik?.hatApiZugang} />
            <InfoRow label="WLAN" value={onboarding.technik?.wlanVorhanden ? 'Ja' : 'Nein'} />
            <InfoRow label="Tablet" value={onboarding.technik?.tabletImService ? 'Ja' : 'Nein'} />
            <InfoRow label="Internet" value={onboarding.technik?.internetAnbieter} />
          </InfoSection>

          {/* Tische */}
          <InfoSection title="Tische">
            <InfoRow label="Gesamt" value={onboarding.tische?.anzahlGesamt} />
            <InfoRow label="Innen" value={onboarding.tische?.anzahlInnen} />
            <InfoRow label="Außen" value={onboarding.tische?.anzahlAussen} />
            <InfoRow label="Nummerierung" value={onboarding.tische?.nummerierungVorhanden ? 'Ja' : 'Nein'} />
            <InfoRow label="Schema" value={onboarding.tische?.nummerierungSchema} />
            <InfoRow label="Besonderheiten" value={onboarding.tische?.besonderheiten} />
            {onboarding.tische?.grundrissFoto && (
              <div className="pt-2">
                <a
                  href={onboarding.tische.grundrissFoto}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-hover text-sm"
                >
                  🖼️ Grundriss anzeigen
                </a>
              </div>
            )}
          </InfoSection>

          {/* Speisekarte */}
          <InfoSection title="Speisekarte">
            <InfoRow label="Dateien" value={`${onboarding.speisekarte?.dateien?.length || 0} hochgeladen`} />
            <InfoRow label="Online-Link" value={onboarding.speisekarte?.onlineLink} />
            <InfoRow label="Mehrere Karten" value={onboarding.speisekarte?.mehrereKarten ? 'Ja' : 'Nein'} />
            <InfoRow label="Beschreibung" value={onboarding.speisekarte?.kartenBeschreibung} />
            <InfoRow label="Sprachen" value={onboarding.speisekarte?.sprachen?.join(', ')} />
            <InfoRow label="Logo" value={onboarding.speisekarte?.logo ? 'Hochgeladen' : 'Nein'} />
            <InfoRow label="Fotos" value={`${onboarding.speisekarte?.restaurantFotos?.length || 0} Fotos`} />
          </InfoSection>
        </div>

        {/* Vereinbarung */}
        <InfoSection title="Vereinbarung">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <InfoRow label="Paket" value="Standard (€179/Monat)" />
              <InfoRow label="Testphase" value={onboarding.vereinbarung?.testphase ? '30 Tage kostenlos' : 'Nein'} />
              <InfoRow label="Startdatum" value={onboarding.vereinbarung?.startdatum} />
              <InfoRow label="Sonderkonditionen" value={onboarding.vereinbarung?.sonderkonditionen} />
            </div>
            <div>
              <InfoRow label="DSGVO" value={onboarding.vereinbarung?.zustimmungDSGVO ? '✅ Zugestimmt' : '❌ Ausstehend'} />
              <InfoRow label="AGB" value={onboarding.vereinbarung?.zustimmungAGB ? '✅ Zugestimmt' : '❌ Ausstehend'} />
              <InfoRow label="Verkäufer" value={onboarding.vereinbarung?.unterschriftVerkaufer || onboarding.verkaeuferId} />
              <InfoRow label="Restaurant" value={onboarding.vereinbarung?.unterschriftRestaurant} />
            </div>
          </div>
          {onboarding.vereinbarung?.notizen && (
            <div className="mt-4 p-3 bg-surface-hover rounded-lg">
              <p className="text-sm font-medium mb-1">Notizen:</p>
              <p className="text-sm text-secondary">{onboarding.vereinbarung.notizen}</p>
            </div>
          )}
        </InfoSection>

        {/* Meta-Informationen */}
        <InfoSection title="Meta-Informationen">
          <InfoRow label="ID" value={onboarding._id} copyable />
          <InfoRow label="Erstellt am" value={format(new Date(onboarding.erstelltAm), 'dd.MM.yyyy HH:mm', { locale: de })} />
          {onboarding.eingereichtAm && (
            <InfoRow label="Eingereicht am" value={format(new Date(onboarding.eingereichtAm), 'dd.MM.yyyy HH:mm', { locale: de })} />
          )}
          <InfoRow label="Verkäufer" value={onboarding.verkaeuferId} />
        </InfoSection>

        {/* Interne Notizen */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Interne Notizen</h3>
          <textarea
            value={interneNotizen}
            onChange={(e) => setInterneNotizen(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border bg-surface-hover"
            rows={4}
            placeholder="Notizen für interne Zwecke..."
          />
          <button
            onClick={handleNotizenSave}
            disabled={updating}
            className="mt-3 px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {updating ? 'Speichert...' : 'Notizen speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}