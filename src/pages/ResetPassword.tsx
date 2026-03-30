import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/api';
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state?.email as string) || '';
  const resetToken = (location.state?.resetToken as string) || '';

  useEffect(() => {
    if (!email || !resetToken) {
      toast.error('Please complete the OTP verification first');
      navigate('/forgot-password');
    }
  }, [email, resetToken, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ 
          email, 
          newPassword: newPassword.trim(), 
          confirmPassword: confirmPassword.trim(),
          resetToken 
        }),
      });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/paintings/ocean.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md p-8 bg-white/10 border border-white/20 rounded-3xl backdrop-blur-xl shadow-2xl">
        <Link 
          to="/forgot-password"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        
        <h1 className="text-3xl font-serif text-white mb-2 text-center">Reset Password</h1>
        <p className="text-white/60 text-center text-sm mb-6">
          Create a new password for your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input 
              type={showNewPassword ? 'text' : 'password'}
              placeholder="New Password" 
              className="bg-white/20 border-white/30 text-gray-900 placeholder:text-gray-600 pr-10"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors"
              tabIndex={-1}
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="relative">
            <Input 
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm Password" 
              className="bg-white/20 border-white/30 text-gray-900 placeholder:text-gray-600 pr-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Button 
            type="submit"
            className="w-full bg-white text-black hover:bg-white/90" 
            disabled={isLoading || !newPassword || !confirmPassword}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset Password'
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

export default ResetPassword;
