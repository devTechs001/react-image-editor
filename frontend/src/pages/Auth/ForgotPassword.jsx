// frontend/src/pages/Auth/ForgotPassword.jsx
import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authAPI } from '@/services/api/authAPI';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/utils/helpers/cn';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  }, [email]);

  if (submitted) {
    return (
      <div className="min-h-screen bg-editor-bg flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-editor-card border border-editor-border rounded-2xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Check Your Email</h1>
              <p className="text-surface-400 mb-6">
                We've sent a password reset link to <strong className="text-white">{email}</strong>
              </p>
              <p className="text-sm text-surface-500 mb-6">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => navigate('/login')}
                >
                  Back to Login
                </Button>
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => setSubmitted(false)}
                >
                  Try Another Email
                </Button>
              </div>
            </div>
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
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
            <h1 className="text-2xl font-bold text-white mb-2">Forgot Password?</h1>
            <p className="text-surface-400">
              No worries! Enter your email and we'll send you reset instructions.
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
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              icon={Mail}
              required
              disabled={loading}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={!email}
            >
              Send Reset Link
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-surface-500">
              Remember your password?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
