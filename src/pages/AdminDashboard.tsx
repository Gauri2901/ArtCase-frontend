import { useEffect, useMemo, useState } from 'react';
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
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/api';
import type { AdminOrder, Artwork, ArtworkCategory, DashboardStats, UploadLog } from '@/types/admin';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminStatCard from '@/components/admin/AdminStatCard';

type AdminSection = 'artworks' | 'orders' | 'logs';
type OrderStatusFilter = 'all' | 'created' | 'paid' | 'failed';
type LogSort = 'timestamp' | 'title' | 'type' | 'action';
type LogActionFilter = 'all' | UploadLog['action'];

type ArtworkFormState = {
  title: string;
  description: string;
  price: string;
  category: ArtworkCategory;
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
  tags: '',
  imageFile: null,
  existingImageUrl: '',
};

const tableCardClassName = 'border-white/50 bg-white/70 shadow-xl backdrop-blur-2xl';
const validSections: AdminSection[] = ['artworks', 'orders', 'logs'];

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
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSection = searchParams.get('section');
  const initialSection = validSections.includes(requestedSection as AdminSection)
    ? (requestedSection as AdminSection)
    : 'artworks';
  const [activeSection, setActiveSection] = useState<AdminSection>(initialSection);
  const [loading, setLoading] = useState(true);
  const [savingArtwork, setSavingArtwork] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({ totalArtworks: 0, totalOrders: 0, unreadOrders: 0 });
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [logs, setLogs] = useState<UploadLog[]>([]);
  const [editingArtworkId, setEditingArtworkId] = useState<string | null>(null);
  const [form, setForm] = useState<ArtworkFormState>(emptyForm);
  const [previewUrl, setPreviewUrl] = useState('');
  const [orderStatus, setOrderStatus] = useState<OrderStatusFilter>('all');
  const [orderUserFilter, setOrderUserFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
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
      const [statsData, artworkData, orderData, logData] = await Promise.all([
        apiRequest<DashboardStats>('/admin/stats', { token: user.token }),
        apiRequest<Artwork[]>('/artworks', { token: user.token }),
        apiRequest<AdminOrder[]>(
          `/orders?status=${orderStatus}&user=${encodeURIComponent(orderUserFilter)}&dateFrom=${dateFrom}&dateTo=${dateTo}`,
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
      setLogs(logData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user, orderStatus, orderUserFilter, dateFrom, dateTo, logSort, logOrder, logTypeFilter, logActionFilter, logSearch]);

  useEffect(() => {
    if (!user?.token) return;
    const interval = window.setInterval(() => {
      fetchDashboardData();
    }, 20000);

    return () => window.clearInterval(interval);
  }, [user, orderStatus, orderUserFilter, dateFrom, dateTo, logSort, logOrder, logTypeFilter, logActionFilter, logSearch]);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + order.payment.amount, 0),
    [orders]
  );
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
      tags: artwork.tags.join(', '),
      imageFile: null,
      existingImageUrl: artwork.imageUrl,
    });
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
    }
  };

  if (!user?.isAdmin) {
    return <div className="p-20 text-center">Access Denied. Artists Only.</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-28">
      <div className="fixed left-[-10rem] top-20 h-[26rem] w-[26rem] rounded-full bg-primary/10 blur-[120px]" />
      <div className="fixed bottom-0 right-[-10rem] h-[24rem] w-[24rem] rounded-full bg-amber-200/30 blur-[120px]" />

      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Admin Dashboard</p>
            <h1 className="mt-3 text-5xl font-serif">Studio operations at a glance</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Manage artwork uploads, review incoming orders, and keep an eye on upload activity from one polished control room.
            </p>
          </div>
          <div className="rounded-full border border-white/60 bg-white/70 px-5 py-3 text-sm shadow-lg backdrop-blur-xl">
            <span className="font-medium text-foreground">{stats.unreadOrders}</span>{' '}
            <span className="text-muted-foreground">new order notifications</span>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Total Artworks" value={stats.totalArtworks} icon={<Archive className="h-5 w-5" />} hint="Published pieces across the collection" />
          <AdminStatCard label="Total Orders" value={stats.totalOrders} icon={<Package className="h-5 w-5" />} hint="All paid and tracked purchases" />
          <AdminStatCard label="Unread Orders" value={stats.unreadOrders} icon={<BellRing className="h-5 w-5" />} hint="Fresh orders waiting for review" />
          <AdminStatCard
            label="Revenue"
            value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalRevenue)}
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
              <>
                <Card className={tableCardClassName}>
                  <CardHeader>
                    <CardTitle className="text-3xl">Upload or update artwork</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]" onSubmit={handleArtworkSubmit}>
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
                            {savingArtwork ? <Loader2 className="h-4 w-4 animate-spin" /> : editingArtworkId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            {editingArtworkId ? 'Save artwork' : 'Upload artwork'}
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
                              <p className="mt-1 text-sm text-muted-foreground">{artwork.category}</p>
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
                            <Button type="button" variant="destructive" className="flex-1 rounded-full" onClick={() => handleDeleteArtwork(artwork._id)}>
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
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
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                          <div className="grid gap-5 md:grid-cols-2 xl:flex-1">
                            <div>
                              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Order</p>
                              <h3 className="mt-2 text-2xl font-serif">{order.orderId}</h3>
                              <p className="mt-2 text-sm text-muted-foreground">
                                {new Date(order.placedAt).toLocaleString('en-IN')}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Customer</p>
                              <p className="mt-2 font-medium">{order.user.name}</p>
                              <p className="text-sm text-muted-foreground">{order.user.email}</p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {order.user.address}, {order.user.city} {order.user.zip}
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2 xl:min-w-[28rem]">
                            <div className="rounded-2xl bg-secondary/60 p-4">
                              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Payment</p>
                              <p className="mt-2 font-medium">
                                {new Intl.NumberFormat('en-IN', {
                                  style: 'currency',
                                  currency: order.payment.currency || 'INR',
                                }).format(order.payment.amount)}
                              </p>
                              <p className="mt-1 text-sm text-muted-foreground">{order.payment.method}</p>
                              <span className="mt-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                {order.payment.status}
                              </span>
                            </div>
                            <div className="rounded-2xl bg-secondary/60 p-4">
                              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Artwork details</p>
                              <div className="mt-3 space-y-3">
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
