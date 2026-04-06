import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock3, Loader2, PencilLine, PlusCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/useAuth';
import { apiRequest } from '@/lib/api';
import type { UploadLog } from '@/types/admin';

const tableCardClassName = 'border-white/50 bg-white/70 shadow-xl backdrop-blur-2xl';

const actionConfig = {
  created: {
    label: 'Uploaded',
    icon: PlusCircle,
    badgeClassName: 'bg-emerald-100 text-emerald-700',
  },
  updated: {
    label: 'Updated',
    icon: PencilLine,
    badgeClassName: 'bg-amber-100 text-amber-700',
  },
  deleted: {
    label: 'Deleted',
    icon: Trash2,
    badgeClassName: 'bg-rose-100 text-rose-700',
  },
} as const;

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return 'Not set';
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : 'None';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
};

const AdminLogDetail = () => {
  const { user } = useAuth();
  const { logId } = useParams();
  const [loading, setLoading] = useState(true);
  const [log, setLog] = useState<UploadLog | null>(null);

  useEffect(() => {
    const fetchLog = async () => {
      if (!user?.token || !logId) {
        return;
      }

      setLoading(true);
      try {
        const data = await apiRequest<UploadLog>(`/logs/${logId}`, { token: user.token });
        setLog(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load log details');
      } finally {
        setLoading(false);
      }
    };

    fetchLog();
  }, [logId, user?.token]);

  const config = useMemo(() => (log ? actionConfig[log.action] ?? actionConfig.created : null), [log]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 pt-28">
        <div className="container mx-auto px-4">
          <Card className={tableCardClassName}>
            <CardContent className="flex min-h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!log || !config) {
    return (
      <div className="min-h-screen bg-background pb-20 pt-28">
        <div className="container mx-auto px-4">
          <Card className={tableCardClassName}>
            <CardContent className="space-y-4 p-8 text-center">
              <h1 className="text-3xl font-serif">Log not found</h1>
              <p className="text-muted-foreground">This activity record may have been removed or the link is invalid.</p>
              <Button asChild className="rounded-full px-6">
                <Link to="/admin?section=logs">Back to logs</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-background pb-20 pt-28">
      {/* Background blobs - decorative, should not block clicks */}
      <div className="fixed left-[-10rem] top-20 h-[26rem] w-[26rem] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-[-10rem] h-[24rem] w-[24rem] rounded-full bg-amber-200/30 blur-[120px] pointer-events-none" />

      <div className="container relative z-10 mx-auto space-y-6 px-4">
        <Button asChild variant="outline" className="rounded-full border-white/60 bg-white/70 px-5 backdrop-blur-xl">
          <Link to="/admin?section=logs">
            <ArrowLeft className="h-4 w-4" />
            Back to logs
          </Link>
        </Button>

        <Card className={tableCardClassName}>
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <span className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${config.badgeClassName}`}>
                  <Icon className="h-4 w-4" />
                  {config.label}
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Artwork activity</p>
                  <CardTitle className="mt-3 text-4xl font-serif">{log.artworkTitle}</CardTitle>
                </div>
                <p className="max-w-2xl text-muted-foreground">{log.summary}</p>
              </div>

              <div className="rounded-[1.5rem] border border-white/60 bg-background/75 p-4 text-sm shadow-sm">
                <p className="font-medium text-foreground">{log.uploadedBy?.name || 'Admin'}</p>
                <p className="text-muted-foreground">{log.uploadedBy?.email || 'Studio activity'}</p>
                <div className="mt-3 flex items-center gap-2 text-muted-foreground">
                  <Clock3 className="h-4 w-4" />
                  {new Date(log.timestamp).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="space-y-4">
              <div className="rounded-[1.75rem] border border-white/60 bg-background/80 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Artwork type</p>
                <p className="mt-3 text-xl font-semibold">{log.artworkType}</p>
              </div>

              <div className="rounded-[1.75rem] border border-white/60 bg-background/80 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Log ID</p>
                <p className="mt-3 break-all text-sm text-muted-foreground">{log._id}</p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/60 bg-background/80 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Detailed changes</p>
              {log.changes.length > 0 ? (
                <div className="mt-5 space-y-4">
                  {log.changes.map((change) => (
                    <div key={`${log._id}-${change.field}`} className="rounded-[1.5rem] border border-border/70 bg-white/70 p-4">
                      <p className="font-medium">{change.field}</p>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl bg-rose-50 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-rose-600">Previous</p>
                          <pre className="mt-3 whitespace-pre-wrap break-words text-sm text-rose-900">{formatValue(change.previousValue)}</pre>
                        </div>
                        <div className="rounded-2xl bg-emerald-50 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">New</p>
                          <pre className="mt-3 whitespace-pre-wrap break-words text-sm text-emerald-900">{formatValue(change.newValue)}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-[1.5rem] border border-dashed border-border bg-white/60 p-8 text-center text-muted-foreground">
                  {log.action === 'created'
                    ? 'This log records a new artwork upload.'
                    : log.action === 'deleted'
                      ? 'This log records that the artwork was removed from the collection.'
                      : 'No field-level changes were stored for this update.'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogDetail;
