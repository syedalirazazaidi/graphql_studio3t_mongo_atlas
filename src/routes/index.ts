import { Express, Response } from 'express';
import { getDb, DB_NAME } from '../config/database';

export const setupRoutes = (app: Express): void => {
  // Health check endpoint
  app.get('/health', (_, res: Response) => {
    try {
      getDb(); // Check if database is connected
      res.json({ status: 'ok', db: 'connected' });
    } catch {
      res.json({ status: 'ok', db: 'disconnected' });
    }
  });

  // List all collections endpoint
  app.get('/collections', async (_, res: Response) => {
    try {
      const database = getDb();
      const collections = await database.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      
      // Get document count for each collection
      const collectionsWithCount = await Promise.all(
        collectionNames.map(async (name) => {
          const count = await database.collection(name).countDocuments();
          return { name, count };
        })
      );

      res.json({
        success: true,
        database: DB_NAME,
        collections: collectionsWithCount,
        total: collectionNames.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to list collections',
        error: error.message
      });
    }
  });
};

