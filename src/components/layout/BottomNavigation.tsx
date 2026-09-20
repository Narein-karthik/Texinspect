import { motion } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../utils/classNames';
import type { NavigationItem } from './navigation';

export function BottomNavigation({ navItems }: { navItems: NavigationItem[] }) {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="
          fixed bottom-0 left-1/2 -translate-x-1/2
          w-full max-w-xl
          bg-gray-900/95
          backdrop-blur-xl
          border-t border-white/10
          rounded-t-3xl
          px-6 py-4
          flex justify-around items-center
          z-50
        "
    >

      {navItems.map((item) => (

        <motion.button
          key={item.path}
          onClick={() => navigate(item.path)}
          whileTap={{ scale: 0.88 }}
          className={cn(
            "flex flex-col items-center gap-1 transition-all touch-target",
            location.pathname === item.path
              ? "text-blue-400"
              : "text-white/40"
          )}
        >
          <item.icon
            size={26}
            strokeWidth={location.pathname === item.path ? 3 : 2}
          />

          <span className="text-[9px] font-black uppercase tracking-tighter">
            {item.label}
          </span>

        </motion.button>

      ))}

    </motion.nav>
  );
}
