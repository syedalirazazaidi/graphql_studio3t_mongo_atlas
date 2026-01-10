import { Db, ObjectId } from 'mongodb';
import { Task, CreateTaskInput } from '../models/Task';

export class TaskService {
  private db: Db;
  private collectionName: string = 'tasks';

  constructor(db: Db) {
    this.db = db;
  }

  async createTask(input: CreateTaskInput): Promise<Task> {
    // Create task without _id (MongoDB will generate it)
    const taskData = {
      title: input.title,
      description: input.description || '',
      completed: false,
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

  async deleteTask(id: string): Promise<boolean> {
    try {
      const result = await this.db
        .collection(this.collectionName)
        .deleteOne({ _id: new ObjectId(id) });
      
      return result.deletedCount > 0;
    } catch (error) {
      throw new Error(`Failed to delete task: ${error}`);
    }
  }

  async getAllTasks(): Promise<Task[]> {
    const tasks = await this.db
      .collection(this.collectionName)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return tasks.map((task) => ({
      _id: task._id.toString(),
      title: task.title,
      description: task.description || '',
      completed: task.completed,
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
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      };
    } catch (error) {
      return null;
    }
  }
}

