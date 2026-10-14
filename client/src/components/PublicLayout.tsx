import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import OfferBanner from './OfferBanner';

/**
 * Ad-traffic landing isolation: the /contact route must not offer any
 * navigation exits, so the header (logo + nav links) and the full footer
 * are suppressed there only. Every other public route keeps the regular
 * chrome untouched.
 */
const CHROME_FREE_ROUTES = ['/contact'];

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
      {hideChrome ? <ContactFooter /> : <Footer />}
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
