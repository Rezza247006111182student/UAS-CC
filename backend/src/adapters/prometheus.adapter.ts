import axios from 'axios';
import { env } from '../config/env';

const NOT_CONFIGURED = {
  status: 'NOT_CONFIGURED' as const,
  message: 'Prometheus URL not configured',
};

function getClient() {
  return axios.create({
    baseURL: env.PROMETHEUS_URL,
    timeout: 10000,
  });
}

export async function query(promql: string): Promise<Record<string, unknown>> {
  if (!env.PROMETHEUS_URL) return NOT_CONFIGURED;

  try {
    const client = getClient();
    const response = await client.get('/api/v1/query', {
      params: { query: promql },
    });
    return { status: 'CONNECTED', data: response.data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { status: 'ERROR', message };
  }
}

export async function getTargets(): Promise<Record<string, unknown>> {
  if (!env.PROMETHEUS_URL) return NOT_CONFIGURED;

  try {
    const client = getClient();
    const response = await client.get('/api/v1/targets');
    return { status: 'CONNECTED', data: response.data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { status: 'ERROR', message };
  }
}
