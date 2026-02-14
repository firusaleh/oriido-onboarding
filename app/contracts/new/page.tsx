'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ContractTemplate, Contract } from '@/lib/types/contract';
import SignaturePad from '@/components/contracts/SignaturePad';
import { generateContractPDF, downloadPDF } from '@/lib/utils/pdf-generator';

function NewContractPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  const onboardingId = searchParams.get('onboardingId');
  
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [requiredSignatures, setRequiredSignatures] = useState([
    { role: 'Vertragspartner', name: '', email: '', signed: false },
    { role: 'Oriido Vertreter', name: '', email: '', signed: false },
  ]);
  const [showSignature, setShowSignature] = useState(false);
  const [currentSignerIndex, setCurrentSignerIndex] = useState<number | null>(null);
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (templateId && templates.length > 0) {
      const template = templates.find(t => t._id === templateId);
      if (template) {
        setSelectedTemplate(template);
        initializeVariables(template);
      }
    }
  }, [templateId, templates]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/contracts/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const initializeVariables = (template: ContractTemplate) => {
    const vars: Record<string, any> = {};
    template.variables.forEach(v => {
      vars[v.key] = v.defaultValue || '';
    });
    setVariables(vars);
  };

  const renderContent = () => {
    if (!selectedTemplate) return '';
    
    let content = selectedTemplate.content;
    Object.keys(variables).forEach(key => {
      const value = variables[key] || `[${key}]`;
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return content;
  };

  const handleSignatureComplete = async (signature: string) => {
    if (currentSignerIndex === null) return;
    
    const updated = [...requiredSignatures];
    updated[currentSignerIndex] = {
      ...updated[currentSignerIndex],
      signed: true,
    };
    setRequiredSignatures(updated);
    setShowSignature(false);
    setCurrentSignerIndex(null);
    
    // Store signature data (in real app, send to backend)
    console.log('Signature captured for:', updated[currentSignerIndex]);
  };

  const handleSaveContract = async () => {
    if (!selectedTemplate || !onboardingId) {
      alert('Bitte wählen Sie eine Vorlage und ein Onboarding aus');
      return;
    }
    
    setLoading(true);
    
    try {
      const contract: Partial<Contract> = {
        onboardingId,
        templateId: selectedTemplate._id!,
        type: selectedTemplate.category,
        content: renderContent(),
        variables: new Map(Object.entries(variables)),
        requiredSignatures,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        notes,
      };
      
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contract),
      });
      
      if (response.ok) {
        const savedContract = await response.json();
        router.push(`/contracts/${savedContract._id}`);
      }
    } catch (error) {
      console.error('Error saving contract:', error);
      alert('Fehler beim Speichern des Vertrags');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!selectedTemplate) return;
    
    const pdfData = {
      title: selectedTemplate.name,
      contractNumber: `${new Date().getFullYear()}-DRAFT`,
      content: renderContent(),
      metadata: {
        createdAt: new Date().toISOString(),
        validUntil: validUntil || undefined,
      },
    };
    
    const pdfBytes = await generateContractPDF(pdfData);
    downloadPDF(pdfBytes, `vertrag-entwurf-${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/contracts"
                className="text-secondary hover:text-primary transition-colors"
              >
                ← Verträge
              </Link>
            </div>
            <h1 className="text-3xl font-bold mt-2">Neuer Vertrag</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGeneratePDF}
              disabled={!selectedTemplate}
              className="px-4 py-2 bg-surface-hover border border-border rounded-lg hover:bg-border transition-colors disabled:opacity-50"
            >
              PDF Vorschau
            </button>
            <button
              onClick={handleSaveContract}
              disabled={!selectedTemplate || loading}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {loading ? 'Speichern...' : 'Vertrag speichern'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Template Selection and Variables */}
          <div className="space-y-6">
            {/* Template Selection */}
            <div className="bg-surface-dark rounded-lg p-6 border border-border">
              <h3 className="font-semibold mb-4">Vorlage wählen</h3>
              <select
                value={selectedTemplate?._id || ''}
                onChange={(e) => {
                  const template = templates.find(t => t._id === e.target.value);
                  if (template) {
                    setSelectedTemplate(template);
                    initializeVariables(template);
                  }
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:border-accent focus:outline-none"
              >
                <option value="">Vorlage auswählen...</option>
                {templates.map(template => (
                  <option key={template._id} value={template._id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Variables */}
            {selectedTemplate && selectedTemplate.variables.length > 0 && (
              <div className="bg-surface-dark rounded-lg p-6 border border-border">
                <h3 className="font-semibold mb-4">Variablen ausfüllen</h3>
                <div className="space-y-4">
                  {selectedTemplate.variables.map(variable => (
                    <div key={variable.key}>
                      <label className="block text-sm font-medium mb-1">
                        {variable.label}
                        {variable.required && <span className="text-accent ml-1">*</span>}
                      </label>
                      {variable.type === 'text' && (
                        <input
                          type="text"
                          value={variables[variable.key] || ''}
                          onChange={(e) => setVariables({
                            ...variables,
                            [variable.key]: e.target.value
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded focus:border-accent focus:outline-none"
                        />
                      )}
                      {variable.type === 'number' && (
                        <input
                          type="number"
                          value={variables[variable.key] || ''}
                          onChange={(e) => setVariables({
                            ...variables,
                            [variable.key]: e.target.value
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded focus:border-accent focus:outline-none"
                        />
                      )}
                      {variable.type === 'date' && (
                        <input
                          type="date"
                          value={variables[variable.key] || ''}
                          onChange={(e) => setVariables({
                            ...variables,
                            [variable.key]: e.target.value
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded focus:border-accent focus:outline-none"
                        />
                      )}
                      {variable.type === 'boolean' && (
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={variables[variable.key] || false}
                            onChange={(e) => setVariables({
                              ...variables,
                              [variable.key]: e.target.checked
                            })}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm">Ja</span>
                        </label>
                      )}
                      {variable.type === 'select' && variable.options && (
                        <select
                          value={variables[variable.key] || ''}
                          onChange={(e) => setVariables({
                            ...variables,
                            [variable.key]: e.target.value
                          })}
                          className="w-full px-3 py-2 bg-background border border-border rounded focus:border-accent focus:outline-none"
                        >
                          <option value="">Bitte wählen...</option>
                          {variable.options.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Signatures */}
            <div className="bg-surface-dark rounded-lg p-6 border border-border">
              <h3 className="font-semibold mb-4">Unterschriften</h3>
              <div className="space-y-4">
                {requiredSignatures.map((signer, index) => (
                  <div key={index} className="space-y-2">
                    <div className="text-sm font-medium">{signer.role}</div>
                    <input
                      type="text"
                      value={signer.name}
                      onChange={(e) => {
                        const updated = [...requiredSignatures];
                        updated[index].name = e.target.value;
                        setRequiredSignatures(updated);
                      }}
                      placeholder="Name"
                      className="w-full px-3 py-2 bg-background border border-border rounded focus:border-accent focus:outline-none"
                    />
                    <input
                      type="email"
                      value={signer.email}
                      onChange={(e) => {
                        const updated = [...requiredSignatures];
                        updated[index].email = e.target.value;
                        setRequiredSignatures(updated);
                      }}
                      placeholder="E-Mail"
                      className="w-full px-3 py-2 bg-background border border-border rounded focus:border-accent focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        setCurrentSignerIndex(index);
                        setShowSignature(true);
                      }}
                      className={`w-full px-3 py-2 rounded text-sm ${
                        signer.signed 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-surface-hover hover:bg-border'
                      } transition-colors`}
                    >
                      {signer.signed ? '✓ Unterschrieben' : 'Unterschreiben'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Settings */}
            <div className="bg-surface-dark rounded-lg p-6 border border-border">
              <h3 className="font-semibold mb-4">Weitere Einstellungen</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Gültig bis
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Notizen
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-background border border-border rounded focus:border-accent focus:outline-none"
                    placeholder="Interne Notizen zum Vertrag..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Contract Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white text-black rounded-lg p-8 min-h-[800px]">
              {selectedTemplate ? (
                <div className="prose prose-lg max-w-none">
                  <h1 className="text-2xl font-bold mb-6">{selectedTemplate.name}</h1>
                  <div className="whitespace-pre-wrap">{renderContent()}</div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-12">
                  Bitte wählen Sie eine Vorlage aus
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Signature Modal */}
        {showSignature && currentSignerIndex !== null && (
          <SignaturePad
            signerName={requiredSignatures[currentSignerIndex].name}
            signerRole={requiredSignatures[currentSignerIndex].role}
            onSign={handleSignatureComplete}
            onCancel={() => {
              setShowSignature(false);
              setCurrentSignerIndex(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default function NewContractPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-secondary">Lade...</div>
      </div>
    }>
      <NewContractPageContent />
    </Suspense>
  );
}