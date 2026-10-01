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
      case 'whatsApp':
        return /^\d{6,15}$/.test(form.whatsAppNumber.trim());
    }
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
    } catch (err) {
      setStatus('error');
      setError(err instanceof ApiError ? err.message : 'Something went wrong, please try again.');
    }
  };

  const goBack = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  if (status === 'success') {
    return (
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-20 text-center">
        <div className="rounded-lg bg-green-50 border border-green-200 text-green-800 p-6">
          Thanks! We've received your details and will reach out on WhatsApp shortly.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-12 min-h-[70vh] flex flex-col">
      <div className="h-1 w-full bg-neutral-100 rounded-full mb-12">
        <div className="h-1 bg-neutral-900 rounded-full transition-all" style={{ width: `${progress}%` }} />
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
            <h2 className="text-2xl font-semibold mb-6">
              Your Full Name <span className="text-neutral-400">*</span>
            </h2>
            <input
              autoFocus
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && goNext()}
              placeholder="Your answer here..."
              maxLength={150}
              className="w-full border-b-2 border-neutral-300 focus:border-neutral-900 outline-none py-2 text-lg"
            />
          </div>
        )}
        {step === 'whatsApp' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">
              Your WhatsApp number <span className="text-neutral-400">*</span>
            </h2>
            <div className="flex gap-2 items-end">
              <select
                value={form.whatsAppCountryCode}
                onChange={(e) => setForm({ ...form, whatsAppCountryCode: e.target.value })}
                className="border-b-2 border-neutral-300 outline-none py-2 text-lg bg-transparent"
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
                onChange={(e) => setForm({ ...form, whatsAppNumber: e.target.value.replace(/\D/g, '') })}
                onKeyDown={(e) => e.key === 'Enter' && goNext()}
                placeholder="081234 56789"
                maxLength={15}
                className="flex-1 border-b-2 border-neutral-300 focus:border-neutral-900 outline-none py-2 text-lg"
              />
            </div>
          </div>
        )}

        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
      </div>

      <div className="flex gap-3 mt-10">
        {stepIndex > 0 && (
          <button
            type="button"
            onClick={goBack}
            className="rounded-md border border-neutral-300 px-5 py-3 text-sm font-medium"
            aria-label="Back"
          >
            ←
          </button>
        )}
        <button
          type="button"
          onClick={goNext}
          disabled={!isStepValid() || status === 'submitting'}
          className="flex-1 rounded-md bg-neutral-900 text-white py-3 text-sm font-semibold disabled:opacity-40"
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
}: {
  question: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">
        {question} <span className="text-neutral-400">*</span>
      </h2>
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`w-full text-left rounded-lg border px-4 py-3 text-base font-medium transition-colors ${
              value === option
                ? 'border-neutral-900 bg-neutral-100'
                : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
