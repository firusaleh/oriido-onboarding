import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  text: String,
  datum: {
    type: Date,
    default: Date.now
  },
  typ: {
    type: String,
    enum: ['notiz', 'anruf', 'besuch', 'email', 'whatsapp'],
    default: 'notiz'
  }
});

const crmRestaurantSchema = new mongoose.Schema({
  verkaeuferId: {
    type: String,
    required: true
  },
  
  // Basis-Daten
  name: {
    type: String,
    required: true
  },
  adresse: String,
  googleMapsLink: String,
  art: String,
  
  // Kontakt
  ansprechpartner: String,
  telefon: String,
  email: String,
  
  // Pipeline-Status
  status: {
    type: String,
    required: true,
    enum: ['lead', 'kontaktiert', 'termin', 'angebot', 'gewonnen', 'verloren', 'spaeter'],
    default: 'lead'
  },
  
  // Details
  anzahlTische: Number,
  kassensystem: String,
  geschaetztesVolumen: String,
  
  // Follow-Up
  naechsterKontakt: Date,
  
  // Notizen
  notizen: [noteSchema],
  
  // Absage-Grund
  absageGrund: String,
  
  // Google Places Integration
  placeId: String,
  googleBewertung: Number,
  googleFotos: [String],
  quelle: {
    type: String,
    enum: ['manuell', 'google_maps', 'import'],
    default: 'manuell'
  },
  
  // Meta
  erstelltAm: {
    type: Date,
    default: Date.now
  },
  aktualisiertAm: {
    type: Date,
    default: Date.now
  }
});

// Index für Verkäufer-ID für schnellere Queries
crmRestaurantSchema.index({ verkaeuferId: 1, status: 1 });

export default mongoose.models.CrmRestaurant || mongoose.model('CrmRestaurant', crmRestaurantSchema);