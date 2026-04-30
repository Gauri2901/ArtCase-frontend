import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/useAuth';
import type { AdminCommission, AdminOrder } from '@/types/admin';

type NotificationPayload = {
  unreadCount: number;
  orders: AdminOrder[];
  commissions: AdminCommission[];
};

const NotificationBell = () => {
  const { user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<NotificationPayload>({ unreadCount: 0, orders: [], commissions: [] });

  useEffect(() => {
    if (!user?.isAdmin || !user.token) return;

    let mounted = true;

    const load = async () => {
      if (document.visibilityState !== 'visible') {
        return;
      }

      try {
        const payload = await apiRequest<NotificationPayload>('/orders/unread', {
          token: user.token,
        });

        if (mounted) {
          setData(payload);
        }
      } catch (error) {
        console.error(error);
      }
    };

    load();
    const interval = window.setInterval(load, 60000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [user?.isAdmin, user?.token]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (dropdownRef.current && target && !dropdownRef.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [open]);

  if (!user?.isAdmin) return null;

  const markAllRead = async () => {
    setLoading(true);
    try {
      await apiRequest<{ message: string }>('/orders/mark-read', {
        method: 'PATCH',
        token: user.token,
      });
      setData({ unreadCount: 0, orders: [], commissions: [] });
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={dropdownRef} className="relative pointer-events-auto">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          'rounded-full transition-colors hover:bg-white/20',
          (open || data.unreadCount > 0) && 'bg-primary/10 text-primary hover:bg-primary/15'
        )}
        onClick={() => setOpen((value) => !value)}
      >
        <Bell className="h-5 w-5" />
        {data.unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
            {data.unreadCount > 99 ? '99+' : data.unreadCount}
          </span>
        ) : null}
        <span className="sr-only">Toggle admin notifications</span>
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              "pointer-events-auto absolute z-50 rounded-[1.75rem] border border-white/60 bg-white/90 p-4 shadow-2xl backdrop-blur-2xl",
              "top-14 sm:top-12 right-0 sm:right-0",
              "w-[min(24rem,calc(100vw-3rem))]",
              "max-sm:fixed max-sm:inset-x-4 max-sm:mx-auto max-sm:top-24 max-sm:w-auto max-sm:max-w-md"
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Notifications</p>
                <h3 className="mt-1 font-serif text-2xl">Admin updates</h3>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={(event: ReactMouseEvent<HTMLButtonElement>) => {
                  event.preventDefault();
                  event.stopPropagation();
                  void markAllRead();
                }}
                disabled={loading || data.unreadCount === 0}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
                Mark read
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {data.orders.length === 0 && data.commissions.length === 0 ? (
                <div className="rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
                  No unread notifications right now.
                </div>
              ) : (
                <>
                  {data.orders.map((order) => (
                    <div
                      key={order._id}
                      className={cn(
                        'rounded-2xl border border-border/70 bg-background/80 p-4 text-left shadow-sm',
                        order.unread && 'border-primary/30'
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Order</p>
                          <p className="mt-1 font-semibold">{order.orderId}</p>
                          <p className="text-sm text-muted-foreground">{order.user.name}</p>
                        </div>
                        <p className="text-sm font-medium">
                          {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: order.payment.currency || 'INR',
                          }).format(order.payment.amount)}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {order.artworks.map((artwork) => artwork.title).join(', ') || order.commissionDetails?.artworkType || 'Order received'}
                      </p>
                    </div>
                  ))}

                  {data.commissions.map((commission) => (
                    <div
                      key={commission._id}
                      className={cn(
                        'rounded-2xl border border-border/70 bg-background/80 p-4 text-left shadow-sm',
                        commission.unread && 'border-primary/30'
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Commission</p>
                          <p className="mt-1 font-semibold">{commission.commissionId}</p>
                          <p className="text-sm text-muted-foreground">{commission.customer.name}</p>
                        </div>
                        <p className="text-sm font-medium">
                          {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: commission.currency || 'INR',
                          }).format(commission.quotedPrice ?? commission.budget)}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {commission.artworkType}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
