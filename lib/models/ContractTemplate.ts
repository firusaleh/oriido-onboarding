import mongoose from 'mongoose';

const ContractTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['partner', 'service', 'datenschutz', 'agb', 'sonstiges'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  variables: [{
    key: String,
    label: String,
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'select', 'boolean'],
    },
    required: Boolean,
    defaultValue: String,
    options: [String], // for select type
  }],
  active: {
    type: Boolean,
    default: true,
  },
  version: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.ContractTemplate || mongoose.model('ContractTemplate', ContractTemplateSchema);