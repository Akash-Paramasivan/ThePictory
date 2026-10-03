import { useEffect, useState, type FormEvent } from 'react';
import { getSiteSettings, updateSiteSettings } from '../../api/settings';
import { ApiError } from '../../api/client';

export default function SettingsAdmin() {
  const [offersPageEnabled, setOffersPageEnabled] = useState(false);
  const [homepageVideoUrl, setHomepageVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSiteSettings()
      .then((s) => {
        setOffersPageEnabled(s.offersPageEnabled);
        setHomepageVideoUrl(s.homepageVideoUrl ?? '');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async () => {
    setSaving(true);
    try {
      const next = !offersPageEnabled;
      const result = await updateSiteSettings(next, homepageVideoUrl || null);
      setOffersPageEnabled(result.offersPageEnabled);
    } finally {
      setSaving(false);
    }
  };

  const handleVideoSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const result = await updateSiteSettings(offersPageEnabled, homepageVideoUrl || null);
      setHomepageVideoUrl(result.homepageVideoUrl ?? '');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save video URL.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-neutral-500 text-sm">Loading...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      <div className="bg-white rounded-lg border border-neutral-200 p-4 flex items-center justify-between max-w-xl">
        <div>
          <p className="font-medium">Show Offers page publicly</p>
          <p className="text-sm text-neutral-500">
            When off, the Offers nav link, page, and homepage offers section are hidden from visitors. You can still
            manage offers below while it's off.
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={saving}
          aria-pressed={offersPageEnabled}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0 ${
            offersPageEnabled ? 'bg-neutral-900' : 'bg-neutral-300'
          } disabled:opacity-50`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              offersPageEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <form onSubmit={handleVideoSave} className="bg-white rounded-lg border border-neutral-200 p-4 max-w-xl space-y-3">
        <div>
          <p className="font-medium">Homepage showcase video</p>
          <p className="text-sm text-neutral-500">
            Paste a YouTube link to show an auto-playing showcase video on the homepage. Leave blank to hide it.
          </p>
        </div>
        <input
          value={homepageVideoUrl}
          onChange={(e) => setHomepageVideoUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-neutral-900 text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save video'}
        </button>
      </form>
    </div>
  );
}
