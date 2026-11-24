import axios from 'axios';
import { env } from '../config/env';

const NOT_CONFIGURED = {
  status: 'NOT_CONFIGURED' as const,
  message: 'Portainer credentials not configured',
};

function getClient() {
  return axios.create({
    baseURL: env.PORTAINER_URL,
    headers: {
      Authorization: `Bearer ${env.PORTAINER_TOKEN}`,
    },
    timeout: 10000,
  });
}

export async function getStatus(): Promise<Record<string, unknown>> {
  if (!env.PORTAINER_URL) return NOT_CONFIGURED;

  try {
    const client = getClient();
    const response = await client.get('/api/status');
    return { status: 'CONNECTED', data: response.data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { status: 'ERROR', message };
  }
}

export async function getEndpoints(): Promise<Record<string, unknown>> {
  if (!env.PORTAINER_URL) return NOT_CONFIGURED;

  try {
    const client = getClient();
    const response = await client.get('/api/endpoints');
    return { status: 'CONNECTED', data: response.data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { status: 'ERROR', message };
  }
}
