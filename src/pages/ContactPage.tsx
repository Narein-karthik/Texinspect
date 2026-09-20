import { ArrowRight, CheckCircle2 } from 'lucide-react';
import React from 'react';
import { Brand } from '../features/public-site/Brand';
import { submitContactInquiry } from '../services/api/contactService';

export const ContactPage = ({ onHome, onSignIn }: { onHome: () => void; onSignIn: () => void }) => {
  const [submitted, setSubmitted] = React.useState(false);
  const [submissionError, setSubmissionError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formValues, setFormValues] = React.useState({
    name: '',
    email: '',
    company: '',
    improvement: '',
    website: '',
  });

  const updateField = (field: keyof typeof formValues, value: string) => {
    setFormValues((currentValues) => ({ ...currentValues, [field]: value }));
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const name = formValues.name.trim();
    const email = formValues.email.trim().toLowerCase();
    const company = formValues.company.trim();
    const improvement = formValues.improvement.trim();
    setSubmissionError('');

    if (!name || !email || !company || !improvement) {
      setSubmissionError('Please complete all fields before requesting a walkthrough.');
      return;
    }

    if (!isValidEmail(email)) {
      setSubmissionError('Please enter a valid work email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitContactInquiry({ name, email, company, improvement, website: formValues.website });

      setFormValues({ name: '', email: '', company: '', improvement: '', website: '' });
      setSubmitted(true);
    } catch (error) {
      console.error('Unable to submit contact request', error);
      setSubmissionError('We could not send your inquiry right now. Please try again shortly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7fafc] text-[#0b1930]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Brand onClick={onHome} />
          <div className="flex items-center gap-3">
            <button type="button" onClick={onHome} className="px-3 py-2 text-sm font-bold text-slate-600 hover:text-[#0b1930]">Home</button>
            <button type="button" onClick={onSignIn} className="rounded-lg bg-[#0b1930] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#162b4e]">Sign in</button>
          </div>
        </div>
      </header>
      <main className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.85fr_1.15fr]">
        <section>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1765cb]">Contact us</p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Let’s make quality data easier to use.</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-slate-600">Tell us about your inspection process, the size of your team, and where reporting currently slows you down. We’ll use that context to shape the right walkthrough.</p>
          <div className="mt-10 space-y-4 text-sm text-slate-600">
            <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={18} /><span>See the inspection workflow from roll setup to downloadable report.</span></div>
            <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={18} /><span>Discuss admin oversight, inspector access, and reporting needs.</span></div>
          </div>
        </section>
        <section className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {submitted ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="mx-auto text-emerald-600" size={42} />
              <h2 className="mt-5 text-2xl font-black" aria-live="polite">Thanks! We&apos;ve received your request.</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">Your message is ready for the TEXINSPECT team. We’ll be in touch with the next steps.</p>
              <button type="button" onClick={onHome} className="mt-7 rounded-lg bg-[#0b1930] px-5 py-3 text-sm font-bold text-white">Back to home</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div><h2 className="text-xl font-black">Request a walkthrough</h2><p className="mt-1 text-sm text-slate-500">We’ll start with your current process.</p></div>
              <label className="block text-sm font-bold text-slate-700">Name<input required name="name" value={formValues.name} onChange={(event) => updateField('name', event.target.value)} autoComplete="name" className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
              <label className="block text-sm font-bold text-slate-700">Work email<input required type="email" name="email" value={formValues.email} onChange={(event) => updateField('email', event.target.value)} autoComplete="email" className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
              <label className="block text-sm font-bold text-slate-700">Company<input required name="company" value={formValues.company} onChange={(event) => updateField('company', event.target.value)} autoComplete="organization" className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
              <label className="block text-sm font-bold text-slate-700">What would you like TexInspect to help improve?<textarea required name="improvement" value={formValues.improvement} onChange={(event) => updateField('improvement', event.target.value)} rows={4} className="mt-2 w-full resize-y rounded-lg border border-slate-200 p-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
              <label className="absolute left-[-10000px] h-px w-px overflow-hidden" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" name="website" value={formValues.website} onChange={(event) => updateField('website', event.target.value)} /></label>
              <div aria-live="assertive">{submissionError && <p role="alert" className="text-sm font-medium text-red-600">{submissionError}</p>}</div>
              <button type="submit" disabled={isSubmitting} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#2c7be5] px-5 text-sm font-bold text-white transition-colors hover:bg-[#1765cb] disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Sending...' : <>Request walkthrough <ArrowRight size={17} /></>}</button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
};

