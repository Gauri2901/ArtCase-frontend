import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, Loader2, LogOut, Package, Save, User2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import type { AdminCommission, AdminOrder } from '@/types/admin';

type ProfileSection = 'profile' | 'orders';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSection = searchParams.get('section');
  const activeSection: ProfileSection = requestedSection === 'orders' ? 'orders' : 'profile';
  const highlightedOrderId = searchParams.get('order');

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [payingCommissionId, setPayingCommissionId] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [commissions, setCommissions] = useState<AdminCommission[]>([]);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
    });
  }, [user]);

  useEffect(() => {
    if (!user?.token) return;

    let mounted = true;

    const loadProfile = async () => {
      try {
        const profile = await apiRequest<{ _id: string; name: string; email: string; phone: string; isAdmin: boolean; token: string }>('/auth/profile', { token: user.token });

        if (!mounted) return;
        updateUser(profile);
        setProfileForm({
          name: profile.name,
          email: profile.email,
          phone: profile.phone || '',
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to load your profile');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [user?.token, updateUser]);

  useEffect(() => {
    if (!user?.token) return;

    let mounted = true;

    const loadOrders = async () => {
      if (document.visibilityState !== 'visible') {
        return;
      }

      try {
        const [myOrders, myCommissions] = await Promise.all([
          apiRequest<AdminOrder[]>('/orders/mine', { token: user.token }),
          apiRequest<AdminCommission[]>('/commissions/mine', { token: user.token }),
        ]);

        if (!mounted) return;
        setOrders(myOrders);
        setCommissions(myCommissions);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to load your dashboard');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOrders();
    const interval = window.setInterval(loadOrders, activeSection === 'orders' ? 30000 : 60000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [activeSection, user?.token]);

  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const refreshOrders = async () => {
    if (!user?.token) return;

    const [myOrders, myCommissions] = await Promise.all([
      apiRequest<AdminOrder[]>('/orders/mine', { token: user.token }),
      apiRequest<AdminCommission[]>('/commissions/mine', { token: user.token }),
    ]);

    setOrders(myOrders);
    setCommissions(myCommissions);
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.token) return;

    setSavingProfile(true);
    try {
      const updatedUser = await apiRequest<{ _id: string; name: string; email: string; phone: string; isAdmin: boolean; token: string }>('/auth/profile', {
        method: 'PUT',
        token: user.token,
        body: JSON.stringify(profileForm),
      });
      updateUser(updatedUser);
      toast.success('Profile updated successfully.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCommissionPayment = async (commission: AdminCommission) => {
    if (!user?.token) return;

    const isSdkLoaded = await loadRazorpay();
    if (!isSdkLoaded) {
      toast.error('Razorpay SDK failed to load.');
      return;
    }

    setPayingCommissionId(commission._id);
    try {
      const order = await apiRequest<{
        id: string;
        amount: number;
        currency: string;
        key: string;
        commissionId: string;
      }>(`/commissions/${commission._id}/create-payment-order`, {
        method: 'POST',
        token: user.token,
      });

      const Razorpay = (window as any).Razorpay;
      const paymentObject = new Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: 'Art Case',
        description: `Commission ${order.commissionId}`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            await apiRequest(`/commissions/${commission._id}/verify-payment`, {
              method: 'POST',
              token: user.token,
              body: JSON.stringify(response),
            });
            toast.success('Payment received successfully.');
            await refreshOrders();
          } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Payment verification failed');
          } finally {
            setPayingCommissionId(null);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || '',
        },
        notes: {
          commissionId: commission.commissionId,
        },
        theme: {
          color: '#1f2937',
        },
      });

      paymentObject.open();
      paymentObject.on('payment.failed', (response: any) => {
        toast.error(response.error.description || 'Payment failed');
        setPayingCommissionId(null);
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to initialize payment');
      setPayingCommissionId(null);
    }
  };

  const commissionOrders = useMemo(
    () => commissions.filter((commission) => commission.convertedOrder),
    [commissions]
  );
  const purchaseOrders = useMemo(
    () => orders.filter((order) => order.orderKind === 'purchase'),
    [orders]
  );

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-28">
      {/* Background blobs - clearly decorative, should not block clicks */}
      <div className="fixed left-[-10rem] top-20 h-[26rem] w-[26rem] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-[-10rem] h-[24rem] w-[24rem] rounded-full bg-amber-200/30 blur-[120px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">My Dashboard</p>
            <h1 className="mt-3 text-5xl font-serif">Your profile and orders</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Keep your contact details up to date, follow your orders, and pay for approved commissions from one place.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant={activeSection === 'profile' ? 'default' : 'outline'} className="rounded-full" onClick={() => setSearchParams({ section: 'profile' })}>
              <User2 className="h-4 w-4" />
              Profile
            </Button>
            <Button variant={activeSection === 'orders' ? 'default' : 'outline'} className="rounded-full" onClick={() => setSearchParams({ section: 'orders' })}>
              <Package className="h-4 w-4" />
              Orders
            </Button>
          </div>
        </div>

        {loading ? (
          <Card className="border-white/50 bg-white/70 shadow-xl backdrop-blur-2xl">
            <CardContent className="flex min-h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : null}

        {!loading && activeSection === 'profile' ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <Card className="border-white/50 bg-white/70 shadow-xl backdrop-blur-2xl">
              <CardHeader>
                <CardTitle className="text-3xl">Profile details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="grid gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium">Name</label>
                    <Input value={profileForm.name} onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))} className="h-12 rounded-2xl bg-background/80" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Email</label>
                    <Input type="email" value={profileForm.email} onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))} className="h-12 rounded-2xl bg-background/80" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Phone number</label>
                    <Input value={profileForm.phone} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} className="h-12 rounded-2xl bg-background/80" placeholder="Add a phone number if you want" />
                  </div>
                  <div className="md:col-span-2 flex flex-wrap gap-3">
                    <Button type="submit" className="rounded-full px-6" disabled={savingProfile}>
                      {savingProfile ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save profile
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-white/50 bg-white/70 shadow-xl backdrop-blur-2xl">
              <CardHeader>
                <CardTitle className="text-3xl">Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[1.5rem] border border-primary/10 bg-primary/5 p-4 text-sm text-muted-foreground">
                  Order updates, commission payment links, and status changes will appear in your notification bell automatically.
                </div>
                <Button variant="destructive" className="w-full rounded-full" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {!loading && activeSection === 'orders' ? (
          <div className="space-y-6">
            <Card className="border-white/50 bg-white/70 shadow-xl backdrop-blur-2xl">
              <CardHeader>
                <CardTitle className="text-3xl">Store orders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {purchaseOrders.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-border bg-background/70 p-10 text-center text-muted-foreground">
                    No store orders yet.
                  </div>
                ) : (
                  purchaseOrders.map((order) => (
                    <div
                      key={order._id}
                      className={`rounded-[1.5rem] border bg-background/80 p-5 shadow-sm ${highlightedOrderId === order.orderId ? 'border-primary/40 ring-2 ring-primary/20' : 'border-white/50'}`}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{order.orderKind === 'commission' ? 'Commission order' : 'Order'}</p>
                          <h3 className="mt-2 text-2xl font-serif">{order.orderId}</h3>
                          <p className="mt-2 text-sm text-muted-foreground">{new Date(order.placedAt).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="rounded-2xl bg-secondary/60 p-4">
                          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Payment</p>
                          <p className="mt-2 font-medium">{formatPrice(order.payment.amount)}</p>
                          <span className="mt-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            {order.payment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-white/50 bg-white/70 shadow-xl backdrop-blur-2xl">
              <CardHeader>
                <CardTitle className="text-3xl">Custom commissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {commissionOrders.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-border bg-background/70 p-10 text-center text-muted-foreground">
                    No custom commissions yet.
                  </div>
                ) : (
                  commissionOrders.map((commission) => (
                    <div
                      key={commission._id}
                      className={`rounded-[1.5rem] border bg-background/80 p-5 shadow-sm ${highlightedOrderId === commission.convertedOrder?.orderId ? 'border-primary/40 ring-2 ring-primary/20' : 'border-white/50'}`}
                    >
                      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                              {commission.status.replace('_', ' ')}
                            </span>
                            <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                              {commission.payment.status}
                            </span>
                            <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                              {commission.convertedOrder?.orderId || commission.commissionId}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-2xl font-serif">{commission.artworkType}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">{commission.sizeDetails}</p>
                          </div>
                          <p className="text-sm leading-6 text-muted-foreground">{commission.description}</p>
                          {commission.referenceImages.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {commission.referenceImages.map((image, index) => (
                                <img key={`${commission._id}-reference-${index}`} src={image} alt={`Reference ${index + 1}`} className="h-14 w-14 rounded-xl object-cover" />
                              ))}
                            </div>
                          ) : null}
                        </div>

                        <div className="rounded-[1.5rem] bg-secondary/60 p-4">
                          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Payment summary</p>
                          <p className="mt-2 font-medium">{formatPrice(commission.quotedPrice ?? commission.budget)}</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {commission.adminNotes || 'The studio will keep you updated here.'}
                          </p>
                          {commission.status === 'payment_pending' && commission.payment.status === 'unpaid' ? (
                            <Button className="mt-4 w-full rounded-full" onClick={() => handleCommissionPayment(commission)} disabled={payingCommissionId === commission._id}>
                              {payingCommissionId === commission._id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Processing payment...
                                </>
                              ) : (
                                <>
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Pay now
                                </>
                              )}
                            </Button>
                          ) : (
                            <div className="mt-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                              {commission.status === 'completed' ? 'Artwork completed' : 'No payment action needed right now'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Profile;
