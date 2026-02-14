'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WizardStep from '@/components/WizardStep';
import SignaturePad from '@/components/contracts/SignaturePad';
import { generateContractPDF, downloadPDF } from '@/lib/utils/pdf-generator';

interface Props {
  id: string;
  onboardingData: any;
  onPrevious: () => void;
  onComplete: () => void;
}

export default function Step8Vertrag({ id, onboardingData, onPrevious, onComplete }: Props) {
  const router = useRouter();
  const [contractId, setContractId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [signatures, setSignatures] = useState<any[]>([]);
  const [contractContent, setContractContent] = useState('');
  const [pdfGenerated, setPdfGenerated] = useState(false);

  useEffect(() => {
    generateContractContent();
  }, [onboardingData]);

  const generateContractContent = () => {
    const { restaurant, kontakt, geschaeftsdaten, vereinbarung } = onboardingData;
    
    const content = `
PARTNERVERTRAG

zwischen

Oriido GmbH
Musterstraße 123
12345 Berlin
(nachfolgend "Oriido" genannt)

und

${geschaeftsdaten?.firmenname || '[Firmenname]'}
${restaurant?.strasse || '[Straße]'}
${restaurant?.plz || '[PLZ]'} ${restaurant?.stadt || '[Stadt]'}
(nachfolgend "Partner" genannt)

§1 Vertragsgegenstand

Oriido stellt dem Partner eine digitale Bestellplattform zur Verfügung, über die Kunden Bestellungen aufgeben können. Der Partner verpflichtet sich, die über die Plattform eingehenden Bestellungen anzunehmen und auszuführen.

§2 Leistungen von Oriido

- Bereitstellung der digitalen Bestellplattform
- QR-Codes für ${onboardingData.tische?.anzahlGesamt || '[Anzahl]'} Tische
- Digitale Speisekarte in ${onboardingData.speisekarte?.sprachen?.length || 1} Sprachen
- Technischer Support
- Monatliche Abrechnungen

§3 Vergütung

${vereinbarung?.preismodell === 'payPerOrder' ? 
`Der Partner zahlt eine Provision von €0,45 pro erfolgreich abgewickelter Bestellung.
Einmalige Einrichtungsgebühr: €${vereinbarung?.setupGebuehr || 300}` :
`Der Partner zahlt eine monatliche Pauschale von €279.
Bei jährlicher Zahlung: €2.150 (Ersparnis: €1.198)
Einmalige Einrichtungsgebühr: €${vereinbarung?.setupGebuehr || 300}`}

Testphase: Die ersten 100 Bestellungen sind kostenfrei.

§4 Vertragslaufzeit

Der Vertrag beginnt mit der Unterzeichnung und läuft auf unbestimmte Zeit.
Kündigungsfrist: 1 Monat zum Monatsende.

§5 Datenschutz

Beide Parteien verpflichten sich zur Einhaltung der geltenden Datenschutzbestimmungen, insbesondere der DSGVO.

§6 Schlussbestimmungen

Änderungen und Ergänzungen dieses Vertrages bedürfen der Schriftform.
Gerichtsstand ist Berlin.

Ort: ${restaurant?.stadt || '[Stadt]'}
Datum: ${new Date().toLocaleDateString('de-DE')}
    `;
    
    setContractContent(content);
  };

  const handleCreateContract = async () => {
    setLoading(true);
    
    try {
      // Create contract in database
      const contractData = {
        onboardingId: id,
        templateId: 'partner-standard', // Use standard template
        type: 'partner',
        content: contractContent,
        requiredSignatures: [
          {
            role: 'Partner',
            name: `${onboardingData.kontakt?.anrede || ''} ${onboardingData.kontakt?.vorname || ''} ${onboardingData.kontakt?.nachname || ''}`.trim(),
            email: onboardingData.kontakt?.email || '',
            signed: false,
          },
          {
            role: 'Oriido Vertreter',
            name: 'Oriido Team',
            email: 'vertraege@oriido.de',
            signed: false,
          },
        ],
        variables: {
          restaurantName: onboardingData.restaurant?.name,
          restaurantAddress: `${onboardingData.restaurant?.strasse}, ${onboardingData.restaurant?.plz} ${onboardingData.restaurant?.stadt}`,
          firmenname: onboardingData.geschaeftsdaten?.firmenname,
          preismodell: onboardingData.vereinbarung?.preismodell,
          setupGebuehr: onboardingData.vereinbarung?.setupGebuehr,
        },
      };
      
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractData),
      });
      
      if (response.ok) {
        const contract = await response.json();
        setContractId(contract._id);
      }
    } catch (error) {
      console.error('Error creating contract:', error);
      alert('Fehler beim Erstellen des Vertrags');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    const pdfData = {
      title: 'Partnervertrag Oriido',
      contractNumber: `${new Date().getFullYear()}-${id.slice(-5)}`,
      content: contractContent,
      signatures: signatures,
      metadata: {
        createdAt: new Date().toISOString(),
        restaurantName: onboardingData.restaurant?.name,
        restaurantAddress: `${onboardingData.restaurant?.strasse}, ${onboardingData.restaurant?.plz} ${onboardingData.restaurant?.stadt}`,
      },
    };
    
    const pdfBytes = await generateContractPDF(pdfData);
    downloadPDF(pdfBytes, `oriido-vertrag-${onboardingData.restaurant?.name?.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    setPdfGenerated(true);
  };

  const handleSignature = (signature: string) => {
    const newSignature = {
      name: `${onboardingData.kontakt?.vorname} ${onboardingData.kontakt?.nachname}`,
      role: 'Partner',
      signedAt: new Date().toISOString(),
      signature: signature,
    };
    
    setSignatures([...signatures, newSignature]);
    setShowSignature(false);
  };

  const handleSendContract = async () => {
    if (!contractId) {
      await handleCreateContract();
    }
    
    // In production, this would send the contract via email
    alert('Vertrag wurde per E-Mail versandt!');
    onComplete();
  };

  return (
    <WizardStep
      title="Vertrag & Abschluss"
      description="Prüfen Sie die Vertragsbedingungen und unterschreiben Sie digital"
    >
      <div className="space-y-6">
        {/* Contract Preview */}
        <div className="bg-white text-gray-900 rounded-lg p-8 max-h-96 overflow-y-auto border border-border">
          <pre className="whitespace-pre-wrap font-sans text-sm">
            {contractContent}
          </pre>
        </div>

        {/* Signature Status */}
        <div className="bg-surface-hover rounded-lg p-6 border border-border">
          <h3 className="font-semibold mb-4">Unterschriften</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Partner</div>
                <div className="text-sm text-secondary">
                  {onboardingData.kontakt?.vorname} {onboardingData.kontakt?.nachname}
                </div>
              </div>
              {signatures.length > 0 ? (
                <span className="text-green-500 text-sm">✓ Unterschrieben</span>
              ) : (
                <button
                  onClick={() => setShowSignature(true)}
                  className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors text-sm"
                >
                  Jetzt unterschreiben
                </button>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Oriido Vertreter</div>
                <div className="text-sm text-secondary">Wird nach Versand unterzeichnet</div>
              </div>
              <span className="text-gray-500 text-sm">Ausstehend</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-surface-hover rounded-lg p-6 border border-border">
          <h3 className="font-semibold mb-4">Nächste Schritte</h3>
          <div className="space-y-3">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={signatures.length > 0}
                disabled
                className="mt-1"
              />
              <span className={signatures.length > 0 ? 'line-through text-secondary' : ''}>
                Digital unterschreiben
              </span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={pdfGenerated}
                disabled
                className="mt-1"
              />
              <span className={pdfGenerated ? 'line-through text-secondary' : ''}>
                PDF herunterladen (optional)
              </span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={false}
                disabled
                className="mt-1"
              />
              <span>
                Vertrag per E-Mail erhalten
              </span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-6">
          <button
            onClick={onPrevious}
            className="px-6 py-3 bg-surface-hover hover:bg-border text-primary font-semibold rounded-lg transition-colors"
          >
            Zurück
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={handleGeneratePDF}
              className="px-6 py-3 bg-surface-hover hover:bg-border text-primary font-semibold rounded-lg transition-colors"
            >
              PDF Download
            </button>
            
            <button
              onClick={handleSendContract}
              disabled={signatures.length === 0 || loading}
              className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Wird gesendet...' : 'Vertrag versenden & Abschließen'}
            </button>
          </div>
        </div>
      </div>

      {/* Signature Modal */}
      {showSignature && (
        <SignaturePad
          signerName={`${onboardingData.kontakt?.vorname} ${onboardingData.kontakt?.nachname}`}
          signerRole="Partner"
          onSign={handleSignature}
          onCancel={() => setShowSignature(false)}
        />
      )}
    </WizardStep>
  );
}