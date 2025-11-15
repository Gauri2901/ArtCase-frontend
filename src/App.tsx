import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import About from './pages/About';
import ProductDetail from './pages/ProductDetail';
// 1. Import the new Cart page
import Cart from './pages/Cart'; 

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="about" element={<About />} />
        <Route path="product/:id" element={<ProductDetail />} />
        
        {/* 2. Add the route for the cart page */}
        <Route path="cart" element={<Cart />} />
        
      </Route>
    </Routes>
  );
}

export default App;