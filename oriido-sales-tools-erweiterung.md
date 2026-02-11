# Oriido Sales Tools – Erweiterung (Spec für Claude Code)

## Kontext

Das Onboarding-Tool (Wizard mit 7 Schritten, Admin-Dashboard, PIN-Login) ist bereits implementiert und funktioniert. Jetzt soll die App um **Sales Tools** erweitert werden, die der Verkäufer VOR und WÄHREND des Verkaufsgesprächs nutzt.

---

## Neue Routen

```
/tools                    → Übersicht der Sales Tools
/tools/checkliste         → "Ist dein Restaurant bereit?" (interaktive 8-Punkte-Checkliste)
/tools/demo               → QR-Code der zur Oriido-Demo-Seite führt
```

---

## Navigation erweitern

### Startseite nach Login (bestehende / anpassen)
Zeigt jetzt 2 große Karten:
- 🚀 **"Neues Onboarding starten"** → /neu
- 🧰 **"Sales Tools"** → /tools

Darunter: "Letzte Einreichungen" (die letzten 2-3 des Verkäufers)

### Bottom Navigation (mobil, sticky)
4 Tabs: **Home** | **Tools** | **Meine** | **Admin**
- Home → / (Startseite)
- Tools → /tools
- Meine → /meine (existiert bereits)
- Admin → /admin (existiert bereits, nur für Admin-PIN sichtbar)

---

## Tool 1: Restaurant-Checkliste ("/tools/checkliste")

### Was ist das?
Der Verkäufer sitzt mit dem Restaurantbesitzer zusammen und geht 8 Punkte durch: "Trifft das auf dich zu?" Je mehr Haken, desto klarer der Bedarf. Am Ende: Ergebnis + direkter CTA zum Onboarding.

### UI-Aufbau
- Gleicher Dark Theme wie die bestehende App (#0C0C14 bg, #FF6B35 accent)
- Mobil-first, volle Breite
- Smooth Animationen (Framer Motion)

### Header
- Titel: "Ist dein Restaurant **bereit?**" (bereit in #FF6B35)
- Untertitel: "8 Punkte – check ab, was auf dich zutrifft"
- Info-Box: Hintergrund #16161F, Border #2A2A38, Border-Radius 12px
  - Text: "**So funktioniert's:** Geh die Punkte durch und hak ab, was auf dein Restaurant zutrifft. Je mehr Haken, desto mehr profitierst du von Oriido. Aber auch mit nur 2–3 Haken lohnt es sich!"
  - "So funktioniert's:" in #FF6B35
- Counter oben rechts: "X von 8" in Mono-Font, Farbe #FF6B35, live aktualisiert

### Die 8 Checklist-Punkte
Jeder Punkt ist eine Karte (bg #16161F, border #2A2A38, rounded-xl):
- Links: Kreis-Checkbox (26px, border #2A2A38)
  - Bei Klick: Bounce-Animation, Kreis füllt sich orange (#FF6B35), weißes Häkchen
  - Karte bekommt dezenten orangen Border-Glow wenn gecheckt
- Mitte: Titel (bold, weiß) + Beschreibung (grau, Schlüsselsatz in **orange bold**)
- Rechts: Tag-Badge

```
1. Titel: "Du hast ein Kassensystem im Einsatz"
   Desc: "ready2order, orderbird, gastrofix oder ähnlich – Oriido verbindet sich **direkt damit**"
   Tag: MUSS → Badge: bg #FF6B35, text weiß

2. Titel: "Deine Gäste warten oft auf die Bestellung"
   Desc: "Besonders zu Stoßzeiten dauert es, bis Personal am Tisch ist – **Oriido löst das sofort**"
   Tag: MUSS → Badge: bg #FF6B35, text weiß

3. Titel: "Du hast mehr Tische als Personal"
   Desc: "Fachkräftemangel? Mit Oriido bedienst du **gleich viele Tische mit weniger Leuten**"
   Tag: IDEAL → Badge: border #FF6B35, text #FF6B35, bg transparent

4. Titel: "Du hast internationale Gäste"
   Desc: "Touristen, Studenten, Expats – die Speisekarte erscheint **automatisch in ihrer Sprache**"
   Tag: IDEAL → Badge: border #FF6B35, text #FF6B35, bg transparent

5. Titel: "Nachbestellungen kommen selten rein"
   Desc: "Gäste bestellen ungern nach, weil sie extra winken müssen – **digital geht's mit einem Tap**"
   Tag: IDEAL → Badge: border #FF6B35, text #FF6B35, bg transparent

6. Titel: "Bezahlung dauert zu lange"
   Desc: "Gäste warten auf die Rechnung, Tische bleiben blockiert – **Handy-Zahlung spart 2+ Minuten pro Tisch**"
   Tag: IDEAL → Badge: border #FF6B35, text #FF6B35, bg transparent

7. Titel: "Du änderst deine Speisekarte regelmäßig"
   Desc: "Tagesgerichte, saisonale Angebote – **digital in Sekunden aktualisiert, kein Neudruck**"
   Tag: BONUS → Badge: border #2A2A38, text #8A8A9A, bg transparent

8. Titel: "Du willst wissen, was deine Gäste wirklich bestellen"
   Desc: "Echtzeit-Daten zu Bestsellern, Umsatz pro Tisch, Stoßzeiten – **alles im Dashboard**"
   Tag: BONUS → Badge: border #2A2A38, text #8A8A9A, bg transparent
```

### Ergebnis-Sektion
Erscheint unter den 8 Punkten. Die passende Karte wird basierend auf der Anzahl Haken highlighted.

- Titel: "Dein **Ergebnis**" (Ergebnis in #FF6B35)
- 3 Karten nebeneinander (Grid, 3 Spalten):

| Bereich | Text | Nicht aktiv | Aktiv |
|---------|------|-------------|-------|
| 1–3 Haken | "Oriido lohnt sich schon" | border #2A2A38, opacity 0.5 | border #8A8A9A, opacity 1 |
| 4–6 Haken | "Perfekter Oriido-Kandidat" | border #2A2A38, opacity 0.5 | border #FF6B35, box-shadow orange glow, opacity 1 |
| 7–8 Haken | "Du brauchst Oriido gestern" | border #2A2A38, opacity 0.5 | border #22C55E, box-shadow green glow, opacity 1 |

Jede Karte zeigt:
- Große Zahl: "1–3" / "4–6" / "7–8" (Mono-Font, farbig)
- "Haken?" darunter (grau, klein)
- Ergebnis-Text darunter

### CTA-Bereich (unter Ergebnis)
- Großer Button: **"Jetzt Onboarding starten →"** (bg #FF6B35, text weiß, rounded-xl, min-height 52px, volle Breite)
  - Klick → `/neu?restaurant=[Name]` falls Restaurantname eingegeben wurde, sonst `/neu`
- Darunter: "Kein Risiko. Kein Aufwand. Wir richten alles ein." (text-center, 11px, grau)

### Optionale Extras
- **Restaurantname-Feld** ganz oben (optional): Input für den Namen des Restaurants → wird bei "Onboarding starten" als Query-Param übergeben und in Schritt 1 vorausgefüllt
- **WhatsApp-Teilen Button**: "📱 Ergebnis teilen" → öffnet wa.me mit: "Dein Restaurant hat X/8 Punkten bei der Oriido-Checkliste! Mehr Infos: oriido.com"
- **Reset Button**: Alle Haken zurücksetzen

---

## Tool 2: Demo ("/tools/demo")

### Was ist das?
Einfache Seite die einen großen QR-Code zeigt. Der Verkäufer zeigt dem Restaurantbesitzer den QR-Code, der scannt ihn mit seinem Handy und sieht live wie Oriido für Gäste funktioniert.

### UI-Aufbau
- Titel: "Live-**Demo**" (Demo in #FF6B35)
- Beschreibung: "Scann den QR-Code und erlebe Oriido als Gast – genau so sieht es für deine Gäste aus."
- Großer QR-Code in der Mitte (zentriert, ca. 250×250px, weißer Hintergrund mit Padding, rounded-xl)
  - QR-Code verlinkt zu: **https://your-restaurant.oriido.com/**
  - Nutze eine QR-Code Library: `qrcode.react` oder `next-qrcode`
- Unter dem QR-Code: 
  - URL als Text: "your-restaurant.oriido.com" (klickbar, öffnet in neuem Tab)
  - "Oder Link direkt teilen:" + Copy-Button der die URL in die Zwischenablage kopiert
- Ganz unten: Hinweis-Box: "💡 Tipp: Lass den Restaurantbesitzer den QR-Code mit seinem eigenen Handy scannen. So erlebt er Oriido aus Gäste-Perspektive."

### Kein Backend nötig
Komplett statische Seite, QR-Code wird client-side generiert.

---

## Tools-Übersicht ("/tools")

### UI
- Titel: "Sales Tools"
- Untertitel: "Alles was du für dein Verkaufsgespräch brauchst."

2 Tool-Karten (gleicher Style wie bestehende App-Karten):

| Tool | Icon | Titel | Beschreibung | Icon-Farbe |
|------|------|-------|-------------|-----------|
| 1 | ✅ | Restaurant-Checkliste | "Ist das Restaurant bereit? 8 Punkte durchgehen." | Orange bg (rgba(255,107,53,0.12)) |
| 2 | 📱 | Live-Demo | "QR-Code scannen – Oriido als Gast erleben." | Blau bg (rgba(59,130,246,0.12)) |

Jede Karte: Icon links (48×48 rounded box), Titel + Beschreibung mitte, Pfeil rechts (›).
Klick → navigiert zur jeweiligen Tool-Seite.

Darunter: Onboarding-CTA Karte:
- 🚀 "Restaurant überzeugt?"
- "Onboarding starten und alle Daten erfassen →"
- Klick → /neu

---

## Dateien die erstellt/angepasst werden müssen

### Neue Dateien
```
/app/tools/page.tsx                    → Tools-Übersicht
/app/tools/checkliste/page.tsx         → Interaktive 8-Punkte-Checkliste
/app/tools/demo/page.tsx               → QR-Code Demo-Seite
/components/ChecklistItem.tsx          → Einzelne Checkbox-Karte mit Animation
/components/BottomNav.tsx              → Bottom Navigation (4 Tabs)
```

### Bestehende Dateien anpassen
```
/app/page.tsx                          → Login-Seite: nach Login auf Home umleiten
/app/[home oder dashboard]/page.tsx    → 2 große Karten (Onboarding + Tools) + letzte Einreichungen
/app/neu/[id]/[schritt]/page.tsx       → Query-Param ?restaurant= auslesen und in Schritt 1 vorausfüllen
/app/layout.tsx                        → BottomNav einbinden (nur wenn eingeloggt)
```

### Dependencies installieren
```bash
npm install framer-motion qrcode.react
```

---

## Design-Referenz (gleich wie bestehende App)

```
Farben:
- Background:     #0C0C14
- Surface/Cards:  #16161F
- Surface Hover:  #1C1C28
- Border:         #2A2A38
- Accent/CTA:     #FF6B35
- Text Primary:   #F0EFE8
- Text Secondary: #8A8A9A
- Success:        #22C55E
- Error:          #EF4444
- Info/Blue:      #3B82F6

Komponenten:
- Cards: bg #16161F, border #2A2A38, rounded-xl, p-4
- Buttons Primary: bg #FF6B35, text white, rounded-xl, min-h 48px
- Tags/Badges: rounded-md, py-1 px-2, font-size 10-11px, font-weight 700
```

---

## Prompt für Claude Code

Kopiere das hier direkt in dein Terminal:

```
Lies die Datei oriido-sales-tools-erweiterung.md und erweitere die bestehende 
Onboarding-App um ein Sales Tools Modul. Die Onboarding-App (Wizard, Admin-Dashboard, 
PIN-Login) existiert bereits – NICHT neu bauen, nur erweitern.

Baue folgendes:

1. /tools – Übersichtsseite mit 2 Tool-Karten (Checkliste + Demo) und Onboarding-CTA
2. /tools/checkliste – Interaktive "Ist dein Restaurant bereit?" Checkliste mit 8 Punkten 
   (MUSS/IDEAL/BONUS Tags), animierten Checkboxen (Framer Motion), Live-Counter "X von 8", 
   Ergebnis-Sektion (1-3/4-6/7-8 Haken mit farbigem Highlight), und "Onboarding starten" 
   CTA der den Restaurantnamen als Query-Param übergibt
3. /tools/demo – Seite mit großem QR-Code (qrcode.react) der zu 
   https://your-restaurant.oriido.com/ verlinkt, plus Copy-Link Button und Tipp-Box

Außerdem:
- BottomNav Komponente (Home/Tools/Meine/Admin) in alle Seiten einbinden
- Startseite nach Login anpassen: 2 große Karten (Onboarding + Tools) + letzte Einreichungen
- Wizard Schritt 1: Query-Param ?restaurant= auslesen und Restaurantname vorausfüllen
- npm install framer-motion qrcode.react

Gleicher Dark Theme wie die bestehende App (#0C0C14 bg, #FF6B35 accent). Mobile-first. 
Alles auf Deutsch.
```
