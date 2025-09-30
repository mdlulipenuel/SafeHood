import React, { useState } from 'react';
import { User, LogOut, Settings, Shield, Star, CreditCard, Bell, Eye, Camera, MapPin } from 'lucide-react';
import AuthModal from './AuthModal';
import type { AuthState } from '../utils/authService';

interface ProfileManagerProps {
  authState: AuthState;
  onLogout: () => void;
  onAuthSuccess: () => void;
}

const ProfileManager: React.FC<ProfileManagerProps> = ({ authState, onLogout, onAuthSuccess }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'subscription' | 'security'>('profile');

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
  };

  const handleAuthSuccess = () => {
    onAuthSuccess();
    setShowAuthModal(false);
  };

  // If user is not authenticated, show login/register interface
  if (!authState.isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Welcome to SafeHood</h2>
            <p className="text-sm sm:text-base text-gray-600">Sign in to access your safety dashboard and community features</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg text-sm sm:text-base"
            >
              Sign In / Register
            </button>

            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500">
                Join thousands of community members keeping neighborhoods safe
              </p>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Why Join SafeHood?</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700">Report and track safety incidents</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700">Get real-time safety alerts</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700">Monitor your neighborhood zones</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700">Access premium analytics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Modal */}
        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={handleAuthModalClose}
            onAuthSuccess={handleAuthSuccess}
          />
        )}
      </div>
    );
  }

  // Authenticated user profile interface
  const { user } = authState;
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">{user?.name}</h3>
                  <p className="text-sm sm:text-base text-gray-600 truncate">{user?.email}</p>
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user?.isPremium 
                        ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user?.isPremium ? '⭐ Premium Member' : 'Free Member'}
                    </span>
                    {user?.identityVerified && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 border border-gray-100">
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">12</p>
                    <p className="text-xs sm:text-sm text-gray-600">Reports Filed</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 border border-gray-100">
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">3</p>
                    <p className="text-xs sm:text-sm text-gray-600">Active Zones</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Recent Activity</h4>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">Reported suspicious activity</p>
                    <p className="text-xs text-gray-600">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">Updated monitoring zone</p>
                    <p className="text-xs text-gray-600">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Notification Preferences</h4>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start justify-between space-x-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium text-gray-900">Safety Alerts</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Get notified about incidents in your area</p>
                  </div>
                  <div className="flex-shrink-0">
                    <input type="checkbox" defaultChecked className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="flex items-start justify-between space-x-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium text-gray-900">Email Notifications</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Receive weekly safety reports</p>
                  </div>
                  <div className="flex-shrink-0">
                    <input type="checkbox" defaultChecked className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="flex items-start justify-between space-x-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium text-gray-900">Push Notifications</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Instant alerts on your device</p>
                  </div>
                  <div className="flex-shrink-0">
                    <input type="checkbox" defaultChecked className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Privacy Settings</h4>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start justify-between space-x-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium text-gray-900">Location Sharing</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Share location for better safety insights</p>
                  </div>
                  <div className="flex-shrink-0">
                    <input type="checkbox" defaultChecked className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="flex items-start justify-between space-x-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium text-gray-900">Profile Visibility</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Show your profile to community members</p>
                  </div>
                  <div className="flex-shrink-0">
                    <input type="checkbox" className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'subscription':
        return (
          <div className="space-y-4 sm:space-y-6">
            {user?.isPremium ? (
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4 sm:p-6 border border-yellow-200">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 flex-shrink-0" />
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900">Premium Member</h4>
                </div>
                <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">You're enjoying all premium features!</p>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                  <p>• Advanced analytics and insights</p>
                  <p>• Priority safety alerts</p>
                  <p>• Unlimited monitoring zones</p>
                  <p>• Professional community features</p>
                </div>
                <button className="w-full sm:w-auto bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium hover:from-yellow-700 hover:to-yellow-800 transition-all duration-200 text-sm sm:text-base">
                  Manage Subscription
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-blue-200">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900">Upgrade to Premium</h4>
                </div>
                <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">Unlock advanced safety features for your community</p>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                  <p>• Advanced analytics and trend insights</p>
                  <p>• Priority safety alerts and notifications</p>
                  <p>• Unlimited custom monitoring zones</p>
                  <p>• Professional community networking</p>
                  <p>• Data export and reporting tools</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <button className="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm sm:text-base">
                    Upgrade Now - $9.99/month
                  </button>
                  <button className="w-full sm:w-auto text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base py-2">
                    Learn More
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'security':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Identity Verification</h4>
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {user?.identityVerified ? (
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  ) : (
                    <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-sm sm:text-base font-medium text-gray-900">
                    {user?.identityVerified ? 'Identity Verified' : 'Verify Your Identity'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {user?.identityVerified 
                      ? 'Your identity has been verified for enhanced security' 
                      : 'Complete identity verification for trusted community access'
                    }
                  </p>
                </div>
                {!user?.identityVerified && (
                  <button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm">
                    Verify Now
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Account Security</h4>
              <div className="space-y-2 sm:space-y-3">
                <button className="w-full text-left p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <p className="text-sm sm:text-base font-medium text-gray-900">Change Password</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Update your account password</p>
                </button>
                <button className="w-full text-left p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <p className="text-sm sm:text-base font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Add extra security to your account</p>
                </button>
                <button className="w-full text-left p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <p className="text-sm sm:text-base font-medium text-gray-900">Login History</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">View recent account activity</p>
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      {/* Profile Header */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Profile</h2>
        <p className="text-sm sm:text-base text-gray-600">Manage your account, preferences, and security settings</p>
      </div>

      {/* Tab Navigation - Mobile Optimized */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6 overflow-hidden">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 min-w-0 flex-1 sm:flex-none ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-b-2 border-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content - Mobile Optimized */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>

      {/* Logout Section - Mobile Optimized */}
      <div className="mt-6 sm:mt-8 bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="text-center sm:text-left">
            <h4 className="text-lg font-semibold text-gray-900">Account Actions</h4>
            <p className="text-sm text-gray-600">Manage your account status</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-medium hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileManager;
