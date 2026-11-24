import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Cloud, ShoppingCart, Menu, X, ChevronDown, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { ROUTES } from '../../lib/constants';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { isAuthenticated, user, logout } = useAuthStore();
  const { itemCount, toggleCart } = useCartStore();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
    }`;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2 flex-shrink-0">
            <Cloud className="w-7 h-7 text-blue-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              CloudMart
            </span>
          </Link>

          {/* Center nav links — hidden on mobile */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to={ROUTES.HOME} end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to={ROUTES.PRODUCTS} className={navLinkClass}>
              Products
            </NavLink>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Cart icon */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* Auth section */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {isDropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                      <Link
                        to={ROUTES.PROFILE}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to={ROUTES.LOGIN}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors px-3 py-1.5"
                >
                  Login
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="text-sm font-medium bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 flex flex-col gap-3">
            <NavLink
              to={ROUTES.HOME}
              end
              className={navLinkClass}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to={ROUTES.PRODUCTS}
              className={navLinkClass}
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </NavLink>

            {isAuthenticated && user ? (
              <>
                <Link
                  to={ROUTES.PROFILE}
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile ({user.name})
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="text-left text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-3 pt-1">
                <Link
                  to={ROUTES.LOGIN}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="text-sm font-medium bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
