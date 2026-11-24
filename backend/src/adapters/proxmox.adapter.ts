import axios from 'axios';
import https from 'https';
import { env } from '../config/env';

const NOT_CONFIGURED = {
  status: 'NOT_CONFIGURED' as const,
  message: 'Proxmox credentials not configured',
};

function getClient() {
  return axios.create({
    baseURL: `https://${env.PROXMOX_HOST}/api2/json`,
    headers: {
      Authorization: `PVEAPIToken=${env.PROXMOX_TOKEN_ID}=${env.PROXMOX_TOKEN_SECRET}`,
    },
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    timeout: 10000,
  });
}

export async function getStatus(): Promise<Record<string, unknown>> {
  if (!env.PROXMOX_HOST) return NOT_CONFIGURED;

  try {
    const client = getClient();
    const response = await client.get('/version');
    return { status: 'CONNECTED', data: response.data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { status: 'ERROR', message };
  }
}

export async function getNodes(): Promise<Record<string, unknown>> {
  if (!env.PROXMOX_HOST) return NOT_CONFIGURED;

  try {
    const client = getClient();
    const response = await client.get('/nodes');
    return { status: 'CONNECTED', data: response.data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { status: 'ERROR', message };
  }
}
