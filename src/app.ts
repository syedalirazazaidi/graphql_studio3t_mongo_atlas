import express, { Express } from 'express';
import { graphqlHTTP } from 'express-graphql';
import { schema } from './graphql/schema';
import { root } from './graphql/resolvers';
import { setupRoutes } from './routes';
import './config/database'; // Initialize database connection

const app: Express = express();

// GraphQL endpoint
app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true, // Enable GraphiQL interface for testing
  })
);

// REST routes
setupRoutes(app);

export default app;
