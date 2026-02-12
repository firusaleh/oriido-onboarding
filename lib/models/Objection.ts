import mongoose from 'mongoose';

const objectionSchema = new mongoose.Schema({
  einwand: {
    type: String,
    required: true
  },
  kategorie: {
    type: String,
    required: true,
    enum: ['preis', 'technik', 'bedarf', 'vertrauen', 'timing', 'wettbewerb']
  },
  schwierigkeit: {
    type: Number,
    min: 1,
    max: 3,
    default: 2
  },
  antwortStrategie: String,
  antwortText: {
    type: String,
    required: true
  },
  beispielDialog: String,
  doNotSay: String,
  proTipp: String,
  tags: [String],
  sortierung: {
    type: Number,
    default: 0
  },
  erstelltAm: {
    type: Date,
    default: Date.now
  },
  aktualisiertAm: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Objection || mongoose.model('Objection', objectionSchema);