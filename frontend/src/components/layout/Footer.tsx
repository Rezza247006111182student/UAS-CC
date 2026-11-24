import { Link } from 'react-router-dom';
import { Cloud } from 'lucide-react';
import { ROUTES } from '../../lib/constants';

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-white/10">
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Cloud className="w-7 h-7 text-blue-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                CloudMart
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Platform e-commerce berbasis cloud yang memadukan kemudahan belanja dengan
              infrastruktur cloud modern.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Quick Links
            </h3>
            <nav className="flex flex-col gap-2">
              <Link
                to={ROUTES.HOME}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                to={ROUTES.PRODUCTS}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Products
              </Link>
              <Link
                to={ROUTES.LOGIN}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Login
              </Link>
            </nav>
          </div>

          {/* Column 3: Contact */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Contact
            </h3>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <span>Universitas Siliwangi</span>
              <span>Prodi Informatika — Kelompok 3</span>
              <span>cloudmart@example.com</span>
            </div>
          </div>
        </div>

        <div className="pt-6 text-center text-sm text-gray-500">
          © 2026 CloudMart — Kelompok 3, Komputasi Awan
        </div>
      </div>
    </footer>
  );
}
