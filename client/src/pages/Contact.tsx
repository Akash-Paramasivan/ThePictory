import { useState, useRef, useEffect } from 'react';
import { submitContactForm } from '../api/contact';
import { ApiError } from '../api/client';

const EVENT_TYPES = ['Wedding', 'Engagement', 'Wedding + Engagement', 'Other'];
// Budget tiers for "Wedding + Engagement" events.
const WEDDING_ENGAGEMENT_BUDGET_OPTIONS = ['1L – 1.5L', '1.5L – 2L', '2L – 2.5L', '3L+ and above'];
// Budget tiers shown only when the event type is "Other".
const OTHER_BUDGET_OPTIONS = ['Above 25k – 50k', 'Above 50k – 1L', '1L+ and above'];
// Original budget ranges, preserved for "Wedding" or "Engagement" alone.
const BUDGET_OPTIONS = ['₹50,000 – ₹1 Lakh', '₹1 Lakh – ₹2 Lakhs', '₹2 Lakhs – ₹3 Lakhs', '₹3 Lakhs & Above'];
const COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳', label: 'IN' },
  { code: '+1', flag: '🇺🇸', label: 'US' },
  { code: '+44', flag: '🇬🇧', label: 'UK' },
  { code: '+971', flag: '🇦🇪', label: 'AE' },
];

interface FormState {
  eventType: string;
  eventOther: string;
  eventDate: string;
  budget: string;
  fullName: string;
  whatsAppCountryCode: string;
  whatsAppNumber: string;
}

const STEPS = ['eventType', 'eventDate', 'budget', 'fullName', 'whatsApp'] as const;

export default function Contact() {
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<FormState>({
    eventType: '',
    eventOther: '',
    eventDate: '',
    budget: '',
    fullName: '',
    whatsAppCountryCode: '+91',
    whatsAppNumber: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const step = STEPS[stepIndex];
  const progress = ((stepIndex + 1) / STEPS.length) * 100;
  // Conditional budget tiers based on event type: "Wedding + Engagement" gets custom tiers.
  const budgetOptions = form.eventType === 'Wedding + Engagement'
    ? WEDDING_ENGAGEMENT_BUDGET_OPTIONS
    : form.eventType === 'Other'
      ? OTHER_BUDGET_OPTIONS
      : BUDGET_OPTIONS;

  // Keep a ref in sync so deferred advances (radio auto-next) always see
  // the latest form values instead of a stale closure.
  const formRef = useRef(form);
  useEffect(() => { formRef.current = form; }, [form]);

  // Stateless validation reading LIVE form state (not the ref) so it
  // re-evaluates on every keystroke — the NEXT/SUBMIT button enables the
  // moment a step becomes valid, with no blur/Enter/trailing-space needed.
  const isStepValid = (f: FormState = form): boolean => {
    switch (step) {
      case 'eventType':
        return f.eventType !== '' && (f.eventType !== 'Other' || f.eventOther.trim().length > 0);
      case 'eventDate':
        return f.eventDate.trim().length > 0;
      case 'budget':
        return f.budget !== '';
      case 'fullName':
        return f.fullName.trim().length > 0;
      case 'whatsApp': {
        const digits = f.whatsAppNumber.replace(/\D/g, '');
        const isIndian = f.whatsAppCountryCode === '+91';
        // Allow 10-digit Indian mobile numbers (6-9 start) and 10-15 for others
        if (isIndian) return /^[6-9]\d{9}$/.test(digits);
        return digits.length >= 10 && digits.length <= 15;
      }
      default: {
        // Ensure exhaustive switch checking.
        return step as never;
      }
    }
  };

  const handleEventTypeChange = (value: string) => {
    setForm((f) => ({
      ...f,
      eventType: value,
      // Only relevant while "Other" is selected.
      eventOther: value === 'Other' ? f.eventOther : '',
      // Reset budget when event type changes (except for "Other" where user must specify).
      budget: value === f.eventType ? f.budget : '',
    }));
    // Clear any lingering error when the user updates the event type.
    setError(null);
  };

  const goNext = async () => {
    const currentForm = formRef.current;

    // For the WhatsApp step, validate strictly on button click.
    if (step === 'whatsApp') {
      const cleanNumber = currentForm.whatsAppNumber.replace(/\D/g, '');
      const isIndian = currentForm.whatsAppCountryCode === '+91';
      const isValid = isIndian
        ? /^[6-9]\d{9}$/.test(cleanNumber)
        : cleanNumber.length >= 10 && cleanNumber.length <= 15;

      if (!isValid) {
        setError('Please enter a valid 10-digit mobile number.');
        return;
      }
      // Clear any previous validation error and proceed.
      setError(null);
    }

    if (!isStepValid(currentForm)) return;
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((i) => i + 1);
      return;
    }
    setStatus('submitting');
    setError(null);
    // An "Other" selection is submitted as "Other – <specification>"; the
    // event date fills the existing photographyDays field so the API
    // payload shape is unchanged.
    const eventType = currentForm.eventType === 'Other'
      ? `Other – ${currentForm.eventOther.trim()}`
      : currentForm.eventType;

    // Build the payload - match backend schema exactly.
    const payload = {
      eventType,
      photographyDays: currentForm.eventDate.trim(),
      budget: currentForm.budget,
      fullName: currentForm.fullName.trim(),
      whatsAppCountryCode: currentForm.whatsAppCountryCode,
      whatsAppNumber: currentForm.whatsAppNumber.trim(),
    };

    console.log('[Contact] Submitting payload:', payload);

    try {
      await submitContactForm(payload);
      setStatus('success');

      // Fire Meta Pixel Lead event on successful submission.
      const win = window as Window & { fbq?: (...args: (string | Record<string, unknown>)[]) => void };
      if (win.fbq) {
        win.fbq('track', 'Lead', {
          content_name: 'Contact Form Submission',
          event_type: eventType,
          budget: currentForm.budget,
        });
      }

      // Hand off to WhatsApp with the enquiry pre-filled.
      const message = [
        'New Enquiry from The Pictory',
        '',
        `Name: ${currentForm.fullName.trim()}`,
        `Event: ${eventType}`,
        `Event date: ${currentForm.eventDate.trim()}`,
        `Budget: ${currentForm.budget}`,
        `WhatsApp: ${currentForm.whatsAppCountryCode} ${currentForm.whatsAppNumber.trim()}`,
      ].join('\n');
      try { sessionStorage.setItem('offer-banner', 'pending'); } catch { /* sessionStorage unavailable */ }
      window.location.href = `https://wa.me/916380630219?text=${encodeURIComponent(message)}`;
    } catch (err) {
      // Log the exact error response body so any API validation mismatch
      // (e.g. backend rejecting the payload shape) is visible in console.
      console.error('[Contact] submit failed:', err);
      if (err instanceof ApiError) {
        console.error('[Contact] API error response:', err.status, err.message);
        // Show the specific backend error message if available.
        setError(err.message);
      } else {
        console.error('[Contact] Unknown error:', err);
        setError('Something went wrong, please try again.');
      }
      setStatus('error');
    }
  };

  // Clear the error message whenever the user types or changes a field so
  // the "Something went wrong" banner doesn't persist across steps.
  const clearErrorOnInput = () => setError(null);

  const goBack = () => {
    if (stepIndex > 0) {
      // Reset error and status when navigating between steps to clear persistent error messages.
      setStepIndex((i) => i - 1);
      setError(null);
    }
  };

  if (status === 'success') {
    const message = `New Enquiry\nName: ${form.fullName}\nEvent: ${form.eventType}\nEvent date: ${form.eventDate}\nBudget: ${form.budget}\nWhatsApp: ${form.whatsAppCountryCode} ${form.whatsAppNumber}`;
    const waUrl = `https://wa.me/916380630219?text=${encodeURIComponent(message)}`;
    return (
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-20 text-center">
        <div className="border border-blush-dark bg-blush text-charcoal p-8 mb-6">
          <p className="font-sans font-bold text-2xl mb-2">Thank you</p>
          <p className="text-charcoal-soft">We've received your details. Redirecting to WhatsApp now.</p>
        </div>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] hover:bg-green-700 transition-colors rounded-md"
        >
          Open WhatsApp
        </a>
        <p className="text-xs text-charcoal-soft mt-4">If it doesn't open automatically, click the button above.</p>
        <button
          type="button"
          onClick={() => { window.location.href = waUrl; }}
          className="text-xs text-charcoal-soft underline hover:text-charcoal mt-2"
        >
          Click here if not redirected
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-16 min-h-[70vh] flex flex-col">
      <h1 className="font-sans font-bold text-3xl text-center text-charcoal mb-10">Claim Your Exclusive Offer</h1>
      <div className="h-px w-full bg-charcoal/10 mb-12">
        <div className="h-px bg-charcoal transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex-1">
        {step === 'eventType' && (
          <>
            <RadioStep
              question="Which event do you need photography for?"
              options={EVENT_TYPES}
              value={form.eventType}
              onChange={handleEventTypeChange}
              onSelect={(value) => {
                // "Other" must be specified in the free-text input before
                // the form can advance.
                if (value !== 'Other') setTimeout(goNext, 200);
              }}
            />
            {form.eventType === 'Other' && (
              <div className="mt-6">
                <label htmlFor="event-other" className="block font-sans font-bold text-2xl text-charcoal mb-6">
                  Please specify your event <span className="text-charcoal-soft">*</span>
                </label>
                <input
                  id="event-other"
                  autoFocus
                  value={form.eventOther}
                  onChange={(e) => { setForm({ ...form, eventOther: e.target.value }); clearErrorOnInput(); }}
                  onKeyDown={(e) => e.key === 'Enter' && goNext()}
                  placeholder="Your answer here..."
                  maxLength={90}
                  className="w-full border-b-2 border-charcoal/20 focus:border-charcoal outline-none py-2 text-lg bg-transparent font-sans"
                />
              </div>
            )}
          </>
        )}
        {step === 'eventDate' && (
          <div>
            <h2 className="font-sans font-bold text-2xl text-charcoal mb-6">
              What is your estimated event date or month? <span className="text-charcoal-soft">*</span>
            </h2>
            <input
              autoFocus
              value={form.eventDate}
              onChange={(e) => { setForm({ ...form, eventDate: e.target.value }); clearErrorOnInput(); }}
              onKeyDown={(e) => e.key === 'Enter' && goNext()}
              placeholder="e.g., 14th Nov 2026 or Dec 2026"
              maxLength={50}
              className="w-full border-b-2 border-charcoal/20 focus:border-charcoal outline-none py-2 text-lg bg-transparent font-sans"
            />
            <p className="mt-3 text-sm text-charcoal-soft font-sans">
              (Exact date not finalized? Just mention the month/year)
            </p>
          </div>
        )}
        {step === 'budget' && (
          <RadioStep
            question="What is your photography budget?"
            options={budgetOptions}
            value={form.budget}
            onChange={(v) => { setForm({ ...form, budget: v }); clearErrorOnInput(); }}
            onSelect={() => setTimeout(goNext, 200)}
          />
        )}
        {step === 'fullName' && (
          <div>
            <h2 className="font-sans font-bold text-2xl text-charcoal mb-6">
              Your Full Name <span className="text-charcoal-soft">*</span>
            </h2>
            <input
              autoFocus
              value={form.fullName}
              onChange={(e) => { setForm({ ...form, fullName: e.target.value }); clearErrorOnInput(); }}
              onKeyDown={(e) => e.key === 'Enter' && goNext()}
              placeholder="Your answer here..."
              maxLength={150}
              className="w-full border-b-2 border-charcoal/20 focus:border-charcoal outline-none py-2 text-lg bg-transparent font-sans"
            />
          </div>
        )}
        {step === 'whatsApp' && (
          <div>
            <h2 className="font-sans font-bold text-2xl text-charcoal mb-6">
              Your WhatsApp number <span className="text-charcoal-soft">*</span>
            </h2>
            <div className="flex gap-2 items-end">
              <select
                value={form.whatsAppCountryCode}
                onChange={(e) => { setForm({ ...form, whatsAppCountryCode: e.target.value }); clearErrorOnInput(); }}
                className="border-b-2 border-charcoal/20 outline-none py-2 text-lg bg-transparent font-sans"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              <input
                autoFocus
                inputMode="numeric"
                value={form.whatsAppNumber}
                onChange={(e) => { setForm({ ...form, whatsAppNumber: e.target.value }); clearErrorOnInput(); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    goNext();
                  }
                }}
                placeholder="081234 56789"
                maxLength={15}
                className="flex-1 border-b-2 border-charcoal/20 focus:border-charcoal outline-none py-2 text-lg bg-transparent font-sans"
              />
            </div>
            {(() => {
              const cleanNumber = form.whatsAppNumber.replace(/\D/g, '');
              const isIndian = form.whatsAppCountryCode === '+91';
              const isValid = isIndian
                ? /^[6-9]\d{9}$/.test(cleanNumber)
                : cleanNumber.length >= 10 && cleanNumber.length <= 15;

              if (isValid) {
                return <p className="mt-3 text-sm text-green-700 font-sans">Looks good ✓</p>;
              }
              return null;
            })()}
          </div>
        )}

        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
      </div>

      <div className="flex gap-3 mt-10">
        {stepIndex > 0 && (
          <button
            type="button"
            onClick={goBack}
            className="border border-charcoal/20 text-charcoal px-5 py-3 text-xs uppercase tracking-[0.15em] hover:bg-charcoal/5"
            aria-label="Back"
          >
            ←
          </button>
        )}
        <button
          type="button"
          onClick={goNext}
          disabled={status === 'submitting'}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-charcoal text-white py-3 text-xs font-bold uppercase tracking-[0.15em] disabled:opacity-40 hover:bg-charcoal/90 transition-colors"
        >
          {status === 'submitting' ? 'Submitting...' : stepIndex === STEPS.length - 1 ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  );
}

function RadioStep({
  question,
  options,
  value,
  onChange,
  onSelect,
}: {
  question: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
}) {
  return (
    <div>
      <h2 className="font-sans font-bold text-2xl text-charcoal mb-6">
        {question} <span className="text-charcoal-soft">*</span>
      </h2>
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              onChange(option);
              onSelect(option);
            }}
            className={`w-full text-left border px-4 py-3 text-base font-sans font-semibold transition-colors ${
              value === option
                ? 'border-charcoal bg-blush text-charcoal'
                : 'border-charcoal/20 bg-cream text-charcoal-soft hover:border-charcoal/40'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
