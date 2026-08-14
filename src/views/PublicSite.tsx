import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  FileDown,
  Menu,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X,
} from 'lucide-react';
import heroImage from '../assets/texinspect-hero.png';
import { submitContactRequest } from '../services/contactService';

const Brand = ({ onClick }: { onClick?: () => void }) => (
  <button
    type="button"
    onClick={onClick || (() => window.scrollTo({ top: 0, behavior: 'smooth' }))}
    className="flex items-center gap-2 text-left"
    aria-label="TEXINSPECT home"
  >
    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b1930] text-sm font-black text-white">TX</span>
    <span className="text-lg font-black tracking-[0.02em] text-[#0b1930]">TEXINSPECT</span>
  </button>
);

const productBenefits = [
  {
    icon: Smartphone,
    title: 'Capture at the source',
    description: 'Inspect rolls on the floor, record defects in seconds, and add photo evidence only when it matters.',
  },
  {
    icon: ClipboardCheck,
    title: 'Work from one standard',
    description: 'Keep scoring, roll measurements, defect types, and report details consistent across every inspector.',
  },
  {
    icon: BarChart3,
    title: 'See the whole operation',
    description: 'Give managers one clear view of inspectors, customers, styles, and completed reports.',
  },
  {
    icon: FileDown,
    title: 'Share evidence quickly',
    description: 'Turn inspection activity into a professional report that is ready to download and send.',
  },
];

const steps = [
  ['01', 'Set up the inspection', 'Enter customer, order, fabric, and roll details before the roll reaches the next stage.'],
  ['02', 'Record what you find', 'Log defect type, severity, position, notes, and photo evidence from the same focused workspace.'],
  ['03', 'Act from the report', 'Review pass or fail results, share the report, and let admin teams monitor work across the floor.'],
];

const PublicHeader = ({ onContact, onSignIn }: { onContact: () => void; onSignIn: () => void }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Brand />
        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
          <button type="button" onClick={() => scrollTo('product')} className="hover:text-[#0b1930]">Product</button>
          <button type="button" onClick={() => scrollTo('workflow')} className="hover:text-[#0b1930]">How it works</button>
          <button type="button" onClick={onContact} className="hover:text-[#0b1930]">Contact</button>
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <button type="button" onClick={onSignIn} className="px-3 py-2 text-sm font-bold text-[#0b1930] hover:text-blue-700">Sign in</button>
          <button type="button" onClick={onContact} className="rounded-lg bg-[#0b1930] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#162b4e]">Talk to us</button>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#0b1930] md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {menuOpen && (
        <div className="mx-5 rounded-lg border border-slate-200 bg-white p-2 shadow-lg md:hidden">
          <button type="button" onClick={() => scrollTo('product')} className="w-full rounded-md px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">Product</button>
          <button type="button" onClick={() => scrollTo('workflow')} className="w-full rounded-md px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">How it works</button>
          <button type="button" onClick={onContact} className="w-full rounded-md px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">Contact us</button>
          <button type="button" onClick={onSignIn} className="w-full rounded-md bg-[#0b1930] px-3 py-3 text-left text-sm font-bold text-white">Sign in</button>
        </div>
      )}
    </header>
  );
};

const HomePage = ({ onContact, onSignIn }: { onContact: () => void; onSignIn: () => void }) => (
  <div className="min-h-screen bg-[#f7fafc] text-[#0b1930] selection:bg-blue-100">
    <PublicHeader onContact={onContact} onSignIn={onSignIn} />

    <main>
      <section className="relative min-h-[720px] overflow-hidden bg-[#071426] sm:min-h-[760px]">
        <img src={heroImage} alt="Textile inspector examining fabric on an inspection machine" className="absolute inset-0 h-full w-full object-cover object-[62%_center]" />
        <div className="absolute inset-0 bg-[#071426]/70" />
        <div className="relative mx-auto flex min-h-[720px] max-w-7xl items-end px-5 pb-16 pt-36 sm:min-h-[760px] sm:px-8 sm:pb-24">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/90">
              <Sparkles size={14} className="text-[#6db4ff]" />
              Textile quality, in real time
            </div>
            <h1 className="max-w-xl text-4xl font-black leading-[1.08] tracking-normal text-white sm:text-6xl">
              Make every roll inspection count.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-200 sm:text-lg">
              TEXINSPECT brings floor inspections, photo evidence, four-point scoring, and manager visibility into one practical system.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={onContact} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#2c7be5] px-5 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition-colors hover:bg-[#1765cb]">
                Request a walkthrough <ArrowRight size={17} />
              </button>
              <button type="button" onClick={onSignIn} className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/30 bg-white/10 px-5 text-sm font-bold text-white transition-colors hover:bg-white/20">
                Open workspace
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            ['Less rework', 'Spot defects while there is still time to respond.'],
            ['Clear accountability', 'Know what each inspector has completed.'],
            ['Faster reporting', 'Move from floor finding to shareable report.'],
          ].map(([title, description]) => (
            <div key={title} className="px-5 py-6 sm:px-8 sm:py-8">
              <p className="text-base font-black text-[#0b1930]">{title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="product" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#2c7be5]">Built for the floor</p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-[#0b1930] sm:text-4xl">A calmer, more reliable quality process.</h2>
            <p className="mt-5 max-w-md text-base leading-7 text-slate-600">The right information should be available where the work happens, then stay useful long after the roll leaves the inspection table.</p>
          </div>
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
            {productBenefits.map(({ icon: Icon, title, description }) => (
              <div key={title}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-[#1765cb]"><Icon size={20} /></div>
                <h3 className="mt-4 text-base font-black text-[#0b1930]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="bg-[#e9f3ff] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-xl">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1765cb]">From inspection to decision</p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-[#0b1930] sm:text-4xl">Quality information that keeps moving.</h2>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {steps.map(([number, title, description]) => (
              <article key={number} className="border-t-2 border-[#2c7be5] pt-5">
                <p className="font-mono text-sm font-bold text-[#1765cb]">{number}</p>
                <h3 className="mt-5 text-xl font-black text-[#0b1930]">{title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0b1930] py-20 text-white sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-400 text-[#0b1930]"><ShieldCheck size={22} /></div>
            <h2 className="mt-6 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">Give your quality team one trusted record of the work.</h2>
          </div>
          <div className="lg:justify-self-end">
            <button type="button" onClick={onContact} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-[#0b1930] transition-colors hover:bg-slate-100">
              Talk to TEXINSPECT <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>
    </main>

    <footer className="bg-white py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Brand />
        <div className="flex items-center gap-5 text-sm font-semibold text-slate-500">
          <button type="button" onClick={onContact} className="hover:text-[#0b1930]">Contact us</button>
          <button type="button" onClick={onSignIn} className="hover:text-[#0b1930]">Sign in</button>
        </div>
      </div>
    </footer>
  </div>
);

const ContactPage = ({ onHome, onSignIn }: { onHome: () => void; onSignIn: () => void }) => {
  const [submitted, setSubmitted] = React.useState(false);
  const [submissionError, setSubmissionError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmissionError('');
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      await submitContactRequest({
        name: String(formData.get('name') || '').trim(),
        email: String(formData.get('email') || '').trim(),
        company: String(formData.get('company') || '').trim(),
        message: String(formData.get('message') || '').trim(),
      });
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
              <h2 className="mt-5 text-2xl font-black">Thank you for your interest.</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">Your message is ready for the TEXINSPECT team. We’ll be in touch with the next steps.</p>
              <button type="button" onClick={onHome} className="mt-7 rounded-lg bg-[#0b1930] px-5 py-3 text-sm font-bold text-white">Back to home</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div><h2 className="text-xl font-black">Request a walkthrough</h2><p className="mt-1 text-sm text-slate-500">We’ll start with your current process.</p></div>
              <label className="block text-sm font-bold text-slate-700">Name<input required name="name" autoComplete="name" className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
              <label className="block text-sm font-bold text-slate-700">Work email<input required type="email" name="email" autoComplete="email" className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
              <label className="block text-sm font-bold text-slate-700">Company<input required name="company" autoComplete="organization" className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
              <label className="block text-sm font-bold text-slate-700">What would you like to improve?<textarea required name="message" rows={4} className="mt-2 w-full resize-y rounded-lg border border-slate-200 p-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
              {submissionError && <p role="alert" className="text-sm font-medium text-red-600">{submissionError}</p>}
              <button type="submit" disabled={isSubmitting} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#2c7be5] px-5 text-sm font-bold text-white transition-colors hover:bg-[#1765cb] disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Sending inquiry...' : <>Send inquiry <ArrowRight size={17} /></>}</button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
};

export const PublicSite = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const goHome = () => navigate('/');
  const goContact = () => navigate('/contact');
  const goSignIn = () => navigate('/login');

  return location.pathname === '/contact'
    ? <ContactPage onHome={goHome} onSignIn={goSignIn} />
    : <HomePage onContact={goContact} onSignIn={goSignIn} />;
};
