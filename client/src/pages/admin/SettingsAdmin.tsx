import { useEffect, useState } from 'react';
import { getSiteSettings, updateSiteSettings } from '../../api/settings';

export default function SettingsAdmin() {
  const [offersPageEnabled, setOffersPageEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSiteSettings()
      .then((s) => setOffersPageEnabled(s.offersPageEnabled))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async () => {
    setSaving(true);
    try {
      const next = !offersPageEnabled;
      const result = await updateSiteSettings(next);
      setOffersPageEnabled(result.offersPageEnabled);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-neutral-500 text-sm">Loading...</p>;

  return (
    <div>
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
    </div>
  );
}
