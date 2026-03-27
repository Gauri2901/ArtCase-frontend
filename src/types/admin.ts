export type ArtworkCategory = 'Oil' | 'Acrylic' | 'Watercolor' | 'Mixed Media';

export type Artwork = {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: ArtworkCategory;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type DashboardStats = {
  totalArtworks: number;
  totalOrders: number;
  unreadOrders: number;
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
  unread: boolean;
  placedAt: string;
  payment: {
    amount: number;
    currency: string;
    method: string;
    status: 'created' | 'paid' | 'failed';
    razorpayOrderId: string;
    razorpayPaymentId: string;
  };
  user: {
    name: string;
    email: string;
    address: string;
    city: string;
    zip: string;
  };
  artworks: OrderItem[];
};
