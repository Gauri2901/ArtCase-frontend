import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/api';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { CLOUDINARY_IMAGES } from '@/lib/constants';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });
      toast.success('OTP sent to your email. Check your inbox!');
      navigate('/verify-otp', { state: { email: email.trim() } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12`} style={{ backgroundImage: `url(${CLOUDINARY_IMAGES[2]})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md p-6 sm:p-8 bg-white/10 border border-white/20 rounded-3xl backdrop-blur-xl shadow-2xl">
        <Link 
          to="/login"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
        
        <h1 className="text-3xl font-serif text-white mb-2 text-center">Forgot Password</h1>
        <p className="text-white/60 text-center text-sm mb-6">
          Enter your email address and we'll send you an OTP to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            type="email"
            placeholder="Email" 
            className="bg-white/20 border-white/30 text-gray-900 placeholder:text-gray-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <Button 
            type="submit"
            className="w-full bg-white text-black hover:bg-white/90" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending OTP...
              </>
            ) : (
              'Send OTP'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-white/60 text-sm">
          Remember your password? <Link to="/login" className="underline hover:text-white">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
