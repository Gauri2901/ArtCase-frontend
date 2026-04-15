import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/api';
import { ArrowLeft, Loader2, RotateCcw } from 'lucide-react';
import { CLOUDINARY_IMAGES } from '@/lib/constants';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state?.email as string) || '';

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  useEffect(() => {
    if (!email) {
      toast.error('Please start from the forgot password page');
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp.trim()) {
      toast.error('Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      toast.error('OTP must be 6 digits');
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiRequest<{ resetToken: string }>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp: otp.trim() }),
      });
      toast.success('OTP verified successfully!');
      navigate('/reset-password', { state: { email, resetToken: data.resetToken } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      toast.success('OTP sent to your email');
      setResendCountdown(60);
      setOtp('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12`} style={{ backgroundImage: `url(${CLOUDINARY_IMAGES[5]})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md p-6 sm:p-8 bg-white/10 border border-white/20 rounded-3xl backdrop-blur-xl shadow-2xl">
        <Link 
          to="/forgot-password"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        
        <h1 className="text-3xl font-serif text-white mb-2 text-center">Verify OTP</h1>
        <p className="text-white/60 text-center text-sm mb-6">
          Enter the 6-digit OTP sent to {email}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            type="text"
            placeholder="Enter OTP" 
            maxLength={6}
            className="bg-white/20 border-white/30 text-gray-900 placeholder:text-gray-600 text-center text-2xl tracking-widest"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              setOtp(value.slice(0, 6));
            }}
            disabled={isLoading}
          />
          <Button 
            type="submit"
            className="w-full bg-white text-black hover:bg-white/90" 
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </Button>
        </form>

        <div className="mt-6 space-y-3">
          <button
            onClick={handleResendOTP}
            disabled={resendCountdown > 0 || isResending}
            className="w-full flex items-center justify-center gap-2 text-white/70 hover:text-white text-sm transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            {isResending ? 'Resending...' : resendCountdown > 0 ? `Resend OTP in ${resendCountdown}s` : 'Resend OTP'}
          </button>
          <p className="text-center text-white/60 text-sm">
            <Link to="/login" className="underline hover:text-white">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
