import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const links = [
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/offers', label: 'Offers' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-charcoal/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex h-20 items-center justify-between">
        <Link to="/" className="font-serif text-2xl tracking-wide text-charcoal" onClick={() => setOpen(false)}>
          The Pictory
        </Link>

        <nav className="hidden md:flex gap-10">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-xs uppercase tracking-[0.15em] transition-colors ${
                  isActive ? 'text-charcoal' : 'text-charcoal-soft hover:text-charcoal'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md text-charcoal"
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
        <nav className="md:hidden border-t border-charcoal/10 px-4 py-4 flex flex-col gap-4 bg-cream">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `text-sm uppercase tracking-[0.15em] py-1 ${isActive ? 'text-charcoal' : 'text-charcoal-soft'}`
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
