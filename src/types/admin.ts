export type ArtworkCategory = 'Oil' | 'Acrylic' | 'Watercolor' | 'Mixed Media';

export type Artwork = {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: ArtworkCategory;
  dimensions: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type DashboardStats = {
  totalArtworks: number;
  totalOrders: number;
  unreadOrders: number;
  totalCommissions: number;
  unreadCommissions: number;
};

export type UploadLog = {
  _id: string;
  artwork?: string | null;
  artworkTitle: string;
  artworkType: ArtworkCategory;
  action: 'created' | 'updated' | 'deleted';
  summary: string;
  changes: Array<{
    field: string;
    previousValue: unknown;
    newValue: unknown;
  }>;
  timestamp: string;
  uploadedBy?: {
    _id: string;
    name: string;
    email: string;
  };
};

export type OrderItem = {
  artwork: string;
  title: string;
  imageUrl: string;
  price: number;
  quantity: number;
  category: ArtworkCategory;
};

export type AdminOrder = {
  _id: string;
  orderId: string;
  orderKind: 'purchase' | 'commission';
  unread: boolean;
  placedAt: string;
  invoice: {
    invoiceNumber: string;
    issuedAt: string;
    pdfUrl: string;
  };
  payment: {
    amount: number;
    currency: string;
    method: string;
    status: 'created' | 'paid' | 'failed';
    razorpayOrderId: string;
    razorpayPaymentId: string;
  };
  pricing: {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    currency: string;
  };
  user: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zip: string;
  };
  artworks: OrderItem[];
  commissionDetails?: {
    commission?: string | null;
    artworkType: string;
    description: string;
    sizeDetails: string;
    referenceImages: string[];
    adminNotes: string;
  };
};

export type CommissionStatus = 'pending' | 'approved' | 'payment_pending' | 'paid' | 'rejected' | 'in_progress' | 'completed';

export type AdminCommission = {
  _id: string;
  commissionId: string;
  submittedAt: string;
  unread: boolean;
  artworkType: string;
  description: string;
  budget: number;
  currency: string;
  sizeDetails: string;
  referenceImages: string[];
  status: CommissionStatus;
  adminNotes: string;
  quotedPrice: number | null;
  payment: {
    status: 'unpaid' | 'paid' | 'failed';
    paymentLink: string;
    paymentOrderId: string;
    paymentId: string;
    linkSentAt: string | null;
    paidAt: string | null;
  };
  approvedAt: string | null;
  completedAt: string | null;
  customer: {
    name: string;
    email: string;
  };
  convertedOrder?: {
    _id: string;
    orderId: string;
    orderKind: 'commission';
    payment: {
      amount: number;
      currency: string;
      status: 'created' | 'paid' | 'failed';
    };
  } | null;
};
