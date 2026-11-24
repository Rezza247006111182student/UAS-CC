import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../lib/constants';

const PATH_LABELS: Record<string, string> = {
  [ROUTES.ADMIN.DASHBOARD]: 'Dashboard',
  [ROUTES.ADMIN.PRODUCTS]: 'Products',
  [ROUTES.ADMIN.CATEGORIES]: 'Categories',
  [ROUTES.ADMIN.ORDERS]: 'Orders',
  [ROUTES.ADMIN.USERS]: 'Users',
  [ROUTES.ADMIN.PLATFORM]: 'Platform',
  [ROUTES.ADMIN.INFRASTRUCTURE]: 'Infrastructure',
};

export default function AdminTopbar() {
  const { pathname } = useLocation();
  const { user } = useAuthStore();

  const pageLabel = PATH_LABELS[pathname] ?? 'Admin';

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link
          to={ROUTES.ADMIN.DASHBOARD}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="font-semibold text-gray-900">{pageLabel}</span>
      </nav>

      {/* User info */}
      <div className="flex items-center gap-3">
        {user && (
          <>
            <span className="text-sm font-medium text-gray-700">{user.name}</span>
            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              {user.role}
            </span>
          </>
        )}
      </div>
    </header>
  );
}
