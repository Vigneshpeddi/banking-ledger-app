import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { runQuery, getRow } from '../database/connection';
import { User, CreateUserRequest, LoginRequest, AuthResponse } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-i-dont-know-what-to-put-here-LMAO';
const SALT_ROUNDS = 10;

export class AuthService {
  static async register(userData: CreateUserRequest): Promise<AuthResponse> {
    const { email, password, name } = userData;

    const existingUser = await getRow('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await runQuery(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      [email, passwordHash, name]
    );

    const user = await getRow('SELECT id, email, name, created_at FROM users WHERE id = ?', [result.id]);

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      }
    };
  }

  static async login(loginData: LoginRequest): Promise<AuthResponse> {
    const { email, password } = loginData;

    const user = await getRow(
      'SELECT id, email, password_hash, name, created_at FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      }
    };
  }

  static async verifyToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const user = await getRow(
        'SELECT id, email, name, created_at FROM users WHERE id = ?',
        [decoded.userId]
      );

      if (!user) {
        throw new Error('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static async getUserById(userId: number): Promise<User | null> {
    const user = await getRow(
      'SELECT id, email, name, created_at FROM users WHERE id = ?',
      [userId]
    );

    return user ? {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at
    } : null;
  }
} 