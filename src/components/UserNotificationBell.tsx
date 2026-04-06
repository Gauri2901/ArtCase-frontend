import { useEffect, useRef, useState } from 'react';
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
      setData((current) => ({
        unreadCount: 0,
        notifications: current.notifications.map((notification) => ({ ...notification, read: true })),
      }));
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
      }
      setOpen(false);
      navigate(notification.link || '/profile?section=orders');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-full hover:bg-white/20"
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
              "absolute z-50 rounded-[1.75rem] border border-white/60 bg-white/90 p-4 shadow-2xl backdrop-blur-2xl",
              "top-14 sm:top-12 right-0 sm:right-0",
              "w-[min(24rem,calc(100vw-3rem))]",
              "max-sm:fixed max-sm:inset-x-4 max-sm:mx-auto max-sm:top-24 max-sm:w-auto max-sm:max-w-md"
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Notifications</p>
                <h3 className="mt-1 font-serif text-2xl">Updates for you</h3>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={markAllRead}
                disabled={loading || data.unreadCount === 0}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
                Mark read
              </Button>
            </div>

            <div className="mt-4 space-y-3">
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
                      "w-full rounded-2xl border border-border/70 bg-background/80 p-4 text-left shadow-sm transition-colors hover:bg-background",
                      !notification.read && "border-primary/30"
                    )}
                  >
                    <p className="font-semibold">{notification.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{new Date(notification.createdAt).toLocaleString('en-IN')}</p>
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
