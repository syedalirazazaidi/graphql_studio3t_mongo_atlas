import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { Database } from '../config/Database';
import { TaskService } from '../services/TaskService';
import { UserService } from '../services/UserService';

export class GraphQL {
  private server: ApolloServer;
  private database: Database;

  constructor(database: Database) {
    this.database = database;
    this.server = new ApolloServer({
      typeDefs: `
        type User {
          _id: ID!
          email: String!
          name: String!
          createdAt: String!
          updatedAt: String!
        }

        type Task {
          _id: ID!
          title: String!
          description: String
          completed: Boolean!
          userId: ID!
          createdAt: String!
          updatedAt: String!
        }

        input CreateTaskInput {
          title: String!
          description: String
        }

        input LoginInput {
          email: String!
          password: String!
        }

        input RegisterInput {
          email: String!
          password: String!
          name: String!
        }

        type AuthPayload {
          token: String!
          user: User!
        }

        type Query {
          tasks: [Task!]!
          task(id: ID!): Task
          me: User
        }

        type Mutation {
          register(input: RegisterInput!): AuthPayload!
          login(input: LoginInput!): AuthPayload!
          createTask(input: CreateTaskInput!): Task!
          deleteTask(id: ID!): Boolean!
        }
      `,
      resolvers: {
        Query: {
          tasks: async (_: any, __: any, context: any) => {
            if (!context.userId) {
              throw new Error('Authentication required');
            }
            const taskService = new TaskService(context.db);
            return await taskService.getAllTasks(context.userId);
          },
          task: async (_: any, { id }: { id: string }, context: any) => {
            if (!context.userId) {
              throw new Error('Authentication required');
            }
            const taskService = new TaskService(context.db);
            return await taskService.getTaskById(id);
          },
          me: async (_: any, __: any, context: any) => {
            if (!context.userId) {
              throw new Error('Authentication required');
            }
            const userService = new UserService(context.db);
            return await userService.getUserById(context.userId);
          },
        },
        Mutation: {
          register: async (_: any, { input }: { input: any }, context: any) => {
            const userService = new UserService(context.db);
            return await userService.register(input);
          },
          login: async (_: any, { input }: { input: any }, context: any) => {
            const userService = new UserService(context.db);
            return await userService.login(input);
          },
          createTask: async (_: any, { input }: { input: any }, context: any) => {
            if (!context.userId) {
              throw new Error('Authentication required');
            }
            const taskService = new TaskService(context.db);
            return await taskService.createTask(input, context.userId);
          },
          deleteTask: async (_: any, { id }: { id: string }, context: any) => {
            if (!context.userId) {
              throw new Error('Authentication required');
            }
            const taskService = new TaskService(context.db);
            return await taskService.deleteTask(id, context.userId);
          },
        },
      },
    });
  }

  async start(): Promise<void> {
    await this.server.start();
  }

  getMiddleware() {
    return expressMiddleware(this.server, {
      context: async ({ req }) => {
        const db = this.database.getDb();
        const userService = new UserService(db);
        const authService = userService.getAuthService();
        
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        const token = authService.getTokenFromHeader(authHeader);
        
        let userId: string | null = null;
        
        if (token) {
          const decoded = authService.verifyToken(token);
          if (decoded) {
            userId = decoded.userId;
          }
        }
        
        return {
          db,
          userId,
        };
      },
    });
  }

  getServer(): ApolloServer {
    return this.server;
  }
}
