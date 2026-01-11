export interface Task {
  _id?: string;
  title: string;
  description?: string;
  completed: boolean;
  userId: string; // User who created the task
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
}

