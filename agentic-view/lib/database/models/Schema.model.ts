// Single Responsibility: Schema data model definition
import mongoose, { Schema as MongooseSchema, Model } from 'mongoose';
import { Schema } from '../../types/schema.types';

const SchemaFieldSchema = new MongooseSchema({
  name: { type: String, required: true },
  css_selector: { type: String, required: true },
  data_type: {
    type: String,
    enum: ['string', 'number', 'currency', 'date', 'boolean'],
    required: true,
  },
  confidence: { type: Number, required: true, min: 0, max: 1 },
  currency_hint: { type: String, required: false },
}, { _id: false });

const SchemaModelSchema = new MongooseSchema<Schema>({
  schema_id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  source_url: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  fields: {
    type: [SchemaFieldSchema],
    required: true,
    validate: {
      validator: (fields: unknown[]) => fields.length > 0,
      message: 'Schema must have at least one field',
    },
  },
  sample_output: {
    type: MongooseSchema.Types.Mixed,
    required: true,
  },
}, {
  timestamps: false,
  collection: 'schemas',
});

export const SchemaModel: Model<Schema> =
  mongoose.models.Schema || mongoose.model<Schema>('Schema', SchemaModelSchema);
