import { FileText, Home, PlusSquare, type LucideIcon } from 'lucide-react';
import type { UserRole } from '../../types';

export interface NavigationItem { icon: LucideIcon; label: string; path: string; }

export function getNavigationItems(role: UserRole): NavigationItem[] {
  const navItems = role === 'ADMIN'
    ? [
      { icon: Home, label: 'Admin', path: '/' },
      { icon: FileText, label: 'Reports', path: '/reports' },
    ]
    : [
      { icon: Home, label: 'Dashboard', path: '/' },
      { icon: PlusSquare, label: 'New', path: '/new' },
      { icon: FileText, label: 'Reports', path: '/reports' },
    ];
  return navItems;
}
