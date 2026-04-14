import type { Review } from '@/types/review';
import { Star, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface ReviewListProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

const ReviewList = ({ reviews, averageRating, totalReviews }: ReviewListProps) => {
  if (reviews.length === 0) {
    return (
      <div className="py-12 text-center bg-secondary/20 rounded-[2.5rem] border border-dashed border-border">
        <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  // Calculate rating distribution
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { star, count, percentage };
  });

  return (
    <div className="space-y-12">
      {/* Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/50 shadow-sm">
        <div className="text-center md:text-left space-y-2">
          <h3 className="text-5xl font-serif font-medium">{averageRating.toFixed(1)}</h3>
          <div className="flex justify-center md:justify-start gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-5 w-5 ${
                  s <= Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">
            Based on {totalReviews} Reviews
          </p>
        </div>

        <div className="md:col-span-2 space-y-3">
          {distribution.map((item) => (
            <div key={item.star} className="flex items-center gap-4 text-sm">
              <span className="w-12 font-medium flex items-center gap-1">
                {item.star} <Star className="h-3 w-3 fill-current" />
              </span>
              <div className="flex-1 h-2 bg-secondary/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-1000"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="w-10 text-right text-muted-foreground">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review._id} className="p-8 rounded-[2.5rem] bg-white/40 backdrop-blur-sm border border-white/20 shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${
                        s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <h4 className="text-xl font-serif font-medium pt-1">{review.title}</h4>
              </div>
              <span className="text-sm text-muted-foreground font-sans">
                {format(new Date(review.createdAt), 'MMM dd, yyyy')}
              </span>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-6 font-sans">
              {review.comment}
            </p>

            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-serif text-primary text-lg">
                {review.name[0]}
              </div>
              <div>
                <p className="font-medium text-sm">{review.name}</p>
                {review.isVerifiedPurchase && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="h-3 w-3" /> Verified Purchase
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
