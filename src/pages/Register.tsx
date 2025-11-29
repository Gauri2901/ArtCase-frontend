import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        login(data);
        toast.success(`Welcome to ArtCase, ${data.name}!`);
        navigate('/');
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      toast.error('Something went wrong');
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
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input 
            type="email" 
            placeholder="Email Address" 
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input 
            type="password" 
            placeholder="Password" 
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button className="w-full bg-white text-black hover:bg-white/90">Create Account</Button>
        </form>
        <p className="mt-4 text-center text-white/60 text-sm">
          Already a collector? <Link to="/login" className="underline hover:text-white">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;