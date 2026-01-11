import { Db, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { User, LoginInput, RegisterInput } from '../models/User';
import { AuthService } from './AuthService';

export class UserService {
  private db: Db;
  private collectionName: string = 'users';
  private authService: AuthService;

  constructor(db: Db) {
    this.db = db;
    this.authService = new AuthService();
  }

  async register(input: RegisterInput): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const existingUser = await this.db
      .collection(this.collectionName)
      .findOne({ email: input.email });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, 10);

    // Create user
    const userData = {
      email: input.email,
      password: hashedPassword,
      name: input.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.db.collection(this.collectionName).insertOne(userData);

    const user: User = {
      _id: result.insertedId.toString(),
      email: userData.email,
      password: '', // Don't return password
      name: userData.name,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    };

    // Generate JWT token
    const token = this.authService.generateToken(user._id!, user.email);

    return { user, token };
  }

  async login(input: LoginInput): Promise<{ user: User; token: string }> {
    // Find user by email
    const userDoc = await this.db
      .collection(this.collectionName)
      .findOne({ email: input.email });

    if (!userDoc) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(input.password, userDoc.password);

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const user: User = {
      _id: userDoc._id.toString(),
      email: userDoc.email,
      password: '', // Don't return password
      name: userDoc.name,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    };

    // Generate JWT token
    const token = this.authService.generateToken(user._id!, user.email);

    return { user, token };
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await this.db
        .collection(this.collectionName)
        .findOne({ _id: new ObjectId(userId) });

      if (!userDoc) return null;

      return {
        _id: userDoc._id.toString(),
        email: userDoc.email,
        password: '', // Don't return password
        name: userDoc.name,
        createdAt: userDoc.createdAt,
        updatedAt: userDoc.updatedAt,
      };
    } catch (error) {
      return null;
    }
  }

  getAuthService(): AuthService {
    return this.authService;
  }
}

