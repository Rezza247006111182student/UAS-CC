import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { signToken } from '../lib/jwt';
import { AppError } from '../types';

function makeError(message: string, statusCode: number): AppError {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  return err;
}

export async function register(email: string, name: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw makeError('Email already registered', 409);
  }

  const password_hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, name, password_hash },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      is_active: true,
      created_at: true,
      updated_at: true,
    },
  });

  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  return { user, token };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw makeError('Invalid email or password', 401);
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    throw makeError('Invalid email or password', 401);
  }

  if (!user.is_active) {
    throw makeError('Account is deactivated', 403);
  }

  const { password_hash: _, ...safeUser } = user;
  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  return { user: safeUser, token };
}

export async function me(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      is_active: true,
      created_at: true,
      updated_at: true,
    },
  });

  if (!user) {
    throw makeError('User not found', 404);
  }

  return user;
}
