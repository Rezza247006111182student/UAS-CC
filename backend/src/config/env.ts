
import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables before validation
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().optional().default('http://localhost:5173'),
  PROXMOX_HOST: z.string().optional().default(''),
  PROXMOX_TOKEN_ID: z.string().optional().default(''),
  PROXMOX_TOKEN_SECRET: z.string().optional().default(''),
  PORTAINER_URL: z.string().optional().default(''),
  PORTAINER_TOKEN: z.string().optional().default(''),
  PROMETHEUS_URL: z.string().optional().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.format());
  throw new Error('Environment validation failed. Check your .env file.');
}

export const env = parsed.data;
export const PORT = parseInt(env.PORT, 10);
export const NODE_ENV = env.NODE_ENV;
export const DATABASE_URL = env.DATABASE_URL;
export const JWT_SECRET = env.JWT_SECRET;
export const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;
export const CORS_ORIGIN = env.CORS_ORIGIN;
