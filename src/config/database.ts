import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'todest-graphql-db';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is required in .env file');
  process.exit(1);
}

let db: Db | null = null;

// Connect to MongoDB Atlas
MongoClient.connect(MONGODB_URI)
  .then((client) => {
    console.log('✅ Connected to MongoDB Atlas');
    db = client.db(DB_NAME);
    console.log(`📊 Using database: ${DB_NAME}`);
    
    // List existing collections on startup
    db.listCollections()
      .toArray()
      .then((collections) => {
        const collectionNames = collections.map(c => c.name);
        console.log(`📁 Existing collections: ${collectionNames.join(', ') || 'none'}`);
      })
      .catch((err) => {
        console.warn('⚠️  Could not list collections:', err.message);
      });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

export const getDb = (): Db => {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db;
};

export { DB_NAME };

