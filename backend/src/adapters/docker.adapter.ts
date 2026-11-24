import Dockerode from 'dockerode';

const NOT_CONFIGURED = {
  status: 'NOT_CONFIGURED' as const,
  message: 'Docker socket not available',
};

function getDocker(): Dockerode {
  return new Dockerode({ socketPath: '/var/run/docker.sock' });
}

export async function getCloudMartContainers(): Promise<Record<string, unknown>> {
  try {
    const docker = getDocker();
    const allContainers = await docker.listContainers({ all: true });

    const cloudmartContainers = allContainers
      .filter((c) => {
        const hasLabel = c.Labels && c.Labels['com.cloudmart'] === 'true';
        const hasNamePrefix = c.Names.some((n) => n.startsWith('/cloudmart_'));
        return hasLabel || hasNamePrefix;
      })
      .map((c) => ({
        id: c.Id.slice(0, 12),
        names: c.Names,
        image: c.Image,
        status: c.Status,
        state: c.State,
        created: c.Created,
        ports: c.Ports,
      }));

    return { status: 'CONNECTED', data: cloudmartContainers };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('ENOENT') || message.includes('EACCES') || message.includes('connect')) {
      return NOT_CONFIGURED;
    }
    return { status: 'ERROR', message };
  }
}
