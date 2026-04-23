'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterForm() {
  const [userType, setUserType] = useState<'entrepreneur' | 'investor'>('entrepreneur');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (!agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);

    try {
      // Call the registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: fullName.split(' ')[0],
          lastName: fullName.split(' ').slice(1).join(' ') || 'User',
          email,
          password,
          userType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      // Success - store token and redirect
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect based on userType
      if (userType === 'investor') {
        window.location.href = '/dashboard/investor';
      } else {
        window.location.href = '/dashboard/entrepreneur';
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-4 sm:px-0">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl">
            🏢
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
        <p className="text-gray-600">Join Business Nexus to connect with partners</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Type Selection */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">I am registering as a</p>
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

        {/* Full Name Field */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition text-black bg-white"
            required
          />
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

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition text-black bg-white"
            required
          />
        </div>

        {/* Terms & Privacy */}
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-600 mt-1"
            required
          />
          <span className="text-sm text-gray-700">
            I agree to the{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
              Privacy Policy
            </Link>
          </span>
        </label>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Create Account Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
