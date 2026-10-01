import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/media', label: 'Media' },
  { to: '/admin/offers', label: 'Offers' },
  { to: '/admin/contacts', label: 'Contact Submissions' },
  { to: '/admin/settings', label: 'Settings' },
];

export default function AdminDashboardLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-cream-dark">
      <aside className="md:w-56 bg-white border-b md:border-b-0 md:border-r border-charcoal/10 md:min-h-screen">
        <div className="p-4 font-serif text-xl text-charcoal">The Pictory</div>
        <nav className="flex md:flex-col gap-1 px-2 overflow-x-auto md:overflow-visible">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `whitespace-nowrap px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-charcoal text-white' : 'text-charcoal-soft hover:bg-blush'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 text-left"
          >
            Log out
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
}
