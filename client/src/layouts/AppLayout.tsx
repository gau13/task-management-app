import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  X,
  CheckSquare,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { Button } from '../components/ui/Button';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navItems.map(({ to, label, icon: Icon }) => {
        const isActive = location.pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={() => mobile && setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-primary-600" />
          <span className="font-semibold text-gray-900">TaskManager</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile nav overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-40 h-full w-64 bg-white border-r transform transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-primary-600" />
          <span className="font-semibold">TaskManager</span>
        </div>
        <nav className="p-3 space-y-1">
          <NavLinks mobile />
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="mt-2 w-full justify-start">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="lg:flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r">
          <div className="p-6 border-b flex items-center gap-2">
            <CheckSquare className="h-7 w-7 text-primary-600" />
            <span className="text-lg font-bold text-gray-900">TaskManager</span>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <NavLinks />
          </nav>
          <div className="p-4 border-t">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate mb-2">{user?.email}</p>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-64">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
