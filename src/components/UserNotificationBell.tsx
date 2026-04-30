import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/useAuth';
import type { UserNotification } from '@/types/user';

type NotificationPayload = {
  unreadCount: number;
  notifications: UserNotification[];
};

const UserNotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<NotificationPayload>({ unreadCount: 0, notifications: [] });

  useEffect(() => {
    if (!user || user.isAdmin || !user.token) return;

    let mounted = true;

    const load = async () => {
      if (document.visibilityState !== 'visible') {
        return;
      }

      try {
        const payload = await apiRequest<NotificationPayload>('/notifications/mine', {
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

  if (!user || user.isAdmin) return null;

  const markAllRead = async () => {
    setLoading(true);
    try {
      await apiRequest('/notifications/mine/read-all', {
        method: 'PATCH',
        token: user.token,
      });
      setData({
        unreadCount: 0,
        notifications: [],
      });
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: UserNotification) => {
    try {
      if (!notification.read) {
        await apiRequest(`/notifications/mine/${notification._id}/read`, {
          method: 'PATCH',
          token: user.token,
        });

        setData((current) => ({
          unreadCount: Math.max(0, current.unreadCount - 1),
          notifications: current.notifications.map((entry) =>
            entry._id === notification._id ? { ...entry, read: true } : entry
          ),
        }));
      }
      setOpen(false);
      navigate(notification.link || '/profile?section=orders');
    } catch (error) {
      console.error(error);
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
        <span className="sr-only">Toggle user notifications</span>
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              "pointer-events-auto absolute z-50 rounded-2xl border border-white/60 bg-white/90 p-3 shadow-2xl backdrop-blur-2xl",
              "top-12 right-0",
              "w-[min(18rem,calc(100vw-3rem))]",
              "max-sm:fixed max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:right-auto max-sm:top-[4.75rem] max-sm:w-[calc(100vw-2rem)] max-sm:max-w-sm"
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Notifications</p>
                  <h3 className="mt-0.5 font-serif text-lg">Updates for you</h3>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full h-7 px-2.5 text-xs gap-1"
                onClick={(event: ReactMouseEvent<HTMLButtonElement>) => {
                  event.preventDefault();
                  event.stopPropagation();
                  void markAllRead();
                }}
                disabled={loading || data.unreadCount === 0}
              >
                  {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCheck className="h-3 w-3" />}
                  Mark read
                </Button>
            </div>

            <div className="mt-3 space-y-2">
              {data.notifications.length === 0 ? (
                <div className="rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
                  No new updates right now.
                </div>
              ) : (
                data.notifications.map((notification) => (
                  <button
                    key={notification._id}
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "w-full rounded-xl border border-border/70 bg-background/80 p-3 text-left shadow-sm transition-colors hover:bg-background",
                      !notification.read && "border-primary/30"
                    )}
                  >
                    <p className="text-sm font-semibold leading-snug">{notification.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{notification.message}</p>
                    <p className="mt-1.5 text-[10px] text-muted-foreground">{new Date(notification.createdAt).toLocaleString('en-IN')}</p>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserNotificationBell;
