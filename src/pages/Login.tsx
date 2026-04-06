import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await apiRequest<{
        _id: string;
        name: string;
        email: string;
        phone: string;
        isAdmin: boolean;
        token: string;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      login(data);
      toast.success(`Welcome back, ${data.name}`);
      navigate('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/paintings/ocean.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md p-8 bg-white/10 border border-white/20 rounded-3xl backdrop-blur-xl shadow-2xl">
        <h1 className="text-3xl font-serif text-white mb-6 text-center">User Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            placeholder="Email" 
            className="bg-white/20 border-white/30 text-gray-900 placeholder:text-gray-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <Input 
            type="password" 
            placeholder="Password" 
            className="bg-white/20 border-white/30 text-gray-900 placeholder:text-gray-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <Button className="w-full bg-white text-black hover:bg-white/90" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
        <div className="mt-6 space-y-3">
          <div className="text-center">
            <Link to="/forgot-password" className="text-white/70 hover:text-white text-sm underline transition-colors">
              Forgot Password?
            </Link>
          </div>
          <p className="text-center text-white/60 text-sm">
            Don't have an account? <Link to="/register" className="underline hover:text-white">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
