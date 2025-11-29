import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        login(data);
        toast.success(`Welcome back, ${data.name}`);
        navigate(data.isAdmin ? '/admin' : '/'); // Redirect Admin to Dashboard
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/paintings/ocean.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md p-8 bg-white/10 border border-white/20 rounded-3xl backdrop-blur-xl shadow-2xl">
        <h1 className="text-3xl font-serif text-white mb-6 text-center">Artist Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            placeholder="Email" 
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input 
            type="password" 
            placeholder="Password" 
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button className="w-full bg-white text-black hover:bg-white/90">Sign In</Button>
        </form>
        <p className="mt-4 text-center text-white/60 text-sm">
          Don't have an account? <Link to="/register" className="underline hover:text-white">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;