import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeadCell,
} from '../../components/ui/Table';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import type { User, UserRole } from '../../types';

const ROLE_VARIANT: Record<UserRole, 'info' | 'danger'> = {
  ADMIN: 'danger',
  CUSTOMER: 'info',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ success: boolean; data: User[] }>('/admin/users')
      .then((res) => setUsers(res.data.data))
      .catch(() => setError('Gagal memuat daftar pengguna.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengguna</h1>
        <p className="text-sm text-gray-500 mt-1">Daftar akun terdaftar di CloudMart</p>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : (
          <Table>
            <TableHead>
              <tr>
                <TableHeadCell>Nama</TableHeadCell>
                <TableHeadCell>Email</TableHeadCell>
                <TableHeadCell>Role</TableHeadCell>
                <TableHeadCell>Bergabung</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
              </tr>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-400 py-10">
                    Belum ada pengguna.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-gray-900">{user.name}</TableCell>
                    <TableCell className="text-gray-500">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={ROLE_VARIANT[user.role]}>{user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? 'success' : 'danger'}>
                        {user.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
