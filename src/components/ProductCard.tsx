import { Plus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from './ui/button';
// 1. Import 'Link'
import { Link } from 'react-router-dom';

type ProductCardProps = {
  // 2. We need the 'id' to build the link!
  id: string;
  title: string;
  imageUrl: string;
  price: number;
};

// 3. Get 'id' from the props
const ProductCard = ({ id, title, imageUrl, price }: ProductCardProps) => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        {/* 4. Wrap the title in a Link */}
        <Link to={`/product/${id}`}>
          <CardTitle className="text-xl hover:text-primary transition-colors">
            {title}
          </CardTitle>
        </Link>
      </CardHeader>

      <CardContent className="flex-grow">
        {/* 5. Wrap the image in a Link */}
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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;