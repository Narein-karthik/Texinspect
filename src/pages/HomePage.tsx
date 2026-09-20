import {
  ArrowRight,
  BarChart3,
  ClipboardCheck,
  FileDown,
  ShieldCheck,
  Smartphone,
  Sparkles
} from 'lucide-react';
import heroImage from '../assets/texinspect-hero.png';
import { Brand } from '../features/public-site/Brand';
import { PublicHeader } from '../features/public-site/PublicHeader';

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

export const HomePage = ({ onContact, onSignIn }: { onContact: () => void; onSignIn: () => void }) => (
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

