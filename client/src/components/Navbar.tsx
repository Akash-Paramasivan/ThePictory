import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';
import logo from '../assets/logo.png';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { offersPageEnabled } = useSiteSettings();
  const links = offersPageEnabled
    ? [{ to: '/portfolio', label: 'Portfolio' }, { to: '/offers', label: 'Offers' }, { to: '/contact', label: 'Contact' }]
    : [{ to: '/portfolio', label: 'Portfolio' }, { to: '/contact', label: 'Contact' }];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 flex h-24 items-center justify-between">
        <Link to="/" onClick={() => setOpen(false)}>
          <img src={logo} alt="The Pictory" className="h-6 sm:h-7 w-auto" />
        </Link>

        <nav className="hidden md:flex gap-12">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-light tracking-[0.2em] transition-colors ${
                  isActive ? 'text-stone-900 border-b border-stone-900' : 'text-stone-500 hover:text-stone-900'
                }`
              }
            >
              {link.label.toUpperCase()}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md text-stone-900"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <div className="space-y-1.5">
            <span className={`block h-0.5 w-6 bg-current transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-0.5 w-6 bg-current transition-opacity ${open ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-6 bg-current transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`} />
          </div>
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-stone-200 px-6 py-8 flex flex-col gap-6 bg-white">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `text-sm font-light tracking-[0.2em] uppercase ${isActive ? 'text-stone-900' : 'text-stone-500'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
