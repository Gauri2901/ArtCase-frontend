import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import About from './pages/About';
// 1. Import the new page (we'll create this next)
import ProductDetail from './pages/ProductDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="about" element={<About />} />
        
        {/* 2. This is our new dynamic route!
            The ':id' part is a "URL parameter".
            React Router will match /product/1, /product/abc, etc.
        */}
        <Route path="product/:id" element={<ProductDetail />} />
        
      </Route>
    </Routes>
  );
}

export default App;