import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Shield, ArrowLeft } from 'lucide-react';
import { authService } from '../utils/authService';
import CameraVerification from './CameraVerification';
import type { LoginCredentials, SignupData } from '../utils/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

type AuthView = 'login' | 'signup' | 'reset' | 'verification';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  // Login form state
  const [loginData, setLoginData] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false
  });

  // Signup form state
  const [signupData, setSignupData] = useState<SignupData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  // Reset form state
  const [resetEmail, setResetEmail] = useState('');

  const resetForms = () => {
    setLoginData({ email: '', password: '', rememberMe: false });
    setSignupData({ name: '', email: '', password: '', confirmPassword: '', agreeToTerms: false });
    setResetEmail('');
    setError(null);
    setSuccessMessage(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await authService.login(loginData);
    
    if (result.success) {
      handleClose();
      onAuthSuccess();
    } else {
      setError(result.error || 'Login failed');
    }
    
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await authService.signup(signupData);
    
    if (result.success && result.user) {
      // Store user ID for verification
      setPendingUserId(result.user.id);
      setCurrentView('verification');
      setSuccessMessage('Account created! Please complete identity verification.');
    } else {
      setError(result.error || 'Signup failed');
    }
    
    setLoading(false);
  };

  const handleVerificationComplete = async (success: boolean, confidence: number) => {
    if (success && confidence > 0.7) {
      // Update user verification status
      if (pendingUserId) {
        await authService.updateUserVerification(pendingUserId, true);
      }
      handleClose();
      onAuthSuccess();
    } else {
      setError('Identity verification failed. Please try again or contact support.');
      setCurrentView('signup');
    }
    setPendingUserId(null);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await authService.resetPassword({ email: resetEmail });
    
    if (result.success) {
      setSuccessMessage('Password reset instructions sent to your email');
      setResetEmail('');
    } else {
      setError(result.error || 'Password reset failed');
    }
    
    setLoading(false);
  };

  const switchView = (view: AuthView) => {
    setCurrentView(view);
    setError(null);
    setSuccessMessage(null);
  };

  if (!isOpen) return null;

  // Render camera verification
  if (currentView === 'verification' && pendingUserId) {
    return (
      <CameraVerification
        userId={pendingUserId}
        onVerificationComplete={handleVerificationComplete}
        onClose={() => {
          setPendingUserId(null);
          setCurrentView('signup');
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {currentView === 'login' && 'Welcome Back'}
                {currentView === 'signup' && 'Join SafeHood'}
                {currentView === 'reset' && 'Reset Password'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Subtitle */}
          <div className="text-center mb-6">
            <p className="text-sm sm:text-base text-gray-600">
              {currentView === 'login' && 'Sign in to your SafeHood account'}
              {currentView === 'signup' && 'Create your account to get started'}
              {currentView === 'reset' && 'We\'ll send you a reset link'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

          {/* Login Form */}
          {currentView === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-3 py-3 sm:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 sm:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={loginData.rememberMe}
                    onChange={(e) => setLoginData({...loginData, rememberMe: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => switchView('reset')}
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold text-sm sm:text-base shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              <div className="text-center">
                <span className="text-sm text-gray-600">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => switchView('signup')}
                  className="text-sm text-blue-600 hover:text-blue-500 font-semibold"
                >
                  Create one
                </button>
              </div>
            </form>
          )}

          {/* Signup Form */}
          {currentView === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={signupData.name}
                    onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-3 py-3 sm:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-3 py-3 sm:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signupData.password}
                    onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                    placeholder="Create a password"
                    className="w-full pl-10 pr-12 py-3 sm:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-12 py-3 sm:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={signupData.agreeToTerms}
                    onChange={(e) => setSignupData({...signupData, agreeToTerms: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1 flex-shrink-0"
                    required
                  />
                  <span className="text-sm text-gray-600 leading-relaxed">
                    I agree to SafeHood's{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">Privacy Policy</a>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold text-sm sm:text-base shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              <div className="text-center">
                <span className="text-sm text-gray-600">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="text-sm text-blue-600 hover:text-blue-500 font-semibold"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}

          {/* Password Reset Form */}
          {currentView === 'reset' && (
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to sign in
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Enter your email address and we'll send you a secure link to reset your password.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-3 py-3 sm:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold text-sm sm:text-base shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}

          {/* Demo Credentials */}
          {(currentView === 'login' || currentView === 'signup') && (
            <div className="mt-6 sm:mt-8 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Demo Accounts (For Testing)
              </h4>
              <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg p-2">
                  <div>
                    <span className="font-medium text-blue-600">Basic User:</span>
                    <span className="ml-1">john.doe@example.com</span>
                  </div>
                  <span className="text-gray-500 text-xs">password123</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg p-2">
                  <div>
                    <span className="font-medium text-yellow-600">Premium User:</span>
                    <span className="ml-1">jane.smith@example.com</span>
                  </div>
                  <span className="text-gray-500 text-xs">password123</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg p-2">
                  <div>
                    <span className="font-medium text-purple-600">Professional:</span>
                    <span className="ml-1">admin@safehood.com</span>
                  </div>
                  <span className="text-gray-500 text-xs">password123</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
