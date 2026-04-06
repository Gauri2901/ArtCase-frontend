import { ChevronDown, CreditCard, Mail, MapPin, Phone, Receipt, ShoppingBag, User2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import type { AdminOrder } from '@/types/admin';

type OrderCardProps = {
  order: AdminOrder;
  expanded: boolean;
  onToggle: () => void;
  highlighted?: boolean;
  showInvoiceAction?: boolean;
};

const formatAddress = (order: AdminOrder) =>
  [order.user.address, order.user.city, order.user.zip].filter(Boolean).join(', ');

const buildInvoiceHtml = (order: AdminOrder) => {
  const address = formatAddress(order) || 'Not provided';
  const itemRows =
    order.orderKind === 'commission'
      ? `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${order.commissionDetails?.artworkType || 'Custom commission'}</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">1</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatPrice(order.pricing.total)}</td>
        </tr>
      `
      : order.artworks
          .map(
            (artwork) => `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                  <div style="font-weight: 600;">${artwork.title}</div>
                  <div style="font-size: 12px; color: #6b7280;">${artwork.category}</div>
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${artwork.quantity}</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatPrice(artwork.price * artwork.quantity)}</td>
              </tr>
            `
          )
          .join('');

  return `
    <html>
      <head>
        <title>Invoice ${order.invoice.invoiceNumber}</title>
      </head>
      <body style="font-family: Arial, sans-serif; color: #111827; padding: 32px;">
        <h1 style="margin-bottom: 6px;">Art-Case Invoice</h1>
        <p style="margin: 0 0 24px;">Invoice ${order.invoice.invoiceNumber}</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
          <div>
            <h3>Order details</h3>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Placed at:</strong> ${new Date(order.placedAt).toLocaleString('en-IN')}</p>
            <p><strong>Payment method:</strong> ${order.payment.method}</p>
            <p><strong>Payment status:</strong> ${order.payment.status}</p>
            <p><strong>Razorpay order ID:</strong> ${order.payment.razorpayOrderId || 'Not available'}</p>
            <p><strong>Razorpay payment ID:</strong> ${order.payment.razorpayPaymentId || 'Not available'}</p>
          </div>
          <div>
            <h3>Customer</h3>
            <p><strong>Name:</strong> ${order.user.name}</p>
            <p><strong>Email:</strong> ${order.user.email}</p>
            <p><strong>Phone:</strong> ${order.user.phone || 'Not provided'}</p>
            <p><strong>Address:</strong> ${address}</p>
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align: left; padding-bottom: 12px; border-bottom: 1px solid #d1d5db;">Item</th>
              <th style="text-align: left; padding-bottom: 12px; border-bottom: 1px solid #d1d5db;">Qty</th>
              <th style="text-align: right; padding-bottom: 12px; border-bottom: 1px solid #d1d5db;">Amount</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        <div style="margin-top: 24px; margin-left: auto; width: 320px;">
          <p><strong>Subtotal:</strong> ${formatPrice(order.pricing.subtotal)}</p>
          <p><strong>Discount:</strong> ${formatPrice(order.pricing.discount)}</p>
          <p><strong>Shipping:</strong> ${formatPrice(order.pricing.shipping)}</p>
          <p style="font-size: 18px;"><strong>Total:</strong> ${formatPrice(order.pricing.total)}</p>
        </div>
      </body>
    </html>
  `;
};

const downloadInvoice = (order: AdminOrder) => {
  const invoiceWindow = window.open('', '_blank', 'noopener,noreferrer,width=960,height=720');
  if (!invoiceWindow) {
    return;
  }

  invoiceWindow.document.write(buildInvoiceHtml(order));
  invoiceWindow.document.close();
  invoiceWindow.focus();
  invoiceWindow.print();
};

const OrderCard = ({ order, expanded, onToggle, highlighted = false, showInvoiceAction = false }: OrderCardProps) => {
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
                <Button type="button" className="mt-3 rounded-full" onClick={() => downloadInvoice(order)}>
                  <Receipt className="h-4 w-4" />
                  Download invoice
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
