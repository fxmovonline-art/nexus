'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginForm() {
  const [userType, setUserType] = useState<'entrepreneur' | 'investor'>('entrepreneur');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Success - store token and redirect
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect based on user type
      if (data.user.userType === 'entrepreneur') {
        window.location.href = '/dashboard/entrepreneur';
      } else {
        window.location.href = '/dashboard/investor';
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoType: 'entrepreneur' | 'investor') => {
    // Demo credentials
    const demoCredentials = {
      entrepreneur: {
        email: 'demo@entrepreneur.com',
        password: 'demo123456',
      },
      investor: {
        email: 'demo@investor.com',
        password: 'demo123456',
      },
    };

    setEmail(demoCredentials[demoType].email);
    setPassword(demoCredentials[demoType].password);
    setUserType(demoType);
  };

  return (
    <div className="w-full max-w-md px-4 sm:px-0">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl">
            🏢
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign in to Business Nexus</h1>
        <p className="text-gray-600">Connect with investors and entrepreneurs</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Type Selection */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">I am a</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setUserType('entrepreneur')}
              className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
                userType === 'entrepreneur'
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              💼 Entrepreneur
            </button>
            <button
              type="button"
              onClick={() => setUserType('investor')}
              className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
                userType === 'investor'
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              📊 Investor
            </button>
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition text-black bg-white"
            required
          />
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition text-black bg-white"
            required
          />
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
            />
            <span className="text-sm text-gray-700">Remember me</span>
          </label>
          <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Forgot your password?
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? '⏳ Signing in...' : '➔ Sign in'}
        </button>

        {/* Demo Accounts */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm bg-white px-2">
            <span className="text-gray-600">Demo Accounts</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleDemoLogin('entrepreneur')}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            👤 Entrepreneur Demo
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('investor')}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            📊 Investor Demo
          </button>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
