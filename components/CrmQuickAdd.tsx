'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CrmQuickAddProps {
  onAdd: (restaurant: any) => void;
  onClose: () => void;
}

export default function CrmQuickAdd({ onAdd, onClose }: CrmQuickAddProps) {
  const [formData, setFormData] = useState({
    name: '',
    adresse: '',
    art: '',
    ansprechpartner: '',
    telefon: '',
    status: 'lead',
    notiz: '',
    naechsterKontakt: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25 }}
          className="bg-surface w-full max-w-md rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-primary">Neues Restaurant</h2>
            <button onClick={onClose} className="text-secondary hover:text-primary">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Restaurantname *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border bg-surface-hover border-border text-primary focus:border-accent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Adresse
              </label>
              <input
                type="text"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border bg-surface-hover border-border text-primary focus:border-accent outline-none"
                placeholder="Straße, Stadt"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Art
              </label>
              <select
                value={formData.art}
                onChange={(e) => setFormData({ ...formData, art: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border bg-surface-hover border-border text-primary focus:border-accent outline-none"
              >
                <option value="">Wählen...</option>
                <option value="Italienisch">Italienisch</option>
                <option value="Deutsch">Deutsch</option>
                <option value="Asiatisch">Asiatisch</option>
                <option value="Café">Café</option>
                <option value="Bar">Bar</option>
                <option value="Fast Food">Fast Food</option>
                <option value="Andere">Andere</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Ansprechpartner
              </label>
              <input
                type="text"
                value={formData.ansprechpartner}
                onChange={(e) => setFormData({ ...formData, ansprechpartner: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border bg-surface-hover border-border text-primary focus:border-accent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Telefon
              </label>
              <input
                type="tel"
                value={formData.telefon}
                onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border bg-surface-hover border-border text-primary focus:border-accent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border bg-surface-hover border-border text-primary focus:border-accent outline-none"
                required
              >
                <option value="lead">Lead</option>
                <option value="kontaktiert">Kontaktiert</option>
                <option value="termin">Termin vereinbart</option>
                <option value="angebot">Angebot gemacht</option>
                <option value="gewonnen">Gewonnen</option>
                <option value="verloren">Verloren</option>
                <option value="spaeter">Später</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Erste Notiz
              </label>
              <textarea
                value={formData.notiz}
                onChange={(e) => setFormData({ ...formData, notiz: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border bg-surface-hover border-border text-primary focus:border-accent outline-none"
                rows={3}
                placeholder="z.B. Erster Kontakt, interessiert aber skeptisch..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Nächster Kontakt
              </label>
              <input
                type="date"
                value={formData.naechsterKontakt}
                onChange={(e) => setFormData({ ...formData, naechsterKontakt: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border bg-surface-hover border-border text-primary focus:border-accent outline-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-surface border border-border text-primary py-3 px-4 rounded-xl hover:bg-surface-hover transition-colors font-medium"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="flex-1 bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                Hinzufügen
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}