// Single Responsibility: Schema data access implementation
// Dependency Inversion: Implements ISchemaRepository interface
import { ISchemaRepository } from '../interfaces/ISchemaRepository';
import { Schema, CreateSchemaDTO } from '../types/schema.types';
import { SchemaModel } from '../database/models/Schema.model';
import { connectToDatabase } from '../database/connection';
import { nanoid } from 'nanoid';

export class SchemaRepository implements ISchemaRepository {
  async create(data: CreateSchemaDTO): Promise<Schema> {
    await connectToDatabase();

    const schema = new SchemaModel({
      schema_id: `schema_${nanoid(10)}`,
      ...data,
      created_at: new Date(),
    });

    const saved = await schema.save();
    return saved.toObject();
  }

  async findById(schemaId: string): Promise<Schema | null> {
    await connectToDatabase();
    const schema = await SchemaModel.findOne({ schema_id: schemaId });
    return schema ? schema.toObject() : null;
  }

  async findAll(): Promise<Schema[]> {
    await connectToDatabase();
    const schemas = await SchemaModel.find().sort({ created_at: -1 });
    return schemas.map(s => s.toObject());
  }

  async update(schemaId: string, data: Partial<Schema>): Promise<Schema | null> {
    await connectToDatabase();
    const schema = await SchemaModel.findOneAndUpdate(
      { schema_id: schemaId },
      data,
      { new: true }
    );
    return schema ? schema.toObject() : null;
  }

  async delete(schemaId: string): Promise<boolean> {
    await connectToDatabase();
    const result = await SchemaModel.deleteOne({ schema_id: schemaId });
    return result.deletedCount > 0;
  }
}
