import { useEffect, useState } from 'react';
import { getContactSubmissions, markContactRead, type ContactSubmission } from '../../api/contact';

export default function ContactsAdmin() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);

  const load = () => getContactSubmissions().then(setSubmissions).catch(() => setSubmissions([]));

  useEffect(() => {
    load();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await markContactRead(id);
      await load();
    } catch (err) {
      alert('Failed to mark as read — check console.');
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Contact Submissions</h1>
      <div className="bg-white rounded-lg border border-neutral-200 divide-y">
        {submissions.map((s) => (
          <div key={s.id} className={`p-4 ${s.isRead ? '' : 'bg-yellow-50'}`}>
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="font-medium">
                  {s.fullName} <span className="text-neutral-400 font-normal">({s.whatsAppCountryCode} {s.whatsAppNumber})</span>
                </p>
                <p className="text-sm text-neutral-600 mt-1">
                  {s.eventType} &middot; {s.photographyDays} &middot; {s.budget}
                </p>
                <p className="text-xs text-neutral-400 mt-2">{new Date(s.submittedAt).toLocaleString()}</p>
              </div>
              {!s.isRead && (
                <button type="button" onClick={() => handleMarkRead(s.id)} className="text-sm text-neutral-600 hover:underline whitespace-nowrap">
                  Mark read
                </button>
              )}
            </div>
          </div>
        ))}
        {submissions.length === 0 && <p className="p-4 text-neutral-500 text-sm">No submissions yet.</p>}
      </div>
    </div>
  );
}
