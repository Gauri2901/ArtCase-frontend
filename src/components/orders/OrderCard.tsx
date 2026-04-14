import { ChevronDown, CreditCard, Loader2, Mail, MapPin, Phone, Receipt, ShoppingBag, Star, User2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import type { AdminOrder } from '@/types/admin';

type OrderCardProps = {
  order: AdminOrder;
  expanded: boolean;
  onToggle: () => void;
  highlighted?: boolean;
  showInvoiceAction?: boolean;
  invoiceLoading?: boolean;
  onDownloadInvoice?: (order: AdminOrder) => void;
  onWriteReview?: (productId: string, productTitle: string, orderId: string) => void;
};

const formatAddress = (order: AdminOrder) =>
  [order.user.address, order.user.city, order.user.zip].filter(Boolean).join(', ');

const OrderCard = ({
  order,
  expanded,
  onToggle,
  highlighted = false,
  showInvoiceAction = false,
  invoiceLoading = false,
  onDownloadInvoice,
  onWriteReview,
}: OrderCardProps) => {
  const primaryArtwork = order.artworks[0];
  const shippingAddress = formatAddress(order);
  const itemCount = order.orderKind === 'commission'
    ? 1
    : order.artworks.reduce((sum, artwork) => sum + artwork.quantity, 0);

  return (
    <div
      className={`rounded-[1.5rem] border bg-background/80 p-5 shadow-sm transition-all ${highlighted ? 'border-primary/40 ring-2 ring-primary/20' : 'border-white/50'}`}
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 gap-4">
          {order.orderKind === 'purchase' && primaryArtwork ? (
            <img
              src={primaryArtwork.imageUrl}
              alt={primaryArtwork.title}
              className="h-20 w-20 rounded-[1.25rem] object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-[1.25rem] bg-secondary/70 text-center text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Custom
            </div>
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {order.orderKind === 'commission' ? 'Commission order' : 'Store order'}
              </span>
              <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                {order.payment.status}
              </span>
            </div>
            <h3 className="mt-3 text-2xl font-serif">{order.orderId}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{new Date(order.placedAt).toLocaleString('en-IN')}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              {order.orderKind === 'commission'
                ? order.commissionDetails?.artworkType || 'Commission artwork'
                : `${primaryArtwork?.title || 'Artwork'}${order.artworks.length > 1 ? ` + ${order.artworks.length - 1} more` : ''}`}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:min-w-[250px]">
          <div className="rounded-2xl bg-secondary/60 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Payment</p>
            <p className="mt-2 text-lg font-semibold">{formatPrice(order.pricing.total)}</p>
            <p className="mt-1 text-sm text-muted-foreground">{order.payment.method}</p>
            <p className="mt-1 text-sm text-muted-foreground">{itemCount} item{itemCount > 1 ? 's' : ''}</p>
          </div>
          <Button type="button" variant="outline" className="rounded-full" onClick={onToggle}>
            <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            {expanded ? 'Hide details' : 'View details'}
          </Button>
        </div>
      </div>

      {expanded ? (
        <div className="mt-6 grid gap-4 border-t border-border/60 pt-6 xl:grid-cols-3">
          <div className="space-y-4 rounded-[1.5rem] bg-secondary/45 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <User2 className="h-4 w-4" />
              Customer details
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{order.user.name}</p>
              <p className="flex items-center gap-2 break-all"><Mail className="h-4 w-4" /> {order.user.email}</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {order.user.phone || 'Phone not provided'}</p>
              <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4" /> {shippingAddress || 'Address not provided'}</p>
            </div>
          </div>

          <div className="space-y-4 rounded-[1.5rem] bg-secondary/45 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CreditCard className="h-4 w-4" />
              Payment details
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><span className="font-medium text-foreground">Invoice:</span> {order.invoice.invoiceNumber}</p>
              <p><span className="font-medium text-foreground">Method:</span> {order.payment.method}</p>
              <p><span className="font-medium text-foreground">Status:</span> {order.payment.status}</p>
              <p className="break-all"><span className="font-medium text-foreground">Razorpay order ID:</span> {order.payment.razorpayOrderId || 'Not available'}</p>
              <p className="break-all"><span className="font-medium text-foreground">Razorpay payment ID:</span> {order.payment.razorpayPaymentId || 'Not available'}</p>
              <p><span className="font-medium text-foreground">Order ID:</span> {order.orderId}</p>
              <p><span className="font-medium text-foreground">PDF status:</span> {order.invoice.pdfUrl ? 'Ready to download' : 'Will be generated on request'}</p>
            </div>
          </div>

          <div className="space-y-4 rounded-[1.5rem] bg-secondary/45 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Receipt className="h-4 w-4" />
              Pricing summary
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><span className="font-medium text-foreground">Subtotal:</span> {formatPrice(order.pricing.subtotal)}</p>
              <p><span className="font-medium text-foreground">Other discounts:</span> {order.pricing.discount > 0 ? formatPrice(order.pricing.discount) : 'No discounts applied'}</p>
              <p><span className="font-medium text-foreground">Shipping:</span> {formatPrice(order.pricing.shipping)}</p>
              <p className="text-base font-semibold text-foreground"><span>Total amount:</span> {formatPrice(order.pricing.total)}</p>
              {showInvoiceAction ? (
                <Button type="button" className="mt-3 rounded-full" onClick={() => onDownloadInvoice?.(order)} disabled={invoiceLoading}>
                  {invoiceLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Receipt className="h-4 w-4" />}
                  {invoiceLoading ? 'Preparing invoice...' : 'Download invoice PDF'}
                </Button>
              ) : null}
            </div>
          </div>

          <div className="xl:col-span-3 rounded-[1.5rem] bg-secondary/35 p-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <ShoppingBag className="h-4 w-4" />
              {order.orderKind === 'commission' ? 'Commission details' : 'Ordered items'}
            </div>

            {order.orderKind === 'commission' ? (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div>
                  <p className="text-lg font-medium text-foreground">{order.commissionDetails?.artworkType || 'Custom commission'}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{order.commissionDetails?.sizeDetails || 'No size details shared.'}</p>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    {order.commissionDetails?.description || 'No commission brief was added.'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {order.commissionDetails?.referenceImages?.length ? order.commissionDetails.referenceImages.map((image, index) => (
                    <img key={`${order._id}-reference-${index}`} src={image} alt={`Reference ${index + 1}`} className="h-20 w-20 rounded-xl object-cover" />
                  )) : (
                    <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                      No reference images.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {order.artworks.map((artwork) => (
                  <div key={`${order._id}-${artwork.artwork}`} className="flex gap-4 rounded-[1.25rem] border border-white/50 bg-background/80 p-4">
                    <img src={artwork.imageUrl} alt={artwork.title} className="h-24 w-24 rounded-[1rem] object-cover" />
                    <div className="min-w-0">
                      <p className="text-lg font-medium text-foreground">{artwork.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{artwork.category}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Quantity: {artwork.quantity}</p>
                      <p className="mt-3 text-sm font-medium text-foreground">
                        {formatPrice(artwork.price)} each
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Line total: {formatPrice(artwork.price * artwork.quantity)}
                      </p>
                      {onWriteReview && order.payment.status === 'paid' && (
                        <Button 
                          variant="secondary" 
                          size="lg" 
                          className="mt-6 w-full sm:w-auto h-12 rounded-full !bg-amber-400 !text-black hover:!bg-amber-500 shadow-xl shadow-amber-400/20 transition-all text-sm font-bold border-none"
                          onClick={() => onWriteReview(artwork.artwork, artwork.title, order._id)}
                        >
                          <Star className="h-4 w-4 mr-2 fill-black" />
                          Review this Artwork
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default OrderCard;
