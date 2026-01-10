import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { Database } from '../config/Database';
import { TaskService } from '../services/TaskService';

export class GraphQL {
  private server: ApolloServer;
  private database: Database;

  constructor(database: Database) {
    this.database = database;
    this.server = new ApolloServer({
      typeDefs: `
        type Task {
          _id: ID!
          title: String!
          description: String
          completed: Boolean!
          createdAt: String!
          updatedAt: String!
        }

        input CreateTaskInput {
          title: String!
          description: String
        }

        type Query {
          tasks: [Task!]!
          task(id: ID!): Task
        }

        type Mutation {
          createTask(input: CreateTaskInput!): Task!
          deleteTask(id: ID!): Boolean!
        }
      `,
      resolvers: {
        Query: {
          tasks: async (_: any, __: any, context: any) => {
            const taskService = new TaskService(context.db);
            return await taskService.getAllTasks();
          },
          task: async (_: any, { id }: { id: string }, context: any) => {
            const taskService = new TaskService(context.db);
            return await taskService.getTaskById(id);
          },
        },
        Mutation: {
          createTask: async (_: any, { input }: { input: any }, context: any) => {
            const taskService = new TaskService(context.db);
            return await taskService.createTask(input);
          },
          deleteTask: async (_: any, { id }: { id: string }, context: any) => {
            const taskService = new TaskService(context.db);
            return await taskService.deleteTask(id);
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
      context: async () => {
        return {
          db: this.database.getDb(),
        };
      },
    });
  }

  getServer(): ApolloServer {
    return this.server;
  }
}
