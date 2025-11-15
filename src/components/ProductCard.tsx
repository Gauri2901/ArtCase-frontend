import { Plus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
// 1. Import our custom hook
import { useCart } from '@/context/CartContext';

type ProductCardProps = {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
};

// 3. We need all the product data to pass to the cart
const ProductCard = (props: ProductCardProps) => {
  const { id, title, imageUrl, price } = props;

  // 2. Get the 'addToCart' function from our context
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    // 4. Call 'addToCart' with the product info
    // We pass the 'props' object directly as it matches the shape
    addToCart(props);
    // You could add a 'toast' notification here later!
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <Link to={`/product/${id}`}>
          <CardTitle className="text-xl hover:text-primary transition-colors">
            {title}
          </CardTitle>
        </Link>
      </CardHeader>

      <CardContent className="flex-grow">
        <Link to={`/product/${id}`}>
          <div className="aspect-square relative overflow-hidden rounded-md">
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover"
            />
          </div>
        </Link>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <span className="font-bold text-lg">${price.toFixed(2)}</span>
        
        {/* 5. Attach the 'handleAddToCart' function to the button */}
        <Button onClick={handleAddToCart}>
          <Plus className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;