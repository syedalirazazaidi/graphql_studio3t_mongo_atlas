import express, { Response } from 'express';
import { Database } from '../config/Database';

export class Routes {
  private database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  setup(app: express.Application): void {
    app.get('/health', this.healthCheck.bind(this));
    app.get('/collections', this.listCollections.bind(this));
  }

  private healthCheck(_: any, res: Response): void {
    try {
      this.database.getDb();
      res.json({ status: 'ok', db: 'connected' });
    } catch {
      res.json({ status: 'ok', db: 'disconnected' });
    }
  }

  private async listCollections(_: any, res: Response): Promise<void> {
    try {
      const db = this.database.getDb();
      const collections = await db.listCollections().toArray();
      const names = collections.map(c => c.name);
      
      const collectionsWithCount = await Promise.all(
        names.map(async (name) => {
          const count = await db.collection(name).countDocuments();
          return { name, count };
        })
      );

      res.json({
        success: true,
        database: this.database.getDbName(),
        collections: collectionsWithCount,
        total: names.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to list collections',
        error: error.message
      });
    }
  }
}

