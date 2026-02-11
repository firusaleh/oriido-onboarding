# Oriido – Restaurant Onboarding Tool (Spec für Claude Code)

## Was ist das?

Ein mobil-optimiertes Web-Tool für Oriido-Verkäufer. Wenn ein Restaurant "Ja" sagt, öffnet der Verkäufer das Tool auf seinem Handy und geht Schritt für Schritt alle Daten durch. Am Ende bekommt Firas (Admin) alles gebündelt per E-Mail + Dashboard, um:

1. Den **Partnervertrag** zu erstellen
2. Das **Restaurant in Oriido** anzulegen
3. Das **Onboarding** zu starten (Speisekarte digitalisieren, QR-Codes generieren, Stripe Connect)

---

## Tech Stack

- **Framework**: Next.js 14+ App Router
- **Database**: MongoDB Atlas (Collection: `onboardings`)
- **Styling**: Tailwind CSS (mobil-first, muss auf iPhone/Android perfekt funktionieren)
- **File Uploads**: Upload zu `/api/upload` → Speicherung in MongoDB GridFS oder lokaler `/uploads` Ordner
- **E-Mail Benachrichtigung**: Resend oder Nodemailer – bei jeder neuen Einreichung E-Mail an firas.hattab@gmx.de
- **Auth**: Einfacher PIN-Schutz (Verkäufer geben 4-stelligen PIN ein, kein komplexes Auth)
- **Deployment**: Vercel

---

## Datenbank-Schema (MongoDB)

```javascript
{
  _id: ObjectId,
  status: "entwurf" | "eingereicht" | "in_bearbeitung" | "abgeschlossen",
  erstelltAm: Date,
  eingereichtAm: Date | null,
  verkaeuferId: String,       // Name oder Kürzel des Verkäufers
  
  // SCHRITT 1: Restaurant-Basics
  restaurant: {
    name: String,              // *Pflicht
    strasse: String,           // *Pflicht
    plz: String,               // *Pflicht
    stadt: String,             // *Pflicht
    googleMapsLink: String,
    art: String,               // Italienisch, Deutsch, Asiatisch, Türkisch, Griechisch, Café, Bar, Sonstiges
    artSonstiges: String,      // Falls "Sonstiges" gewählt
    sitzplaetzeInnen: Number,
    sitzplaetzeAussen: Number,
    oeffnungszeiten: {
      montag: { von: String, bis: String, geschlossen: Boolean },
      dienstag: { von: String, bis: String, geschlossen: Boolean },
      mittwoch: { von: String, bis: String, geschlossen: Boolean },
      donnerstag: { von: String, bis: String, geschlossen: Boolean },
      freitag: { von: String, bis: String, geschlossen: Boolean },
      samstag: { von: String, bis: String, geschlossen: Boolean },
      sonntag: { von: String, bis: String, geschlossen: Boolean },
    }
  },

  // SCHRITT 2: Ansprechpartner & Inhaber
  kontakt: {
    inhaberName: String,       // *Pflicht
    inhaberRolle: String,      // Inhaber / Geschäftsführer / Betriebsleiter
    handynummer: String,       // *Pflicht (direkt, nicht Festnetz)
    email: String,             // *Pflicht
    bevorzugterKanal: String,  // WhatsApp / E-Mail / Telefon
    zweiterKontakt: {
      name: String,
      rolle: String,
      handynummer: String,
    }
  },

  // SCHRITT 3: Geschäftsdaten (für Vertrag)
  geschaeftsdaten: {
    firmenname: String,        // *Pflicht – offizieller Firmenname (z.B. "Bella Napoli GmbH")
    rechtsform: String,        // GmbH, UG, Einzelunternehmen, GbR, OHG, KG, Sonstiges
    steuernummer: String,      // *Pflicht
    ustId: String,             // Umsatzsteuer-ID (optional, nicht jeder hat eine)
    handelsregister: String,   // HRB-Nummer (optional, nur bei GmbH/UG/etc.)
    iban: String,              // *Pflicht – für Stripe Connect & Auszahlungen
    bic: String,               // optional
    bankname: String,          // optional
    rechnungsadresse: {        // Falls abweichend von Restaurantadresse
      abweichend: Boolean,
      strasse: String,
      plz: String,
      stadt: String,
    }
  },

  // SCHRITT 4: Kassensystem & Technik
  technik: {
    kassensystem: String,      // *Pflicht – ready2order / orderbird / gastrofix / Anderes / Keins
    kassensystemAnderes: String,
    hatApiZugang: String,      // Ja / Nein / Weiß nicht
    wlanVorhanden: Boolean,
    tabletImService: Boolean,
    internetAnbieter: String,  // optional
  },

  // SCHRITT 5: Tische & Räumlichkeiten
  tische: {
    anzahlGesamt: Number,      // *Pflicht
    anzahlInnen: Number,
    anzahlAussen: Number,
    nummerierungVorhanden: Boolean,
    nummerierungSchema: String, // z.B. "1-20 Innen, T1-T10 Terrasse"
    grundrissFoto: String,      // Upload-URL
    besonderheiten: String,     // z.B. "Separater Raum", "2 Etagen", "Biergarten"
  },

  // SCHRITT 6: Speisekarte & Branding
  speisekarte: {
    dateien: [String],         // *Pflicht – Array von Upload-URLs (PDFs, Fotos)
    onlineLink: String,        // Falls Online-Speisekarte vorhanden
    mehrereKarten: Boolean,    // Mittag/Abend/Getränke separat?
    kartenBeschreibung: String,// z.B. "Mittagskarte + Abendkarte + Getränke"
    logo: String,              // Upload-URL
    restaurantFotos: [String], // bis zu 5 Fotos, Upload-URLs
    sprachen: [String],        // Deutsch, Englisch, etc. – welche Sprachen soll die Karte haben?
  },

  // SCHRITT 7: Vereinbarung & Abschluss
  vereinbarung: {
    paket: String,             // "standard" (€179/Monat) 
    startdatum: String,        // Gewünschtes Startdatum
    testphase: Boolean,        // 30 Tage kostenlos testen? Ja/Nein
    sonderkonditionen: String, // Falls was vereinbart wurde
    unterschriftVerkäufer: String,  // Name des Verkäufers
    unterschriftRestaurant: String, // Name des Restaurant-Ansprechpartners
    zustimmungDSGVO: Boolean,  // *Pflicht
    zustimmungAGB: Boolean,    // *Pflicht
    notizen: String,           // Freitext für Besonderheiten
  },

  // META
  fotos: {
    aussenansicht: String,     // Foto der Fassade (für Marketing)
    innenraum: String,
  }
}
```

---

## Seiten & Routen

```
/                        → PIN-Login für Verkäufer
/neu                     → Neues Restaurant → erstellt Entwurf → Weiterleitung zu /neu/[id]/1
/neu/[id]/[schritt]      → Wizard Schritt 1-7 (auto-save bei jedem Feld)
/neu/[id]/zusammenfassung → Alles auf einen Blick vor dem Absenden
/neu/[id]/erfolg          → Bestätigungsseite nach Einreichung
/meine                   → Liste aller Einreichungen des Verkäufers
/admin                   → Admin-Dashboard für Firas (anderer PIN)
/admin/[id]              → Detail-Ansicht einer Einreichung mit Status-Management
```

---

## Die 7 Wizard-Schritte im Detail

### Schritt 1: Restaurant-Basics
**Titel**: "Über das Restaurant"
**Beschreibung**: "Grundinfos – Name, Adresse, Öffnungszeiten"

Felder:
- Restaurantname (Text) *
- Straße + Hausnummer (Text) *
- PLZ (Text, 5 Zeichen) *
- Stadt (Text) *
- Google Maps Link (URL, optional) – Button: "📍 Standort teilen" der den aktuellen GPS-Standort als Google Maps Link einfügt
- Art des Restaurants (Dropdown: Italienisch, Deutsch, Asiatisch, Türkisch, Griechisch, Café, Bar, Sonstiges) *
- Sitzplätze Innen (Number)
- Sitzplätze Außen (Number)
- Öffnungszeiten (7 Zeilen Mo-So: Von/Bis Time-Picker + "Geschlossen" Toggle pro Tag)

### Schritt 2: Ansprechpartner
**Titel**: "Wer ist dein Ansprechpartner?"
**Beschreibung**: "Kontaktdaten des Entscheiders – für Vertrag und Kommunikation"

Felder:
- Name des Inhabers/GF *
- Rolle (Dropdown: Inhaber / Geschäftsführer / Betriebsleiter / Sonstiges) *
- Handynummer (Tel) * – Hinweis: "Direkte Handynummer, nicht Festnetz"
- E-Mail *
- Bevorzugter Kanal (Toggle-Buttons: WhatsApp / E-Mail / Telefon)
- Zweiter Ansprechpartner? (Toggle) → Falls ja: Name, Rolle, Handynummer

### Schritt 3: Geschäftsdaten
**Titel**: "Daten für den Vertrag"
**Beschreibung**: "Für den Partnervertrag und die Zahlungsabwicklung"

Felder:
- Offizieller Firmenname * – Hinweis: "Wie im Handelsregister eingetragen"
- Rechtsform (Dropdown: Einzelunternehmen / GbR / GmbH / UG / OHG / KG / Sonstiges) *
- Steuernummer * – Hinweis: "Findet man auf dem letzten Steuerbescheid"
- Umsatzsteuer-ID (optional) – Hinweis: "DE... Nummer, nicht jeder hat eine"
- Handelsregisternummer (optional) – nur sichtbar wenn Rechtsform GmbH/UG/OHG/KG
- IBAN * – Hinweis: "Für Auszahlungen über Stripe Connect"
- BIC (optional)
- Bankname (optional)
- Rechnungsadresse abweichend? (Toggle) → Falls ja: Straße, PLZ, Stadt

### Schritt 4: Kassensystem & Technik
**Titel**: "Technik-Check"
**Beschreibung**: "Welches Kassensystem? Brauchen wir für die Integration."

Felder:
- Kassensystem (Große Buttons mit Icons: ready2order / orderbird / gastrofix / Anderes / Keins) *
- Falls Anderes: Welches? (Text)
- Hat API-Zugang? (3 Buttons: Ja / Nein / Weiß nicht) – Hinweis bei "Weiß nicht": "Kein Problem, klären wir beim Onboarding"
- WLAN vorhanden für Gäste? (Toggle)
- Tablet/iPad im Service? (Toggle)

### Schritt 5: Tische & Räumlichkeiten
**Titel**: "Tische & Raumplan"
**Beschreibung**: "Für die QR-Codes brauchen wir die Tischinfos"

Felder:
- Anzahl Tische gesamt *
- Davon Innen (Number)
- Davon Außen (Number)
- Tischnummerierung vorhanden? (Toggle)
- Falls ja: Schema beschreiben (Text) – Beispiel: "1-20 Innen, T1-T10 Terrasse"
- Besonderheiten (Text, optional) – Beispiel: "Separater Raum, 2 Etagen, Biergarten"
- Foto der Tischanordnung (Kamera/Upload, optional)

### Schritt 6: Speisekarte & Branding
**Titel**: "Speisekarte & Bilder"
**Beschreibung**: "Die Speisekarte wird digitalisiert – Foto oder PDF reicht!"

Felder:
- Speisekarte hochladen * – Multi-Upload mit 3 Optionen:
  - 📸 "Foto machen" (öffnet Kamera direkt)
  - 📎 "Datei hochladen" (PDF, JPG, PNG)
  - 🔗 "Online-Link einfügen" (URL)
- Mehrere Karten? (Toggle) → Beschreibung: "z.B. Mittagskarte, Abendkarte, Getränkekarte"
- In welchen Sprachen? (Multi-Select: Deutsch, Englisch, Arabisch, Französisch, Türkisch, Sonstiges)
- Logo hochladen (optional)
- Restaurantfotos (optional, bis zu 5 – Fassade, Innenraum, Essen)

### Schritt 7: Vereinbarung & Abschluss
**Titel**: "Fast geschafft! 🎉"
**Beschreibung**: "Letzte Details und Bestätigung"

Felder:
- Paket-Info: Standard (€179/Monat, all-inclusive) – als Info-Card, nicht editierbar
- 30 Tage kostenlos testen? (Toggle, default: Ja)
- Gewünschtes Startdatum (Date-Picker)
- Sonderkonditionen (Text, optional) – "Falls etwas Besonderes vereinbart wurde"
- Notizen (Textarea) – "Sonstige Infos, Besonderheiten, Wünsche"
- Foto Außenansicht (optional, Kamera) – "Kurzes Foto der Fassade für Marketing"

Bestätigungen (Checkboxen):
- ☐ "Ich bestätige, dass die Angaben korrekt sind" *
- ☐ "Der Restaurantbetreiber stimmt der Datenverarbeitung gemäß DSGVO zu" *
- ☐ "Der Restaurantbetreiber stimmt den AGB von Oriido zu" *

- Name des Verkäufers (auto-filled aus Login)
- Name des Restaurant-Ansprechpartners (Text) *

**[Jetzt einreichen]** Button – Orange, groß, prominent

---

## Zusammenfassungsseite (/neu/[id]/zusammenfassung)

Zeigt ALLE Daten in übersichtlichen Karten:
1. Restaurant-Infos (Name, Adresse, Art, Öffnungszeiten)
2. Kontaktdaten (Inhaber, Telefon, E-Mail)
3. Geschäftsdaten (Firma, Steuernummer, IBAN)
4. Technik (POS, API, WLAN)
5. Tische (Anzahl, Schema)
6. Speisekarte (Upload-Vorschau, Sprachen)
7. Vereinbarung (Paket, Startdatum, Zustimmungen)

Jede Karte: "✏️ Bearbeiten" Button → springt zum Schritt zurück.

Ganz unten: **[Alles korrekt – Einreichen]**

---

## Was passiert nach Einreichung?

1. Status → "eingereicht"
2. **E-Mail an Firas** (firas.hattab@gmx.de):
   - Betreff: "🟢 Neues Restaurant: [Name] – [Stadt]"
   - Inhalt: Restaurantname, Ansprechpartner, Handynummer, Kassensystem, Anzahl Tische, Link zum Admin-Dashboard
3. **Bestätigungsseite** für Verkäufer: "✅ Erfolgreich eingereicht! Firas kümmert sich um den Rest."
4. **WhatsApp-Quick-Link**: Button "📱 Firas benachrichtigen" → öffnet wa.me/491734689676 mit vorgefertigter Nachricht

---

## Admin-Dashboard (/admin)

### Übersicht
- Statistik-Karten oben: Gesamt / Eingereicht / In Bearbeitung / Abgeschlossen
- Liste aller Einreichungen (neueste zuerst)
- Status-Filter Tabs: Alle | Eingereicht | In Bearbeitung | Abgeschlossen
- Suchfeld (Restaurantname, Stadt)
- Jede Zeile: Restaurantname, Stadt, Verkäufer, Datum, Status-Badge (farbig)

### Detail-Ansicht (/admin/[id])
- Alle Daten (gleiche Karten wie Zusammenfassung)
- Uploads: Bilder inline, PDFs als Download-Link
- **Status ändern** (Dropdown)
- **Interne Notizen** (Textarea, nur für Admin sichtbar)
- **"Vertragsdaten kopieren"** → kopiert Geschäftsdaten formatiert in Zwischenablage:
  ```
  Firma: Bella Napoli GmbH
  Rechtsform: GmbH
  Inhaber: Marco Rossi
  Steuernummer: 123/456/78901
  IBAN: DE89 3704 0044 0532 0130 00
  Adresse: Hauptstr. 42, 91054 Erlangen
  ```
- **"Oriido-Daten kopieren"** → kopiert Restaurant-Setup-Daten:
  ```
  Restaurant: Bella Napoli
  Adresse: Hauptstr. 42, 91054 Erlangen
  Kassensystem: ready2order
  Tische: 25 (15 Innen, 10 Außen)
  Sprachen: Deutsch, Englisch
  Kontakt: Marco Rossi, 0176/12345678
  ```
- **"Alles als PDF exportieren"** → generiert druckfertiges PDF mit allen Daten

---

## API Endpoints

```
POST   /api/auth/login              → PIN prüfen, Cookie setzen
POST   /api/onboarding              → Neuen Entwurf erstellen
GET    /api/onboarding/[id]         → Entwurf laden
PATCH  /api/onboarding/[id]         → Auto-Save (partielle Updates)
POST   /api/onboarding/[id]/submit  → Einreichen + E-Mail senden
GET    /api/onboarding/mine         → Alle Entwürfe des Verkäufers
POST   /api/upload                  → Datei hochladen
GET    /api/admin/onboardings       → Alle Einreichungen (Admin)
PATCH  /api/admin/onboardings/[id]  → Status/Notizen ändern
```

---

## Environment Variables

```env
MONGODB_URI=mongodb+srv://...
VERKAEUFER_PIN=1234
ADMIN_PIN=9876
EMAIL_FROM=onboarding@oriido.com
EMAIL_TO=firas.hattab@gmx.de
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=https://onboarding.oriido.com
```

---

## Design-System

```
Farben:
- Background:     #0C0C14
- Surface/Cards:  #16161F
- Surface Hover:  #1C1C28
- Border:         #2A2A38
- Accent/CTA:     #FF6B35
- Accent Hover:   #E85A24
- Text Primary:   #F0EFE8
- Text Secondary: #8A8A9A
- Success:        #22C55E
- Error:          #EF4444
- Info/Blue:      #3B82F6

Typography:
- Font: Inter oder system-ui
- H1: 24px bold
- H2: 18px bold  
- Body: 14-16px
- Labels: 12-13px, text-secondary
- Alle Texte auf Deutsch

Komponenten:
- Inputs: bg #1C1C28, border #2A2A38, focus border #FF6B35, text white
- Buttons Primary: bg #FF6B35, text white, rounded-lg, min-h 48px
- Buttons Secondary: bg transparent, border #2A2A38, text white
- Toggle: Pill-förmig, #FF6B35 wenn aktiv
- Cards: bg #16161F, border #2A2A38, rounded-xl, p-4
- Progress Bar: bg #2A2A38, fill gradient #FF6B35
- Status Badges: orange (eingereicht), blau (in Bearbeitung), grün (abgeschlossen)
```

---

## Wichtige UX-Details

1. **Auto-Save ist KRITISCH** – Verkäufer im Restaurant wird unterbrochen, muss jederzeit weitermachen können
2. **Kamera-Button = sofort Handy-Kamera öffnen** – input type="file" accept="image/*" capture="environment"
3. **Große Touch-Targets** – Alle Buttons mind. 48px hoch, genug Abstand
4. **Offline-tolerant**: Daten lokal puffern (localStorage), bei Reconnect syncen
5. **Schnell** – Keine unnötigen Animationen, lazy load Uploads
6. **Fortschritt sichtbar** – Progress bar + "Schritt X von 7" immer sichtbar
7. **Pflichtfelder erst beim "Weiter"-Klick validieren** – nicht beim Tippen
8. **Telefon**: type="tel", automatische Formatierung
9. **PLZ**: maxLength 5, nur Zahlen
10. **IBAN**: automatische Formatierung mit Leerzeichen alle 4 Zeichen

---

## Datei-Struktur

```
/app
  /page.tsx                        → Login
  /neu
    /page.tsx                      → Neuen Entwurf erstellen + Redirect
    /[id]
      /[schritt]/page.tsx          → Wizard Schritte 1-7
      /zusammenfassung/page.tsx    → Zusammenfassung vor Einreichung
      /erfolg/page.tsx             → Bestätigung nach Einreichung
  /meine/page.tsx                  → Verkäufer-Übersicht
  /admin
    /page.tsx                      → Admin-Dashboard
    /[id]/page.tsx                 → Admin-Detail
  /api
    /auth/login/route.ts
    /onboarding/route.ts
    /onboarding/[id]/route.ts
    /onboarding/[id]/submit/route.ts
    /onboarding/mine/route.ts
    /upload/route.ts
    /admin/onboardings/route.ts
    /admin/onboardings/[id]/route.ts
/components
  /WizardShell.tsx                 → Layout: Progress + Navigation
  /WizardStep.tsx                  → Container für einzelnen Schritt
  /FormField.tsx                   → Input, Select, Toggle, Textarea
  /FileUpload.tsx                  → Kamera + Datei + URL Upload
  /TimeRangePicker.tsx             → Öffnungszeiten Mo-So
  /StatusBadge.tsx                 → Farbiges Status-Badge
  /OnboardingCard.tsx              → Zusammenfassungs-Karte
  /AdminTable.tsx                  → Tabelle für Admin-Dashboard
/lib
  /mongodb.ts                      → DB Connection (Singleton)
  /auth.ts                         → PIN-Check, Cookie-Helpers
  /email.ts                        → E-Mail Template + Versand
  /validation.ts                   → Zod Schemas pro Schritt
  /hooks/useAutoSave.ts            → Auto-Save Hook (debounced PATCH)
```

---

## Prompt für Claude Code

Kopiere das hier in dein Terminal:

```
Lies die Datei oriido-onboarding-tool-spec.md und baue die komplette App 
nach dieser Spezifikation. Nutze Next.js 14 App Router, Tailwind CSS, 
MongoDB Atlas, und Resend für E-Mails. 

Starte mit:
1. Projekt-Setup (npx create-next-app, Tailwind, MongoDB-Connection)
2. DB-Schema und API-Routes
3. PIN-Login
4. Wizard mit allen 7 Schritten + Auto-Save
5. Zusammenfassung + Einreichen mit E-Mail
6. Verkäufer-Übersicht
7. Admin-Dashboard mit Detail-Ansicht
8. File-Upload Komponente mit Kamera-Support

Dark Theme mit Oriido-Branding (#0C0C14 bg, #FF6B35 accent).
Alles auf Deutsch. Mobil-first.
```

---

## Prioritäten (falls es mehrere Durchgänge braucht)

1. ⭐ Projekt-Setup + DB + Auth
2. ⭐ Wizard Schritt 1-7 mit Auto-Save (= das Kernprodukt)
3. ⭐ Zusammenfassung + Einreichen + E-Mail
4. Verkäufer-Übersicht
5. Admin-Dashboard + Detail + Status
6. File Uploads (Kamera + Datei)
7. Polish: Offline-Support, IBAN-Formatierung, PDF-Export
