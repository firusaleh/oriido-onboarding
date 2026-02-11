'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ZusammenfassungPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [onboarding, setOnboarding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchOnboarding = async () => {
      try {
        const res = await fetch(`/api/onboarding/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOnboarding(data);
        } else {
          router.push('/neu');
        }
      } catch (error) {
        console.error('Error fetching onboarding:', error);
        router.push('/neu');
      } finally {
        setLoading(false);
      }
    };

    fetchOnboarding();
  }, [id, router]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/onboarding/${id}/submit`, {
        method: 'POST',
      });

      if (res.ok) {
        router.push(`/neu/${id}/erfolg`);
      } else {
        alert('Fehler beim Einreichen. Bitte versuche es erneut.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Netzwerkfehler. Bitte versuche es erneut.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!onboarding) return null;

  const SummaryCard = ({ title, step, children }: any) => (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Link
          href={`/neu/${id}/${step}`}
          className="text-sm text-accent hover:text-accent-hover"
        >
          ✏️ Bearbeiten
        </Link>
      </div>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );

  const InfoRow = ({ label, value }: any) => {
    if (!value || value === '') return null;
    return (
      <div className="flex justify-between py-1">
        <span className="text-secondary">{label}:</span>
        <span className="text-primary font-medium">{value}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-surface border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-accent">Zusammenfassung</h1>
          <p className="text-sm text-secondary">Bitte prüfe alle Angaben vor dem Einreichen</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="space-y-4">
          {/* Restaurant */}
          <SummaryCard title="Restaurant-Infos" step={1}>
            <InfoRow label="Name" value={onboarding.restaurant?.name} />
            <InfoRow label="Adresse" value={`${onboarding.restaurant?.strasse}, ${onboarding.restaurant?.plz} ${onboarding.restaurant?.stadt}`} />
            <InfoRow label="Art" value={onboarding.restaurant?.art} />
            <InfoRow label="Sitzplätze Innen" value={onboarding.restaurant?.sitzplaetzeInnen} />
            <InfoRow label="Sitzplätze Außen" value={onboarding.restaurant?.sitzplaetzeAussen} />
          </SummaryCard>

          {/* Kontakt */}
          <SummaryCard title="Kontaktdaten" step={2}>
            <InfoRow label="Inhaber/GF" value={onboarding.kontakt?.inhaberName} />
            <InfoRow label="Rolle" value={onboarding.kontakt?.inhaberRolle} />
            <InfoRow label="Telefon" value={onboarding.kontakt?.handynummer} />
            <InfoRow label="E-Mail" value={onboarding.kontakt?.email} />
            <InfoRow label="Bevorzugter Kanal" value={onboarding.kontakt?.bevorzugterKanal} />
          </SummaryCard>

          {/* Geschäftsdaten */}
          <SummaryCard title="Geschäftsdaten" step={3}>
            <InfoRow label="Firma" value={onboarding.geschaeftsdaten?.firmenname} />
            <InfoRow label="Rechtsform" value={onboarding.geschaeftsdaten?.rechtsform} />
            <InfoRow label="Steuernummer" value={onboarding.geschaeftsdaten?.steuernummer} />
            <InfoRow label="USt-ID" value={onboarding.geschaeftsdaten?.ustId} />
            <InfoRow label="IBAN" value={onboarding.geschaeftsdaten?.iban} />
          </SummaryCard>

          {/* Technik */}
          <SummaryCard title="Technik" step={4}>
            <InfoRow label="Kassensystem" value={onboarding.technik?.kassensystem} />
            <InfoRow label="API-Zugang" value={onboarding.technik?.hatApiZugang} />
            <InfoRow label="WLAN" value={onboarding.technik?.wlanVorhanden ? 'Ja' : 'Nein'} />
            <InfoRow label="Tablet im Service" value={onboarding.technik?.tabletImService ? 'Ja' : 'Nein'} />
          </SummaryCard>

          {/* Tische */}
          <SummaryCard title="Tische" step={5}>
            <InfoRow label="Anzahl gesamt" value={onboarding.tische?.anzahlGesamt} />
            <InfoRow label="Innen" value={onboarding.tische?.anzahlInnen} />
            <InfoRow label="Außen" value={onboarding.tische?.anzahlAussen} />
            <InfoRow label="Nummerierung" value={onboarding.tische?.nummerierungVorhanden ? 'Ja' : 'Nein'} />
            {onboarding.tische?.nummerierungSchema && (
              <InfoRow label="Schema" value={onboarding.tische.nummerierungSchema} />
            )}
          </SummaryCard>

          {/* Speisekarte */}
          <SummaryCard title="Speisekarte" step={6}>
            <InfoRow label="Dateien hochgeladen" value={onboarding.speisekarte?.dateien?.length || 0} />
            <InfoRow label="Online-Link" value={onboarding.speisekarte?.onlineLink ? 'Ja' : 'Nein'} />
            <InfoRow label="Sprachen" value={onboarding.speisekarte?.sprachen?.join(', ')} />
            <InfoRow label="Logo" value={onboarding.speisekarte?.logo ? 'Hochgeladen' : 'Nein'} />
            <InfoRow label="Fotos" value={onboarding.speisekarte?.restaurantFotos?.length || 0} />
          </SummaryCard>

          {/* Vereinbarung */}
          <SummaryCard title="Vereinbarung" step={7}>
            <InfoRow label="Paket" value="Standard (€179/Monat)" />
            <InfoRow label="Testphase" value={onboarding.vereinbarung?.testphase ? '30 Tage kostenlos' : 'Nein'} />
            <InfoRow label="Startdatum" value={onboarding.vereinbarung?.startdatum} />
            <InfoRow label="DSGVO" value={onboarding.vereinbarung?.zustimmungDSGVO ? 'Zugestimmt' : 'Ausstehend'} />
            <InfoRow label="AGB" value={onboarding.vereinbarung?.zustimmungAGB ? 'Zugestimmt' : 'Ausstehend'} />
          </SummaryCard>
        </div>

        <div className="mt-8 bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Bereit zum Einreichen?</h3>
          <p className="text-secondary mb-6">
            Bitte überprüfe alle Angaben sorgfältig. Nach dem Einreichen erhält Firas eine
            Benachrichtigung und wird sich um den Rest kümmern.
          </p>
          <div className="flex gap-4">
            <Link
              href={`/neu/${id}/7`}
              className="px-6 py-3 bg-surface-hover hover:bg-border text-primary font-semibold rounded-lg transition-colors"
            >
              Zurück
            </Link>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 px-8 py-4 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-lg transition-colors"
            >
              {submitting ? 'Wird eingereicht...' : 'Alles korrekt – Jetzt einreichen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}