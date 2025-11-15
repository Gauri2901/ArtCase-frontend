import ProductCard from "@/components/ProductCard";

// 1. We're changing the 'imageUrl' paths to point to
//    our images in the 'public' folder.
const mockProducts = [
  {
    id: "1",
    title: "Mountain Sunset",
    imageUrl: "/paintings/sunset.jpg", // The path starts with '/'
    price: 49.99,
  },
  {
    id: "2",
    title: "Abstract Ocean",
    imageUrl: "/paintings/ocean.jpg",
    price: 79.99,
  },
  {
    id: "3",
    title: "Forest Path",
    imageUrl: "/paintings/forest.jpg",
    price: 39.99,
  },
  {
    id: "4",
    title: "Cityscape",
    imageUrl: "/paintings/city.jpg",
    price: 99.99,
  },
];

const Gallery = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Gallery</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id} // <-- Make sure this 'id' prop is being passed!
            title={product.title}
            imageUrl={product.imageUrl}
            price={product.price}
          />
        ))}
      </div>
    </div>
  );
};

export default Gallery;