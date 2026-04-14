import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, Loader2, LogOut, Package, Save, User2, MapPin, Plus, Trash2, Edit2, Home, Briefcase, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import type { AdminCommission, AdminOrder } from '@/types/admin';
import type { UserAddress } from '@/types/user';
import type { Review } from '@/types/review';
import ReviewDialog from '@/components/reviews/ReviewDialog';
import OrderCard from '@/components/orders/OrderCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ProfileSection = 'profile' | 'orders' | 'addresses';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSection = searchParams.get('section');
  const activeSection: ProfileSection = (requestedSection === 'orders' || requestedSection === 'addresses') ? requestedSection : 'profile';
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
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [invoiceOrderId, setInvoiceOrderId] = useState<string | null>(null);

  // Review Dialog State
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewContext, setReviewContext] = useState<{
      productId: string;
      productTitle: string;
      orderId: string;
  } | null>(null);

  // Address State
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    zip: '',
    addressType: 'Home' as 'Home' | 'Work' | 'Other',
    isDefault: false
  });

  useEffect(() => {
    if (!highlightedOrderId) {
      return;
    }

    const matchingOrder = orders.find((order) => order.orderId === highlightedOrderId);
    if (matchingOrder) {
      setExpandedOrderId(matchingOrder._id);
    }
  }, [highlightedOrderId, orders]);

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

    const loadAddresses = async () => {
      try {
        const myAddresses = await apiRequest<UserAddress[]>('/users/addresses', { token: user.token });
        if (!mounted) return;
        setAddresses(myAddresses);
      } catch (error) {
        console.error('Failed to load addresses:', error);
      }
    };

    loadOrders();
    loadAddresses();
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

  const handleInvoiceDownload = async (order: AdminOrder) => {
    if (!user?.token) return;

    setInvoiceOrderId(order._id);
    try {
      const payload = await apiRequest<{ downloadUrl: string }>('/orders/' + order._id + '/invoice', {
        token: user.token,
      });

      window.open(payload.downloadUrl, '_blank', 'noopener,noreferrer');
      await refreshOrders();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to generate invoice');
    } finally {
      setInvoiceOrderId(null);
    }
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

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return;

    setAddressLoading(true);
    try {
      const method = editingAddress ? 'PUT' : 'POST';
      const endpoint = editingAddress ? `/users/addresses/${editingAddress._id}` : '/users/addresses';
      
      const updatedAddresses = await apiRequest<UserAddress[]>(endpoint, {
        method,
        token: user.token,
        body: JSON.stringify(addressForm)
      });

      setAddresses(updatedAddresses);
      toast.success(editingAddress ? 'Address updated' : 'Address added');
      setIsAddressDialogOpen(false);
      resetAddressForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Action failed');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!user?.token || !window.confirm('Are you sure you want to delete this address?')) return;

    try {
      const updatedAddresses = await apiRequest<UserAddress[]>(`/users/addresses/${id}`, {
        method: 'DELETE',
        token: user.token
      });
      setAddresses(updatedAddresses);
      toast.success('Address deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete');
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    if (!user?.token) return;

    try {
      const updatedAddresses = await apiRequest<UserAddress[]>(`/users/addresses/${id}/default`, {
        method: 'PATCH',
        token: user.token
      });
      setAddresses(updatedAddresses);
      toast.success('Default address updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update');
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      name: user?.name || '',
      phone: user?.phone || '',
      addressLine: '',
      city: '',
      state: '',
      zip: '',
      addressType: 'Home',
      isDefault: false
    });
    setEditingAddress(null);
  };

  const openEditAddress = (addr: UserAddress) => {
    setEditingAddress(addr);
    setAddressForm({
      name: addr.name,
      phone: addr.phone,
      addressLine: addr.addressLine,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      addressType: addr.addressType,
      isDefault: addr.isDefault
    });
    setIsAddressDialogOpen(true);
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

  const handleWriteReview = (productId: string, productTitle: string, orderId: string) => {
      setReviewContext({ productId, productTitle, orderId });
      setReviewDialogOpen(true);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-28">
      {/* Background blobs */}
      <div className="fixed left-[-10rem] top-20 h-[26rem] w-[26rem] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-[-10rem] h-[24rem] w-[24rem] rounded-full bg-amber-200/30 blur-[120px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-primary/70">My Dashboard</p>
            <h1 className="text-5xl lg:text-6xl font-serif">Your profile & center</h1>
            <p className="max-w-2xl text-lg text-muted-foreground/80 leading-relaxed">
              Keep your contact details up to date, follow your orders, and manage your delivery addresses from one premium dashboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 bg-secondary/30 p-1.5 rounded-full backdrop-blur-sm self-start">
            <Button 
                variant={activeSection === 'profile' ? 'default' : 'ghost'} 
                className="rounded-full px-6 transition-all duration-300" 
                onClick={() => setSearchParams({ section: 'profile' })}
            >
              <User2 className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button 
                variant={activeSection === 'addresses' ? 'default' : 'ghost'} 
                className="rounded-full px-6 transition-all duration-300" 
                onClick={() => setSearchParams({ section: 'addresses' })}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Addresses
            </Button>
            <Button 
                variant={activeSection === 'orders' ? 'default' : 'ghost'} 
                className="rounded-full px-6 transition-all duration-300" 
                onClick={() => setSearchParams({ section: 'orders' })}
            >
              <Package className="h-4 w-4 mr-2" />
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
            <Card className="border-white/50 bg-white/70 shadow-2xl backdrop-blur-2xl overflow-hidden group">
              <div className="h-2 w-full bg-gradient-to-r from-primary to-primary/40" />
              <CardHeader className="pt-8">
                <CardTitle className="text-3xl font-serif">Personal Details</CardTitle>
                <CardDescription>Manage your contact information and identity</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground ml-1">Full Name</label>
                    <Input 
                        value={profileForm.name} 
                        onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))} 
                        className="h-14 rounded-2xl bg-white/50 border-white/50 focus:bg-white text-lg px-5 shadow-sm transition-all" 
                        placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground ml-1">Email Address</label>
                    <Input 
                        type="email" 
                        value={profileForm.email} 
                        onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))} 
                        className="h-14 rounded-2xl bg-white/50 border-white/50 focus:bg-white px-5 shadow-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground ml-1">Phone Number</label>
                    <Input 
                        value={profileForm.phone} 
                        onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} 
                        className="h-14 rounded-2xl bg-white/50 border-white/50 focus:bg-white px-5 shadow-sm" 
                        placeholder="+91 00000 00000"
                    />
                  </div>
                  <div className="md:col-span-2 pt-4">
                    <Button type="submit" className="rounded-full px-8 h-12 text-md font-medium shadow-lg hover:shadow-xl transition-all" disabled={savingProfile}>
                      {savingProfile ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                      ) : (
                        <><Save className="h-4 w-4 mr-2" />Save profile</>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-white/50 bg-white/70 shadow-2xl backdrop-blur-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5 text-sm text-primary/80 leading-relaxed">
                   <Info className="h-5 w-5 mb-2" />
                  Order updates and commission links will be sent to your registered email and appear in notifications.
                </div>
                <Button variant="outline" className="w-full rounded-full border-destructive/20 text-destructive hover:bg-destructive hover:text-white h-12 transition-all" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {!loading && activeSection === 'addresses' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/40 backdrop-blur-md p-4 rounded-3xl border border-white/50 shadow-sm">
                <h2 className="text-2xl font-serif font-medium flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-primary" />
                    Saved delivery addresses
                </h2>
                <Dialog open={isAddressDialogOpen} onOpenChange={(open) => {
                    setIsAddressDialogOpen(open);
                    if(!open) resetAddressForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="rounded-full px-6 shadow-md hover:shadow-lg transition-all">
                            <Plus className="h-4 w-4 mr-2" />
                            Add new address
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-serif">{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                            <DialogDescription>
                                Enter your shipping details for a seamless checkout experience.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddressSubmit} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Full Name</label>
                                <Input 
                                    required
                                    value={addressForm.name}
                                    onChange={e => setAddressForm({...addressForm, name: e.target.value})}
                                    placeholder="Recipient Name"
                                    className="rounded-xl h-11"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Phone Number</label>
                                <Input 
                                    required
                                    value={addressForm.phone}
                                    onChange={e => setAddressForm({...addressForm, phone: e.target.value})}
                                    placeholder="10-digit mobile number"
                                    className="rounded-xl h-11"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Street Address</label>
                                <Input 
                                    required
                                    value={addressForm.addressLine}
                                    onChange={e => setAddressForm({...addressForm, addressLine: e.target.value})}
                                    placeholder="Flat, House no., Building, Company, Apartment"
                                    className="rounded-xl h-11"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">City</label>
                                    <Input 
                                        required
                                        value={addressForm.city}
                                        onChange={e => setAddressForm({...addressForm, city: e.target.value})}
                                        className="rounded-xl h-11"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Pincode</label>
                                    <Input 
                                        required
                                        value={addressForm.zip}
                                        onChange={e => setAddressForm({...addressForm, zip: e.target.value})}
                                        placeholder="6 digits"
                                        className="rounded-xl h-11"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">State</label>
                                <Input 
                                    required
                                    value={addressForm.state}
                                    onChange={e => setAddressForm({...addressForm, state: e.target.value})}
                                    placeholder="e.g. Maharashtra"
                                    className="rounded-xl h-11"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Address Type</label>
                                <Select 
                                    value={addressForm.addressType} 
                                    onValueChange={(val: any) => setAddressForm({...addressForm, addressType: val})}
                                >
                                    <SelectTrigger className="rounded-xl h-11">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Home">Home (All day delivery)</SelectItem>
                                        <SelectItem value="Work">Work (10 AM - 5 PM)</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="submit" className="rounded-full w-full h-12" disabled={addressLoading}>
                                    {addressLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Address'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {addresses.length === 0 ? (
                    <div className="md:col-span-2 py-20 bg-white/40 border border-dashed border-primary/20 rounded-[2rem] flex flex-col items-center justify-center text-center">
                        <MapPin className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <h3 className="text-xl font-medium text-muted-foreground">No addresses saved yet</h3>
                        <p className="text-muted-foreground/70 mt-2">Add your shipping addresses for a faster checkout</p>
                    </div>
                ) : (
                    addresses.sort((a,b) => a.isDefault ? -1 : 1).map((addr) => (
                        <Card key={addr._id} className={`border-white/50 bg-white/70 shadow-lg backdrop-blur-2xl rounded-3xl overflow-hidden transition-all hover:shadow-xl ${addr.isDefault ? 'ring-2 ring-primary/40 bg-white/90' : ''}`}>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-secondary/80 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
                                            {addr.addressType === 'Home' ? <Home className="h-3 w-3" /> : addr.addressType === 'Work' ? <Briefcase className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                                            {addr.addressType}
                                        </span>
                                        {addr.isDefault && (
                                            <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">Default</span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => openEditAddress(addr)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10" onClick={() => handleDeleteAddress(addr._id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-lg">{addr.name}</p>
                                    <p className="text-muted-foreground">{addr.addressLine}</p>
                                    <p className="text-muted-foreground">{addr.city}, {addr.state} - {addr.zip}</p>
                                    <p className="text-muted-foreground font-medium pt-2">Phone: {addr.phone}</p>
                                </div>
                                {!addr.isDefault && (
                                    <Button 
                                        variant="link" 
                                        className="mt-4 p-0 h-auto text-primary text-sm font-semibold hover:no-underline underline-offset-4 hover:underline"
                                        onClick={() => handleSetDefaultAddress(addr._id)}
                                    >
                                        Set as default
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
          </div>
        ) : null}

        {!loading && activeSection === 'orders' ? (
          <div className="space-y-6">
            <Card className="border-white/50 bg-white/70 shadow-2xl backdrop-blur-2xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="pt-8">
                <CardTitle className="text-3xl font-serif">Order History</CardTitle>
                <CardDescription>View and track your store purchases</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 px-6 pb-8">
                {purchaseOrders.length === 0 ? (
                  <div className="rounded-[2rem] border border-dashed border-primary/20 bg-white/40 p-16 text-center">
                    <Package className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-xl font-medium text-muted-foreground">No store orders yet.</p>
                    <Button variant="link" className="mt-2 text-primary">Browse Gallery</Button>
                  </div>
                ) : (
                  purchaseOrders.map((order) => (
                    <OrderCard
                      key={order._id}
                      order={order}
                      highlighted={highlightedOrderId === order.orderId}
                      expanded={expandedOrderId === order._id}
                      onToggle={() => setExpandedOrderId((current) => (current === order._id ? null : order._id))}
                      showInvoiceAction={true}
                      invoiceLoading={invoiceOrderId === order._id}
                      onDownloadInvoice={handleInvoiceDownload}
                      onWriteReview={handleWriteReview}
                    />
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-white/50 bg-white/70 shadow-2xl backdrop-blur-2xl rounded-[2.5rem] overflow-hidden">
               <div className="h-1.5 w-full bg-amber-200/50" />
              <CardHeader className="pt-8">
                <CardTitle className="text-3xl font-serif">Commission Projects</CardTitle>
                <CardDescription>Status and payments for your custom art requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 px-6 pb-8">
                {commissionOrders.length === 0 ? (
                  <div className="rounded-[2rem] border border-dashed border-primary/20 bg-white/40 p-16 text-center">
                    <Info className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-xl font-medium text-muted-foreground">No active commissions.</p>
                  </div>
                ) : (
                  commissionOrders.map((commission) => (
                    <div
                      key={commission._id}
                      className={`rounded-[2rem] border bg-white/80 p-6 shadow-sm transition-all hover:shadow-md ${highlightedOrderId === commission.convertedOrder?.orderId ? 'border-primary/40 ring-4 ring-primary/5' : 'border-white/80'}`}
                    >
                      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
                        <div className="space-y-5">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                              {commission.status.replace('_', ' ')}
                            </span>
                            <span className="inline-flex rounded-full bg-secondary px-4 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                              {commission.payment.status}
                            </span>
                            <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground ml-auto">
                              #{commission.convertedOrder?.orderId || commission.commissionId}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-3xl font-serif leading-tight">{commission.artworkType}</h3>
                            <p className="mt-2 text-muted-foreground font-medium">{commission.sizeDetails}</p>
                          </div>
                          <p className="text-muted-foreground/80 leading-relaxed italic border-l-2 border-primary/10 pl-4">{commission.description}</p>
                          {commission.referenceImages.length > 0 ? (
                            <div className="flex flex-wrap gap-3 pt-2">
                              {commission.referenceImages.map((image, index) => (
                                <img key={`${commission._id}-reference-${index}`} src={image} alt={`Reference ${index + 1}`} className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white shadow-sm" />
                              ))}
                            </div>
                          ) : null}
                        </div>

                        <div className="rounded-3xl bg-secondary/40 p-6 flex flex-col justify-between">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">Project Valuation</p>
                            <p className="text-3xl font-serif font-medium text-primary">{formatPrice(commission.quotedPrice ?? commission.budget)}</p>
                            <div className="mt-6 space-y-2">
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Creative Notes</p>
                                <p className="text-sm text-muted-foreground/80 leading-relaxed leading-relaxed">
                                    {commission.adminNotes || 'Our artists are reviewing your requirements.'}
                                </p>
                            </div>
                          </div>
                          
                          <div className="mt-8">
                            {commission.status === 'payment_pending' && commission.payment.status === 'unpaid' ? (
                                <Button className="w-full rounded-full h-12 shadow-lg shadow-primary/20 hover:shadow-xl transition-all" onClick={() => handleCommissionPayment(commission)} disabled={payingCommissionId === commission._id}>
                                {payingCommissionId === commission._id ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>
                                ) : (
                                    <><CreditCard className="h-4 w-4 mr-2" />Pay Now</>
                                )}
                                </Button>
                            ) : (
                                <div className="w-full text-center py-3 px-4 rounded-full bg-white/50 text-[10px] font-bold uppercase tracking-widest text-primary/60 border border-white">
                                {commission.status === 'completed' ? 'Project Completed' : 'Wait for Studio Input'}
                                </div>
                            )}
                          </div>
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

      {reviewContext && (
        <ReviewDialog 
          isOpen={reviewDialogOpen}
          onClose={() => setReviewDialogOpen(false)}
          productId={reviewContext.productId}
          productTitle={reviewContext.productTitle}
          orderId={reviewContext.orderId}
          onSuccess={() => {
            // Success logic if needed
          }}
        />
      )}
    </div>
  );
};

export default Profile;
