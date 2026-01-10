import dotenv from 'dotenv';
import { App } from './app';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  const app = new App();
  
  // Connect to database
  await app.getDatabase().connect();
  
  // Setup GraphQL (Apollo Server)
  await app.setupGraphQL();
  
  // Start server
  app.getApp().listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}/graphql`);
    console.log(`📊 Apollo Studio: http://localhost:${PORT}/graphql`);
  });
}

startServer();
