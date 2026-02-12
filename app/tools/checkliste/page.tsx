'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ChecklistItem from '../../../components/ChecklistItem';

interface ChecklistItemData {
  id: number;
  title: string;
  description: string;
  tag: 'MUSS' | 'IDEAL' | 'BONUS';
}

const checklistItems: ChecklistItemData[] = [
  {
    id: 1,
    title: "Du hast ein Kassensystem im Einsatz",
    description: "ready2order, orderbird, gastrofix oder ähnlich – Oriido verbindet sich **direkt damit**",
    tag: "MUSS"
  },
  {
    id: 2,
    title: "Deine Gäste warten oft auf die Bestellung",
    description: "Besonders zu Stoßzeiten dauert es, bis Personal am Tisch ist – **Oriido löst das sofort**",
    tag: "MUSS"
  },
  {
    id: 3,
    title: "Du hast mehr Tische als Personal",
    description: "Fachkräftemangel? Mit Oriido bedienst du **gleich viele Tische mit weniger Leuten**",
    tag: "IDEAL"
  },
  {
    id: 4,
    title: "Du hast internationale Gäste",
    description: "Touristen, Studenten, Expats – die Speisekarte erscheint **automatisch in ihrer Sprache**",
    tag: "IDEAL"
  },
  {
    id: 5,
    title: "Nachbestellungen kommen selten rein",
    description: "Gäste bestellen ungern nach, weil sie extra winken müssen – **digital geht's mit einem Tap**",
    tag: "IDEAL"
  },
  {
    id: 6,
    title: "Bezahlung dauert zu lange",
    description: "Gäste warten auf die Rechnung, Tische bleiben blockiert – **Handy-Zahlung spart 2+ Minuten pro Tisch**",
    tag: "IDEAL"
  },
  {
    id: 7,
    title: "Du änderst deine Speisekarte regelmäßig",
    description: "Tagesgerichte, saisonale Angebote – **digital in Sekunden aktualisiert, kein Neudruck**",
    tag: "BONUS"
  },
  {
    id: 8,
    title: "Du willst wissen, was deine Gäste wirklich bestellen",
    description: "Echtzeit-Daten zu Bestsellern, Umsatz pro Tisch, Stoßzeiten – **alles im Dashboard**",
    tag: "BONUS"
  }
];

export default function ChecklistePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/');
          return;
        }
        const userData = await res.json();
        setUser(userData);
      } catch (error) {
        console.error('Error:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const toggleItem = (itemId: number) => {
    setCheckedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const resetChecklist = () => {
    setCheckedItems([]);
  };

  const shareWhatsApp = () => {
    const count = checkedItems.length;
    const message = `Dein Restaurant hat ${count}/8 Punkten bei der Oriido-Checkliste! Mehr Infos: oriido.com`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const startOnboarding = () => {
    const url = restaurantName 
      ? `/neu?restaurant=${encodeURIComponent(restaurantName)}`
      : '/neu';
    router.push(url);
  };

  const getResultData = () => {
    const count = checkedItems.length;
    if (count >= 7) {
      return {
        category: '7-8',
        title: 'Du brauchst Oriido gestern',
        color: 'border-success shadow-success/20 opacity-100',
        inactive: 'border-border/50 opacity-50'
      };
    } else if (count >= 4) {
      return {
        category: '4-6',
        title: 'Perfekter Oriido-Kandidat',
        color: 'border-accent shadow-accent/20 opacity-100',
        inactive: 'border-border/50 opacity-50'
      };
    } else {
      return {
        category: '1-3',
        title: 'Oriido lohnt sich schon',
        color: 'border-secondary opacity-100',
        inactive: 'border-border/50 opacity-50'
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  const result = getResultData();
  
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">
                Ist dein Restaurant <span className="text-accent">bereit?</span>
              </h1>
              <p className="text-secondary mt-1">
                8 Punkte – check ab, was auf dich zutrifft
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-mono font-bold text-accent">
                {checkedItems.length} von 8
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-sm text-secondary leading-relaxed">
              <span className="text-accent font-semibold">So funktioniert&apos;s:</span> Geh die Punkte durch und hak ab, was auf dein Restaurant zutrifft. Je mehr Haken, desto mehr profitierst du von Oriido. Aber auch mit nur 2–3 Haken lohnt es sich!
            </p>
          </div>

          {/* Optional Restaurant Name */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Restaurantname (optional)
            </label>
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="z.B. Bella Italia"
              className="w-full px-4 py-3 rounded-lg border bg-surface-hover border-border text-primary placeholder-secondary focus:border-accent outline-none transition-colors"
            />
          </div>
        </div>

        {/* Checklist Items */}
        <div className="space-y-3">
          <AnimatePresence>
            {checklistItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ChecklistItem
                  title={item.title}
                  description={item.description}
                  tag={item.tag}
                  checked={checkedItems.includes(item.id)}
                  onToggle={() => toggleItem(item.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Result Section */}
        {checkedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-bold text-primary">
              Dein <span className="text-accent">Ergebnis</span>
            </h2>
            
            <div className="grid grid-cols-3 gap-3">
              {/* 1-3 Haken */}
              <div className={`bg-surface border rounded-xl p-3 text-center transition-all ${
                checkedItems.length >= 1 && checkedItems.length <= 3 
                  ? 'border-secondary opacity-100' 
                  : 'border-border/50 opacity-50'
              }`}>
                <div className="text-lg font-mono font-bold text-secondary">1–3</div>
                <div className="text-xs text-secondary mt-1">Haken?</div>
                <div className="text-xs text-primary mt-2 font-medium">
                  Oriido lohnt sich schon
                </div>
              </div>

              {/* 4-6 Haken */}
              <div className={`bg-surface border rounded-xl p-3 text-center transition-all ${
                checkedItems.length >= 4 && checkedItems.length <= 6 
                  ? 'border-accent shadow-lg shadow-accent/20 opacity-100' 
                  : 'border-border/50 opacity-50'
              }`}>
                <div className="text-lg font-mono font-bold text-accent">4–6</div>
                <div className="text-xs text-secondary mt-1">Haken?</div>
                <div className="text-xs text-primary mt-2 font-medium">
                  Perfekter Oriido-Kandidat
                </div>
              </div>

              {/* 7-8 Haken */}
              <div className={`bg-surface border rounded-xl p-3 text-center transition-all ${
                checkedItems.length >= 7 
                  ? 'border-success shadow-lg shadow-success/20 opacity-100' 
                  : 'border-border/50 opacity-50'
              }`}>
                <div className="text-lg font-mono font-bold text-success">7–8</div>
                <div className="text-xs text-secondary mt-1">Haken?</div>
                <div className="text-xs text-primary mt-2 font-medium">
                  Du brauchst Oriido gestern
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* CTA Section */}
        <div className="space-y-3">
          <button
            onClick={startOnboarding}
            className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-4 px-4 rounded-xl transition-colors min-h-[52px]"
          >
            Jetzt Onboarding starten →
          </button>
          <p className="text-center text-xs text-secondary">
            Kein Risiko. Kein Aufwand. Wir richten alles ein.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={shareWhatsApp}
            className="flex-1 bg-surface border border-border text-primary py-3 px-4 rounded-xl hover:bg-surface-hover transition-colors text-sm font-medium"
          >
            📱 Ergebnis teilen
          </button>
          <button
            onClick={resetChecklist}
            className="flex-1 bg-surface border border-border text-primary py-3 px-4 rounded-xl hover:bg-surface-hover transition-colors text-sm font-medium"
          >
            🔄 Zurücksetzen
          </button>
        </div>
      </div>
    </div>
  );
}