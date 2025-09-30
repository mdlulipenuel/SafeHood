import React, { useState } from 'react';
import { User, Shield, TestTube, UserPlus, LogIn } from 'lucide-react';
import { authService } from '../utils/authService';
import type { AuthState } from '../utils/authService';

interface AuthTestingProps {
  onShowAuth: () => void;
  authState: AuthState;
}

const AuthTesting: React.FC<AuthTestingProps> = ({ onShowAuth, authState }) => {
  const [quickTestMode, setQuickTestMode] = useState(false);

  // Demo users for testing
  const demoUsers = [
    {
      email: 'john.doe@example.com',
      password: 'demo123',
      name: 'John Doe',
      type: 'Regular User'
    },
    {
      email: 'jane.premium@example.com', 
      password: 'demo123',
      name: 'Jane Smith',
      type: 'Premium User'
    },
    {
      email: 'pro.user@example.com',
      password: 'demo123', 
      name: 'Professional User',
      type: 'Professional'
    }
  ];

  const handleQuickLogin = async (email: string, password: string) => {
    const result = await authService.login({ email, password, rememberMe: true });
    if (result.success) {
      setQuickTestMode(false);
    } else {
      alert(`Login failed: ${result.error}`);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  if (authState.isAuthenticated && authState.user) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
              <User className="w-4 h-4 text-white" />
            </div>
            Authentication Status
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-600">Authenticated</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {authState.user.name.charAt(0)}
              </span>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">{authState.user.name}</h4>
              <p className="text-sm text-gray-600">{authState.user.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white/50 rounded-lg p-2">
              <span className="text-gray-600">Status:</span>
              <span className="ml-1 font-semibold text-blue-600 capitalize">
                {authState.user.subscriptionStatus}
              </span>
            </div>
            <div className="bg-white/50 rounded-lg p-2">
              <span className="text-gray-600">Reports:</span>
              <span className="ml-1 font-semibold text-purple-600">
                {authState.user.reportsSubmitted}
              </span>
            </div>
            <div className="bg-white/50 rounded-lg p-2">
              <span className="text-gray-600">Score:</span>
              <span className="ml-1 font-semibold text-green-600">
                {authState.user.communityScore}
              </span>
            </div>
            <div className="bg-white/50 rounded-lg p-2">
              <span className="text-gray-600">Verified:</span>
              <span className={`ml-1 font-semibold ${authState.user.identityVerified ? 'text-green-600' : 'text-orange-600'}`}>
                {authState.user.identityVerified ? '✓ Yes' : '⏳ Pending'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleLogout}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4 rotate-180" />
            Logout
          </button>
          <button
            onClick={() => setQuickTestMode(!quickTestMode)}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <TestTube className="w-4 h-4" />
            Switch User
          </button>
        </div>

        {quickTestMode && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h5 className="font-semibold text-gray-900 mb-3">🔄 Switch to Demo User:</h5>
            <div className="space-y-2">
              {demoUsers.map((user, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickLogin(user.email, user.password)}
                  className="w-full text-left bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition-colors"
                >
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email} • {user.type}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
            <Shield className="w-4 h-4 text-white" />
          </div>
          Authentication Required
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span className="text-sm font-medium text-orange-600">Not Authenticated</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 mb-4">
        <p className="text-gray-700 mb-3">
          🔐 To test all SafeHood features like reporting incidents, viewing analytics, and managing zones, 
          you need to be authenticated.
        </p>
        
        <div className="text-sm text-gray-600 mb-3">
          <strong>Available options:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Quick demo login with pre-configured users</li>
            <li>Create a new account with full registration</li>
            <li>Use existing credentials if you have an account</li>
          </ul>
        </div>
      </div>

      {/* Quick Demo Section */}
      <div className="mb-4">
        <button
          onClick={() => setQuickTestMode(!quickTestMode)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 mb-3"
        >
          <TestTube className="w-5 h-5" />
          {quickTestMode ? 'Hide Demo Users' : 'Quick Demo Login'}
        </button>

        {quickTestMode && (
          <div className="space-y-3">
            <h5 className="font-semibold text-gray-900">🚀 Demo Users (Click to login):</h5>
            {demoUsers.map((user, index) => (
              <button
                key={index}
                onClick={() => handleQuickLogin(user.email, user.password)}
                className="w-full text-left bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl p-4 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 group-hover:text-blue-600">
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className="text-xs text-blue-600 font-medium">{user.type}</div>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center">
                    <LogIn className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Full Authentication Options */}
      <div className="space-y-3">
        <button
          onClick={onShowAuth}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Sign Up / Login
        </button>

        <div className="text-center">
          <span className="text-xs text-gray-500">
            🔒 Secure authentication with identity verification
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthTesting;
