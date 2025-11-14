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

// 2. The component receives 'props' as an argument.
// We "destructure" them to get 'title', 'imageUrl', and 'price' directly.
const ProductCard = ({ title, imageUrl, price }: ProductCardProps) => {
  return (
    // 3. This is the 'Card' component we installed from shadcn
    <Card className="flex flex-col"> {/* Added flex-col for structure */}
      
      {/* 4. CardHeader holds the title */}
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>

      {/* 5. CardContent is for the main content, like the image */}
      <CardContent className="flex-grow"> {/* Added flex-grow */}
        <div className="aspect-square relative">
          {/* We use a placeholder image for now.
              'aspect-square' makes it a perfect square.
              'bg-gray-200' gives us a placeholder color.
              We'll replace this with a real image tag soon.
          */}
          <div className="w-full h-full bg-gray-200 rounded-md" />
          {/* We'll soon use: <img src={imageUrl} alt={title} className="..." /> */}
        </div>
      </CardContent>

      {/* 6. CardFooter is for actions, like price and an "Add to Cart" button */}
      <CardFooter className="flex justify-between items-center">
        <span className="font-bold text-lg">
          {/* Format the price to look like currency */}
          ${price.toFixed(2)}
        </span>
        <Button>Add to Cart</Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;