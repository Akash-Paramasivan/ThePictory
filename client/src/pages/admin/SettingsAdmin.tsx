import { useEffect, useState, type FormEvent } from 'react';
import { getSiteSettings, updateSiteSettings } from '../../api/settings';
import { ApiError } from '../../api/client';
import { extractYouTubeId, extractInstagramId } from '../../lib/embeds';

/** Returns true if the URL is blank, a valid YouTube URL, or a valid Instagram reel/post URL. */
function isValidShowcaseUrl(url: string): boolean {
  if (!url.trim()) return true;
  return extractYouTubeId(url) !== null || extractInstagramId(url) !== null;
}

/** Returns true if the URL is blank or a valid social profile URL (YouTube channel or Instagram profile). */
function isValidSocialProfile(url: string): boolean {
  if (!url.trim()) return true;
  const clean = url.trim().split('?')[0].replace(/\/$/, '');
  const isInstagramProfile = /^https?:\/\/(?:www\.)?instagram\.com\/(?!reel|p|tv|explore|accounts)[a-zA-Z0-9_.-]+$/i.test(clean);
  const isYouTubeChannel = /^https?:\/\/(?:www\.)?youtube\.com\/(?:channel\/[\w-]+|@[\w.-]+|user\/[\w.-]+|c\/[\w.-]+)$/i.test(clean);
  return isInstagramProfile || isYouTubeChannel;
}

export default function SettingsAdmin() {
  const [offersPageEnabled, setOffersPageEnabled] = useState(false);
  const [homepageVideoUrl, setHomepageVideoUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [youtubeProfileUrl, setYoutubeProfileUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [socialError, setSocialError] = useState<string | null>(null);

  useEffect(() => {
    getSiteSettings()
      .then((s) => {
        setOffersPageEnabled(s.offersPageEnabled);
        setHomepageVideoUrl(s.homepageVideoUrl ?? '');
        setInstagramUrl(s.instagramUrl ?? '');
        setYoutubeProfileUrl(s.youtubeProfileUrl ?? '');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async () => {
    setSaving(true);
    try {
      const next = !offersPageEnabled;
      const result = await updateSiteSettings(
        next,
        homepageVideoUrl.trim() || null,
        instagramUrl.trim() || null,
        youtubeProfileUrl.trim() || null,
      );
      setOffersPageEnabled(result.offersPageEnabled);
    } finally {
      setSaving(false);
    }
  };

  const handleVideoSave = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedUrl = homepageVideoUrl.trim();
    if (!isValidShowcaseUrl(trimmedUrl)) {
      setVideoError('A valid YouTube or Instagram Reel/Post URL is required.');
      return;
    }
    setSaving(true);
    setVideoError(null);
    try {
      const result = await updateSiteSettings(
        offersPageEnabled,
        trimmedUrl || null,
        instagramUrl.trim() || null,
        youtubeProfileUrl.trim() || null,
      );
      setHomepageVideoUrl(result.homepageVideoUrl ?? '');
    } catch (err) {
      setVideoError(err instanceof ApiError ? err.message : 'Failed to save video URL.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSocials = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedIg = instagramUrl.trim();
    const trimmedYt = youtubeProfileUrl.trim();

    if (!isValidSocialProfile(trimmedIg)) {
      setSocialError('Please enter a valid Instagram profile URL.');
      return;
    }
    if (!isValidSocialProfile(trimmedYt)) {
      setSocialError('Please enter a valid YouTube profile URL.');
      return;
    }
    setSaving(true);
    setSocialError(null);
    try {
      const result = await updateSiteSettings(
        offersPageEnabled,
        homepageVideoUrl.trim() || null,
        trimmedIg || null,
        trimmedYt || null,
      );
      setInstagramUrl(result.instagramUrl ?? '');
      setYoutubeProfileUrl(result.youtubeProfileUrl ?? '');
    } catch (err) {
      setSocialError(err instanceof ApiError ? err.message : 'Failed to save social profile URLs.');
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
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shrink-0 ${
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
            Paste a YouTube video link or an Instagram Reel/Post link to show an auto-playing showcase video on the homepage. Leave blank to hide it.
          </p>
        </div>
        <input
          value={homepageVideoUrl}
          onChange={(e) => {
            setHomepageVideoUrl(e.target.value);
            if (videoError) setVideoError(null);
          }}
          placeholder="YouTube or Instagram URL..."
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
        {videoError && <p className="text-red-600 text-sm">{videoError}</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-neutral-900 text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save video'}
        </button>
      </form>

      <form onSubmit={handleSaveSocials} className="bg-white rounded-lg border border-neutral-200 p-4 max-w-xl space-y-3">
        <div>
          <p className="font-medium">Instagram profile URL</p>
          <p className="text-sm text-neutral-500">
            Paste your Instagram profile link so it appears in the website footer. Leave blank to hide it.
          </p>
        </div>
        <input
          value={instagramUrl}
          onChange={(e) => {
            setInstagramUrl(e.target.value);
            if (socialError) setSocialError(null);
          }}
          placeholder="https://www.instagram.com/yourprofile/"
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
        <div>
          <p className="font-medium">YouTube profile URL</p>
          <p className="text-sm text-neutral-500">
            Paste your YouTube channel link so it appears in the website footer. Leave blank to hide it.
          </p>
        </div>
        <input
          value={youtubeProfileUrl}
          onChange={(e) => {
            setYoutubeProfileUrl(e.target.value);
            if (socialError) setSocialError(null);
          }}
          placeholder="https://www.youtube.com/@yourchannel/"
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
        {socialError && <p className="text-red-600 text-sm">{socialError}</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-neutral-900 text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Saving Calls...' : 'Save social profiles'}
        </button>
      </form>
    </div>
  );
}
