import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Database } from './config/Database';
import { GraphQL } from './graphql/GraphQL';
import { Routes } from './routes/Routes';

export class App {
  private app: express.Application;
  private database: Database;
  private graphql: GraphQL;
  private routes: Routes;

  constructor() {
    this.app = express();
    this.database = new Database();
    this.graphql = new GraphQL(this.database);
    this.routes = new Routes(this.database);
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // Global middleware
    this.app.use(cors());
    this.app.use(bodyParser.json());
  }

  async setupGraphQL(): Promise<void> {
    await this.graphql.start();
    // Apply Apollo Server middleware
    // bodyParser.json() is already applied globally in setupMiddleware
    this.app.use('/graphql', this.graphql.getMiddleware());
  }

  private setupRoutes(): void {
    this.routes.setup(this.app);
  }

  getApp(): express.Application {
    return this.app;
  }

  getDatabase(): Database {
    return this.database;
  }
}
