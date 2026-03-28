import { cn } from '@/lib/utils';
import { Bell, BrushCleaning, ClipboardList, ImagePlus, ScrollText } from 'lucide-react';

type AdminSection = 'artworks' | 'orders' | 'commissions' | 'logs';

type AdminSidebarProps = {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  unreadOrders: number;
  unreadCommissions: number;
};

const items = [
  { id: 'artworks', label: 'Artworks', icon: ImagePlus },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'commissions', label: 'Commissions', icon: ScrollText },
  { id: 'logs', label: 'Logs', icon: BrushCleaning },
] as const;

const AdminSidebar = ({ activeSection, onSectionChange, unreadOrders, unreadCommissions }: AdminSidebarProps) => {
  return (
    <aside className="rounded-[2rem] border border-white/50 bg-white/70 p-4 shadow-xl backdrop-blur-2xl">
      <div className="mb-6 hidden lg:block">
        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Studio Admin</p>
        <h2 className="mt-3 text-3xl font-serif">Control Room</h2>
      </div>

      <div className="grid grid-cols-4 gap-2 lg:grid-cols-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const badgeCount = item.id === 'orders' ? unreadOrders : item.id === 'commissions' ? unreadCommissions : 0;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSectionChange(item.id)}
              className={cn(
                'flex items-center justify-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all lg:justify-between',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-background/70 text-foreground hover:bg-background'
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                <span className="hidden lg:inline">{item.label}</span>
              </span>
              {badgeCount > 0 ? (
                <span
                  className={cn(
                    'inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold',
                    isActive ? 'bg-white/20 text-white' : 'bg-primary text-primary-foreground'
                  )}
                >
                  {badgeCount}
                </span>
              ) : item.id === 'logs' ? (
                <Bell className="hidden h-4 w-4 lg:block" />
              ) : null}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default AdminSidebar;
