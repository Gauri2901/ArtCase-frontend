import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Commissions from './pages/Commissions';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Cart from './pages/Cart'; 
import ThankYou from './pages/ThankYou';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogDetail from './pages/AdminLogDetail';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="about" element={<About />} />
        <Route path="commissions" element={<Commissions />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="verify-otp" element={<VerifyOTP />} />
        <Route path="reset-password" element={<ResetPassword />} />

        {/* Protected User Routes (Checkout requires login) */}
        <Route element={<ProtectedRoute />}>
          <Route path="checkout" element={<Checkout />} />
          <Route path="thank-you" element={<ThankYou />} />
          <Route path="profile" element={<Profile />} />
          <Route path="wishlist" element={<Wishlist />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute adminOnly={true} />}>
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/logs/:logId" element={<AdminLogDetail />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
