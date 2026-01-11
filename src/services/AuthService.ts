import jwt from 'jsonwebtoken';

export class AuthService {
  private secretKey: string;

  constructor() {
    this.secretKey = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  }

  generateToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email },
      this.secretKey,
      { expiresIn: '7d' }
    );
  }

  verifyToken(token: string): { userId: string; email: string } | null {
    try {
      const decoded = jwt.verify(token, this.secretKey) as { userId: string; email: string };
      return decoded;
    } catch (error) {
      return null;
    }
  }

  getTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    
    // Format: "Bearer TOKEN"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }
}

