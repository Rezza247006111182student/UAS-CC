import { NavLink } from 'react-router-dom';
import {
  Cloud,
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  Users,
  Server,
  Monitor,
} from 'lucide-react';
import { ROUTES } from '../../lib/constants';

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
}

const mainNav: NavItem[] = [
  { label: 'Dashboard', to: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard },
  { label: 'Products', to: ROUTES.ADMIN.PRODUCTS, icon: Package },
  { label: 'Categories', to: ROUTES.ADMIN.CATEGORIES, icon: Tag },
  { label: 'Orders', to: ROUTES.ADMIN.ORDERS, icon: ShoppingBag },
  { label: 'Users', to: ROUTES.ADMIN.USERS, icon: Users },
];

const cloudNav: NavItem[] = [
  { label: 'Platform', to: ROUTES.ADMIN.PLATFORM, icon: Server },
  { label: 'Infrastructure', to: ROUTES.ADMIN.INFRASTRUCTURE, icon: Monitor },
];

export default function AdminSidebar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-400 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <aside className="bg-[#0F172A] text-white w-64 h-screen fixed left-0 top-0 overflow-y-auto flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-white/10">
        <Cloud className="w-7 h-7 text-blue-400" />
        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          CloudMart
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {mainNav.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === ROUTES.ADMIN.DASHBOARD}
            className={linkClass}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}

        <hr className="my-3 border-white/10" />

        {cloudNav.map(({ label, to, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
