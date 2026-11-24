import { prisma } from '../lib/prisma';
import { AppError } from '../types';

function makeError(message: string, statusCode: number): AppError {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  return err;
}

export async function getProfile(userId: string) {
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

  if (!user) throw makeError('User not found', 404);
  return user;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  email?: string;
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  if (data.email) {
    const existing = await prisma.user.findFirst({
      where: { email: data.email, NOT: { id: userId } },
    });
    if (existing) throw makeError('Email already in use', 409);
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email,
    },
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
}
