// Single Responsibility: Database connection management
import mongoose from 'mongoose';

interface ConnectionState {
  isConnected: boolean;
}

const connection: ConnectionState = {
  isConnected: false,
};

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (connection.isConnected) {
    return mongoose;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);
    connection.isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB connected successfully');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export function isConnected(): boolean {
  return connection.isConnected;
}
