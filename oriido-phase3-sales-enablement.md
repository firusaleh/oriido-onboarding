# Oriido Sales App – Erweiterung Phase 3 (Spec für Claude Code)

## Kontext

Die Oriido Sales App hat bereits:
- ✅ Onboarding-Wizard (7 Schritte, Auto-Save, Admin-Dashboard)
- ✅ Sales Tools (Checkliste, QR-Demo)
- ✅ PIN-Login, Bottom Navigation, Dark Theme

Jetzt kommt **Phase 3**: Das Sales Enablement Modul – alles was die Verkäufer brauchen um besser, schneller und selbstständiger zu verkaufen.

---

## 5 neue Module

```
/dokumente                → Dokumente & Materialien Hub
/einwaende                → Einwand-Datenbank
/leitfaden                → Gesprächsleitfaden
/briefing                 → Tages-Briefing
/crm                      → Notizen & CRM-Light
/crm/[id]                 → Detail-Ansicht eines Restaurants
```

---

## Bottom Navigation erweitern

Die bestehende Bottom Nav hat 4 Tabs. Da jetzt deutlich mehr Seiten dazukommen, umbauen zu:

**Verkäufer-Ansicht:**
- 🏠 **Home** → / (Dashboard mit Karten zu allem)
- 🧰 **Tools** → /tools (Checkliste, Demo – existiert bereits)
- 📋 **CRM** → /crm (Notizen & Restaurant-Pipeline)
- 📚 **Mehr** → Slide-Up Menü mit: Dokumente, Einwände, Leitfaden, Briefing, Meine Einreichungen

**Admin-Ansicht (Firas):**
- Gleich, aber "Mehr" enthält zusätzlich: Admin-Dashboard, Dokumente verwalten, Einwände verwalten, Briefing erstellen

---

## Startseite (Home) anpassen

Die bestehende Home-Seite erweitern. Quick-Access Karten:

```
Obere Reihe (2 große Karten – existiert bereits):
🚀 Neues Onboarding    |    🧰 Sales Tools

Mittlere Reihe (Tages-Briefing – nur wenn eins vorhanden):
📣 Tages-Briefing: "[Titel des heutigen Briefings]" → /briefing

Untere Reihe (3 kleine Karten):
📚 Dokumente    |    💬 Einwände    |    🗺️ Leitfaden

Ganz unten:
📋 Meine Pipeline (X Restaurants) → /crm
```

---

## Modul 1: Dokumente & Materialien Hub ("/dokumente")

### Was ist das?
Zentrale Stelle wo Firas (Admin) Dokumente hochlädt, die alle Verkäufer sofort auf dem Handy sehen. Pitch Decks, Preislisten, Einseiter, Vertragsvorlagen – alles an einem Ort, immer aktuell.

### Datenbank-Schema

```javascript
// Collection: documents
{
  _id: ObjectId,
  titel: String,              // *Pflicht – z.B. "Oriido Pitch Deck"
  beschreibung: String,       // Kurze Beschreibung
  kategorie: String,          // *Pflicht – "vor_gespraech" | "im_gespraech" | "nach_zusage" | "intern"
  dateiUrl: String,           // *Pflicht – Upload-URL
  dateiName: String,          // Original-Dateiname
  dateiGroesse: Number,       // In Bytes
  dateiTyp: String,           // "pdf" | "pptx" | "docx" | "xlsx" | "jpg" | "png" | "mp4"
  tags: [String],             // z.B. ["pitch", "preis", "deutsch"]
  version: Number,            // Auto-increment bei Update
  hochgeladenAm: Date,
  aktualisiertAm: Date,
  hochgeladenVon: String,     // "admin"
  gepinnt: Boolean,           // Wichtige Dokumente oben anpinnen
  sortierung: Number,         // Custom Sortierung innerhalb Kategorie
}
```

### Verkäufer-Ansicht ("/dokumente")

**Header:**
- Titel: "Dokumente"
- Suchfeld: Volltextsuche über Titel, Beschreibung, Tags

**Kategorie-Tabs** (horizontal scrollbar):
- 📋 Vor dem Gespräch
- 🎯 Im Gespräch
- ✅ Nach der Zusage
- 🔒 Intern

**Dokument-Karten** (pro Kategorie, Liste):
Jede Karte zeigt:
- Datei-Icon links (PDF-Icon, PPTX-Icon, etc. – je nach dateiTyp)
- Titel (bold) + Beschreibung (grau, 1 Zeile, truncated)
- Tags als kleine Badges
- Dateigröße + "Aktualisiert vor X Tagen"
- 📌 Pin-Icon wenn gepinnt (gepinnte Dokumente immer oben)
- Klick → Öffnet das Dokument (PDF inline, andere als Download)
- Long-Press oder Swipe → "Teilen" Option (WhatsApp, E-Mail, Copy Link)

**Offline-Hinweis:**
- Jedes Dokument hat einen "⬇️ Offline verfügbar machen" Button
- Speichert in Browser-Cache / Service Worker
- Offline-Dokumente bekommen einen grünen Haken

### Admin-Ansicht ("/admin/dokumente")

Gleiche Liste, aber mit:
- **"+ Neues Dokument"** Button (oben rechts, Floating Action Button)
- Upload-Modal:
  - Titel *
  - Beschreibung
  - Kategorie * (Dropdown)
  - Datei hochladen * (Drag & Drop oder Klick)
  - Tags (Komma-getrennt)
  - Gepinnt? (Toggle)
- Jedes Dokument: Bearbeiten / Ersetzen / Löschen Buttons
- "Ersetzen" → Neue Version hochladen, Version-Counter +1, alle Verkäufer sehen sofort die neue Version
- Drag & Drop Sortierung innerhalb Kategorien

### API Endpoints

```
GET    /api/documents                → Alle Dokumente (mit Kategorie-Filter)
POST   /api/documents               → Neues Dokument (Admin)
PATCH  /api/documents/[id]          → Dokument bearbeiten/ersetzen (Admin)
DELETE /api/documents/[id]          → Dokument löschen (Admin)
POST   /api/documents/upload        → Datei hochladen (returns URL)
```

---

## Modul 2: Einwand-Datenbank ("/einwaende")

### Was ist das?
Durchsuchbare Sammlung der häufigsten Einwände von Restaurants + die perfekte Antwort. Verkäufer sucht "zu teuer" → bekommt sofort die beste Antwort-Strategie. Von Firas gepflegt und jederzeit aktualisierbar.

### Datenbank-Schema

```javascript
// Collection: objections
{
  _id: ObjectId,
  einwand: String,            // *Pflicht – "Das ist mir zu teuer"
  kategorie: String,          // "preis" | "technik" | "bedarf" | "vertrauen" | "timing" | "wettbewerb"
  schwierigkeit: Number,      // 1-3 (1=leicht, 2=mittel, 3=schwer)
  antwortStrategie: String,   // Kurzer Titel der Strategie: "Kosten-Nutzen-Argument"
  antwortText: String,        // *Pflicht – Die ausformulierte Antwort (Markdown)
  beispielDialog: String,     // Optional – Beispiel Frage-Antwort Dialog
  doNotSay: String,           // Was man NICHT sagen sollte
  proTipp: String,            // Zusätzlicher Verkäufer-Tipp
  tags: [String],             // z.B. ["preis", "roi", "häufig"]
  sortierung: Number,
  erstelltAm: Date,
  aktualisiertAm: Date,
}
```

### Vorbefüllte Einwände (Seed-Daten)

Die Datenbank soll mit diesen 12 Einwänden vorbefüllt sein:

```
KATEGORIE: PREIS
1. "Das ist mir zu teuer" / "€179 ist viel"
   Strategie: Kosten-Nutzen-Rechnung
   Antwort: "Ich versteh das. Lass uns kurz rechnen: Bei 20 Tischen und nur 40% Nutzung 
   sparst du ca. €1.000 im Monat an Personalkosten allein. Dazu kommen Zusatzbestellungen 
   die digital um 15% steigen. Die €179 hast du am dritten Tag wieder rein."
   Pro-Tipp: "ROI-Rechner in der App öffnen und mit echten Zahlen des Restaurants rechnen."
   Nicht sagen: "Aber das ist doch günstig!" – Wertet den Einwand ab.

2. "Ich will erstmal kostenlos testen"
   Strategie: Testphase anbieten
   Antwort: "Absolut – genau dafür haben wir die 30-Tage-Testphase. Du zahlst erst wenn 
   du überzeugt bist. Und wir richten alles komplett für dich ein, du musst nichts machen."
   Pro-Tipp: "Testphase ist der stärkste Abschluss-Hebel – immer proaktiv anbieten."

KATEGORIE: BEDARF
3. "Meine Gäste wollen persönlichen Service, keine Handys"
   Strategie: Ergänzung statt Ersatz
   Antwort: "Das verstehe ich total. Oriido ersetzt nicht deinen Service – es ergänzt ihn. 
   Dein Personal hat mehr Zeit für persönliche Betreuung weil die Bestellannahme automatisch 
   läuft. Die Gäste die lieber klassisch bestellen, können das weiterhin tun."
   Nicht sagen: "Aber digital ist die Zukunft!" – Wertet das Geschäftsmodell ab.

4. "Wir haben nicht so viel Betrieb, lohnt sich nicht"
   Strategie: Gerade-Dann-Argument
   Antwort: "Gerade dann. Mit weniger Betrieb zählt jeder Gast doppelt. Digitale 
   Nachbestellungen steigen um 15-20% weil Gäste ohne Wartezeit nochmal bestellen. 
   Und du brauchst weniger Personal an ruhigen Tagen."

5. "Meine Gäste sind älter, die können das nicht"
   Strategie: Einfachheit demonstrieren
   Antwort: "QR-Code scannen kann heute jeder – das hat Corona uns beigebracht. Es gibt 
   keinen App-Download, keine Registrierung. Kamera auf den QR-Code, Speisekarte erscheint, 
   fertig. Und wer nicht will, bestellt ganz normal beim Personal."
   Pro-Tipp: "Demo-QR-Code zeigen lassen – 'Probieren Sie es selbst!'"

KATEGORIE: TECHNIK
6. "Ich hab kein Kassensystem / ein anderes System"
   Strategie: Flexibilität zeigen
   Antwort: "Kein Problem. Oriido funktioniert auch ohne Kassensystem – die Bestellungen 
   kommen auf ein Tablet oder direkt aufs Handy. Und falls du ein System hast das wir noch 
   nicht kennen, prüfen wir kostenlos ob wir es anbinden können."

7. "Das klingt kompliziert / Ich bin nicht technikaffin"
   Strategie: Wir-machen-alles-Versprechen
   Antwort: "Du musst gar nichts machen. Wir kommen vorbei, richten alles ein, schulen 
   dein Team in 10 Minuten und stellen die QR-Codes auf die Tische. Du kannst dich komplett 
   auf dein Restaurant konzentrieren."

KATEGORIE: WETTBEWERB
8. "Lieferando / Wolt hat sowas doch auch"
   Strategie: Differenzierung
   Antwort: "Lieferando ist Lieferung – die nehmen 30% Provision auf jede Bestellung. 
   Oriido ist für Gäste DIE VOR ORT SITZEN. Keine Provision, du behältst 100% deines 
   Umsatzes. Und deine Gäste bleiben deine Gäste, nicht die von Lieferando."

9. "Ich hab schon was Ähnliches probiert, hat nicht funktioniert"
   Strategie: Was-war-anders-Frage
   Antwort: "Was genau hat nicht funktioniert? [Zuhören.] Bei den meisten liegt es daran, 
   dass die Einrichtung zu kompliziert war oder der Support gefehlt hat. Bei uns bekommst 
   du persönlichen Ansprechpartner, wir richten alles ein, und wenn was nicht läuft, 
   sind wir sofort da."
   Pro-Tipp: "Immer erst fragen was das Problem war – dann gezielt darauf eingehen."

KATEGORIE: TIMING
10. "Jetzt ist kein guter Zeitpunkt"
    Strategie: Dringlichkeit + Einfachheit
    Antwort: "Verstehe. Wann wäre besser? [Termin vereinbaren.] Aber bedenke: Die 
    Einrichtung dauert nur einen Tag und die Testphase ist kostenlos. Du verlierst also 
    nichts – aber jeden Tag ohne Oriido verlierst du potenzielle Zusatzbestellungen."

11. "Ich muss noch mit meinem Partner / meiner Frau sprechen"
    Strategie: Respektieren + Material dalassen
    Antwort: "Klar, absolut verständlich. Soll ich euch ein kurzes Angebot per WhatsApp 
    schicken, das ihr zusammen durchgehen könnt? Und ich melde mich Ende der Woche nochmal."
    Pro-Tipp: "Immer einen konkreten Follow-Up-Termin vereinbaren, nie offen lassen."

KATEGORIE: VERTRAUEN
12. "Noch nie von euch gehört, seid ihr neu?"
    Strategie: Ehrlichkeit + Vorteil
    Antwort: "Ja, wir sind neu in der Region – und genau das ist dein Vorteil. Du bist 
    einer der Ersten in Erlangen und bekommst persönliche Betreuung direkt vom Gründer. 
    Bei großen Anbietern bist du eine Nummer, bei uns ein Partner."
```

### Verkäufer-Ansicht ("/einwaende")

**Header:**
- Titel: "Einwand-**Datenbank**" (Datenbank in #FF6B35)
- Suchfeld: Suche über Einwand-Text, Antwort, Tags
  - Placeholder: "z.B. 'zu teuer', 'Lieferando', 'kompliziert'..."
  - Live-Suche: Ergebnisse filtern bei jedem Tastendruck

**Kategorie-Filter** (horizontale Chips):
- 💰 Preis
- ❓ Bedarf  
- ⚙️ Technik
- 🏆 Wettbewerb
- ⏰ Timing
- 🤝 Vertrauen
- Alle (default)

**Einwand-Karten** (Accordion-Style):
Zugeklappt zeigt:
- Einwand-Text in Anführungszeichen (bold, weiß): "Das ist mir zu teuer"
- Schwierigkeit (1-3 Punkte/Dots)
- Kategorie-Badge
- Strategie-Label klein: "Kosten-Nutzen-Rechnung"

Aufgeklappt (bei Klick, smooth Animation) zeigt zusätzlich:
- **Antwort** – Der Haupt-Antworttext in einem leicht hervorgehobenen Container (bg #1C1C28, border-left 3px #FF6B35)
- **💡 Pro-Tipp** – Falls vorhanden, in einer grünen Info-Box (border-left 3px #22C55E)
- **🚫 Das NICHT sagen** – Falls vorhanden, in einer roten Warn-Box (border-left 3px #EF4444)
- **Beispiel-Dialog** – Falls vorhanden, als Chat-Bubbles gestylt (Restaurant grau, Verkäufer orange)
- **"📋 Antwort kopieren"** Button – kopiert den Antworttext in die Zwischenablage

### Admin-Ansicht ("/admin/einwaende")

Gleiche Liste, aber mit:
- **"+ Neuer Einwand"** Button
- Formular:
  - Einwand-Text *
  - Kategorie * (Dropdown)
  - Schwierigkeit * (1-3)
  - Strategie-Titel *
  - Antwort-Text * (Textarea, Markdown)
  - Beispiel-Dialog (Textarea)
  - Das NICHT sagen (Textarea)
  - Pro-Tipp (Textarea)
  - Tags
- Bearbeiten / Löschen pro Einwand
- Drag & Drop Sortierung

### API Endpoints

```
GET    /api/objections              → Alle Einwände (mit Kategorie-Filter + Suche)
POST   /api/objections              → Neuer Einwand (Admin)
PATCH  /api/objections/[id]         → Einwand bearbeiten (Admin)
DELETE /api/objections/[id]         → Einwand löschen (Admin)
POST   /api/objections/seed         → Seed-Daten einfügen (einmalig, 12 Einwände)
```

---

## Modul 3: Gesprächsleitfaden ("/leitfaden")

### Was ist das?
Schritt-für-Schritt Anleitung für das Verkaufsgespräch. Kein starres Script, sondern ein roter Faden mit Tipps. Neue Verkäufer können sich daran entlanghangeln, erfahrene nutzen es als Checkliste.

### Datenbank-Schema

```javascript
// Collection: guide_steps
{
  _id: ObjectId,
  schritt: Number,            // *Pflicht – 1, 2, 3...
  phase: String,              // "einstieg" | "bedarfsanalyse" | "praesentation" | "einwaende" | "abschluss" | "nachbereitung"
  titel: String,              // *Pflicht – "Begrüßung & Smalltalk"
  dauer: String,              // "2-3 Min"
  beschreibung: String,       // Was in diesem Schritt passiert
  sprechtext: String,         // Vorgeschlagener Text (als Inspiration, nicht zum Ablesen)
  tipps: [String],            // Array von Tipps
  donts: [String],            // Array von Don'ts
  toolVerweis: String,        // z.B. "/tools/checkliste" – Link zu einem Tool das hier genutzt wird
  toolVerweisText: String,    // z.B. "Checkliste öffnen"
  aktiv: Boolean,             // Admin kann Schritte deaktivieren
  erstelltAm: Date,
  aktualisiertAm: Date,
}
```

### Vorbefüllte Schritte (Seed-Daten)

```
PHASE 1: EINSTIEG (5 Min)

Schritt 1: "Begrüßung & Smalltalk"
Dauer: 2-3 Min
Beschreibung: "Locker anfangen. Kompliment zum Restaurant, Essen, Atmosphäre. Nicht sofort über Oriido reden."
Sprechtext: "Hi, ich bin [Name] von Oriido. Erstmal – richtig schöner Laden hier! Wie lange gibt's euch schon?"
Tipps: 
  - "Schau dich vorher auf Google Maps an – erwähne eine gute Bewertung"
  - "Frag nach dem Tagesgericht oder der Empfehlung"
  - "Wenn Essen bestellt wird – umso besser, zeigt echtes Interesse"
Don'ts:
  - "Nicht direkt mit dem Pitch starten"
  - "Nicht am Handy rumfummeln"

Schritt 2: "Überleitung zum Thema"
Dauer: 1-2 Min
Beschreibung: "Natürlich überleiten. Am besten über ein Problem das du beobachtet hast."
Sprechtext: "Ich hab gesehen ihr hattet gerade ganz schön was los – wie viele Tische bedient ihr so am Abend? Habt ihr genug Leute dafür?"
Tipps:
  - "An die Beobachtung anknüpfen: Wartezeiten, volle Terrasse, wenig Personal"
  - "Offene Fragen stellen, nicht Ja/Nein-Fragen"

---

PHASE 2: BEDARFSANALYSE (5-8 Min)

Schritt 3: "Pain Points erfragen"
Dauer: 5-8 Min
Beschreibung: "Die wichtigste Phase. Hier findest du raus WO es weh tut. Je mehr der Restaurantbesitzer selbst über seine Probleme spricht, desto einfacher der Abschluss."
Sprechtext: "Was ist aktuell eure größte Herausforderung im Service? [...] Und wie läuft das mit Nachbestellungen – kommen die gut rein?"
Tipps:
  - "ZUHÖREN > REDEN. 80/20 Regel: 80% der Zeit redet der Restaurantbesitzer"
  - "Notiere dir die Pain Points (CRM in der App nutzen)"
  - "Frag nach: Personal, Wartezeiten, Stoßzeiten, Bestellfehler, Bezahlung"
Don'ts:
  - "Nicht unterbrechen"
  - "Nicht sofort eine Lösung anbieten – erst alle Probleme sammeln"

---

PHASE 3: PRÄSENTATION (5-7 Min)

Schritt 4: "Checkliste durchgehen"
Dauer: 3-4 Min
Beschreibung: "Jetzt die Checkliste öffnen und gemeinsam durchgehen. Jeder Haken ist ein 'Ja, das betrifft mich' – und baut den Bedarf auf."
Tool-Verweis: /tools/checkliste → "🔗 Checkliste öffnen"
Tipps:
  - "Handy zeigen, gemeinsam durchklicken"
  - "Bei jedem Punkt kurz erklären wie Oriido das löst"
  - "Das Ergebnis wirken lassen: 'Du hast 6 von 8 – du bist der perfekte Kandidat'"

Schritt 5: "Live-Demo zeigen"
Dauer: 2-3 Min
Beschreibung: "QR-Code aufmachen, dem Restaurantbesitzer geben. Er scannt mit seinem eigenen Handy und erlebt Oriido als Gast."
Tool-Verweis: /tools/demo → "🔗 Demo öffnen"
Tipps:
  - "SEIN Handy, nicht deins – er muss es selbst erleben"
  - "Lass ihn bestellen, durch die Karte scrollen, Sprache wechseln"
  - "'Stell dir vor, so sieht DAS für deine Gäste aus, mit DEINER Karte'"

---

PHASE 4: EINWÄNDE (3-5 Min)

Schritt 6: "Einwände behandeln"
Dauer: 3-5 Min
Beschreibung: "Jetzt kommen die Aber's. Das ist normal und gut – es zeigt Interesse. Ruhig bleiben, zuhören, mit der passenden Antwort reagieren."
Tool-Verweis: /einwaende → "🔗 Einwand-Datenbank öffnen"
Tipps:
  - "Erst bestätigen ('Verstehe ich'), dann antworten"
  - "Bei Preiseinwand: ROI-Rechnung machen (App nutzen)"
  - "Testphase ist der stärkste Hebel: 'Kostet dich nichts, kein Risiko'"
Don'ts:
  - "Nie defensiv werden"
  - "Nie schlecht über Wettbewerber reden"

---

PHASE 5: ABSCHLUSS (3-5 Min)

Schritt 7: "Abschluss & nächste Schritte"
Dauer: 3-5 Min
Beschreibung: "Wenn die Einwände behandelt sind: direkt zum Abschluss. Nicht ewig weiterreden."
Sprechtext: "Was meinst du – sollen wir das einfach mal für euch einrichten? Kostenlose Testphase, ihr zahlt erst wenn ihr überzeugt seid. Dauert nur einen Tag."
Tipps:
  - "Direkt fragen, kein Rumeiern"
  - "Bei 'Ja': Sofort Onboarding in der App starten und Daten aufnehmen"
  - "Bei 'Vielleicht': Konkreten Folgetermin vereinbaren (Tag + Uhrzeit)"
  - "Bei 'Nein': Respektieren, Karte dalassen, in 4 Wochen nochmal vorbeikommen"

---

PHASE 6: NACHBEREITUNG (direkt nach dem Gespräch)

Schritt 8: "Daten erfassen & Follow-Up"
Dauer: 5-10 Min
Beschreibung: "Direkt nach dem Gespräch – noch vor dem nächsten Restaurant. Alles in die App eintragen solange es frisch ist."
Tipps:
  - "Bei 'Ja': Onboarding-Wizard komplett ausfüllen"
  - "Bei 'Vielleicht': Notizen im CRM speichern + Follow-Up-Datum setzen"
  - "Bei 'Nein': Trotzdem im CRM anlegen mit Grund der Absage"
  - "WhatsApp-Nachricht an den Restaurantbesitzer senden (Vorlagen nutzen)"
Tool-Verweis: /crm → "🔗 CRM öffnen"
```

### Verkäufer-Ansicht ("/leitfaden")

**Header:**
- Titel: "Gesprächs-**Leitfaden**" (Leitfaden in #FF6B35)
- Untertitel: "Dein roter Faden fürs Verkaufsgespräch – von Einstieg bis Abschluss"
- Zeitschätzung: "⏱️ Gesamtdauer: ca. 25-35 Minuten"

**Phasen-Übersicht** (oben, horizontal scrollbar):
6 Phase-Chips mit Nummern: Einstieg → Bedarf → Präsentation → Einwände → Abschluss → Nachbereitung
- Aktive Phase ist highlighted (orange)
- Klick scrollt zur Phase

**Schritte als Timeline:**
Vertikale Timeline mit orangem Strich links. Jeder Schritt:
- Schrittnummer in orangem Kreis (am Strich)
- Phase-Label klein über dem Titel
- Titel (bold) + Dauer-Badge ("3-4 Min")
- Beschreibung (grau)
- Aufklappbar (Accordion):
  - 💬 **Sprechtext** – In einer Chat-Bubble-Box (bg #1C1C28, italic)
  - ✅ **Tipps** – Grüne Bullets
  - 🚫 **Don'ts** – Rote Bullets
  - 🔗 **Tool öffnen** – Orange Button der zum verlinkten Tool navigiert
- Jeder Schritt kann mit Klick auf ✓ als "erledigt" markiert werden (für laufendes Gespräch)

**"Gespräch starten" Modus:**
Button oben rechts: "▶️ Gespräch starten"
- Blendet alles andere aus, zeigt nur den aktuellen Schritt im Fullscreen
- Große Weiter/Zurück Navigation unten
- Timer läuft mit (optional)
- Fortschrittsbalken oben

### Admin-Ansicht ("/admin/leitfaden")
- Schritte bearbeiten, Reihenfolge ändern, neue Schritte hinzufügen
- Schritte aktivieren/deaktivieren
- Sprechtext, Tipps, Don'ts inline editieren

### API Endpoints

```
GET    /api/guide                   → Alle Leitfaden-Schritte (sortiert)
POST   /api/guide                   → Neuer Schritt (Admin)
PATCH  /api/guide/[id]              → Schritt bearbeiten (Admin)
DELETE /api/guide/[id]              → Schritt löschen (Admin)
PATCH  /api/guide/reorder           → Reihenfolge ändern (Admin)
POST   /api/guide/seed              → Seed-Daten einfügen (einmalig)
```

---

## Modul 4: Tages-Briefing ("/briefing")

### Was ist das?
Firas postet morgens eine kurze Nachricht an alle Verkäufer: Fokus des Tages, neue Features, Sonderaktionen, Motivation. Alle Verkäufer sehen es auf dem Home-Screen.

### Datenbank-Schema

```javascript
// Collection: briefings
{
  _id: ObjectId,
  datum: Date,                // *Pflicht – Für welchen Tag
  titel: String,              // *Pflicht – "Fokus diese Woche: Cafés"
  inhalt: String,             // *Pflicht – Markdown-Text
  prioritaet: String,         // "normal" | "wichtig" | "dringend"
  anhang: String,             // Optional – Datei-URL
  erstelltVon: String,        // "admin"
  erstelltAm: Date,
  gelesenVon: [String],       // Array von Verkäufer-IDs die es gelesen haben
}
```

### Verkäufer-Ansicht

**Auf der Home-Seite:**
- Wenn es ein Briefing für heute (oder das letzte ungelesene) gibt:
- Karte mit Megafon-Icon: "📣 [Titel]"
- Klick → /briefing
- Badge "NEU" wenn ungelesen

**Briefing-Seite ("/briefing"):**
- Zeigt das aktuelle Briefing als Karte:
  - Datum + Prioritäts-Badge (normal=grau, wichtig=orange, dringend=rot)
  - Titel (groß, bold)
  - Inhalt (Markdown gerendert)
  - Anhang (falls vorhanden) als Download-Button
  - "✓ Gelesen" Button → markiert als gelesen, verschwindet vom Home-Screen
- Darunter: "Ältere Briefings" als aufklappbare Liste (letzte 10)

### Admin-Ansicht ("/admin/briefing")

- Liste aller Briefings (neueste zuerst)
- Pro Briefing: "Gelesen von X/Y Verkäufern"
- **"+ Neues Briefing"** Button:
  - Datum (default: heute)
  - Titel *
  - Inhalt * (Textarea mit Markdown-Preview)
  - Priorität (Dropdown)
  - Anhang (optional, Datei-Upload)
- Bearbeiten / Löschen

### API Endpoints

```
GET    /api/briefings               → Alle Briefings (neueste zuerst)
GET    /api/briefings/today         → Heutiges Briefing (für Home-Screen)
POST   /api/briefings               → Neues Briefing (Admin)
PATCH  /api/briefings/[id]          → Bearbeiten (Admin)
DELETE /api/briefings/[id]          → Löschen (Admin)
PATCH  /api/briefings/[id]/read     → Als gelesen markieren (Verkäufer)
```

---

## Modul 5: Notizen & CRM-Light ("/crm")

### Was ist das?
Ein einfaches Restaurant-Notizbuch für Verkäufer. Jedes Restaurant das der Verkäufer besucht – egal ob Ja, Vielleicht oder Nein – wird hier notiert. Pipeline-Übersicht, Follow-Up Erinnerungen, Notizen.

Kein komplettes CRM wie Salesforce – sondern ein schnelles, mobiles Notizbuch das den Verkäufer organisiert hält.

### Datenbank-Schema

```javascript
// Collection: crm_restaurants
{
  _id: ObjectId,
  verkaeuferId: String,        // Welcher Verkäufer hat es angelegt
  
  // Basis-Daten
  name: String,                // *Pflicht – Restaurantname
  adresse: String,             // Straße, Stadt
  googleMapsLink: String,
  art: String,                 // Italienisch, Café, etc.
  
  // Kontakt
  ansprechpartner: String,
  telefon: String,
  email: String,
  
  // Pipeline-Status
  status: String,              // *Pflicht – "lead" | "kontaktiert" | "termin" | "angebot" | "gewonnen" | "verloren" | "spaeter"
  
  // Details
  anzahlTische: Number,
  kassensystem: String,
  geschaetztesVolumen: String, // z.B. "€150-200/Monat"
  
  // Follow-Up
  naechsterKontakt: Date,      // Erinnerung für Follow-Up
  
  // Notizen (Array – wie ein Chat/Log)
  notizen: [{
    text: String,
    datum: Date,
    typ: String,               // "notiz" | "anruf" | "besuch" | "email" | "whatsapp"
  }],
  
  // Absage-Grund (falls status = "verloren")
  absageGrund: String,
  
  // Meta
  erstelltAm: Date,
  aktualisiertAm: Date,
}
```

### Verkäufer-Ansicht ("/crm")

**Header:**
- Titel: "Meine **Pipeline**" (Pipeline in #FF6B35)
- Suchfeld (Name, Adresse)
- "+ Restaurant" Button (oben rechts)

**Pipeline-Stats** (4 kleine Karten oben):
- 🔵 Leads: X
- 🟡 In Gespräch: X (kontaktiert + termin + angebot)
- 🟢 Gewonnen: X
- 🔴 Verloren: X

**Ansicht-Tabs:**
- 📋 **Liste** (default) – Alle Restaurants als Karten
- 📊 **Kanban** – Spalten: Lead → Kontaktiert → Termin → Angebot → Gewonnen/Verloren

**Listen-Ansicht:**
Filter-Chips: Alle | Leads | In Gespräch | Gewonnen | Verloren | Follow-Up fällig
Sortierung: Neueste zuerst | Follow-Up Datum | Name A-Z

Jede Restaurant-Karte:
- Name (bold) + Art (Badge: "Italienisch")
- Adresse (grau)
- Status-Badge (farbig)
- Ansprechpartner + Telefon (klickbar → Anruf)
- Letzte Notiz (1 Zeile, grau, truncated)
- Follow-Up Datum (wenn gesetzt):
  - Grün wenn in der Zukunft
  - Rot + "⚠️ Überfällig" wenn in der Vergangenheit
  - Orange wenn heute

**Kanban-Ansicht:**
- Horizontal scrollbare Spalten
- Jede Spalte = ein Status
- Karten sind kompakt (Name, Art, Follow-Up)
- Drag & Drop zwischen Spalten → ändert den Status
- Counter pro Spalte

**"+ Restaurant" Modal:**
Schnell-Erfassung (alles optional außer Name + Status):
- Restaurantname *
- Adresse
- Art (Dropdown)
- Ansprechpartner
- Telefon
- Status * (Dropdown, default "Lead")
- Erste Notiz (Textarea)
- Nächster Kontakt (Date-Picker)

### Detail-Ansicht ("/crm/[id]")

**Header:**
- Restaurantname (groß)
- Status-Badge (klickbar → Status ändern)
- Quick-Actions: 📞 Anrufen | 💬 WhatsApp | 📍 Maps | ✏️ Bearbeiten

**Info-Sektion:**
- Adresse (klickbar → Maps)
- Art
- Ansprechpartner + Telefon + E-Mail
- Anzahl Tische, Kassensystem (wenn erfasst)

**Follow-Up Sektion:**
- Nächster Kontakt: Datum + "In X Tagen" / "⚠️ Überfällig seit X Tagen"
- "Datum ändern" Button
- "✅ Follow-Up erledigt" Button → verschiebt Datum + erstellt Notiz

**Notizen-Timeline:**
Wie ein Chat-Verlauf, chronologisch (neuste oben):
- Jede Notiz: Typ-Icon (📝/📞/🚶/📧/💬) + Text + Datum
- Farbige Border links je nach Typ
- "Notiz hinzufügen" am Ende:
  - Typ auswählen (5 Icons: Notiz/Anruf/Besuch/E-Mail/WhatsApp)
  - Textarea
  - "Speichern" Button

**Aktionen unten:**
- "🚀 Onboarding starten" → /neu?restaurant=[Name] (wenn status = gewonnen)
- "❌ Als verloren markieren" → Absage-Grund eingeben
- "🗑️ Löschen"

### Admin-Ansicht

Admin sieht alle Restaurants aller Verkäufer (nicht nur eigene).
Filter nach Verkäufer möglich.

### API Endpoints

```
GET    /api/crm                     → Alle Restaurants des Verkäufers
POST   /api/crm                     → Neues Restaurant
GET    /api/crm/[id]                → Detail
PATCH  /api/crm/[id]                → Restaurant bearbeiten
DELETE /api/crm/[id]                → Löschen
POST   /api/crm/[id]/notes          → Notiz hinzufügen
PATCH  /api/crm/[id]/status         → Status ändern
GET    /api/admin/crm               → Alle Restaurants aller Verkäufer (Admin)
```

---

## Neue Dependencies

```bash
npm install react-beautiful-dnd    # Für Kanban Drag & Drop
npm install react-markdown         # Für Briefing Markdown-Rendering
npm install date-fns               # Für Datums-Berechnungen ("In 3 Tagen", "Überfällig")
```

---

## Neue Dateien (Übersicht)

```
/app
  /dokumente/page.tsx
  /einwaende/page.tsx
  /leitfaden/page.tsx
  /briefing/page.tsx
  /crm/page.tsx
  /crm/[id]/page.tsx
  /admin/dokumente/page.tsx
  /admin/einwaende/page.tsx
  /admin/leitfaden/page.tsx
  /admin/briefing/page.tsx
  /api/documents/route.ts
  /api/documents/[id]/route.ts
  /api/documents/upload/route.ts
  /api/objections/route.ts
  /api/objections/[id]/route.ts
  /api/objections/seed/route.ts
  /api/guide/route.ts
  /api/guide/[id]/route.ts
  /api/guide/reorder/route.ts
  /api/guide/seed/route.ts
  /api/briefings/route.ts
  /api/briefings/[id]/route.ts
  /api/briefings/[id]/read/route.ts
  /api/briefings/today/route.ts
  /api/crm/route.ts
  /api/crm/[id]/route.ts
  /api/crm/[id]/notes/route.ts
  /api/crm/[id]/status/route.ts
  /api/admin/crm/route.ts
/components
  /DocumentCard.tsx
  /ObjectionCard.tsx
  /GuideStep.tsx
  /GuideTimeline.tsx
  /BriefingCard.tsx
  /CrmPipelineStats.tsx
  /CrmRestaurantCard.tsx
  /CrmKanbanBoard.tsx
  /CrmNoteTimeline.tsx
  /CrmQuickAdd.tsx
  /BottomNav.tsx              # Erweitern mit "Mehr" Menü
  /MoreMenu.tsx               # Slide-Up Menü
```

---

## Prompt für Claude Code

```
Lies die Datei oriido-phase3-sales-enablement.md und erweitere die bestehende Oriido 
Sales App um 5 neue Module. Die App hat bereits: Onboarding-Wizard, Sales Tools 
(Checkliste + Demo), Admin-Dashboard, PIN-Login, Bottom Navigation.

Baue folgende 5 Module:

1. /dokumente – Dokumente & Materialien Hub. Admin lädt PDFs/PPTs hoch, Verkäufer 
   sehen sie kategorisiert (Vor Gespräch / Im Gespräch / Nach Zusage / Intern). 
   Suche, Kategoriefilter, Pin-Funktion, Offline-Button.

2. /einwaende – Einwand-Datenbank mit 12 vorbefüllten Einwänden. Accordion-Karten mit 
   Einwand, Antwort, Pro-Tipp, Don'ts. Durchsuchbar, nach Kategorie filterbar 
   (Preis/Bedarf/Technik/Wettbewerb/Timing/Vertrauen). Seed-Route für Initialdaten.

3. /leitfaden – Gesprächsleitfaden als vertikale Timeline mit 8 Schritten in 6 Phasen 
   (Einstieg → Bedarfsanalyse → Präsentation → Einwände → Abschluss → Nachbereitung). 
   Jeder Schritt mit Sprechtext, Tipps, Don'ts, Tool-Verweisen. Vorbefüllt mit 
   Seed-Daten. "Gespräch starten" Fullscreen-Modus.

4. /briefing – Tages-Briefing. Admin postet tägliche Nachrichten. Verkäufer sehen 
   aktuelles Briefing auf Home-Screen mit "NEU" Badge. Gelesen-Tracking. Markdown-Support.

5. /crm – CRM-Light mit Restaurant-Pipeline. Status: Lead → Kontaktiert → Termin → 
   Angebot → Gewonnen/Verloren. Listen- und Kanban-Ansicht. Notizen-Timeline pro 
   Restaurant (Typ: Notiz/Anruf/Besuch/E-Mail/WhatsApp). Follow-Up-Erinnerungen mit 
   Überfällig-Anzeige. Quick-Add für neue Restaurants. "Onboarding starten" Button 
   bei gewonnenen Restaurants.

Außerdem:
- Bottom Navigation erweitern: Home | Tools | CRM | Mehr (Slide-Up mit Dokumente, 
  Einwände, Leitfaden, Briefing)
- Home-Screen erweitern: Briefing-Karte + Quick-Links zu allen Modulen + Pipeline-Stats
- Alle Seed-Routes beim ersten Start aufrufen (12 Einwände, 8 Leitfaden-Schritte)
- Admin kann alles verwalten: Dokumente hochladen, Einwände pflegen, Leitfaden 
  bearbeiten, Briefings erstellen, alle CRM-Daten aller Verkäufer sehen

Dependencies: npm install react-beautiful-dnd react-markdown date-fns framer-motion

Gleicher Dark Theme (#0C0C14 bg, #FF6B35 accent). Mobile-first. Alles auf Deutsch.
```

---

## Prioritäten

Falls Claude Code das nicht alles in einem Durchgang schafft:

1. ⭐ **CRM-Light** – Sofort am wichtigsten, Verkäufer brauchen Pipeline-Tracking
2. ⭐ **Einwand-Datenbank** – Direkt nutzbar, Seed-Daten enthalten
3. ⭐ **Dokumente Hub** – Admin-Upload + Verkäufer-Zugriff
4. **Gesprächsleitfaden** – Seed-Daten + Timeline
5. **Tages-Briefing** – Einfachstes Modul, schnell gebaut
6. **Navigation + Home erweitern** – Am Ende alles verbinden
