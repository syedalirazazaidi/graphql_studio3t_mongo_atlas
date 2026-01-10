import express, { Express } from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

const app: Express = express();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'todest-graphql-db';

// Validate required environment variables
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is required in .env file');
  process.exit(1);
}

console.log('✅ MongoDB URI loaded from .env');

let db: Db | null = null;

// Connect to MongoDB Atlas
MongoClient.connect(MONGODB_URI)
  .then((client) => {
    console.log('✅ Connected to MongoDB Atlas');
    db = client.db(DB_NAME);
    console.log(`📊 Using database: ${DB_NAME}`);
    console.log(`🔗 Connection string: ${MONGODB_URI?.substring(0, 30)}...`);
    
    // Verify database connection by listing collections
    db.listCollections().toArray()
      .then((collections) => {
        console.log(`📁 Existing collections: ${collections.map(c => c.name).join(', ') || 'none'}`);
      })
      .catch((err) => {
        console.warn('⚠️  Could not list collections:', err.message);
      });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// GraphQL Schema
const schema = buildSchema(`
  type Query {
    hello: String
    testDB: String
  }
`);

// GraphQL Root Resolver
const root = {
  hello: () => {
    return 'Hello from GraphQL with TypeScript!';
  },
  testDB: async () => {
    if (!db) {
      console.error('❌ Database not connected in testDB resolver');
      return '❌ Database not connected yet';
    }
    try {
      console.log(`📝 Attempting to insert into collection 'newali' in database: ${DB_NAME}`);
      // Test: Insert a document
      const testCollection = db.collection('developer_ali_test_new_task');
      const testDoc = {
        message: 'Hello from MongoDB!',
        timestamp: new Date(),
        test: true,
        source: 'GraphQL'
      };
      const result = await testCollection.insertOne(testDoc);
      console.log(`✅ Document inserted successfully! ID: ${result.insertedId}`);
      
      // Test: Read it back
      const found = await testCollection.findOne({ _id: result.insertedId });
      console.log(`✅ Document found: ${JSON.stringify(found)}`);
      
      return `✅ DB Test Successful! Inserted ID: ${result.insertedId}, Message: ${found?.message}, Database: ${DB_NAME}`;
    } catch (error: any) {
      console.error('❌ Error in testDB:', error);
      return `❌ DB Test Failed: ${error.message}`;
    }
  },
};

// GraphQL endpoint
app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true, // Enable GraphiQL interface for testing
  })
);

// Health check endpoint
app.get('/health', (_, res) => {
  res.json({ status: 'ok', db: db ? 'connected' : 'disconnected' });
});

// List all collections endpoint
app.get('/collections', async (_, res) => {
  if (!db) {
    return res.json({ 
      success: false, 
      message: 'Database not connected yet' 
    });
  }

  // Store db in a const so TypeScript knows it's not null
  const database = db;

  try {
    const collections = await database.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Get document count for each collection
    const collectionsWithCount = await Promise.all(
      collectionNames.map(async (name) => {
        const count = await database.collection(name).countDocuments();
        return { name, count };
      })
    );

    console.log(`📁 Collections in ${DB_NAME}:`, collectionNames.join(', '));
    
    return res.json({
      success: true,
      database: DB_NAME,
      collections: collectionsWithCount,
      total: collectionNames.length
    });
  } catch (error: any) {
    console.error('❌ Error listing collections:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list collections',
      error: error.message
    });
  }
});

// Simple DB test endpoint
app.get('/test-db', async (_, res) => {
  if (!db) {
    console.error('❌ Database not connected in /test-db endpoint');
    return res.json({ 
      success: false, 
      message: 'Database not connected yet' 
    });
  }

  try {
    console.log(`📝 Attempting to insert into collection 'test' in database: ${DB_NAME}`);
    // Test: Insert a document
    const testCollection = db.collection('test');
    const testDoc = {
      message: 'Hello from MongoDB Atlas!',
      timestamp: new Date(),
      test: true,
      source: 'REST API'
    };
    
    const result = await testCollection.insertOne(testDoc);
    console.log(`✅ Document inserted successfully! ID: ${result.insertedId}`);
    
    // Test: Read it back
    const found = await testCollection.findOne({ _id: result.insertedId });
    console.log(`✅ Document found: ${JSON.stringify(found)}`);
    
    return res.json({
      success: true,
      message: 'Database connection test successful!',
      insertedId: result.insertedId,
      document: found,
      database: DB_NAME,
      collection: 'test'
    });
  } catch (error: any) {
    console.error('❌ Error in /test-db:', error);
    return res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message
    });
  }
});

export default app;

