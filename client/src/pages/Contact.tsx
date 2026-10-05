import { useState } from 'react';
import { submitContactForm } from '../api/contact';
import { ApiError } from '../api/client';

const EVENT_TYPES = ['Wedding', 'Engagement', 'Wedding + Engagement', 'Other'];
const DAYS_OPTIONS = ['1 Day', '2 Days', '3 Days', '4+ Days'];
const BUDGET_OPTIONS = ['₹50,000 – ₹1 Lakh', '₹1 Lakh – ₹2 Lakhs', '₹2 Lakhs – ₹3 Lakhs', '₹3 Lakhs & Above'];
const COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳', label: 'IN' },
  { code: '+1', flag: '🇺🇸', label: 'US' },
  { code: '+44', flag: '🇬🇧', label: 'UK' },
  { code: '+971', flag: '🇦🇪', label: 'AE' },
];

interface FormState {
  eventType: string;
  photographyDays: string;
  budget: string;
  fullName: string;
  whatsAppCountryCode: string;
  whatsAppNumber: string;
}

const STEPS = ['eventType', 'photographyDays', 'budget', 'fullName', 'whatsApp'] as const;

export default function Contact() {
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<FormState>({
    eventType: '',
    photographyDays: '',
    budget: '',
    fullName: '',
    whatsAppCountryCode: '+91',
    whatsAppNumber: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const step = STEPS[stepIndex];
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const isStepValid = (): boolean => {
    switch (step) {
      case 'eventType':
        return form.eventType !== '';
      case 'photographyDays':
        return form.photographyDays !== '';
      case 'budget':
        return form.budget !== '';
      case 'fullName':
        return form.fullName.trim().length > 0;
      case 'whatsApp': {
        const digits = form.whatsAppNumber.trim().replace(/\D/g, '');
        const isIndian = form.whatsAppCountryCode === '+91';
        // Valid mobile: exactly 10 digits for India (9XXXXXXXXX), 10-15 for others
        if (isIndian) return /^[6-9]\d{9}$/.test(digits);
        return digits.length >= 10 && digits.length <= 15;
      }
    }
    return false;
  };

  const goNext = async () => {
    if (!isStepValid()) return;
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((i) => i + 1);
      return;
    }
    setStatus('submitting');
    setError(null);
    try {
      await submitContactForm(form);
      setStatus('success');
      // Hand off to WhatsApp with the enquiry pre-filled.
      const message = [
        'New Enquiry from The Pictory',
        '',
        `Name: ${form.fullName.trim()}`,
        `Event: ${form.eventType}`,
        `Days of photography: ${form.photographyDays}`,
        `Budget: ${form.budget}`,
        `WhatsApp: ${form.whatsAppCountryCode} ${form.whatsAppNumber.trim()}`,
      ].join('\n');
      window.location.href = `https://wa.me/916380630219?text=${encodeURIComponent(message)}`;
    } catch (err) {
      setStatus('error');
      setError(err instanceof ApiError ? err.message : 'Something went wrong, please try again.');
    }
  };

  const goBack = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  if (status === 'success') {
    const message = `New Enquiry\nName: ${form.fullName}\nEvent: ${form.eventType}\nDays: ${form.photographyDays}\nBudget: ${form.budget}\nWhatsApp: ${form.whatsAppCountryCode} ${form.whatsAppNumber}`;
    const waUrl = `https://wa.me/916380630219?text=${encodeURIComponent(message)}`;
    return (
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-20 text-center">
        <div className="border border-blush-dark bg-blush text-charcoal p-8 mb-6">
          <p className="font-serif text-2xl mb-2">Thank you</p>
          <p className="text-charcoal-soft">We've received your details. Redirecting to WhatsApp now.</p>
        </div>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 text-xs uppercase tracking-[0.15em] hover:bg-green-700 transition-colors rounded-md"
        >
          Open WhatsApp <span aria-hidden>✳</span>
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
      <h1 className="font-serif text-3xl text-center text-charcoal mb-10">Let's Begin Your Journey</h1>
      <div className="h-px w-full bg-charcoal/10 mb-12">
        <div className="h-px bg-charcoal transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex-1">
        {step === 'eventType' && (
          <RadioStep
            question="Which event do you need photography for?"
            options={EVENT_TYPES}
            value={form.eventType}
            onChange={(v) => setForm({ ...form, eventType: v })}
          />
        )}
        {step === 'photographyDays' && (
          <RadioStep
            question="How many days of photography do you need?"
            options={DAYS_OPTIONS}
            value={form.photographyDays}
            onChange={(v) => setForm({ ...form, photographyDays: v })}
          />
        )}
        {step === 'budget' && (
          <RadioStep
            question="What is your photography budget?"
            options={BUDGET_OPTIONS}
            value={form.budget}
            onChange={(v) => setForm({ ...form, budget: v })}
          />
        )}
        {step === 'fullName' && (
          <div>
            <h2 className="font-serif text-2xl text-charcoal mb-6">
              Your Full Name <span className="text-charcoal-soft">*</span>
            </h2>
            <input
              autoFocus
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && goNext()}
              placeholder="Your answer here..."
              maxLength={150}
              className="w-full border-b-2 border-charcoal/20 focus:border-charcoal outline-none py-2 text-lg bg-transparent"
            />
          </div>
        )}
        {step === 'whatsApp' && (
          <div>
            <h2 className="font-serif text-2xl text-charcoal mb-6">
              Your WhatsApp number <span className="text-charcoal-soft">*</span>
            </h2>
            <div className="flex gap-2 items-end">
              <select
                value={form.whatsAppCountryCode}
                onChange={(e) => setForm({ ...form, whatsAppCountryCode: e.target.value })}
                className="border-b-2 border-charcoal/20 outline-none py-2 text-lg bg-transparent"
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
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '');
                  setForm({ ...form, whatsAppNumber: digits });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const digits = form.whatsAppNumber.trim();
                    const isIndian = form.whatsAppCountryCode === '+91';
                    const valid = isIndian ? /^[6-9]\d{9}$/.test(digits) : (digits.length >= 10 && digits.length <= 15);
                    if (!valid) {
                      setError('Please enter a valid mobile number');
                      return;
                    }
                    goNext();
                  }
                }}
                placeholder="081234 56789"
                maxLength={15}
                className="flex-1 border-b-2 border-charcoal/20 focus:border-charcoal outline-none py-2 text-lg bg-transparent"
              />
            </div>
            {!isStepValid() && form.whatsAppNumber.length > 0 && (
              <p className="mt-3 text-sm text-charcoal-soft">
                {form.whatsAppCountryCode === '+91'
                  ? 'Enter a valid 10-digit Indian mobile number (starts with 6-9)'
                  : 'Enter a valid mobile number (10-15 digits)'}
              </p>
            )}
            {isStepValid() && form.whatsAppNumber.length > 0 && (
              <p className="mt-3 text-sm text-green-700">Looks good ✓</p>
            )}
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
          disabled={!isStepValid() || status === 'submitting'}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-charcoal text-white py-3 text-xs uppercase tracking-[0.15em] disabled:opacity-40 hover:bg-charcoal/90 transition-colors"
        >
          {status === 'submitting' ? 'Submitting...' : stepIndex === STEPS.length - 1 ? 'Submit' : 'Next'} <span aria-hidden>✳</span>
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
}: {
  question: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <h2 className="font-serif text-2xl text-charcoal mb-6">
        {question} <span className="text-charcoal-soft">*</span>
      </h2>
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`w-full text-left border px-4 py-3 text-base transition-colors ${
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
