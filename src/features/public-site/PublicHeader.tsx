import { Menu, X } from 'lucide-react';
import React from 'react';
import { Brand } from './Brand';

export const PublicHeader = ({ onContact, onSignIn }: { onContact: () => void; onSignIn: () => void }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="absolute inset-x-0 top-0 z-20 border-b border-white/10 bg-[#071426]/35 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Brand light />
        <nav className="hidden items-center gap-7 text-sm font-semibold text-white/70 md:flex">
          <button type="button" onClick={() => scrollTo('product')} className="transition-colors hover:text-white">Product</button>
          <button type="button" onClick={() => scrollTo('workflow')} className="transition-colors hover:text-white">How it works</button>
          <button type="button" onClick={onContact} className="transition-colors hover:text-white">Contact</button>
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <button type="button" onClick={onSignIn} className="px-3 py-2 text-sm font-bold text-white/85 transition-colors hover:text-white">Sign in</button>
          <button type="button" onClick={onContact} className="rounded-lg bg-[#3b91f6] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition-colors hover:bg-[#2c7be5]">Talk to us</button>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white md:hidden"
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

