import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/api';
import { Loader2 } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
      }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, phone, password }),
      });
      login(data);
      toast.success(`Welcome to ArtCase, ${data.name}!`);
      navigate('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/paintings/city.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md p-8 bg-white/10 border border-white/20 rounded-3xl backdrop-blur-xl shadow-2xl">
        <h1 className="text-3xl font-serif text-white mb-6 text-center">Join the Gallery</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            placeholder="Full Name" 
            className="bg-white/20 border-white/30 text-gray-900 placeholder:text-gray-600"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            required
          />
          <Input 
            type="email" 
            placeholder="Email Address" 
            className="bg-white/20 border-white/30 text-gray-900 placeholder:text-gray-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
          <Input 
            placeholder="Phone Number (Optional)" 
            className="bg-white/20 border-white/30 text-gray-900 placeholder:text-gray-600"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isLoading}
          />
          <Input 
            type="password" 
            placeholder="Password" 
            className="bg-white/20 border-white/30 text-gray-900 placeholder:text-gray-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
          <Button className="w-full bg-white text-black hover:bg-white/90" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
        <p className="mt-4 text-center text-white/60 text-sm">
          Already a collector? <Link to="/login" className="underline hover:text-white">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
