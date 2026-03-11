// frontend/src/pages/Auth/ResetPassword.jsx
import React, { useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CheckCircle } from 'lucide-react';
import { authAPI } from '@/services/api/authAPI';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/utils/helpers/cn';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain an uppercase letter';
    if (!/[a-z]/.test(pwd)) return 'Password must contain a lowercase letter';
    if (!/[0-9]/.test(pwd)) return 'Password must contain a number';
    return null;
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  }, [password, confirmPassword, token, navigate]);

  if (success) {
    return (
      <div className="min-h-screen bg-editor-bg flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-editor-card border border-editor-border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Password Reset!</h1>
            <p className="text-surface-400">
              Your password has been successfully reset. Redirecting to login...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-editor-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-editor-card border border-editor-border rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-surface-400 hover:text-white transition-colors mb-4"
            >
              Back to Login
            </Link>
            <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-surface-400">
              Enter your new password below
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
                {error}
              </div>
            )}

            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={Lock}
              required
              disabled={loading}
            />

            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              icon={Lock}
              required
              disabled={loading}
            />

            {/* Password Requirements */}
            <div className="p-3 rounded-lg bg-editor-surface/50 text-xs space-y-1">
              <p className={cn('font-medium', password.length >= 8 ? 'text-emerald-400' : 'text-surface-400')}>
                • At least 8 characters
              </p>
              <p className={cn('font-medium', /[A-Z]/.test(password) ? 'text-emerald-400' : 'text-surface-400')}>
                • One uppercase letter
              </p>
              <p className={cn('font-medium', /[a-z]/.test(password) ? 'text-emerald-400' : 'text-surface-400')}>
                • One lowercase letter
              </p>
              <p className={cn('font-medium', /[0-9]/.test(password) ? 'text-emerald-400' : 'text-surface-400')}>
                • One number
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={!password || !confirmPassword}
            >
              Reset Password
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
