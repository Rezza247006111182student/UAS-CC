import * as proxmox from '../adapters/proxmox.adapter';
import * as docker from '../adapters/docker.adapter';
import * as portainer from '../adapters/portainer.adapter';
import * as prometheus from '../adapters/prometheus.adapter';

export async function getInfrastructureStatus() {
  const [proxmoxStatus, dockerStatus, portainerStatus, prometheusStatus] = await Promise.all([
    proxmox.getStatus(),
    docker.getCloudMartContainers(),
    portainer.getStatus(),
    prometheus.getTargets(),
  ]);

  return {
    proxmox: proxmoxStatus,
    docker: dockerStatus,
    portainer: portainerStatus,
    prometheus: prometheusStatus,
  };
}
