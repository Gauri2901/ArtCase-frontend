import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const ThankYou = () => {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
      <h1 className="text-4xl font-bold mb-4">Thank You for Your Order!</h1>
      <p className="text-lg text-gray-700 mb-8">
        Your order has been placed successfully. We'll be in touch soon with
        shipping details.
      </p>
      <Button asChild size="lg">
        <Link to="/gallery">Continue Shopping</Link>
      </Button>
    </div>
  );
};

export default ThankYou;