import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Cloud, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import { ROUTES } from '../../lib/constants';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? ROUTES.HOME;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setServerError(null);
    try {
      const res = await api.post('/auth/login', data);
      const { user, token } = res.data.data;
      login(user, token);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Email atau password salah.';
      setServerError(msg);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] flex-col items-center justify-center px-12">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Cloud className="w-12 h-12 text-blue-400" />
            <span className="text-4xl font-extrabold text-white">CloudMart</span>
          </div>
          <p className="text-blue-200 text-lg max-w-xs mx-auto leading-relaxed">
            Platform e-commerce berbasis infrastruktur cloud yang handal dan skalabel.
          </p>
          <div className="mt-10 flex flex-col gap-3 text-sm text-blue-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Belanja aman & terpercaya
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Didukung infrastruktur cloud IaaS
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Pengiriman cepat ke seluruh Indonesia
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Cloud className="w-7 h-7 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">CloudMart</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Selamat datang kembali</h1>
            <p className="text-sm text-gray-500 mb-7">Masuk ke akun CloudMart Anda</p>

            {serverError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Email"
                type="email"
                placeholder="nama@email.com"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />

              {/* Password field with toggle */}
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 6 karakter"
                  autoComplete="current-password"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={isSubmitting}
              >
                Masuk
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Belum punya akun?{' '}
              <Link
                to={ROUTES.REGISTER}
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
