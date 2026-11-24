import { Monitor, Server } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const VM_LIST = [
  {
    id: 'vm-100',
    label: 'VM-100 (Debian-1)',
    ip: '192.168.18.31',
  },
  {
    id: 'vm-101',
    label: 'VM-101 (Debian-2)',
    ip: '192.168.18.33',
  },
  {
    id: 'vm-102',
    label: 'VM-102 (Debian-3 / Docker)',
    ip: '192.168.18.35',
  },
];

const ENV_BLOCK = `PROXMOX_HOST=https://your-proxmox-host:8006
PROXMOX_TOKEN_ID=your-token-id@pve!api-token
PROXMOX_TOKEN_SECRET=your-token-secret`;

export default function InfrastructurePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-50 rounded-xl">
          <Monitor className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Infrastructure Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Kelola infrastruktur IaaS — Proxmox, Virtual Machines, dan Cloudflare Tunnel
          </p>
        </div>
      </div>

      {/* Proxmox integration status card */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gray-100 rounded-xl flex-shrink-0">
              <Server className="w-6 h-6 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-base font-semibold text-gray-900">Integrasi Proxmox</h2>
                <Badge variant="warning">NOT CONFIGURED</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                Konfigurasikan variabel lingkungan Proxmox untuk mengaktifkan monitoring
                infrastruktur.
              </p>
              <pre className="bg-gray-900 text-green-400 font-mono text-sm rounded-xl p-4 overflow-x-auto whitespace-pre-wrap break-all">
                {ENV_BLOCK}
              </pre>
              <div className="mt-4">
                <Button variant="outline" disabled>
                  Panduan Konfigurasi
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Virtual machines section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-2">
            Virtual Machines
          </span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {VM_LIST.map((vm) => (
            <div
              key={vm.id}
              className="flex-1 flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
            >
              <div className="p-2.5 bg-gray-100 rounded-lg flex-shrink-0">
                <Monitor className="w-5 h-5 text-gray-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{vm.label}</p>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{vm.ip}</p>
                <div className="mt-1.5">
                  <Badge variant="warning">Waiting for connection...</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
