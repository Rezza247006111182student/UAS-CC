import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';

const profileSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const { setUser } = useAuthStore();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
    },
  });

  // Keep form in sync when user loads
  useEffect(() => {
    if (user) {
      reset({ name: user.name, phone: user.phone ?? '' });
    }
  }, [user, reset]);

  async function onSubmit(data: ProfileFormData) {
    try {
      const res = await api.put('/users/profile', data);
      setUser(res.data.data);
      showToast('Profil berhasil diperbarui', 'success');
      reset(data);
    } catch {
      showToast('Gagal memperbarui profil. Coba lagi.', 'error');
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Profil Saya</h1>

      {/* Avatar card */}
      <div className="flex items-center gap-5 mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">Edit Profil</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Nama Lengkap"
              type="text"
              placeholder="Nama Anda"
              error={errors.name?.message}
              {...register('name')}
            />

            {/* Email — read only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={user?.email ?? ''}
                readOnly
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-400">Email tidak dapat diubah.</p>
            </div>

            <Input
              label="Nomor Telepon"
              type="tel"
              placeholder="Contoh: 08123456789"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isSubmitting}
                disabled={!isDirty}
              >
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
