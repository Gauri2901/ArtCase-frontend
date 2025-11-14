import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";

// 1. We define the 'shape' of the data this component expects.
// This is TypeScript! It helps us prevent bugs by ensuring
// we always pass the right 'props' (properties).
type ProductCardProps = {
  title: string;
  imageUrl: string;
  price: number;
};

const ProductCard = ({ title, imageUrl, price }: ProductCardProps) => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>

      {/* --- THIS IS THE UPDATED SECTION --- */}
      <CardContent className="flex-grow">
        {/* 'aspect-square' keeps the 1:1 ratio. 'relative' and 'overflow-hidden'
            are good for containing the image. */}
        <div className="aspect-square relative overflow-hidden rounded-md">
          {/* We're replacing the placeholder <div> with this <img> tag */}
          <img
            src={imageUrl} // The 'src' prop comes from our mock data
            alt={title}     // 'alt' text is crucial for accessibility!
            className="h-full w-full object-cover" // This is the magic!
          />
        </div>
      </CardContent>
      {/* --- END OF UPDATED SECTION --- */}

      <CardFooter className="flex justify-between items-center">
        <span className="font-bold text-lg">
          ${price.toFixed(2)}
        </span>
        <Button>Add to Cart</Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;