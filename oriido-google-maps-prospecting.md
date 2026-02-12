# Oriido – Google Maps Prospecting (Spec für Claude Code)

## Kontext

Die Oriido Sales App hat bereits:
- ✅ Onboarding-Wizard (7 Schritte, Auto-Save, Admin-Dashboard)
- ✅ Sales Tools (Checkliste, QR-Demo)
- ✅ Dokumente Hub, Einwand-Datenbank, Gesprächsleitfaden, Tages-Briefing
- ✅ CRM-Light mit Pipeline (Lead → Kontaktiert → Termin → Angebot → Gewonnen/Verloren)
- ✅ PIN-Login, Bottom Navigation, Dark Theme

Jetzt kommt das **Google Maps Prospecting Modul**: Verkäufer können direkt in der App nach Restaurants in ihrer Umgebung suchen, sie auf einer Karte sehen, und mit einem Tap in die CRM-Pipeline übernehmen.

---

## Neue Routen

```
/prospecting                → Karten-Ansicht mit Restaurant-Suche
/prospecting/import         → Bulk-Import (Admin) – Excel/CSV hochladen
```

---

## Übersicht: Was macht das Modul?

1. Verkäufer öffnet /prospecting
2. Karte zeigt seinen aktuellen Standort (GPS)
3. Er sucht "Restaurants in Erlangen" oder tippt einen Stadtteil ein
4. Google Places API liefert alle Restaurants in der Umgebung
5. Restaurants erscheinen als Pins auf der Karte + als Liste darunter
6. Jeder Pin ist farbig: 
   - ⚪ Grau = Unbekannt (noch nicht in Pipeline)
   - 🔵 Blau = Lead (in Pipeline, noch nicht besucht)
   - 🟡 Gelb = Kontaktiert / Termin / Angebot
   - 🟢 Grün = Gewonnen (Oriido-Kunde)
   - 🔴 Rot = Verloren / Kein Interesse
7. Verkäufer tippt auf ein graues Restaurant → sieht Google-Infos → "Zur Pipeline hinzufügen"
8. Restaurant landet als Lead im CRM, alle Google-Daten vorausgefüllt

---

## Google Places API Setup

### Benötigte APIs (Google Cloud Console)
- **Places API (New)** – Restaurant-Suche + Details
- **Maps JavaScript API** – Kartenansicht
- **Geocoding API** – Adresse → Koordinaten
- **Geolocation API** (Browser) – Standort des Verkäufers

### Environment Variable
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
```

### Kosten-Bewusstsein
Google Places API kostet pro Anfrage. Daher:
- Ergebnisse cachen (in MongoDB, 7 Tage TTL)
- Nur laden wenn Verkäufer aktiv sucht (kein Auto-Load)
- Max 60 Ergebnisse pro Suche (Google Limit: 20 pro Page, 3 Pages)
- Place Details nur laden wenn Verkäufer auf ein Restaurant tippt

---

## Datenbank-Schema

```javascript
// Collection: prospects (gecachte Google Places Ergebnisse)
{
  _id: ObjectId,
  placeId: String,             // *Unique – Google Place ID
  
  // Google-Daten (gecacht)
  name: String,
  adresse: String,             // formatted_address
  strasse: String,             
  plz: String,
  stadt: String,
  lat: Number,                 // Latitude
  lng: Number,                 // Longitude
  telefon: String,             // formatted_phone_number
  website: String,
  googleMapsUrl: String,       // Google Maps Link
  bewertung: Number,           // 1.0 - 5.0
  anzahlBewertungen: Number,
  oeffnungszeiten: [String],   // Array von Strings ("Monday: 11:00 AM – 10:00 PM")
  fotos: [String],             // Photo URLs (max 3)
  priceLevel: Number,          // 0-4 (Google Price Level)
  types: [String],             // ["restaurant", "italian_restaurant", etc.]
  
  // Oriido-Status
  inPipeline: Boolean,         // Wurde zu CRM hinzugefügt?
  crmId: ObjectId,             // Referenz zur crm_restaurants Collection
  
  // Cache
  gecachtAm: Date,             // Wann von Google geladen
  gecachtFuer: String,         // Suchbegriff ("Restaurants Erlangen")
}

// Die bestehende crm_restaurants Collection wird erweitert um:
{
  // ... bestehende Felder ...
  placeId: String,             // Google Place ID (für Verknüpfung)
  googleBewertung: Number,
  googleFotos: [String],
  quelle: String,              // "manuell" | "google_maps" | "import"
}
```

---

## Hauptseite: Karten-Ansicht ("/prospecting")

### Layout (Mobile-First)

Das Screen ist zweigeteilt:
- **Obere Hälfte**: Google Map (ca. 55% der Bildschirmhöhe)
- **Untere Hälfte**: Ergebnis-Liste (scrollbar, ca. 45%)
- Die Teilung ist per Swipe/Drag anpassbar (Drag-Handle in der Mitte)
- Alternativ: Tab-Umschalter "🗺️ Karte" / "📋 Liste" für einfachere Implementierung

### Suchleiste (oben, über der Karte, sticky)
- Suchfeld: "🔍 Restaurants suchen..." 
- Vorschläge beim Tippen (Google Places Autocomplete)
- Beispiel-Eingaben: "Erlangen", "Erlangen Innenstadt", "Italienisch Nürnberg"
- Neben dem Suchfeld: GPS-Button "📍" → zentriert auf aktuellen Standort
- Unter dem Suchfeld: Filter-Chips (horizontal scrollbar):
  - Alle | Nicht besucht | In Pipeline | Gewonnen | Verloren
  - Typ-Filter: Restaurant | Café | Bar | Imbiss

### Google Map
- Style: Dark Mode Map (passt zum App-Theme)
  - Nutze Google Maps Styling: dunkler Hintergrund, gedämpfte Farben, Straßennamen lesbar
- Initialer Zoom: 14 (Stadtteil-Level)
- Initiale Position: GPS-Standort des Verkäufers, Fallback: Erlangen Zentrum (49.5897, 11.0078)

### Map-Pins (Custom Markers)
Jeder Pin zeigt den Status des Restaurants:

```
⚪ GRAU (Circle, border #8A8A9A)
   → Unbekannt – nicht in der Pipeline
   → Label: Kleines Restaurant-Icon

🔵 BLAU (Circle, bg #3B82F6)
   → Lead – in Pipeline, noch nicht kontaktiert
   
🟡 GELB/ORANGE (Circle, bg #FF6B35)
   → In Arbeit – kontaktiert / termin / angebot
   
🟢 GRÜN (Circle, bg #22C55E)
   → Gewonnen – Oriido-Kunde
   
🔴 ROT (Circle, bg #EF4444)
   → Verloren / Kein Interesse
```

- Pin des Verkäufer-Standorts: Blauer Punkt mit Pulse-Animation (wie Google Maps)
- Cluster-Pins wenn zu viele Pins nah beieinander (zeigt Zahl: "12")
- Klick auf Pin → Popup/Bottom-Sheet mit Restaurant-Infos

### Pin-Klick → Restaurant Bottom Sheet

Wenn der Verkäufer auf einen Pin tippt, schiebt sich von unten ein Sheet hoch:

**Für unbekannte Restaurants (grau):**
```
┌──────────────────────────────────────┐
│  📸 [Google Foto]                     │
│                                       │
│  Bella Napoli                    ⭐4.3│
│  Italienisches Restaurant   (128)     │
│  Hauptstr. 42, 91054 Erlangen        │
│                                       │
│  📞 0913 1234567    🌐 Website       │
│  🕐 Geöffnet bis 22:00              │
│                                       │
│  ┌──────────────────────────────────┐│
│  │ ➕ Zur Pipeline hinzufügen       ││
│  └──────────────────────────────────┘│
│  📍 Route planen                     │
└──────────────────────────────────────┘
```

- **"Zur Pipeline hinzufügen"** Button:
  - Erstellt automatisch einen CRM-Eintrag mit allen Google-Daten
  - Status: "Lead"
  - Pin wechselt von grau zu blau
  - Kurzes Feedback: "✅ Bella Napoli als Lead gespeichert"
  - Optional: Quick-Note Feld das aufpoppt ("Kurze Notiz? z.B. 'Sieht vielversprechend aus'")

**Für Restaurants die schon in der Pipeline sind (farbig):**
```
┌──────────────────────────────────────┐
│  Bella Napoli              ⭐4.3     │
│  Hauptstr. 42, 91054 Erlangen        │
│  Status: [🟡 Termin vereinbart]      │
│                                       │
│  Letzte Notiz: "Chef Marco will      │
│  nächste Woche starten"              │
│  Follow-Up: Morgen ⚠️               │
│                                       │
│  ┌──────────────────────────────────┐│
│  │ 📋 Im CRM öffnen                ││
│  └──────────────────────────────────┘│
│  📞 Anrufen  💬 WhatsApp  📍 Route  │
└──────────────────────────────────────┘
```

### Ergebnis-Liste (unter der Karte)

Scrollbare Liste aller Restaurants im aktuellen Kartenausschnitt.

**Header der Liste:**
- "X Restaurants gefunden" + "Y davon in Pipeline"
- Sortierung: Entfernung | Bewertung | Name A-Z

**Jede Restaurant-Karte:**
```
┌──────────────────────────────────────┐
│ 🔵 Bella Napoli              ⭐ 4.3 │
│    Hauptstr. 42 · 350m · Italienisch │
│    📞 0913 1234567                   │
│    Status: Lead           [➕ / 📋]  │
└──────────────────────────────────────┘
```

- Status-Dot links (farbig nach Pipeline-Status)
- Name + Bewertung
- Adresse + Entfernung vom Verkäufer + Restaurant-Typ
- Telefon (klickbar → Anruf)
- Action-Button rechts:
  - Wenn nicht in Pipeline: "➕" → Hinzufügen
  - Wenn in Pipeline: "📋" → CRM öffnen
- Klick auf Karte → gleicher Bottom Sheet wie bei Pin-Klick
- Klick auf Karte scrollt auch die Map zum Restaurant

---

## Suche & API-Flow

### Suchablauf

```
1. Verkäufer tippt "Erlangen Innenstadt"
2. Frontend ruft /api/prospecting/search auf
3. Backend prüft: Gibt es gecachte Ergebnisse für diese Suche (< 7 Tage alt)?
   a. JA → Liefere gecachte Ergebnisse
   b. NEIN → Google Places Nearby Search API aufrufen:
      - type: "restaurant"
      - location: Geocode von "Erlangen Innenstadt"
      - radius: 2000m
      - Bis zu 60 Ergebnisse (3 Pages × 20)
4. Für jedes Ergebnis: Prüfe ob placeId schon in crm_restaurants existiert
5. Ergebnisse mit Pipeline-Status zurückgeben
6. Frontend zeigt Pins + Liste
```

### Place Details (Lazy Loading)

Place Details (Telefon, Öffnungszeiten, Fotos, Website) kosten extra.
→ Erst laden wenn Verkäufer auf ein spezifisches Restaurant tippt.

```
1. Verkäufer tippt auf Pin
2. Frontend ruft /api/prospecting/details/[placeId] auf
3. Backend prüft Cache → wenn nicht vorhanden: Google Place Details API
4. Speichert in prospects Collection
5. Zeigt Bottom Sheet mit allen Details
```

---

## Gebietsplanung (Bonus-Feature)

### Admin kann Gebiete zuweisen

```javascript
// Collection: territories
{
  _id: ObjectId,
  name: String,              // "Erlangen Süd"
  verkaeuferId: String,      // Zugewiesener Verkäufer
  bounds: {                  // Rechteck-Gebiet
    nordOst: { lat: Number, lng: Number },
    suedWest: { lat: Number, lng: Number },
  },
  farbe: String,             // "#FF6B35" – für Karten-Overlay
  erstelltAm: Date,
}
```

- Admin zeichnet Gebiete auf der Karte (Rechteck-Tool)
- Gebiete erscheinen als halbtransparente farbige Overlays
- Verkäufer sieht nur Restaurants in seinem Gebiet (optional, kann abgeschaltet werden)
- Gebiet-Label auf der Karte: "Dein Gebiet: Erlangen Süd"

---

## Statistiken auf der Karte

### Oben auf der Karte (halbtransparente Overlay-Leiste)

```
┌────────────────────────────────────────────┐
│  📍 42 gefunden  │  🔵 8 Leads  │  🟢 3   │
└────────────────────────────────────────────┘
```

- Gefundene Restaurants im aktuellen Ausschnitt
- Davon in Pipeline (Leads)
- Davon gewonnen
- Aktualisiert sich live wenn die Karte bewegt wird

---

## Routen-Planung

### "Route planen" Feature

Wenn der Verkäufer mehrere Restaurants besuchen will:

1. Long-Press auf Restaurants → "Zur Route hinzufügen" (Checkbox-Modus)
2. Oder: In der Liste mehrere auswählen
3. Button unten: "🗺️ Route planen (X Stops)"
4. Öffnet Google Maps Navigation mit allen Stops als Waypoints:
   ```
   https://www.google.com/maps/dir/[Start]/[Stop1]/[Stop2]/[Stop3]
   ```
5. Optimale Reihenfolge wird berechnet (nearest-neighbor Algorithmus):
   - Sortiere nach Entfernung zum aktuellen Standort
   - Dann jeweils nächstes Restaurant von der aktuellen Position

### Quick-Route

Button in der Toolbar: "🚀 Nächste 5 besuchen"
- Zeigt die 5 nächsten Restaurants die noch nicht besucht wurden (grau oder blau mit fälligem Follow-Up)
- Optimierte Reihenfolge
- Ein Tap → Google Maps öffnet mit Route

---

## Walk-In Schnellerfassung

### "Bin gerade hier" Feature

Verkäufer steht vor einem Restaurant das nicht auf Google Maps ist (selten, aber passiert):

- Floating Action Button unten rechts: "➕"
- Quick-Add Modal:
  - 📸 "Foto der Fassade machen" (Kamera)
  - Restaurant-Name *
  - Ansprechpartner (optional)
  - Telefon (optional)
  - Kurze Notiz (optional)
  - GPS-Standort wird automatisch erfasst
- Speichert direkt als Lead im CRM mit GPS-Position

---

## API Endpoints

```
GET    /api/prospecting/search          → Restaurant-Suche (Google Places + Cache)
       Query: q=Erlangen&lat=49.58&lng=11.00&radius=2000&type=restaurant
       
GET    /api/prospecting/details/[placeId] → Place Details laden (cached oder Google API)

POST   /api/prospecting/add-to-pipeline  → Restaurant zu CRM hinzufügen
       Body: { placeId, notiz? }
       → Erstellt crm_restaurants Eintrag mit Google-Daten

GET    /api/prospecting/nearby          → Restaurants im Kartenausschnitt
       Query: neLat, neLng, swLat, swLng (Map Bounds)
       → Liefert gecachte Prospects + CRM-Status

POST   /api/prospecting/route           → Route optimieren
       Body: { restaurantIds: [...] }
       → Liefert optimierte Reihenfolge + Google Maps URL

GET    /api/prospecting/stats           → Statistiken für Kartenausschnitt
       Query: neLat, neLng, swLat, swLng

# Admin
GET    /api/admin/territories           → Alle Gebiete
POST   /api/admin/territories           → Neues Gebiet erstellen
PATCH  /api/admin/territories/[id]      → Gebiet bearbeiten
DELETE /api/admin/territories/[id]      → Gebiet löschen
```

---

## Dark Mode Map Style

Google Maps Custom Styling für den Dark Theme:

```javascript
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8a9a" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a38" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#6a6a7a" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e0e1a" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];
```

---

## Dependencies

```bash
npm install @react-google-maps/api    # Google Maps React Wrapper
```

---

## Neue Dateien

```
/app
  /prospecting/page.tsx                → Hauptseite: Karte + Liste
  /api/prospecting/search/route.ts     → Google Places Search + Cache
  /api/prospecting/details/[placeId]/route.ts → Place Details
  /api/prospecting/add-to-pipeline/route.ts   → Zu CRM hinzufügen
  /api/prospecting/nearby/route.ts     → Restaurants im Kartenausschnitt
  /api/prospecting/route/route.ts      → Routen-Optimierung
  /api/prospecting/stats/route.ts      → Kartenausschnitt-Statistiken
  /api/admin/territories/route.ts      → Gebiete CRUD
  /api/admin/territories/[id]/route.ts
/components
  /ProspectingMap.tsx                  → Google Map mit Custom Markers
  /RestaurantPin.tsx                   → Custom Map Marker (farbig nach Status)
  /RestaurantBottomSheet.tsx           → Bottom Sheet bei Pin-Klick
  /RestaurantListCard.tsx              → Karte in der Ergebnis-Liste
  /ProspectingFilters.tsx              → Such- und Filter-Leiste
  /ProspectingStats.tsx                → Stats-Overlay auf der Karte
  /RouteBuilder.tsx                    → Multi-Stop Routen-Planung
  /QuickAddRestaurant.tsx              → Walk-In Schnellerfassung
```

---

## Bestehende Dateien anpassen

```
/components/BottomNav.tsx              → "Mehr" Menü: Prospecting-Link hinzufügen
                                         ODER: CRM-Tab durch "Entdecken" ersetzen
                                         mit Sub-Tabs CRM | Karte

/app/page.tsx (Home)                   → Quick-Link Karte hinzufügen:
                                         "🗺️ Restaurants entdecken" → /prospecting

/app/crm/page.tsx                      → Button oben: "🗺️ Auf Karte suchen" → /prospecting
                                         Damit der Flow klar ist: Karte → Pipeline
```

---

## Wichtige UX-Details

1. **GPS-Permission**: Beim ersten Öffnen nach Standort-Berechtigung fragen. Schöner Modal: "📍 Dein Standort hilft uns Restaurants in deiner Nähe zu finden." Falls abgelehnt → Manuelle Suche funktioniert trotzdem.

2. **Ladezeiten**: Google Places API kann 1-2 Sekunden dauern. Skeleton-Loader für die Pins (graue pulsierende Kreise auf der Karte).

3. **Offline**: Gecachte Restaurants bleiben sichtbar. Neue Suchen brauchen Internet.

4. **Karteninteraktion**: 
   - Pinch-to-Zoom muss smooth sein
   - Bei Zoom-Out: Pins clustern (Zahl anzeigen)
   - Bei Zoom-In: Einzelne Pins mit Status-Farbe
   - Pan: Keine Auto-Suche. Button: "🔄 In diesem Bereich suchen" erscheint wenn Karte bewegt wird

5. **"In diesem Bereich suchen"**: Wie bei Google Maps – Button erscheint nach Karten-Pan. Klick → Neue Suche für den sichtbaren Bereich. Verhindert unkontrollierte API-Kosten.

6. **Bottom Sheet Größen**:
   - Peek (kleine Vorschau): Name + Bewertung + Status + Action Button
   - Half (halb offen): + Adresse, Telefon, Öffnungszeiten
   - Full (voll offen): + Fotos, Website, komplette Infos, Notizen

7. **Duplikat-Erkennung**: Wenn ein Restaurant schon manuell im CRM ist (gleicher Name + ähnliche Adresse), soll es mit dem Google-Eintrag verknüpft werden statt doppelt angelegt.

---

## Prompt für Claude Code

```
Lies die Datei oriido-google-maps-prospecting.md und erweitere die bestehende 
Oriido Sales App um ein Google Maps Prospecting Modul. Die App hat bereits: 
Onboarding-Wizard, Sales Tools, CRM-Light, Dokumente, Einwände, Leitfaden, 
Briefing – alles mit Dark Theme und PIN-Login.

Baue folgendes:

1. /prospecting – Hauptseite mit Google Map (Dark Mode Style) + Ergebnis-Liste 
   darunter. Suchleiste oben mit Google Places Autocomplete. GPS-Button für 
   aktuellen Standort. Filter-Chips: Alle/Nicht besucht/In Pipeline/Gewonnen.

2. Custom Map Markers farbig nach CRM-Status: Grau (unbekannt), Blau (Lead), 
   Orange (in Arbeit), Grün (gewonnen), Rot (verloren). Marker-Clustering 
   bei vielen Pins.

3. Bottom Sheet bei Pin-Klick: Google-Infos (Name, Adresse, Bewertung, Telefon, 
   Öffnungszeiten, Fotos). Button "Zur Pipeline hinzufügen" für unbekannte 
   Restaurants → erstellt CRM-Eintrag automatisch mit allen Google-Daten. 
   Button "Im CRM öffnen" für bekannte Restaurants.

4. API mit Caching: Google Places Nearby Search + Place Details. Ergebnisse 
   in MongoDB cachen (7 Tage TTL). Place Details nur bei Klick laden 
   (Lazy Loading). "In diesem Bereich suchen" Button nach Karten-Pan.

5. Routen-Planung: Mehrere Restaurants auswählen → optimierte Route → 
   Google Maps Navigation öffnen.

6. Quick-Add: FAB Button "+" für Walk-In Erfassung mit GPS-Position.

7. Bestehende CRM-Seite: Button "Auf Karte suchen" hinzufügen.
   Home-Screen: Quick-Link "Restaurants entdecken" hinzufügen.

Dependencies: npm install @react-google-maps/api
Environment: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env

Gleicher Dark Theme (#0C0C14 bg, #FF6B35 accent). Mobile-first. Alles auf Deutsch.
```

---

## Prioritäten

1. ⭐ **Karte + Suche + Pins** – Das Kernfeature
2. ⭐ **"Zur Pipeline hinzufügen"** – Die Brücke zum CRM
3. ⭐ **Bottom Sheet mit Google-Infos** – Details auf einen Blick
4. **API-Caching** – Kosten sparen
5. **Routen-Planung** – Nice-to-have
6. **Gebietsplanung** – Für später wenn mehrere Verkäufer aktiv

---

## Google Cloud Setup-Anleitung (für Firas)

Bevor du startest, brauchst du einen Google Maps API Key:

1. Geh zu https://console.cloud.google.com
2. Neues Projekt erstellen: "Oriido Sales App"
3. APIs aktivieren:
   - Maps JavaScript API
   - Places API (New)
   - Geocoding API
4. API Key erstellen unter "Credentials"
5. Key einschränken:
   - HTTP Referrer: deine-domain.vercel.app/*
   - API-Beschränkung: Nur die 3 APIs oben
6. Budgetwarnung setzen: €50/Monat
7. Key in .env.local eintragen: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...

Kosten-Schätzung:
- Places Nearby Search: $0.032 pro Anfrage (32 Cent pro 10 Suchen)
- Place Details: $0.017 pro Anfrage
- Maps JavaScript: Kostenlos bis 28.000 Loads/Monat
- Bei 50 Suchen/Tag: ca. €30-50/Monat
