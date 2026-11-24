import { Server, Container } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';

const ENV_BLOCK = `PORTAINER_URL=https://192.168.18.35:9443
PORTAINER_TOKEN=your-portainer-api-token`;

export default function PlatformPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-purple-50 rounded-xl">
          <Server className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Kelola platform PaaS — Docker, Portainer, dan container CloudMart
          </p>
        </div>
      </div>

      {/* Docker & Portainer integration status card */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gray-100 rounded-xl flex-shrink-0">
              <Container className="w-6 h-6 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-base font-semibold text-gray-900">
                  Docker &amp; Portainer Integration
                </h2>
                <Badge variant="warning">NOT CONFIGURED</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                Konfigurasikan Portainer untuk mengelola container Docker CloudMart.
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

      {/* Containers section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-2">
            Containers
          </span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <Card>
          <EmptyState
            icon={<Container className="w-8 h-8 text-gray-400" />}
            title="Belum ada container aktif"
            description="Hubungkan Portainer untuk melihat container CloudMart"
          />
        </Card>
      </div>
    </div>
  );
}
