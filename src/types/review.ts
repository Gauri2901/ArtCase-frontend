export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  product: string;
  order: string;
  name: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  productId: string;
  orderId: string;
  rating: number;
  title: string;
  comment: string;
}
