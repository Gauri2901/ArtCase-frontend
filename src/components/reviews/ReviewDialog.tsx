import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/useAuth';

interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productTitle: string;
  orderId: string;
  onSuccess?: () => void;
}

const ReviewDialog = ({
  isOpen,
  onClose,
  productId,
  productTitle,
  orderId,
  onSuccess,
}: ReviewDialogProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return;

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest('/reviews', {
        method: 'POST',
        token: user.token,
        body: JSON.stringify({
          productId,
          orderId,
          rating,
          title,
          comment,
        }),
      });

      toast.success('Thank you for your review!');
      onSuccess?.();
      onClose();
      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl backdrop-blur-3xl bg-white/90">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Review Artwork</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Share your thoughts on "{productTitle}" with other collectors.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Your Rating</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      (hover || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Review Title</label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summary of your experience (e.g., Stunning details!)"
              className="rounded-xl h-12 bg-white/50 border-white/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Feedback</label>
            <textarea
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What makes this piece special to you?"
              className="min-h-32 w-full rounded-2xl border border-white/50 bg-white/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full h-12 shadow-lg shadow-primary/10 transition-all hover:scale-[1.02]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting Review...
                </>
              ) : (
                'Post Review'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
