import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import OfferBanner from './OfferBanner';
import GalleryFooter from './GalleryFooter';

/**
 * Chrome-free (distraction-free) routes: the /contact and /gallery routes
 * suppress the standard header navigation bar and the full site footer to
 * keep the experience clean and focused.
 */
const CHROME_FREE_ROUTES = ['/contact', '/gallery'];

export default function PublicLayout() {
  const { pathname } = useLocation();
  const hideChrome = CHROME_FREE_ROUTES.includes(pathname);

  return (
    <div className="min-h-screen flex flex-col">
      {!hideChrome && <Navbar />}
      {!hideChrome && <OfferBanner />}
      <main className="flex-1">
        <Outlet />
      </main>
      {hideChrome ? (pathname === '/gallery' ? <GalleryFooter /> : <ContactFooter />) : <Footer />}
    </div>
  );
}

/**
 * Minimal footer for the /contact Meta Ads landing route — no logo, no nav
 * links, just the copyright line and a Privacy Policy link.
 */
function ContactFooter() {
  return (
    <footer className="border-t border-charcoal/10 bg-cream">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 text-center">
        <p className="text-xs text-charcoal-soft tracking-wide">
          © 2026 The Pictory. All rights reserved.{' '}
          <a
            href="/privacy-policy"
            className="underline hover:text-charcoal transition-colors"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </footer>
  );
}
