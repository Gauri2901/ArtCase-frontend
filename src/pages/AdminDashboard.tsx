import { useEffect, useMemo, useState, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Archive,
  ArrowUpDown,
  BellRing,
  Clock3,
  ExternalLink,
  Loader2,
  Package,
  Pencil,
  PencilLine,
  PlusCircle,
  Plus,
  Search,
  Save,
  ScrollText,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import type { AdminCommission, AdminOrder, Artwork, ArtworkCategory, CommissionStatus, DashboardStats, UploadLog } from '@/types/admin';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminStatCard from '@/components/admin/AdminStatCard';

type AdminSection = 'artworks' | 'orders' | 'commissions' | 'logs';
type OrderStatusFilter = 'all' | 'created' | 'paid' | 'failed';
type CommissionStatusFilter = 'all' | CommissionStatus;
type LogSort = 'timestamp' | 'title' | 'type' | 'action';
type LogActionFilter = 'all' | UploadLog['action'];

type ArtworkFormState = {
  title: string;
  description: string;
  price: string;
  category: ArtworkCategory;
  dimensions: string;
  tags: string;
  imageFile: File | null;
  existingImageUrl: string;
};

const categories: ArtworkCategory[] = ['Oil', 'Acrylic', 'Watercolor', 'Mixed Media'];

const emptyForm: ArtworkFormState = {
  title: '',
  description: '',
  price: '',
  category: 'Oil',
  dimensions: '24" x 36"',
  tags: '',
  imageFile: null,
  existingImageUrl: '',
};

const tableCardClassName = 'border-white/50 bg-white/70 shadow-xl backdrop-blur-2xl';
const validSections: AdminSection[] = ['artworks', 'orders', 'commissions', 'logs'];

const logActionConfig = {
  created: {
    label: 'Uploaded',
    icon: PlusCircle,
    badgeClassName: 'bg-emerald-100 text-emerald-700',
    borderClassName: 'border-emerald-200/80',
  },
  updated: {
    label: 'Updated',
    icon: PencilLine,
    badgeClassName: 'bg-amber-100 text-amber-700',
    borderClassName: 'border-amber-200/80',
  },
  deleted: {
    label: 'Deleted',
    icon: Trash2,
    badgeClassName: 'bg-rose-100 text-rose-700',
    borderClassName: 'border-rose-200/80',
  },
} as const;

const AdminDashboard = () => {
  const { user } = useAuth();
  const formRef = useRef<HTMLDivElement | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSection = searchParams.get('section');
  const initialSection = validSections.includes(requestedSection as AdminSection)
    ? (requestedSection as AdminSection)
    : 'artworks';
  const [activeSection, setActiveSection] = useState<AdminSection>(initialSection);
  const [loading, setLoading] = useState(true);
  const [savingArtwork, setSavingArtwork] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalArtworks: 0,
    totalOrders: 0,
    unreadOrders: 0,
    totalCommissions: 0,
    unreadCommissions: 0,
  });
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [commissions, setCommissions] = useState<AdminCommission[]>([]);
  const [logs, setLogs] = useState<UploadLog[]>([]);
  const [editingArtworkId, setEditingArtworkId] = useState<string | null>(null);
  const [form, setForm] = useState<ArtworkFormState>(emptyForm);
  const [previewUrl, setPreviewUrl] = useState('');
  const [orderStatus, setOrderStatus] = useState<OrderStatusFilter>('all');
  const [orderUserFilter, setOrderUserFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [commissionStatusFilter, setCommissionStatusFilter] = useState<CommissionStatusFilter>('all');
  const [commissionSearch, setCommissionSearch] = useState('');
  const [savingCommissionId, setSavingCommissionId] = useState<string | null>(null);
  const [deletingArtworkId, setDeletingArtworkId] = useState<string | null>(null);
  const [commissionDrafts, setCommissionDrafts] = useState<Record<string, { status: CommissionStatus; quotedPrice: string; adminNotes: string }>>({});
  const [logSort, setLogSort] = useState<LogSort>('timestamp');
  const [logOrder, setLogOrder] = useState<'asc' | 'desc'>('desc');
  const [logTypeFilter, setLogTypeFilter] = useState<'all' | ArtworkCategory>('all');
  const [logActionFilter, setLogActionFilter] = useState<LogActionFilter>('all');
  const [logSearch, setLogSearch] = useState('');

  useEffect(() => {
    if (!requestedSection || !validSections.includes(requestedSection as AdminSection)) {
      return;
    }

    setActiveSection(requestedSection as AdminSection);
  }, [requestedSection]);

  useEffect(() => {
    if (requestedSection === activeSection) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('section', activeSection);
    setSearchParams(nextParams, { replace: true });
  }, [activeSection, requestedSection, searchParams, setSearchParams]);

  const resetForm = () => {
    setForm(emptyForm);
    setPreviewUrl('');
    setEditingArtworkId(null);
  };

  useEffect(() => {
    if (!form.imageFile) {
      setPreviewUrl(form.existingImageUrl);
      return;
    }

    const nextPreview = URL.createObjectURL(form.imageFile);
    setPreviewUrl(nextPreview);

    return () => URL.revokeObjectURL(nextPreview);
  }, [form.imageFile, form.existingImageUrl]);

  const fetchDashboardData = async () => {
    if (!user?.token) return;

    setLoading(true);
    try {
      const [statsData, artworkData, orderData, commissionData, logData] = await Promise.all([
        apiRequest<DashboardStats>('/admin/stats', { token: user.token }),
        apiRequest<Artwork[]>('/artworks', { token: user.token }),
        apiRequest<AdminOrder[]>(
          `/orders?status=${orderStatus}&user=${encodeURIComponent(orderUserFilter)}&dateFrom=${dateFrom}&dateTo=${dateTo}`,
          { token: user.token }
        ),
        apiRequest<AdminCommission[]>(
          `/commissions?status=${commissionStatusFilter}&search=${encodeURIComponent(commissionSearch)}`,
          { token: user.token }
        ),
        apiRequest<UploadLog[]>(
          `/logs?sortBy=${logSort}&order=${logOrder}&type=${encodeURIComponent(logTypeFilter)}&action=${encodeURIComponent(logActionFilter)}&search=${encodeURIComponent(logSearch)}`,
          { token: user.token }
        ),
      ]);

      setStats(statsData);
      setArtworks(artworkData);
      setOrders(orderData);
      setCommissions(commissionData);
      setLogs(logData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user, orderStatus, orderUserFilter, dateFrom, dateTo, commissionStatusFilter, commissionSearch, logSort, logOrder, logTypeFilter, logActionFilter, logSearch]);

  useEffect(() => {
    if (!user?.token) return;
    const interval = window.setInterval(() => {
      fetchDashboardData();
    }, 20000);

    return () => window.clearInterval(interval);
  }, [user, orderStatus, orderUserFilter, dateFrom, dateTo, commissionStatusFilter, commissionSearch, logSort, logOrder, logTypeFilter, logActionFilter, logSearch]);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + order.payment.amount, 0),
    [orders]
  );
  const totalUnreadItems = stats.unreadOrders + stats.unreadCommissions;
  const logSummary = useMemo(
    () => ({
      created: logs.filter((log) => log.action === 'created').length,
      updated: logs.filter((log) => log.action === 'updated').length,
      deleted: logs.filter((log) => log.action === 'deleted').length,
    }),
    [logs]
  );

  const handleSectionChange = (section: AdminSection) => {
    setActiveSection(section);
  };

  const startEditing = (artwork: Artwork) => {
    setActiveSection('artworks');
    setEditingArtworkId(artwork._id);
    setForm({
      title: artwork.title,
      description: artwork.description,
      price: String(artwork.price),
      category: artwork.category,
      dimensions: artwork.dimensions || '24" x 36"',
      tags: artwork.tags.join(', '),
      imageFile: null,
      existingImageUrl: artwork.imageUrl,
    });

    // Scroll to form for immediate visibility
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setForm((current) => ({ ...current, imageFile: file }));
  };

  const updateField = <K extends keyof ArtworkFormState>(key: K, value: ArtworkFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const uploadImage = async () => {
    if (!user?.token) throw new Error('Not authorized');
    if (!form.imageFile) {
      return form.existingImageUrl;
    }

    const data = new FormData();
    data.append('image', form.imageFile);
    const response = await apiRequest<{ imageUrl: string }>('/upload', {
      method: 'POST',
      token: user.token,
      body: data,
    });

    return response.imageUrl;
  };

  const handleArtworkSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.token) return;

    setSavingArtwork(true);

    try {
      const imageUrl = await uploadImage();
      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        dimensions: form.dimensions || '24" x 36"',
        tags: form.tags,
        image: imageUrl,
      };

      if (editingArtworkId) {
        await apiRequest(`/artworks/${editingArtworkId}`, {
          method: 'PUT',
          token: user.token,
          body: JSON.stringify(payload),
        });
        toast.success('Artwork updated successfully');
      } else {
        await apiRequest('/artworks', {
          method: 'POST',
          token: user.token,
          body: JSON.stringify(payload),
        });
        toast.success('Artwork uploaded successfully');
      }

      resetForm();
      fetchDashboardData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save artwork');
    } finally {
      setSavingArtwork(false);
    }
  };

  const handleDeleteArtwork = async (artworkId: string) => {
    if (!user?.token) return;
    const confirmed = window.confirm('Delete this artwork? This action cannot be undone.');
    if (!confirmed) return;

    setDeletingArtworkId(artworkId);
    try {
      await apiRequest(`/artworks/${artworkId}`, {
        method: 'DELETE',
        token: user.token,
      });
      toast.success('Artwork deleted successfully');
      if (editingArtworkId === artworkId) {
        resetForm();
      }
      fetchDashboardData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete artwork');
    } finally {
      setDeletingArtworkId(null);
    }
  };

  useEffect(() => {
    setCommissionDrafts(
      commissions.reduce<Record<string, { status: CommissionStatus; quotedPrice: string; adminNotes: string }>>((drafts, commission) => {
        drafts[commission._id] = {
          status: commission.status,
          quotedPrice: commission.quotedPrice == null ? '' : String(commission.quotedPrice),
          adminNotes: commission.adminNotes || '',
        };
        return drafts;
      }, {})
    );
  }, [commissions]);

  const updateCommissionDraft = (commissionId: string, key: 'status' | 'quotedPrice' | 'adminNotes', value: string) => {
    setCommissionDrafts((current) => {
      const existing = current[commissionId] ?? {
        status: 'pending' as CommissionStatus,
        quotedPrice: '',
        adminNotes: '',
      };

      return {
        ...current,
        [commissionId]:
          key === 'status'
            ? { ...existing, status: value as CommissionStatus }
            : key === 'quotedPrice'
              ? { ...existing, quotedPrice: value }
              : { ...existing, adminNotes: value },
      };
    });
  };

  const handleCommissionSave = async (commissionId: string) => {
    if (!user?.token) return;

    const draft = commissionDrafts[commissionId];
    if (!draft) return;

    setSavingCommissionId(commissionId);
    try {
      await apiRequest(`/commissions/${commissionId}`, {
        method: 'PATCH',
        token: user.token,
        body: JSON.stringify({
          status: draft.status,
          quotedPrice: draft.quotedPrice === '' ? null : Number(draft.quotedPrice),
          adminNotes: draft.adminNotes,
        }),
      });
      toast.success('Commission updated successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update commission');
    } finally {
      setSavingCommissionId(null);
    }
  };

  if (!user?.isAdmin) {
    return <div className="p-20 text-center">Access Denied. Artists Only.</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-28">
      {/* Background blobs - decorative, should not block clicks */}
      <div className="fixed left-[-10rem] top-20 h-[26rem] w-[26rem] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-[-10rem] h-[24rem] w-[24rem] rounded-full bg-amber-200/30 blur-[120px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Admin Dashboard</p>
            <h1 className="mt-3 text-5xl font-serif">Studio operations at a glance</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Manage artwork uploads, review incoming orders, handle custom commissions, and keep an eye on upload activity from one polished control room.
            </p>
          </div>
          <div className="rounded-full border border-white/60 bg-white/70 px-5 py-3 text-sm shadow-lg backdrop-blur-xl">
            <span className="font-medium text-foreground">{totalUnreadItems}</span>{' '}
            <span className="text-muted-foreground">new requests to review</span>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
          <AdminStatCard label="Total Artworks" value={stats.totalArtworks} icon={<Archive className="h-5 w-5" />} hint="Published pieces across the collection" />
          <AdminStatCard label="Total Orders" value={stats.totalOrders} icon={<Package className="h-5 w-5" />} hint="All paid and tracked purchases" />
          <AdminStatCard label="Unread Orders" value={stats.unreadOrders} icon={<BellRing className="h-5 w-5" />} hint="Fresh orders waiting for review" />
          <AdminStatCard label="Commissions" value={stats.totalCommissions} icon={<ScrollText className="h-5 w-5" />} hint="Custom artwork requests received" />
          <AdminStatCard
            label="Revenue"
            value={formatPrice(totalRevenue)}
            icon={<ArrowUpDown className="h-5 w-5" />}
            hint="Based on currently loaded orders"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <AdminSidebar
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              unreadOrders={stats.unreadOrders}
              unreadCommissions={stats.unreadCommissions}
            />
          </div>

          <div className="space-y-6">
            {loading ? (
              <Card className={tableCardClassName}>
                <CardContent className="flex min-h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
              </Card>
            ) : null}

            {!loading && activeSection === 'artworks' ? (
              <div ref={formRef} className="space-y-6 scroll-mt-32">
                <Card className={tableCardClassName}>
                  <CardHeader>
                    <CardTitle className="text-3xl">Upload or update artwork</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] max-md:grid-cols-1" onSubmit={handleArtworkSubmit}>
                      <div className="space-y-4">
                        <div className="aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-dashed border-border bg-secondary/50">
                          {previewUrl ? (
                            <img src={previewUrl} alt="Artwork preview" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
                              Upload an artwork image to see a live preview here.
                            </div>
                          )}
                        </div>
                        <Input type="file" accept="image/*" onChange={handleImageChange} className="h-12 rounded-2xl bg-background/80" />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <Input
                            value={form.title}
                            onChange={(event) => updateField('title', event.target.value)}
                            placeholder="Artwork title"
                            className="h-12 rounded-2xl bg-background/80"
                          />
                        </div>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.price}
                          onChange={(event) => updateField('price', event.target.value)}
                          placeholder="Price"
                          className="h-12 rounded-2xl bg-background/80"
                        />
                        <select
                          value={form.category}
                          onChange={(event) => updateField('category', event.target.value as ArtworkCategory)}
                          className="h-12 rounded-2xl border border-input bg-background/80 px-4 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                        >
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                        <Input
                          value={form.dimensions}
                          onChange={(event) => updateField('dimensions', event.target.value)}
                          placeholder='Dimensions (default: 24" x 36")'
                          className="h-12 rounded-2xl bg-background/80"
                        />
                        <div className="md:col-span-2">
                          <Input
                            value={form.tags}
                            onChange={(event) => updateField('tags', event.target.value)}
                            placeholder="Tags, comma separated"
                            className="h-12 rounded-2xl bg-background/80"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <textarea
                            value={form.description}
                            onChange={(event) => updateField('description', event.target.value)}
                            placeholder="Write a rich description for collectors"
                            className="min-h-40 w-full rounded-[1.5rem] border border-input bg-background/80 px-4 py-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                          />
                        </div>
                        <div className="md:col-span-2 flex flex-wrap gap-3">
                          <Button type="submit" className="rounded-full px-6" disabled={savingArtwork}>
                            {savingArtwork ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {editingArtworkId ? 'Saving...' : 'Uploading...'}
                              </>
                            ) : (
                              <>
                                {editingArtworkId ? <Save className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                {editingArtworkId ? 'Save artwork' : 'Upload artwork'}
                              </>
                            )}
                          </Button>
                          {editingArtworkId ? (
                            <Button type="button" variant="outline" className="rounded-full px-6" onClick={resetForm}>
                              Cancel edit
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <Card className={tableCardClassName}>
                  <CardHeader>
                    <CardTitle className="text-3xl">Artwork library</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                    {artworks.map((artwork) => (
                      <div key={artwork._id} className="overflow-hidden rounded-[1.75rem] border border-white/60 bg-background/80 shadow-sm">
                        <div className="aspect-[4/3] overflow-hidden">
                          <img src={artwork.imageUrl} alt={artwork.title} className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
                        </div>
                        <div className="space-y-4 p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-2xl font-serif">{artwork.title}</h3>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {artwork.category} • {artwork.dimensions || '24" x 36"'}
                              </p>
                            </div>
                            <p className="text-base font-semibold">
                              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(artwork.price)}
                            </p>
                          </div>
                          <p className="line-clamp-3 text-sm text-muted-foreground">{artwork.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {artwork.tags.map((tag) => (
                              <span key={tag} className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-3">
                            <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={() => startEditing(artwork)}>
                              <Pencil className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button type="button" variant="destructive" className="flex-1 rounded-full" onClick={() => handleDeleteArtwork(artwork._id)} disabled={deletingArtworkId === artwork._id}>
                              {deletingArtworkId === artwork._id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ) : null}

            {!loading && activeSection === 'orders' ? (
              <Card className={tableCardClassName}>
                <CardHeader>
                  <CardTitle className="text-3xl">Orders overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 grid gap-3 md:grid-cols-4">
                    <select
                      value={orderStatus}
                      onChange={(event) => setOrderStatus(event.target.value as OrderStatusFilter)}
                      className="h-12 rounded-2xl border border-input bg-background/80 px-4 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                    >
                      <option value="all">All statuses</option>
                      <option value="created">Created</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                    </select>
                    <Input
                      value={orderUserFilter}
                      onChange={(event) => setOrderUserFilter(event.target.value)}
                      placeholder="Filter by user or order ID"
                      className="h-12 rounded-2xl bg-background/80"
                    />
                    <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="h-12 rounded-2xl bg-background/80" />
                    <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="h-12 rounded-2xl bg-background/80" />
                  </div>

                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="rounded-[1.75rem] border border-white/60 bg-background/85 p-5 shadow-sm">
                        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.9fr)_minmax(320px,1.15fr)]">
                          <div className="min-w-0 rounded-2xl bg-secondary/35 p-4">
                            <div>
                              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                                {order.orderKind === 'commission' ? 'Commission Order' : 'Order'}
                              </p>
                              <h3 className="mt-2 text-2xl font-serif">{order.orderId}</h3>
                              <p className="mt-2 text-sm text-muted-foreground">
                                {new Date(order.placedAt).toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>

                          <div className="min-w-0 rounded-2xl bg-secondary/35 p-4">
                            <div>
                              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Customer</p>
                              <p className="mt-2 font-medium">{order.user.name}</p>
                              <p className="text-sm text-muted-foreground">{order.user.email}</p>
                              {order.user.address || order.user.city || order.user.zip ? (
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {order.user.address}, {order.user.city} {order.user.zip}
                                </p>
                              ) : (
                                <p className="mt-1 text-sm text-muted-foreground">No shipping address captured yet.</p>
                              )}
                            </div>
                          </div>

                          <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                            <div className="rounded-2xl bg-secondary/60 p-4">
                              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Payment</p>
                              <p className="mt-2 font-medium break-words">{formatPrice(order.payment.amount)}</p>
                              <p className="mt-1 text-sm text-muted-foreground break-words">{order.payment.method}</p>
                              <span className="mt-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                {order.payment.status}
                              </span>
                            </div>
                            <div className="min-w-0 rounded-2xl bg-secondary/60 p-4">
                              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                                {order.orderKind === 'commission' ? 'Commission brief' : 'Artwork details'}
                              </p>
                              {order.orderKind === 'commission' && order.commissionDetails ? (
                                <div className="mt-3 space-y-3 min-w-0">
                                  <div>
                                    <p className="font-medium">{order.commissionDetails.artworkType}</p>
                                    <p className="mt-1 break-words text-sm text-muted-foreground">{order.commissionDetails.sizeDetails}</p>
                                  </div>
                                  <p className="break-words text-sm text-muted-foreground">{order.commissionDetails.description}</p>
                                  {order.commissionDetails.referenceImages.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {order.commissionDetails.referenceImages.map((image, index) => (
                                        <img key={`${order._id}-reference-${index}`} src={image} alt={`Reference ${index + 1}`} className="h-12 w-12 rounded-xl object-cover" />
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              ) : (
                                <div className="mt-3 space-y-3 min-w-0">
                                  {order.artworks.map((artwork) => (
                                    <div key={`${order._id}-${artwork.artwork}`} className="flex items-center gap-3">
                                      <img src={artwork.imageUrl} alt={artwork.title} className="h-12 w-12 rounded-xl object-cover" />
                                      <div className="min-w-0">
                                        <p className="truncate font-medium">{artwork.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {artwork.category} • Qty {artwork.quantity}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {orders.length === 0 ? (
                      <div className="rounded-[1.75rem] border border-dashed border-border bg-background/70 p-10 text-center text-muted-foreground">
                        No orders matched the current filters.
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {!loading && activeSection === 'commissions' ? (
              <Card className={tableCardClassName}>
                <CardHeader>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <CardTitle className="text-3xl">Commission requests</CardTitle>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Review custom artwork briefs, add studio notes, and convert approved requests into orders.
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{stats.unreadCommissions}</span> new commission requests
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 grid gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
                    <select
                      value={commissionStatusFilter}
                      onChange={(event) => setCommissionStatusFilter(event.target.value as CommissionStatusFilter)}
                      className="h-12 rounded-2xl border border-input bg-background/80 px-4 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                    >
                      <option value="all">All statuses</option>
                      <option value="pending">Pending</option>
                      <option value="payment_pending">Payment pending</option>
                      <option value="paid">Paid</option>
                      <option value="rejected">Rejected</option>
                      <option value="in_progress">In progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <Input
                      value={commissionSearch}
                      onChange={(event) => setCommissionSearch(event.target.value)}
                      placeholder="Search by commission ID, customer, or artwork type"
                      className="h-12 rounded-2xl bg-background/80"
                    />
                  </div>

                  <div className="space-y-5">
                    {commissions.map((commission) => {
                      const draft = commissionDrafts[commission._id] ?? {
                        status: commission.status,
                        quotedPrice: commission.quotedPrice == null ? '' : String(commission.quotedPrice),
                        adminNotes: commission.adminNotes || '',
                      };

                      return (
                        <div key={commission._id} className="rounded-[1.75rem] border border-white/60 bg-background/85 p-5 shadow-sm">
                          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
                            <div className="space-y-5">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                                  {commission.status.replace('_', ' ')}
                                </span>
                                <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                  Payment {commission.payment.status}
                                </span>
                                <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                                  {commission.artworkType}
                                </span>
                                <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{commission.commissionId}</span>
                              </div>

                              <div>
                                <h3 className="text-2xl font-serif">{commission.customer.name}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">{commission.customer.email}</p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                  Submitted {new Date(commission.submittedAt).toLocaleString('en-IN')}
                                </p>
                              </div>

                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-2xl bg-secondary/60 p-4">
                                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Budget</p>
                                  <p className="mt-2 font-medium">{formatPrice(commission.budget)}</p>
                                </div>
                                <div className="rounded-2xl bg-secondary/60 p-4">
                                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Size details</p>
                                  <p className="mt-2 text-sm text-muted-foreground">{commission.sizeDetails}</p>
                                </div>
                              </div>

                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-2xl bg-secondary/60 p-4">
                                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Payment status</p>
                                  <p className="mt-2 font-medium capitalize">{commission.payment.status}</p>
                                  {commission.payment.linkSentAt ? (
                                    <p className="mt-1 text-sm text-muted-foreground">Link sent {new Date(commission.payment.linkSentAt).toLocaleString('en-IN')}</p>
                                  ) : null}
                                </div>
                                <div className="rounded-2xl bg-secondary/60 p-4">
                                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Timeline</p>
                                  <p className="mt-2 text-sm text-muted-foreground">
                                    {commission.approvedAt ? `Approved ${new Date(commission.approvedAt).toLocaleString('en-IN')}` : 'Not approved yet'}
                                  </p>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {commission.completedAt ? `Completed ${new Date(commission.completedAt).toLocaleString('en-IN')}` : 'Waiting for completion'}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Creative brief</p>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">{commission.description}</p>
                              </div>

                              {commission.referenceImages.length > 0 ? (
                                <div>
                                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Reference images</p>
                                  <div className="mt-3 flex flex-wrap gap-3">
                                    {commission.referenceImages.map((image, index) => (
                                      <a key={`${commission._id}-reference-${index}`} href={image} target="_blank" rel="noreferrer" className="block">
                                        <img src={image} alt={`Reference ${index + 1}`} className="h-20 w-20 rounded-2xl object-cover shadow-sm transition-transform hover:scale-105" />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                            </div>

                            <div className="rounded-[1.5rem] border border-white/60 bg-white/70 p-4 shadow-inner">
                              <div className="grid gap-4">
                                <div>
                                  <label className="mb-2 block text-sm font-medium">Status</label>
                                  <select
                                    value={draft.status}
                                    onChange={(event) => updateCommissionDraft(commission._id, 'status', event.target.value)}
                                  className="h-12 w-full rounded-2xl border border-input bg-background/80 px-4 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="payment_pending">Approve & send payment link</option>
                                  <option value="paid">Paid</option>
                                  <option value="rejected">Rejected</option>
                                  <option value="in_progress">In progress</option>
                                  <option value="completed">Completed</option>
                                </select>
                                </div>

                                <div>
                                  <label className="mb-2 block text-sm font-medium">Quoted price</label>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={draft.quotedPrice}
                                    onChange={(event) => updateCommissionDraft(commission._id, 'quotedPrice', event.target.value)}
                                    placeholder="Add final quoted price"
                                    className="h-12 rounded-2xl bg-background/80"
                                  />
                                </div>

                                <div>
                                  <label className="mb-2 block text-sm font-medium">Admin notes</label>
                                  <textarea
                                    value={draft.adminNotes}
                                    onChange={(event) => updateCommissionDraft(commission._id, 'adminNotes', event.target.value)}
                                    placeholder="Add studio notes, timeline context, or client-facing guidance."
                                    className="min-h-32 w-full rounded-[1.5rem] border border-input bg-background/80 px-4 py-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                                  />
                                </div>

                                {commission.convertedOrder ? (
                                  <div className="rounded-2xl bg-primary/5 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Converted order</p>
                                    <p className="mt-2 font-medium">{commission.convertedOrder.orderId}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                      {formatPrice(commission.convertedOrder.payment.amount)} • {commission.convertedOrder.payment.status}
                                    </p>
                                  </div>
                                ) : null}

                                <Button
                                  type="button"
                                  className="rounded-full px-6"
                                  disabled={savingCommissionId === commission._id}
                                  onClick={() => handleCommissionSave(commission._id)}
                                >
                                  {savingCommissionId === commission._id ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Saving commission...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="h-4 w-4 mr-2" />
                                      {draft.status === 'payment_pending' ? 'Approve & send payment link' : 'Save commission'}
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {commissions.length === 0 ? (
                      <div className="rounded-[1.75rem] border border-dashed border-border bg-background/70 p-10 text-center text-muted-foreground">
                        No commission requests matched the current filters.
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {!loading && activeSection === 'logs' ? (
              <Card className={tableCardClassName}>
                <CardHeader>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <CardTitle className="text-3xl">Artwork activity logs</CardTitle>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Track every upload, update, and deletion with a detailed record you can open.
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[1.5rem] border border-emerald-200/80 bg-emerald-50/80 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">Uploaded</p>
                        <p className="mt-2 text-2xl font-semibold text-emerald-900">{logSummary.created}</p>
                      </div>
                      <div className="rounded-[1.5rem] border border-amber-200/80 bg-amber-50/80 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.25em] text-amber-700">Updated</p>
                        <p className="mt-2 text-2xl font-semibold text-amber-900">{logSummary.updated}</p>
                      </div>
                      <div className="rounded-[1.5rem] border border-rose-200/80 bg-rose-50/80 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.25em] text-rose-700">Deleted</p>
                        <p className="mt-2 text-2xl font-semibold text-rose-900">{logSummary.deleted}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,1fr))]">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={logSearch}
                        onChange={(event) => setLogSearch(event.target.value)}
                        placeholder="Search by artwork title"
                        className="h-12 rounded-2xl bg-background/80 pl-11"
                      />
                    </div>
                    <select
                      value={logActionFilter}
                      onChange={(event) => setLogActionFilter(event.target.value as LogActionFilter)}
                      className="h-12 rounded-2xl border border-input bg-background/80 px-4 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                    >
                      <option value="all">All actions</option>
                      <option value="created">Uploads</option>
                      <option value="updated">Updates</option>
                      <option value="deleted">Deletions</option>
                    </select>
                    <select
                      value={logTypeFilter}
                      onChange={(event) => setLogTypeFilter(event.target.value as 'all' | ArtworkCategory)}
                      className="h-12 rounded-2xl border border-input bg-background/80 px-4 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                    >
                      <option value="all">All artwork types</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <select
                      value={logSort}
                      onChange={(event) => setLogSort(event.target.value as LogSort)}
                      className="h-12 rounded-2xl border border-input bg-background/80 px-4 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                    >
                      <option value="timestamp">Sort by timestamp</option>
                      <option value="title">Sort by title</option>
                      <option value="type">Sort by artwork type</option>
                      <option value="action">Sort by action</option>
                    </select>
                    <select
                      value={logOrder}
                      onChange={(event) => setLogOrder(event.target.value as 'asc' | 'desc')}
                      className="h-12 rounded-2xl border border-input bg-background/80 px-4 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                    >
                      <option value="desc">Newest first</option>
                      <option value="asc">Oldest first</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    {logs.map((log) => {
                      const config = logActionConfig[log.action] ?? logActionConfig.created;
                      const Icon = config.icon;

                      return (
                        <Link
                          key={log._id}
                          to={`/admin/logs/${log._id}`}
                          className={`group block rounded-[1.75rem] border bg-background/85 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${config.borderClassName}`}
                        >
                          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                            <div className="space-y-4">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${config.badgeClassName}`}>
                                  <Icon className="h-4 w-4" />
                                  {config.label}
                                </span>
                                <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                                  {log.artworkType}
                                </span>
                              </div>

                              <div>
                                <h3 className="text-2xl font-serif transition-colors group-hover:text-primary">{log.artworkTitle}</h3>
                                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{log.summary}</p>
                              </div>

                              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                                <div>
                                  <p className="text-xs uppercase tracking-[0.2em]">Actor</p>
                                  <p className="mt-1 font-medium text-foreground">{log.uploadedBy?.name || 'Admin'}</p>
                                  <p>{log.uploadedBy?.email || 'Studio activity'}</p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.2em]">Changed fields</p>
                                  <p className="mt-1 font-medium text-foreground">
                                    {log.changes.length > 0 ? log.changes.map((change) => change.field).join(', ') : 'View details'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-start gap-4 xl:items-end">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock3 className="h-4 w-4" />
                                {new Date(log.timestamp).toLocaleString('en-IN')}
                              </div>
                              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/80 px-4 py-2 text-sm font-medium text-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary">
                                Open details
                                <ExternalLink className="h-4 w-4" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                    {logs.length === 0 ? (
                      <div className="rounded-[1.75rem] border border-dashed border-border bg-background/85 px-5 py-12 text-center text-sm text-muted-foreground">
                        No artwork logs matched the current filters.
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
