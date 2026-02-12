import mongoose from 'mongoose';

const ProspectSchema = new mongoose.Schema({
  placeId: { 
    type: String, 
    unique: true, 
    required: true 
  },
  
  name: String,
  adresse: String,
  strasse: String,
  plz: String,
  stadt: String,
  lat: Number,
  lng: Number,
  telefon: String,
  website: String,
  googleMapsUrl: String,
  bewertung: Number,
  anzahlBewertungen: Number,
  oeffnungszeiten: [String],
  fotos: [String],
  priceLevel: Number,
  types: [String],
  
  inPipeline: { 
    type: Boolean, 
    default: false 
  },
  crmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CrmRestaurant'
  },
  
  gecachtAm: { 
    type: Date, 
    default: Date.now 
  },
  gecachtFuer: String
});

ProspectSchema.index({ placeId: 1 });
ProspectSchema.index({ lat: 1, lng: 1 });
ProspectSchema.index({ gecachtAm: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

export const Prospect = mongoose.models.Prospect || mongoose.model('Prospect', ProspectSchema);