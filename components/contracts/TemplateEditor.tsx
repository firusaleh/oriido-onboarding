'use client';

import { useState, useEffect } from 'react';
import { ContractTemplate } from '@/lib/types/contract';

interface Variable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  required: boolean;
  defaultValue?: string;
  options?: string[];
}

interface Props {
  template?: ContractTemplate;
  onSave: (template: Partial<ContractTemplate>) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  { value: 'partner', label: 'Partnervertrag' },
  { value: 'service', label: 'Servicevereinbarung' },
  { value: 'datenschutz', label: 'Datenschutz' },
  { value: 'agb', label: 'AGB' },
  { value: 'sonstiges', label: 'Sonstiges' },
];

export default function TemplateEditor({ template, onSave, onCancel }: Props) {
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [category, setCategory] = useState(template?.category || 'partner');
  const [content, setContent] = useState(template?.content || '');
  const [variables, setVariables] = useState<Variable[]>(template?.variables || []);
  const [previewMode, setPreviewMode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddVariable = () => {
    const newVar: Variable = {
      key: `var_${Date.now()}`,
      label: '',
      type: 'text',
      required: false,
    };
    setVariables([...variables, newVar]);
  };

  const handleUpdateVariable = (index: number, field: keyof Variable, value: any) => {
    const updated = [...variables];
    updated[index] = { ...updated[index], [field]: value };
    setVariables(updated);
  };

  const handleRemoveVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const insertVariable = (varKey: string) => {
    const cursorPos = (document.getElementById('content-editor') as HTMLTextAreaElement)?.selectionStart || content.length;
    const newContent = content.slice(0, cursorPos) + `{{${varKey}}}` + content.slice(cursorPos);
    setContent(newContent);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name) newErrors.name = 'Name ist erforderlich';
    if (!description) newErrors.description = 'Beschreibung ist erforderlich';
    if (!content) newErrors.content = 'Inhalt ist erforderlich';
    
    variables.forEach((v, i) => {
      if (!v.label) newErrors[`var_${i}_label`] = 'Label ist erforderlich';
      if (!v.key) newErrors[`var_${i}_key`] = 'Schlüssel ist erforderlich';
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    
    onSave({
      name,
      description,
      category,
      content,
      variables,
      active: true,
    });
  };

  const renderPreview = () => {
    let preview = content;
    variables.forEach(v => {
      const placeholder = `{{${v.key}}}`;
      const value = v.defaultValue || `[${v.label}]`;
      preview = preview.replace(new RegExp(placeholder, 'g'), value);
    });
    return preview;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-surface-dark rounded-lg p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {template ? 'Vorlage bearbeiten' : 'Neue Vorlage'}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 bg-surface-hover rounded-lg hover:bg-border transition-colors"
            >
              {previewMode ? 'Bearbeiten' : 'Vorschau'}
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-surface-hover rounded-lg hover:bg-border transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-accent rounded-lg hover:bg-accent-hover text-white transition-colors"
            >
              Speichern
            </button>
          </div>
        </div>

        {!previewMode ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-accent focus:outline-none"
                  placeholder="z.B. Partnervertrag Oriido"
                />
                {errors.name && (
                  <div className="text-red-500 text-sm mt-1">{errors.name}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Kategorie *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-accent focus:outline-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Beschreibung *
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-accent focus:outline-none"
                placeholder="Kurze Beschreibung der Vorlage"
              />
              {errors.description && (
                <div className="text-red-500 text-sm mt-1">{errors.description}</div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Vertragsinhalt *
                </label>
                <textarea
                  id="content-editor"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-96 px-4 py-3 bg-background border border-border rounded-lg focus:border-accent focus:outline-none font-mono text-sm"
                  placeholder="Vertragstext mit Variablen in {{geschweiften Klammern}}"
                />
                {errors.content && (
                  <div className="text-red-500 text-sm mt-1">{errors.content}</div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium">Variablen</label>
                  <button
                    onClick={handleAddVariable}
                    className="px-3 py-1 bg-accent text-white rounded text-sm hover:bg-accent-hover transition-colors"
                  >
                    + Neu
                  </button>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {variables.map((variable, index) => (
                    <div key={index} className="bg-background border border-border rounded-lg p-3 space-y-2">
                      <input
                        type="text"
                        value={variable.label}
                        onChange={(e) => handleUpdateVariable(index, 'label', e.target.value)}
                        className="w-full px-2 py-1 bg-surface-dark border border-border rounded text-sm"
                        placeholder="Label"
                      />
                      <input
                        type="text"
                        value={variable.key}
                        onChange={(e) => handleUpdateVariable(index, 'key', e.target.value)}
                        className="w-full px-2 py-1 bg-surface-dark border border-border rounded text-sm"
                        placeholder="Schlüssel"
                      />
                      <select
                        value={variable.type}
                        onChange={(e) => handleUpdateVariable(index, 'type', e.target.value)}
                        className="w-full px-2 py-1 bg-surface-dark border border-border rounded text-sm"
                      >
                        <option value="text">Text</option>
                        <option value="number">Zahl</option>
                        <option value="date">Datum</option>
                        <option value="select">Auswahl</option>
                        <option value="boolean">Ja/Nein</option>
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => insertVariable(variable.key)}
                          className="flex-1 px-2 py-1 bg-surface-hover rounded text-xs hover:bg-border transition-colors"
                        >
                          Einfügen
                        </button>
                        <button
                          onClick={() => handleRemoveVariable(index)}
                          className="px-2 py-1 bg-red-500/20 text-red-500 rounded text-xs hover:bg-red-500/30 transition-colors"
                        >
                          Löschen
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white text-black rounded-lg p-8">
            <div className="prose prose-lg max-w-none">
              <h1 className="text-2xl font-bold mb-6">{name}</h1>
              <div className="whitespace-pre-wrap">{renderPreview()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}