import { Db, ObjectId } from 'mongodb';
import { Task, CreateTaskInput } from '../models/Task';

export class TaskService {
  private db: Db;
  private collectionName: string = 'tasks';

  constructor(db: Db) {
    this.db = db;
  }

  async createTask(input: CreateTaskInput, userId: string): Promise<Task> {
    // Create task without _id (MongoDB will generate it)
    const taskData = {
      title: input.title,
      description: input.description || '',
      completed: false,
      userId: userId, // Associate task with user
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.db.collection(this.collectionName).insertOne(taskData);
    
    // Return task with _id as string
    return {
      _id: result.insertedId.toString(),
      ...taskData,
    };
  }

  async deleteTask(id: string, userId: string): Promise<boolean> {
    try {
      // Only allow user to delete their own tasks
      const result = await this.db
        .collection(this.collectionName)
        .deleteOne({ _id: new ObjectId(id), userId: userId });
      
      return result.deletedCount > 0;
    } catch (error) {
      throw new Error(`Failed to delete task: ${error}`);
    }
  }

  async getAllTasks(userId?: string): Promise<Task[]> {
    // If userId provided, get only that user's tasks
    const filter = userId ? { userId: userId } : {};
    
    const tasks = await this.db
      .collection(this.collectionName)
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return tasks.map((task) => ({
      _id: task._id.toString(),
      title: task.title,
      description: task.description || '',
      completed: task.completed,
      userId: task.userId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }));
  }

  async getTaskById(id: string): Promise<Task | null> {
    try {
      const task = await this.db
        .collection(this.collectionName)
        .findOne({ _id: new ObjectId(id) });

      if (!task) return null;

      return {
        _id: task._id.toString(),
        title: task.title,
        description: task.description || '',
        completed: task.completed,
        userId: task.userId,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      };
    } catch (error) {
      return null;
    }
  }
}

