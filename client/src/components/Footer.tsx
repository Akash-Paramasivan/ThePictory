import { Link } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';
import logo from '../assets/logo.png';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

export default function Footer() {
  const { offersPageEnabled, instagramUrl, youtubeProfileUrl } = useSiteSettings();
  return (
    <footer className="border-t border-charcoal/10 bg-cream">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 flex flex-col items-center text-center gap-6">
        <Link to="/">
          <img src={logo} alt="The Pictory" className="h-9 w-auto" />
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
        {(instagramUrl || youtubeProfileUrl) && (
          <div className="flex gap-5">
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-charcoal-soft hover:text-charcoal transition-colors"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
            )}
            {youtubeProfileUrl && (
              <a
                href={youtubeProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-charcoal-soft hover:text-charcoal transition-colors"
              >
                <YoutubeIcon className="h-5 w-5" />
              </a>
            )}
          </div>
        )}
        <p className="text-xs text-charcoal-soft tracking-wide">
          &copy; {new Date().getFullYear()} The Pictory &mdash; Photography that tells your story.
        </p>
      </div>
    </footer>
  );
}
