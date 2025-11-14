import ProductCard from "@/components/ProductCard";

const mockProducts = [
  {
    id: "1",
    title: "Mountain Sunset",
    imageUrl: "/images/sunset.jpg",
    price: 49.99,
  },
  {
    id: "2",
    title: "Abstract Ocean",
    imageUrl: "/images/ocean.jpg",
    price: 79.99,
  },
  {
    id: "3",
    title: "Forest Path",
    imageUrl: "/images/forest.jpg",
    price: 39.99,
  },
  {
    id: "4",
    title: "Cityscape",
    imageUrl: "/images/city.jpg",
    price: 99.99,
  },
];

const Gallery = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Gallery</h1>

      {/* 2. This is our responsive grid using Tailwind CSS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 3. We 'map' (loop) over our mock data array */}
        {mockProducts.map((product) => (
          
          // 4. For each item, we render a ProductCard
          // We pass the product's data as 'props'.
          // The 'key' is crucial for React!
          <ProductCard
            key={product.id}
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