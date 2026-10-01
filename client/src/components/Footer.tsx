import { Link } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function Footer() {
  const { offersPageEnabled } = useSiteSettings();
  return (
    <footer className="border-t border-charcoal/10 bg-cream">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 flex flex-col items-center text-center gap-6">
        <Link to="/" className="font-serif text-2xl tracking-wide text-charcoal">
          The Pictory
        </Link>
        <nav className="flex flex-wrap justify-center gap-8">
          <Link to="/portfolio" className="text-xs uppercase tracking-[0.15em] text-charcoal-soft hover:text-charcoal">
            Portfolio
          </Link>
          {offersPageEnabled && (
            <Link to="/offers" className="text-xs uppercase tracking-[0.15em] text-charcoal-soft hover:text-charcoal">
              Offers
            </Link>
          )}
          <Link to="/contact" className="text-xs uppercase tracking-[0.15em] text-charcoal-soft hover:text-charcoal">
            Contact
          </Link>
        </nav>
        <p className="text-xs text-charcoal-soft tracking-wide">
          &copy; {new Date().getFullYear()} The Pictory &mdash; Photography that tells your story.
        </p>
      </div>
    </footer>
  );
}
