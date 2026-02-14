'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TemplateEditor from '@/components/contracts/TemplateEditor';
import { ContractTemplate } from '@/lib/types/contract';

const CATEGORY_LABELS = {
  partner: 'Partnervertrag',
  service: 'Servicevereinbarung',
  datenschutz: 'Datenschutz',
  agb: 'AGB',
  sonstiges: 'Sonstiges',
};

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/contracts/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async (template: Partial<ContractTemplate>) => {
    try {
      const url = editingTemplate 
        ? `/api/contracts/templates/${editingTemplate._id}`
        : '/api/contracts/templates';
      
      const method = editingTemplate ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });

      if (response.ok) {
        fetchTemplates();
        setShowEditor(false);
        setEditingTemplate(null);
      }
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Möchten Sie diese Vorlage wirklich löschen?')) return;
    
    try {
      const response = await fetch(`/api/contracts/templates/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const filteredTemplates = templates.filter(template => {
    return filter === 'all' || template.category === filter;
  });

  if (showEditor) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4">
          <TemplateEditor
            template={editingTemplate || undefined}
            onSave={handleSaveTemplate}
            onCancel={() => {
              setShowEditor(false);
              setEditingTemplate(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
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
            <h1 className="text-3xl font-bold mt-2">Vertragsvorlagen</h1>
            <p className="text-secondary mt-1">Erstellen und verwalten Sie Vertragsvorlagen</p>
          </div>
          <button
            onClick={() => setShowEditor(true)}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
          >
            + Neue Vorlage
          </button>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-surface-dark border border-border rounded-lg focus:border-accent focus:outline-none"
          >
            <option value="all">Alle Kategorien</option>
            <option value="partner">Partnervertrag</option>
            <option value="service">Servicevereinbarung</option>
            <option value="datenschutz">Datenschutz</option>
            <option value="agb">AGB</option>
            <option value="sonstiges">Sonstiges</option>
          </select>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-secondary">Lade Vorlagen...</div>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="bg-surface-dark rounded-lg p-12 text-center border border-border">
            <div className="text-secondary mb-4">Keine Vorlagen gefunden</div>
            <button
              onClick={() => setShowEditor(true)}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
            >
              Erste Vorlage erstellen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template._id}
                className="bg-surface-dark rounded-lg p-6 border border-border hover:border-accent/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{template.name}</h3>
                    <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded mt-1 inline-block">
                      {CATEGORY_LABELS[template.category]}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingTemplate(template);
                        setShowEditor(true);
                      }}
                      className="p-2 hover:bg-surface-hover rounded transition-colors"
                      title="Bearbeiten"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template._id!)}
                      className="p-2 hover:bg-red-500/20 rounded transition-colors text-red-500"
                      title="Löschen"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <p className="text-secondary text-sm mb-4">
                  {template.description}
                </p>
                
                <div className="flex justify-between items-center text-xs text-secondary">
                  <span>{template.variables.length} Variablen</span>
                  <span>Version {template.version}</span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border">
                  <button
                    onClick={() => router.push(`/contracts/new?template=${template._id}`)}
                    className="w-full px-3 py-2 bg-accent/10 text-accent rounded hover:bg-accent/20 transition-colors text-sm"
                  >
                    Vertrag erstellen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}