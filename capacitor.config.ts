import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.oriido.sales',
  appName: 'Oriido Sales',
  webDir: 'public',
  server: {
    // Für Entwicklung: Lädt von localhost
    // url: 'http://localhost:3000',
    
    // Für Produktion: Lädt von der Live-URL
    url: 'https://oriido-onboarding.vercel.app',
    cleartext: true
  },
  ios: {
    contentInset: 'always',
    scrollEnabled: false,
    backgroundColor: '#0C0C14'
  },
  android: {
    backgroundColor: '#0C0C14',
    allowMixedContent: true
  },
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0C0C14'
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    }
  }
};

export default config;