
export const Brand = ({ onClick, light = false }: { onClick?: () => void; light?: boolean }) => (
  <button
    type="button"
    onClick={onClick || (() => window.scrollTo({ top: 0, behavior: 'smooth' }))}
    className="flex items-center gap-2 text-left"
    aria-label="TEXINSPECT home"
  >
    <span className={light ? 'flex h-9 w-9 items-center justify-center rounded-lg border border-white/25 bg-white/15 text-sm font-black text-white' : 'flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b1930] text-sm font-black text-white'}>TX</span>
    <span className={light ? 'text-lg font-black tracking-[0.02em] text-white' : 'text-lg font-black tracking-[0.02em] text-[#0b1930]'}>TEXINSPECT</span>
  </button>
);

