// 1. Import the 'useParams' hook from React Router
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
// 2. We need our data. Let's copy the 'mockProducts'
// array here for now.
// (In a real app, we'd import this from a shared file
const mockProducts = [
  {
    id: "1",
    title: "Mountain Sunset",
    imageUrl: "/paintings/sunset.jpg",
    price: 49.99,
    description: "A beautiful oil painting capturing the serene colors of a mountain sunset. Perfect for a living room."
  },
  {
    id: "2",
    title: "Abstract Ocean",
    imageUrl: "/paintings/ocean.jpg",
    price: 79.99,
    description: "A large, dynamic abstract piece in acrylics, inspired by the power and motion of the ocean."
  },
  {
    id: "3",
    title: "Forest Path",
    imageUrl: "/paintings/forest.jpg",
    price: 39.99,
    description: "A charming watercolor painting of a sun-dappled path through a green forest."
  },
  {
    id: "4",
    title: "Cityscape",
    imageUrl: "/paintings/city.jpg",
    price: 99.99,
    description: "A modern, textured mixed-media piece depicting a vibrant city skyline at night."
  },
];

const ProductDetail = () => {
  // 3. 'useParams' gives us an object with the URL params.
  //    We 'destructure' it to get the 'id'.
  const { id } = useParams();
  const { addToCart } = useCart();
  // 4. Find the product in our mock data that matches the id
  //    (The 'product' variable might be 'undefined' if no match is found)
  const product = mockProducts.find(p => p.id === id);

  // 5. Handle the case where no product is found
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold">Product not found</h1>
        <p>We couldn't find the item you're looking for.</p>
      </div>
    );
  }
  const handleAddToCart = () => {
    // We know 'product' exists here, so we can pass it
    addToCart(product);
  };

  // 6. If the product *is* found, render its details
  return (
    <div className="container mx-auto px-4 py-8">
      {/* We'll use a 2-column grid for the layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Column 1: Image */}
        <div className="aspect-square overflow-hidden rounded-lg">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Column 2: Details */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold mb-4">{product.title}</h1>

          <span className="text-3xl font-semibold mb-6">
            ${product.price.toFixed(2)}
          </span>

          <p className="text-gray-700 text-lg mb-6">
            {product.description}
          </p>

          {/* 'mt-auto' pushes this button to the bottom */}
          <Button size="lg" className="mt-auto" onClick={handleAddToCart}>
            <Plus className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;