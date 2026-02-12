# Oriido Sales App - Build Guide

## 🚀 Quick Start

Die App ist so konfiguriert, dass sie die Live-Website von Vercel lädt. Das bedeutet:
- **Alle Änderungen sind sofort live** ohne App-Update!
- Die App ist nur eine "Hülle" mit nativen Features

## 📱 iOS Build (iPhone)

### Voraussetzungen:
- Mac mit Xcode installiert
- Apple Developer Account (für App Store)
- Oder: kostenloser Account für lokales Testen

### Build-Schritte:

1. **Öffne Xcode:**
```bash
npm run cap:ios
```

2. **In Xcode:**
- Wähle dein Team unter "Signing & Capabilities"
- Wähle dein iPhone als Target (oder Simulator)
- Klicke auf ▶️ Play Button

3. **Für TestFlight/App Store:**
- Product → Archive
- Distribute App → App Store Connect

## 🤖 Android Build

### Voraussetzungen:
- Android Studio installiert
- Android SDK

### Build-Schritte:

1. **Öffne Android Studio:**
```bash
npm run cap:android
```

2. **In Android Studio:**
- Warte bis Gradle sync fertig ist
- Wähle dein Gerät/Emulator
- Klicke auf ▶️ Run

3. **APK erstellen (für direkte Installation):**
- Build → Build Bundle(s) / APK(s) → Build APK(s)
- APK findest du unter: `android/app/build/outputs/apk/debug/app-debug.apk`
- Diese APK kannst du per WhatsApp/E-Mail teilen!

## 🔄 Updates

### Website-Updates (99% der Fälle):
1. Ändere Code normal
2. `git push` zu GitHub
3. Vercel deployed automatisch
4. **Änderungen sind sofort in der App live!**

### Native Updates (selten nötig):
Nur wenn du Capacitor-Plugins änderst:
```bash
npm run cap:sync
```

## 📝 Wichtige URLs

- **Live App URL:** https://oriido-onboarding.vercel.app
- **Entwicklung:** http://localhost:3000

### URL wechseln:
Bearbeite `capacitor.config.ts`:
```typescript
server: {
  url: 'https://oriido-onboarding.vercel.app', // Produktion
  // url: 'http://localhost:3000',              // Entwicklung
}
```

## 🎨 App Icons & Splash Screens

Icons und Splash Screens müssen manuell in den nativen Projekten hinzugefügt werden:

### iOS:
- Icons: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Splash: `ios/App/App/Assets.xcassets/Splash.imageset/`

### Android:
- Icons: `android/app/src/main/res/mipmap-*/`
- Splash: `android/app/src/main/res/drawable/`

## 🚢 Verteilung an Mitarbeiter

### iOS (iPhone):
1. **TestFlight** (empfohlen):
   - Upload zu App Store Connect
   - Mitarbeiter per E-Mail/Link einladen
   - 90 Tage gültig

2. **Direkte Installation** (nur mit Developer Account):
   - Gerät muss registriert sein
   - Provisioning Profile erstellen

### Android:
1. **APK direkt teilen** (einfachste Methode):
   ```bash
   npm run cap:build:android
   # Build → Build APK in Android Studio
   # APK per WhatsApp versenden
   ```

2. **Google Play Internal Testing**:
   - Upload zu Play Console
   - Tester-Link teilen

## 🐛 Troubleshooting

### iOS Probleme:
- "No team selected": Xcode → Signing → Team auswählen
- "Device not trusted": iPhone → Einstellungen → Allgemein → VPN & Geräteverwaltung → App vertrauen

### Android Probleme:
- "App not installed": Einstellungen → Sicherheit → Unbekannte Quellen erlauben
- Build fehler: File → Invalidate Caches and Restart in Android Studio

## 💡 Tipps

1. **Für Entwicklung:** Ändere die URL in `capacitor.config.ts` zu localhost
2. **Für Produktion:** Nutze immer die Vercel URL
3. **Performance:** Die App cached automatisch, also ist sie nach dem ersten Laden schnell

---

**Bei Fragen:** Die App lädt einfach die Website - alle Web-Features funktionieren automatisch!