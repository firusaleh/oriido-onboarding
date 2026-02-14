# Oriido – Digitale Vertragsabwicklung (Spec für Claude Code)

## Kontext

Die Oriido Sales App hat bereits:
- ✅ Onboarding-Wizard (7 Schritte, Auto-Save, Admin-Dashboard)
- ✅ Sales Tools (Checkliste, QR-Demo)
- ✅ Dokumente Hub, Einwand-Datenbank, Gesprächsleitfaden, Tages-Briefing
- ✅ CRM-Light mit Pipeline
- ✅ Google Maps Prospecting
- ✅ PIN-Login, Bottom Navigation, Dark Theme

Jetzt kommt das **Vertragsmodul**: Verträge werden direkt vor Ort auf dem Handy generiert, vom Restaurant digital unterschrieben und als PDF an beide Seiten verschickt. Kein Papierkram, kein Nachfassen, Deal closed in einer Sitzung.

---

## Neue Routen

```
/vertrag                           → Vertrags-Dashboard (Liste aller Verträge)
/vertrag/neu/[onboardingId]        → Vertrag aus Onboarding-Daten generieren
/vertrag/neu/manuell               → Vertrag manuell erstellen (ohne Onboarding)
/vertrag/[id]                      → Vertrag ansehen / Status verwalten
/vertrag/[id]/unterschreiben       → Unterschrifts-Seite (Fullscreen, Restaurant + Verkäufer)
/vertrag/[id]/pdf                  → Generiertes PDF anzeigen / downloaden
/admin/vorlagen                    → Vertragsvorlagen verwalten (Admin)
/admin/vorlagen/[id]               → Vorlage bearbeiten (Admin)
/admin/vertraege                   → Alle Verträge aller Verkäufer (Admin)
```

---

## Gesamter Flow

```
Verkäufer schließt Onboarding-Wizard ab (Schritt 7)
         │
         ▼
  "Vertrag jetzt erstellen" Button
         │
         ▼
  Vertrag wird automatisch generiert
  (Daten aus Onboarding → Vorlage → Vorausgefüllt)
         │
         ▼
  Verkäufer prüft den Vertrag auf dem Handy
  Kann Felder korrigieren wenn nötig
         │
         ▼
  "Zur Unterschrift" Button
         │
         ▼
  Unterschrifts-Seite (Fullscreen):
  1. Restaurant-Inhaber unterschreibt mit Finger auf dem Display
  2. Verkäufer unterschreibt
  3. Beide bestätigen
         │
         ▼
  PDF wird generiert mit:
  - Allen Vertragsdaten
  - Beiden Unterschriften
  - Datum + Ort
  - Oriido-Branding
         │
         ▼
  PDF wird automatisch verschickt:
  - Per E-Mail an Restaurant (Inhaber-E-Mail aus Onboarding)
  - Per E-Mail an Firas (firas.hattab@gmx.de)
  - Kopie im Vertrags-Dashboard gespeichert
         │
         ▼
  Optional: SEPA-Lastschriftmandat gleich mit unterschreiben
         │
         ▼
  ✅ Fertig. Restaurant ist vertraglich an Bord.
```

---

## Datenbank-Schemas

### Vertragsvorlagen (Admin erstellt diese)

```javascript
// Collection: contract_templates
{
  _id: ObjectId,
  name: String,                // *Pflicht – "Oriido Standardvertrag"
  beschreibung: String,        // "Standardvertrag für €179/Monat Abo"
  typ: String,                 // "standard" | "testphase" | "sonder" | "sepa"
  version: Number,             // 1, 2, 3... – Auto-Increment bei Änderung
  aktiv: Boolean,              // Nur aktive Vorlagen stehen zur Auswahl
  
  // Vertragsinhalt als strukturierte Sektionen
  sektionen: [{
    titel: String,             // "§1 Vertragsgegenstand"
    inhalt: String,            // Markdown mit Platzhaltern: {firmenname}, {paketpreis}, etc.
    reihenfolge: Number,
  }],
  
  // Verfügbare Platzhalter in dieser Vorlage
  platzhalter: [{
    key: String,               // "firmenname"
    label: String,             // "Offizieller Firmenname"
    quelle: String,            // "onboarding.geschaeftsdaten.firmenname" – Auto-Mapping
    pflicht: Boolean,
    standardwert: String,      // Fallback-Wert
  }],
  
  // Meta
  erstelltAm: Date,
  aktualisiertAm: Date,
  erstelltVon: String,
}
```

### Verträge (generierte Verträge)

```javascript
// Collection: contracts
{
  _id: ObjectId,
  vertragsnummer: String,      // Auto-generiert: "ORI-2026-0042"
  
  // Status-Workflow
  status: String,              // "entwurf" | "zur_unterschrift" | "unterschrieben" | "aktiv" | "gekuendigt" | "storniert"
  
  // Verknüpfungen
  onboardingId: ObjectId,      // Referenz zum Onboarding (optional)
  crmId: ObjectId,             // Referenz zum CRM-Eintrag (optional)
  vorlagenId: ObjectId,        // Welche Vorlage wurde verwendet
  vorlagenVersion: Number,     // Welche Version der Vorlage
  verkaeuferId: String,        // Wer hat den Vertrag erstellt
  
  // Vertragsparteien
  auftragnehmer: {             // Oriido
    firmenname: "Oriido – Firas Hattab",
    adresse: String,
    steuernummer: String,
    vertreter: "Firas Hattab",
  },
  auftraggeber: {              // Restaurant
    firmenname: String,        // *Pflicht
    rechtsform: String,
    inhaberName: String,       // *Pflicht
    adresse: String,           // *Pflicht
    plz: String,
    stadt: String,
    steuernummer: String,      // *Pflicht
    ustId: String,
    handelsregister: String,
    email: String,             // *Pflicht – für PDF-Versand
    telefon: String,
  },
  
  // Vertragsdetails
  details: {
    paket: String,             // "Standard"
    monatspreis: Number,       // 179
    waehrung: String,          // "EUR"
    setupGebuehr: Number,      // 200 (oder 0 bei Testphase)
    laufzeit: String,          // "unbefristet" | "12_monate"
    kuendigungsfrist: String,  // "monatlich" | "3_monate"
    testphase: Boolean,        // 30 Tage kostenlos?
    testphaseTage: Number,     // 30
    startdatum: Date,          // *Pflicht
    sonderkonditionen: String, // Freitext
  },
  
  // Zahlungsdaten (SEPA)
  zahlung: {
    iban: String,              // *Pflicht
    bic: String,
    bankname: String,
    kontoinhaber: String,      // Falls abweichend vom Inhaber
    sepaMandat: Boolean,       // Wurde SEPA-Mandat mit unterschrieben?
    sepaMandatRef: String,     // Auto-generiert: "SEPA-ORI-2026-0042"
    sepaMandatDatum: Date,
  },
  
  // Unterschriften
  unterschriften: {
    restaurant: {
      name: String,            // Name des Unterzeichners
      rolle: String,           // "Inhaber" / "Geschäftsführer"
      signaturBild: String,    // Base64 PNG der Unterschrift
      datum: Date,
      ort: String,
      ip: String,              // IP-Adresse (für Nachweis)
    },
    verkaeufer: {
      name: String,
      signaturBild: String,    // Base64 PNG
      datum: Date,
    },
  },
  
  // Generiertes PDF
  pdf: {
    url: String,               // Gespeicherter PDF-Link
    generiertAm: Date,
    version: Number,           // Bei Neugeneration
  },
  
  // E-Mail-Versand
  versand: {
    restaurantEmail: {
      gesendetAm: Date,
      status: String,          // "gesendet" | "fehlgeschlagen" | "offen"
    },
    adminEmail: {
      gesendetAm: Date,
      status: String,
    },
  },
  
  // Historie
  historie: [{
    aktion: String,            // "erstellt" | "bearbeitet" | "unterschrieben" | "gesendet" | "gekuendigt"
    datum: Date,
    von: String,               // "verkaeufer:markus" | "admin" | "system"
    details: String,
  }],
  
  // Meta
  erstelltAm: Date,
  aktualisiertAm: Date,
}
```

---

## Vertragsvorlagen (Seed-Daten)

### Vorlage 1: Oriido Standard-Partnervertrag

```javascript
{
  name: "Oriido Standard-Partnervertrag",
  typ: "standard",
  version: 1,
  aktiv: true,
  sektionen: [
    {
      titel: "Präambel",
      inhalt: "Zwischen\n\n**{oriido_firma}**\n{oriido_adresse}\n(nachfolgend „Oriido")\n\nund\n\n**{firmenname}**\n{auftraggeber_adresse}, {auftraggeber_plz} {auftraggeber_stadt}\nvertreten durch {inhaber_name} ({inhaber_rolle})\nSteuernummer: {steuernummer}\n(nachfolgend „Partner")\n\nwird folgender Vertrag geschlossen:",
      reihenfolge: 1,
    },
    {
      titel: "§1 Vertragsgegenstand",
      inhalt: "Oriido stellt dem Partner eine digitale Bestell- und Bezahlplattform zur Verfügung. Diese umfasst:\n\n- Digitale Speisekarte mit QR-Code-Zugang für Gäste\n- Integration in das bestehende Kassensystem des Partners\n- Mobile Bezahlfunktion (Stripe Connect)\n- Echtzeit-Dashboard mit Bestellübersicht und Analysen\n- QR-Code Tischaufsteller (Erstausstattung)\n- Persönliches Onboarding und technische Einrichtung\n- Laufender technischer Support",
      reihenfolge: 2,
    },
    {
      titel: "§2 Leistungen von Oriido",
      inhalt: "Oriido verpflichtet sich:\n\n- Die Plattform innerhalb von 3 Werktagen nach Vertragsunterzeichnung betriebsbereit einzurichten\n- Die Speisekarte des Partners zu digitalisieren\n- QR-Codes für alle Tische zu erstellen und bereitzustellen\n- Die Anbindung an das Kassensystem des Partners herzustellen\n- Technischen Support während der Geschäftszeiten (Mo-Sa 9-18 Uhr) bereitzustellen\n- Die Plattform kontinuierlich weiterzuentwickeln und zu warten",
      reihenfolge: 3,
    },
    {
      titel: "§3 Pflichten des Partners",
      inhalt: "Der Partner verpflichtet sich:\n\n- Die für die Einrichtung erforderlichen Zugangsdaten zum Kassensystem bereitzustellen\n- Eine aktuelle Speisekarte in digitaler oder gedruckter Form zu übergeben\n- Die QR-Code Tischaufsteller sichtbar auf den Tischen zu platzieren\n- Änderungen an der Speisekarte zeitnah mitzuteilen\n- Die Stripe Connect Registrierung vollständig durchzuführen",
      reihenfolge: 4,
    },
    {
      titel: "§4 Vergütung",
      inhalt: "Für die Nutzung der Plattform zahlt der Partner:\n\n- **Monatliche Gebühr:** {paketpreis} € (netto) zzgl. gesetzlicher MwSt.\n- **Einmalige Einrichtungsgebühr:** {setup_gebuehr} € (netto) zzgl. gesetzlicher MwSt.\n{testphase_text}\n\nDie Abrechnung erfolgt monatlich per SEPA-Lastschrift. Die erste Abbuchung erfolgt {erste_abbuchung}.\n\nTransaktionsgebühren für Kartenzahlungen über Stripe werden direkt von Stripe berechnet und sind nicht Bestandteil dieses Vertrags.",
      reihenfolge: 5,
    },
    {
      titel: "§5 Vertragslaufzeit und Kündigung",
      inhalt: "Der Vertrag wird auf unbestimmte Zeit geschlossen und kann von beiden Seiten mit einer Frist von **{kuendigungsfrist}** zum Monatsende schriftlich oder per E-Mail gekündigt werden.\n\nDas Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.\n\nVertragsbeginn: **{startdatum}**",
      reihenfolge: 6,
    },
    {
      titel: "§6 Datenschutz",
      inhalt: "Oriido verarbeitet personenbezogene Daten im Auftrag des Partners gemäß Art. 28 DSGVO. Eine gesonderte Auftragsverarbeitungsvereinbarung (AVV) ist Bestandteil dieses Vertrags und wird separat bereitgestellt.\n\nGästedaten (Bestelldaten, Zahlungsdaten) werden ausschließlich zur Auftragsabwicklung verwendet und nicht an Dritte weitergegeben.",
      reihenfolge: 7,
    },
    {
      titel: "§7 Haftung",
      inhalt: "Oriido haftet für Schäden nur bei Vorsatz und grober Fahrlässigkeit. Die Haftung für leichte Fahrlässigkeit ist auf vertragstypische, vorhersehbare Schäden begrenzt.\n\nOriido gewährleistet eine Verfügbarkeit der Plattform von 99% im Jahresdurchschnitt. Geplante Wartungsarbeiten werden mindestens 24 Stunden im Voraus angekündigt.",
      reihenfolge: 8,
    },
    {
      titel: "§8 Sondervereinbarungen",
      inhalt: "{sonderkonditionen_text}",
      reihenfolge: 9,
    },
    {
      titel: "§9 Schlussbestimmungen",
      inhalt: "Änderungen und Ergänzungen dieses Vertrags bedürfen der Schriftform. Dies gilt auch für die Aufhebung dieses Schriftformerfordernisses.\n\nSollte eine Bestimmung dieses Vertrags unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.\n\nEs gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist Erlangen.",
      reihenfolge: 10,
    },
  ],
  platzhalter: [
    { key: "oriido_firma", label: "Oriido Firma", quelle: "static", pflicht: true, standardwert: "Oriido – Firas Hattab" },
    { key: "oriido_adresse", label: "Oriido Adresse", quelle: "static", pflicht: true, standardwert: "Erlangen, Deutschland" },
    { key: "firmenname", label: "Firmenname", quelle: "onboarding.geschaeftsdaten.firmenname", pflicht: true },
    { key: "auftraggeber_adresse", label: "Adresse", quelle: "onboarding.restaurant.strasse", pflicht: true },
    { key: "auftraggeber_plz", label: "PLZ", quelle: "onboarding.restaurant.plz", pflicht: true },
    { key: "auftraggeber_stadt", label: "Stadt", quelle: "onboarding.restaurant.stadt", pflicht: true },
    { key: "inhaber_name", label: "Inhaber", quelle: "onboarding.kontakt.inhaberName", pflicht: true },
    { key: "inhaber_rolle", label: "Rolle", quelle: "onboarding.kontakt.inhaberRolle", pflicht: true },
    { key: "steuernummer", label: "Steuernummer", quelle: "onboarding.geschaeftsdaten.steuernummer", pflicht: true },
    { key: "paketpreis", label: "Monatspreis", quelle: "details.monatspreis", pflicht: true, standardwert: "179" },
    { key: "setup_gebuehr", label: "Setup-Gebühr", quelle: "details.setupGebuehr", pflicht: true, standardwert: "200" },
    { key: "kuendigungsfrist", label: "Kündigungsfrist", quelle: "details.kuendigungsfrist", pflicht: true, standardwert: "1 Monat" },
    { key: "startdatum", label: "Startdatum", quelle: "details.startdatum", pflicht: true },
    { key: "testphase_text", label: "Testphase", quelle: "computed", pflicht: false },
    { key: "erste_abbuchung", label: "Erste Abbuchung", quelle: "computed", pflicht: false },
    { key: "sonderkonditionen_text", label: "Sonderkonditionen", quelle: "details.sonderkonditionen", pflicht: false, standardwert: "Keine Sondervereinbarungen." },
  ],
}
```

### Vorlage 2: SEPA-Lastschriftmandat

```javascript
{
  name: "SEPA-Lastschriftmandat",
  typ: "sepa",
  version: 1,
  aktiv: true,
  sektionen: [
    {
      titel: "SEPA-Basis-Lastschriftmandat",
      inhalt: "**Gläubiger:**\nOriido – Firas Hattab\nGläubiger-ID: {glaeubiger_id}\n\n**Zahlungspflichtiger:**\n{firmenname}\n{auftraggeber_adresse}, {auftraggeber_plz} {auftraggeber_stadt}\n\n**Mandatsreferenz:** {sepa_mandatsref}\n\nIch/Wir ermächtige(n) Oriido – Firas Hattab, Zahlungen von meinem/unserem Konto mittels Lastschrift einzuziehen. Zugleich weise(n) ich/wir mein/unser Kreditinstitut an, die von Oriido – Firas Hattab auf mein/unser Konto gezogenen Lastschriften einzulösen.\n\n**Hinweis:** Ich kann/Wir können innerhalb von acht Wochen, beginnend mit dem Belastungsdatum, die Erstattung des belasteten Betrages verlangen. Es gelten dabei die mit meinem/unserem Kreditinstitut vereinbarten Bedingungen.\n\n**Kreditinstitut:** {bankname}\n**IBAN:** {iban}\n**BIC:** {bic}\n**Kontoinhaber:** {kontoinhaber}",
      reihenfolge: 1,
    },
  ],
  platzhalter: [
    { key: "glaeubiger_id", label: "Gläubiger-ID", quelle: "static", pflicht: true, standardwert: "[WIRD ERGÄNZT]" },
    { key: "firmenname", label: "Firmenname", quelle: "onboarding.geschaeftsdaten.firmenname", pflicht: true },
    { key: "auftraggeber_adresse", label: "Adresse", quelle: "onboarding.restaurant.strasse", pflicht: true },
    { key: "auftraggeber_plz", label: "PLZ", quelle: "onboarding.restaurant.plz", pflicht: true },
    { key: "auftraggeber_stadt", label: "Stadt", quelle: "onboarding.restaurant.stadt", pflicht: true },
    { key: "sepa_mandatsref", label: "Mandatsreferenz", quelle: "computed", pflicht: true },
    { key: "bankname", label: "Bank", quelle: "onboarding.geschaeftsdaten.bankname", pflicht: false, standardwert: "" },
    { key: "iban", label: "IBAN", quelle: "onboarding.geschaeftsdaten.iban", pflicht: true },
    { key: "bic", label: "BIC", quelle: "onboarding.geschaeftsdaten.bic", pflicht: false, standardwert: "" },
    { key: "kontoinhaber", label: "Kontoinhaber", quelle: "onboarding.kontakt.inhaberName", pflicht: true },
  ],
}
```

---

## Modul-Details

### 1. Vertrag aus Onboarding erstellen ("/vertrag/neu/[onboardingId]")

#### Trigger
Am Ende des Onboarding-Wizards (Schritt 7 oder Zusammenfassungsseite) neuer Button:

```
  [Onboarding einreichen]          ← existiert bereits
  [📝 Vertrag jetzt erstellen]     ← NEU, orange outline Button
```

Oder nach dem Einreichen auf der Erfolgsseite:
```
  ✅ Erfolgreich eingereicht!
  
  Nächster Schritt:
  [📝 Vertrag direkt erstellen & unterschreiben lassen]
```

#### Automatisches Befüllen

Wenn der Verkäufer auf "Vertrag erstellen" klickt:

1. Onboarding-Daten werden geladen
2. Standard-Vertragsvorlage wird ausgewählt
3. Platzhalter werden automatisch aus den Onboarding-Daten befüllt:

```
{firmenname}          ← onboarding.geschaeftsdaten.firmenname
{inhaber_name}        ← onboarding.kontakt.inhaberName
{inhaber_rolle}       ← onboarding.kontakt.inhaberRolle
{auftraggeber_adresse}← onboarding.restaurant.strasse
{auftraggeber_plz}    ← onboarding.restaurant.plz
{auftraggeber_stadt}  ← onboarding.restaurant.stadt
{steuernummer}        ← onboarding.geschaeftsdaten.steuernummer
{iban}                ← onboarding.geschaeftsdaten.iban
{paketpreis}          ← onboarding.vereinbarung.paket → 179
{startdatum}          ← onboarding.vereinbarung.startdatum
{sonderkonditionen}   ← onboarding.vereinbarung.sonderkonditionen
```

4. Berechnete Felder:
```
{testphase_text}      ← Wenn testphase=true: "Die ersten 30 Tage sind kostenfrei (Testphase). 
                         Wird nicht innerhalb der Testphase gekündigt, geht der Vertrag 
                         automatisch in ein zahlungspflichtiges Abo über."
                         Wenn testphase=false: "" (leer)
                         
{erste_abbuchung}     ← Wenn testphase: startdatum + 30 Tage
                         Sonst: startdatum
                         
{vertragsnummer}      ← Auto: "ORI-" + Jahr + "-" + laufende Nummer (4-stellig, zero-padded)
{sepa_mandatsref}     ← "SEPA-" + vertragsnummer
```

#### Vertrags-Vorschau Seite

Nachdem die Daten gemappt sind, sieht der Verkäufer eine Vorschau:

**Header:**
- "Vertrag für **{restaurantname}**"
- Vertragsnummer: ORI-2026-0042
- Status-Badge: "Entwurf"

**Vertragsdetails-Karten** (editierbar):

Karte 1: "Vertragspartner"
- Firmenname (editierbar)
- Inhaber (editierbar)
- Adresse (editierbar)
- Steuernummer (editierbar)

Karte 2: "Konditionen"
- Paket: Standard – €179/Monat
- Setup-Gebühr: €200 (editierbar, z.B. auf €0 setzen als Sonderkondition)
- Testphase: Ja / Nein (Toggle)
- Startdatum (Date-Picker)
- Kündigungsfrist: Dropdown (1 Monat / 3 Monate)
- Sonderkonditionen (Textarea)

Karte 3: "Zahlungsdaten"
- IBAN (editierbar)
- BIC
- Bankname
- Kontoinhaber
- ☐ SEPA-Lastschriftmandat mit unterschreiben (Toggle, default: Ja)

**Vertragstext-Vorschau:**
- Aufklappbar: "📄 Vertragstext anzeigen"
- Zeigt den kompletten Vertrag mit eingesetzten Daten
- Markdown gerendert, schön formatiert
- Paragraphen mit §-Nummern
- Platzhalter sind orange hervorgehoben wenn noch nicht befüllt

**Aktionen unten:**
- "Weiter zur Unterschrift →" (orange, groß, volle Breite)
  - Nur aktiv wenn alle Pflichtfelder befüllt
- "💾 Als Entwurf speichern" (grau, outline)
  - Speichert den Vertrag als Entwurf, kann später fortgesetzt werden

---

### 2. Digitale Unterschrift ("/vertrag/[id]/unterschreiben")

#### Fullscreen-Modus
Diese Seite geht in den Fullscreen-Modus (kein Header, keine Bottom Nav). Clean und seriös.

#### Flow: 3 Schritte

**Schritt 1: Zusammenfassung**

Kompakte Zusammenfassung auf einem Screen:

```
┌────────────────────────────────────────┐
│  oriido                                │
│                                        │
│  Partnervertrag                        │
│  ORI-2026-0042                         │
│                                        │
│  Zwischen:                             │
│  Oriido – Firas Hattab                 │
│  und                                   │
│  Bella Napoli GmbH                     │
│  vertreten durch Marco Rossi           │
│                                        │
│  ─────────────────────────────────     │
│  Paket: Standard         €179/Monat    │
│  Setup-Gebühr:           €200          │
│  Testphase:              30 Tage       │
│  Startdatum:             01.03.2026    │
│  Kündigung:              1 Monat       │
│  SEPA-Mandat:            Ja            │
│  ─────────────────────────────────     │
│                                        │
│  ☐ Ich habe den vollständigen          │
│    Vertragstext gelesen und stimme zu  │
│  ☐ Ich stimme dem SEPA-Lastschrift-    │
│    mandat zu                           │
│  ☐ Ich stimme der Datenschutz-         │
│    erklärung zu                        │
│                                        │
│  [📄 Vollständigen Vertrag lesen]      │
│                                        │
│  [Weiter zur Unterschrift →]           │
└────────────────────────────────────────┘
```

**Schritt 2: Restaurant unterschreibt**

```
┌────────────────────────────────────────┐
│                                        │
│  Unterschrift des Partners             │
│                                        │
│  {inhaber_name}                        │
│  {inhaber_rolle}, {firmenname}         │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │                                  │  │
│  │    [SIGNATURE CANVAS]            │  │
│  │    Hier mit dem Finger           │  │
│  │    unterschreiben                │  │
│  │                                  │  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Ort: [Erlangen        ]              │
│  Datum: 14.02.2026 (automatisch)       │
│                                        │
│  [↩️ Löschen]  [Unterschrift bestätigen│→]
└────────────────────────────────────────┘
```

- **Signature Canvas:**
  - Weißer Hintergrund, schwarze Tinte
  - Touch-Input mit Druckempfindlichkeit (dickere Striche bei mehr Druck)
  - Smooth Bezier-Kurven (nicht eckig)
  - "Löschen" Button → Canvas leeren, nochmal unterschreiben
  - Mindestgröße: Unterschrift muss mind. 30% des Canvas nutzen (sonst Warnung)
  - Library: `react-signature-canvas` oder `signature_pad`

- **Nach Bestätigung:**
  - Unterschrift wird als Base64 PNG gespeichert
  - Canvas wird gesperrt (nicht mehr editierbar)
  - Weiter zu Schritt 3

**Schritt 3: Verkäufer unterschreibt**

Gleicher Canvas, aber für den Verkäufer:

```
┌────────────────────────────────────────┐
│                                        │
│  Unterschrift des Oriido-Vertreters    │
│                                        │
│  {verkaeufer_name}                     │
│  Vertriebsmitarbeiter, Oriido          │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │                                  │  │
│  │    [SIGNATURE CANVAS]            │  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Datum: 14.02.2026                     │
│                                        │
│  [↩️ Löschen]     [Vertrag abschließen]│
└────────────────────────────────────────┘
```

**Nach beiden Unterschriften → Bestätigungsscreen:**

```
┌────────────────────────────────────────┐
│                                        │
│           ✅                           │
│                                        │
│    Vertrag unterschrieben!             │
│                                        │
│    Bella Napoli GmbH ist jetzt         │
│    offiziell Oriido-Partner.           │
│                                        │
│    PDF wird generiert und per          │
│    E-Mail verschickt an:              │
│    📧 marco@bellanapoli.de            │
│    📧 firas.hattab@gmx.de            │
│                                        │
│    [📄 PDF anzeigen]                   │
│    [🏠 Zurück zur Übersicht]          │
│                                        │
└────────────────────────────────────────┘
```

---

### 3. PDF-Generierung

#### Aufbau des PDFs (A4, mehrseitig)

**Seite 1+: Vertragstext**
- Header: Oriido Logo links, "PARTNERVERTRAG" rechts
- Vertragsnummer + Datum
- Sektionen mit §-Nummern
- Professionelles Layout, saubere Typografie
- Seitenumbrüche zwischen langen Sektionen

**Letzte Seite: Unterschriften**
```
┌────────────────────────────────────────────┐
│                                            │
│  Ort, Datum: Erlangen, 14.02.2026          │
│                                            │
│  ─────────────────  ─────────────────      │
│                                            │
│  Für den Partner:   Für Oriido:            │
│                                            │
│  [SIGNATUR-BILD]    [SIGNATUR-BILD]        │
│                                            │
│  Marco Rossi        Markus Weber           │
│  Inhaber            Vertriebsmitarbeiter   │
│  Bella Napoli GmbH  Oriido                 │
│                                            │
└────────────────────────────────────────────┘
```

**Falls SEPA-Mandat: Extra-Seite**
- SEPA-Lastschriftmandat als eigene Seite
- Mit eigener Unterschrift (gleiche Signatur wird wiederverwendet)
- Mandatsreferenz prominent oben

#### Technische Umsetzung
- Library: `@react-pdf/renderer` oder `puppeteer` (HTML → PDF) oder `pdf-lib`
- Empfehlung: **pdf-lib** für serverseitige Generierung
  - Schriften einbetten (DM Sans oder fallback)
  - Bilder einbetten (Unterschriften, Logo)
  - Saubere Seitenumbrüche
- PDF wird in `/uploads/vertraege/` gespeichert
- Dateigröße schätzen: 100-200KB pro Vertrag

---

### 4. E-Mail-Versand

#### E-Mail an Restaurant

```
Betreff: Ihr Oriido-Partnervertrag – {firmenname}

Hallo {inhaber_name},

vielen Dank für Ihr Vertrauen! Anbei finden Sie Ihren unterschriebenen 
Partnervertrag mit Oriido.

Vertragsnummer: {vertragsnummer}
Startdatum: {startdatum}
Paket: Standard – {paketpreis} €/Monat

Nächste Schritte:
1. Wir digitalisieren Ihre Speisekarte
2. Wir richten die Kassensystem-Integration ein
3. Sie erhalten Ihre QR-Code Tischaufsteller
4. Go-Live innerhalb von 3 Tagen!

Bei Fragen erreichen Sie uns jederzeit:
📞 01734689676 (Firas Hattab)
📧 info@oriido.com

Herzliche Grüße
Ihr Oriido-Team

[PDF als Anhang: Partnervertrag-ORI-2026-0042.pdf]
```

#### E-Mail an Firas (Admin)

```
Betreff: 🟢 Neuer Vertrag unterschrieben: {firmenname} – {stadt}

Neuer Vertrag!

Restaurant: {firmenname}
Inhaber: {inhaber_name}
Stadt: {stadt}
Paket: €{paketpreis}/Monat
Testphase: {ja/nein}
Verkäufer: {verkaeufer_name}

→ Dashboard öffnen: {admin_link}

[PDF als Anhang]
```

---

### 5. Vertrags-Dashboard ("/vertrag")

#### Verkäufer-Ansicht

**Header:**
- Titel: "Meine **Verträge**"
- Schnell-Stats: X Entwürfe | Y Unterschrieben | Z Aktiv

**Filter-Tabs:**
Alle | Entwürfe | Zur Unterschrift | Unterschrieben | Aktiv

**Vertragskarten:**
```
┌──────────────────────────────────────┐
│  Bella Napoli GmbH          🟢 Aktiv │
│  ORI-2026-0042 · €179/Monat         │
│  Marco Rossi · Erlangen              │
│  Unterschrieben am 14.02.2026        │
│  [📄 PDF]  [📋 Details]             │
└──────────────────────────────────────┘
```

Status-Farben:
- ⚪ Entwurf (grau)
- 🟡 Zur Unterschrift (orange)
- 🔵 Unterschrieben (blau)
- 🟢 Aktiv (grün)
- 🔴 Gekündigt/Storniert (rot)

#### Admin-Ansicht ("/admin/vertraege")

Gleich wie Verkäufer, aber:
- Alle Verträge aller Verkäufer
- Filter nach Verkäufer
- Status ändern (z.B. "Unterschrieben" → "Aktiv" wenn alles eingerichtet ist)
- Vertrag stornieren / als gekündigt markieren
- Monatsübersicht: Neue Verträge diesen Monat, MRR (Monthly Recurring Revenue), Churn
- Export: CSV mit allen Vertragsdaten

---

### 6. Vorlagen-Verwaltung (Admin) ("/admin/vorlagen")

#### Vorlagen-Liste
- Alle Vorlagen mit Name, Typ, Version, Status (Aktiv/Inaktiv)
- "Aktiv" Toggle pro Vorlage
- "Neue Vorlage" Button

#### Vorlagen-Editor ("/admin/vorlagen/[id]")

**Sektionen-Editor:**
- Drag & Drop Reihenfolge der Sektionen
- Jede Sektion: Titel + Inhalt (Markdown-Editor mit Vorschau)
- Platzhalter einfügen per Klick aus einer Sidebar-Liste
- "+ Sektion hinzufügen" am Ende

**Platzhalter-Verwaltung:**
- Liste aller Platzhalter dieser Vorlage
- Für jeden: Key, Label, Auto-Mapping Quelle, Pflichtfeld, Standardwert
- "+ Platzhalter hinzufügen"

**Vorschau:**
- "👁️ Vorschau mit Testdaten" Button
- Zeigt den Vertrag mit Beispieldaten befüllt
- PDF-Vorschau generieren

**Versionierung:**
- Bei jeder Änderung: "Änderungen speichern" → Version +1
- Alte Versionen bleiben erhalten (für bestehende Verträge)
- Bestehende Verträge verweisen immer auf die Version mit der sie erstellt wurden

---

## API Endpoints

```
# Verträge
GET    /api/contracts                        → Alle Verträge des Verkäufers
POST   /api/contracts                        → Neuen Vertrag erstellen (aus Onboarding oder manuell)
GET    /api/contracts/[id]                   → Vertrag laden
PATCH  /api/contracts/[id]                   → Vertrag bearbeiten (Entwurf)
POST   /api/contracts/[id]/sign              → Unterschriften speichern + Status updaten
POST   /api/contracts/[id]/generate-pdf      → PDF generieren
POST   /api/contracts/[id]/send              → PDF per E-Mail versenden
PATCH  /api/contracts/[id]/status            → Status ändern (Admin)
GET    /api/contracts/[id]/pdf               → PDF downloaden

# Vorlagen
GET    /api/templates                        → Alle aktiven Vorlagen
POST   /api/templates                        → Neue Vorlage (Admin)
GET    /api/templates/[id]                   → Vorlage laden
PATCH  /api/templates/[id]                   → Vorlage bearbeiten (Admin)
DELETE /api/templates/[id]                   → Vorlage löschen (Admin)
POST   /api/templates/[id]/preview           → Vorschau mit Testdaten generieren
POST   /api/templates/seed                   → Seed: Standard-Vertrag + SEPA-Mandat

# Admin
GET    /api/admin/contracts                  → Alle Verträge (Admin)
GET    /api/admin/contracts/stats            → MRR, Anzahl, Churn
GET    /api/admin/contracts/export           → CSV Export
```

---

## Dependencies

```bash
npm install pdf-lib                    # PDF-Generierung (serverseitig)
npm install @react-signature-canvas    # Unterschrift-Canvas (NICHT react-signature-canvas, 
                                       # sondern: npm install signature_pad + eigene React Wrapper)
npm install signature_pad              # Signature Canvas Library
npm install @fontsource/dm-sans        # Font für PDF-Einbettung
```

---

## Neue Dateien

```
/app
  /vertrag/page.tsx                            → Vertrags-Dashboard
  /vertrag/neu/[onboardingId]/page.tsx         → Vertrag aus Onboarding
  /vertrag/neu/manuell/page.tsx                → Manueller Vertrag
  /vertrag/[id]/page.tsx                       → Vertrags-Detail
  /vertrag/[id]/unterschreiben/page.tsx        → Unterschrifts-Flow (Fullscreen)
  /vertrag/[id]/pdf/page.tsx                   → PDF-Ansicht
  /admin/vorlagen/page.tsx                     → Vorlagen-Liste
  /admin/vorlagen/[id]/page.tsx                → Vorlagen-Editor
  /admin/vertraege/page.tsx                    → Admin Vertrags-Übersicht
  /api/contracts/route.ts
  /api/contracts/[id]/route.ts
  /api/contracts/[id]/sign/route.ts
  /api/contracts/[id]/generate-pdf/route.ts
  /api/contracts/[id]/send/route.ts
  /api/contracts/[id]/status/route.ts
  /api/contracts/[id]/pdf/route.ts
  /api/templates/route.ts
  /api/templates/[id]/route.ts
  /api/templates/[id]/preview/route.ts
  /api/templates/seed/route.ts
  /api/admin/contracts/route.ts
  /api/admin/contracts/stats/route.ts
  /api/admin/contracts/export/route.ts
/components
  /ContractPreview.tsx                         → Vertrags-Vorschau (Markdown gerendert)
  /ContractCard.tsx                            → Karte in der Vertragsliste
  /ContractEditor.tsx                          → Vertragsdetails bearbeiten
  /SignatureCanvas.tsx                         → Unterschrift-Canvas Wrapper
  /SignatureFlow.tsx                           → 3-Schritt Unterschrifts-Flow
  /ContractSummary.tsx                         → Kompakte Zusammenfassung vor Unterschrift
  /TemplateEditor.tsx                          → Vorlagen-Sektionen-Editor
  /PlaceholderPicker.tsx                       → Platzhalter einfügen
  /ContractPdfGenerator.tsx                    → PDF-Logik (mit pdf-lib)
  /MrrDashboard.tsx                            → MRR Stats für Admin
/lib
  /contract-pdf.ts                             → PDF-Generierung mit pdf-lib
  /contract-email.ts                           → E-Mail Templates + Versand
  /contract-number.ts                          → Vertragsnummer generieren
  /contract-mapper.ts                          → Onboarding-Daten → Vertrags-Platzhalter Mapping
```

---

## Bestehende Dateien anpassen

```
/app/neu/[id]/zusammenfassung/page.tsx   → Button: "📝 Vertrag erstellen" hinzufügen
/app/neu/[id]/erfolg/page.tsx            → Button: "📝 Vertrag direkt erstellen & unterschreiben"
/components/BottomNav.tsx                → "Mehr" Menü: "Verträge" Link hinzufügen
/app/page.tsx (Home)                     → Stat-Karte: "X aktive Verträge" + Quick-Link
/app/admin/page.tsx                      → Link: "Verträge verwalten" + "Vorlagen bearbeiten"
```

---

## Rechtliche Hinweise

### Einfache elektronische Signatur (eIDAS)
Die Finger-Unterschrift auf dem Handy gilt als **einfache elektronische Signatur** gemäß EU-Verordnung eIDAS. Das ist für B2B-Verträge in Deutschland ausreichend und rechtlich gültig. Es ist KEINE qualifizierte elektronische Signatur (QES) – die wäre nur bei notariellen Akten nötig.

### Was gespeichert wird (für Nachweiszwecke)
- Unterschrift als Bild (Base64 PNG)
- Zeitstempel (sekundengenau, UTC)
- IP-Adresse des Geräts
- Name + Rolle des Unterzeichners
- Vollständiger Vertragstext (als PDF archiviert)
- Bestätigungs-Checkboxen (AGB, DSGVO, Vertrag gelesen)

### DSGVO-Konformität
- Personenbezogene Daten werden nur für die Vertragsdurchführung gespeichert
- Hinweis auf Auftragsverarbeitungsvereinbarung (AVV) im Vertrag
- Löschung der Daten nach Vertragsende + gesetzliche Aufbewahrungsfrist (10 Jahre)

---

## Prompt für Claude Code

```
Lies die Datei oriido-vertragsmodul.md und erweitere die bestehende Oriido Sales 
App um ein digitales Vertragsmodul. Die App hat bereits: Onboarding-Wizard, Sales 
Tools, CRM, Dokumente, Einwände, Leitfaden, Briefing, Google Maps Prospecting.

Baue folgendes:

1. Vertragsvorlagen-System: Admin erstellt Vorlagen mit §-Sektionen und 
   Platzhaltern. Seed mit Standard-Partnervertrag (10 Paragraphen) + 
   SEPA-Lastschriftmandat. Vorlagen-Editor mit Markdown, Drag & Drop 
   Sektionen, Platzhalter-Picker.

2. Vertrag aus Onboarding erstellen: Button am Ende des Wizards. Alle 
   Onboarding-Daten werden automatisch in die Vertragsvorlage gemappt. 
   Verkäufer prüft und kann Felder korrigieren. Auch manuelles Erstellen 
   ohne Onboarding möglich.

3. Digitale Unterschrift (Fullscreen-Flow):
   Schritt 1: Zusammenfassung + Checkboxen (Vertrag gelesen, DSGVO, AGB)
   Schritt 2: Restaurant-Inhaber unterschreibt mit Finger auf Signature Canvas
   Schritt 3: Verkäufer unterschreibt
   → Nutze signature_pad Library für smooth Canvas mit Bezier-Kurven

4. PDF-Generierung mit pdf-lib:
   - Mehrseitiges A4-PDF mit Oriido-Branding
   - Vertragstext mit §-Nummern
   - Beide Unterschriften als Bilder eingebettet
   - SEPA-Mandat als Extra-Seite (wenn aktiviert)
   - Saubere Typografie, professionelles Layout

5. Automatischer E-Mail-Versand: PDF als Anhang an Restaurant + Admin

6. Vertrags-Dashboard: Liste aller Verträge mit Status 
   (Entwurf/Zur Unterschrift/Unterschrieben/Aktiv/Gekündigt)
   Admin-Dashboard: Alle Verträge, MRR-Stats, CSV-Export

7. Status-Workflow: Entwurf → Zur Unterschrift → Unterschrieben → Aktiv
   Vertragsnummer Auto-Generierung: ORI-2026-XXXX

Integration:
- Onboarding Zusammenfassung/Erfolgsseite: "Vertrag erstellen" Button
- Home: Vertrags-Stats
- BottomNav "Mehr": Verträge Link
- Admin: Vorlagen + Verträge verwalten

Dependencies: npm install pdf-lib signature_pad

Gleicher Dark Theme (#0C0C14 bg, #FF6B35 accent). Mobile-first. Alles auf Deutsch.
Seed-Route für Standard-Vertrag + SEPA-Mandat bei erstem Start.
```

---

## Prioritäten

1. ⭐ **Vertragsvorlagen + Seed-Daten** – Basis für alles
2. ⭐ **Vertrag aus Onboarding erstellen + Auto-Mapping** – Kernfeature
3. ⭐ **Signature Canvas + Unterschrifts-Flow** – Das Money Feature
4. ⭐ **PDF-Generierung** – Ohne PDF kein Vertrag
5. **E-Mail-Versand** – PDF an beide Seiten
6. **Vertrags-Dashboard** – Übersicht für Verkäufer + Admin
7. **Vorlagen-Editor** – Admin kann Vorlagen anpassen
8. **MRR-Stats + Export** – Nice-to-have für Admin
