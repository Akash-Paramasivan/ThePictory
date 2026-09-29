export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 mt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-neutral-500">
        <p>&copy; {new Date().getFullYear()} The Pictory. All rights reserved.</p>
        <p>Photography that tells your story.</p>
      </div>
    </footer>
  );
}
