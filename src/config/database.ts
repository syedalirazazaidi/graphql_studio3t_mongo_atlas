import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

export class Database {
  private db: Db | null = null;
  private client: MongoClient | null = null;
  private uri: string;
  private dbName: string;

  constructor() {
    const MONGODB_URI = process.env.MONGODB_URI;
    const DB_NAME = process.env.DB_NAME || 'todest-graphql-db';

    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI is required in .env file');
      process.exit(1);
    }

    this.uri = MONGODB_URI;
    this.dbName = DB_NAME;
  }

  async connect(): Promise<void> {
    try {
      this.client = await MongoClient.connect(this.uri);
      this.db = this.client.db(this.dbName);
      
      console.log('✅ Connected to MongoDB Atlas');
      console.log(`📊 Using database: ${this.dbName}`);
      
      // List collections
      const collections = await this.db.listCollections().toArray();
      const names = collections.map(c => c.name);
      console.log(`📁 Collections: ${names.join(', ') || 'none'}`);
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      process.exit(1);
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db;
  }

  getDbName(): string {
    return this.dbName;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.db = null;
      this.client = null;
    }
  }
}

