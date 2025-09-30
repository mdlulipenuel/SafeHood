import React, { useState, useEffect } from 'react';
import { Shield, MapIcon, BarChart3, Bell, User, Plus, Filter, Settings } from 'lucide-react';
import AdvancedSafetyMap from './components/AdvancedSafetyMap';
import MobileReportForm from './components/MobileReportForm';
import ProfileManager from './components/ProfileManager';
import MonitoringZones from './components/MonitoringZones';
import { DataManager } from './utils/dataManager';
import { authService } from './utils/authService';
import { locationService } from './utils/locationService';
import type { SafetyIncident } from './utils/dataManager';
import type { AuthState } from './utils/authService';

const SafeHoodApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<'map' | 'report' | 'analytics' | 'zones' | 'profile'>('map');
  const [selectedIncident, setSelectedIncident] = useState<SafetyIncident | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    severity: '',
    verified: undefined as boolean | undefined
  });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [authState, setAuthState] = useState<AuthState>({ 
    isAuthenticated: false, 
    user: null, 
    loading: true, 
    error: null 
  });
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Load neighborhood stats
  useEffect(() => {
    const neighborhoodStats = DataManager.getNeighborhoodStats();
    setStats(neighborhoodStats);
  }, []);

  // Initialize authentication
  useEffect(() => {
    const initAuth = async () => {
      const currentState = authService.getAuthState();
      setAuthState(currentState);
    };
    initAuth();
  }, []);

  // Initialize location services
  useEffect(() => {
    const initLocation = async () => {
      try {
        await locationService.startLocationWatching();
        const location = await locationService.getCurrentLocation();
        setUserLocation({ lat: location.lat, lng: location.lng });
        
        // Create default monitoring zone if user is authenticated
        if (authState.isAuthenticated) {
          await locationService.createDefaultMonitoringZone();
        }
      } catch (error) {
        console.error('Location initialization failed:', error);
      }
    };
    
    initLocation();
    locationService.loadMonitoringZones();

    return () => {
      locationService.stopLocationWatching();
    };
  }, [authState.isAuthenticated]);

  // Handle authentication
  const handleLogout = async () => {
    await authService.logout();
    setAuthState(authService.getAuthState());
  };

  const handleAuthSuccess = async () => {
    const currentState = authService.getAuthState();
    setAuthState(currentState);
  };

  // Handle incident click from map
  const handleIncidentClick = (incident: SafetyIncident) => {
    setSelectedIncident(incident);
  };

  // Navigation items
  const navItems = [
    { id: 'map', icon: MapIcon, label: 'Map', view: 'map' },
    { id: 'report', icon: Plus, label: 'Report', view: 'report' },
    { id: 'zones', icon: Shield, label: 'Zones', view: 'zones' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', view: 'analytics' },
    { id: 'profile', icon: User, label: 'Profile', view: 'profile' }
  ];

  // Render different views
  const renderView = () => {
    switch (currentView) {
      case 'map':
        return (
          <div className="h-full flex flex-col">
            {/* Map Controls */}
            <div className="bg-white shadow-sm border-b p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Safety Map</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={filters.type}
                        onChange={(e) => setFilters({...filters, type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">All Types</option>
                        <option value="theft">Theft</option>
                        <option value="vandalism">Vandalism</option>
                        <option value="suspicious">Suspicious Activity</option>
                        <option value="emergency">Emergency</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                      <select
                        value={filters.severity}
                        onChange={(e) => setFilters({...filters, severity: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">All Severities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={filters.verified === undefined ? '' : filters.verified ? 'verified' : 'unverified'}
                        onChange={(e) => setFilters({
                          ...filters, 
                          verified: e.target.value === '' ? undefined : e.target.value === 'verified'
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">All Status</option>
                        <option value="verified">Verified</option>
                        <option value="unverified">Unverified</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Summary */}
              {stats && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-600">{stats.safetyScore}</div>
                    <div className="text-sm text-blue-800">Safety Score</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">{stats.weeklyIncidents}</div>
                    <div className="text-sm text-green-800">This Week</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-yellow-600">{stats.verifiedPercentage}%</div>
                    <div className="text-sm text-yellow-800">Verified</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-600">{stats.totalIncidents}</div>
                    <div className="text-sm text-purple-800">Total Reports</div>
                  </div>
                </div>
              )}
            </div>

            {/* Map Container */}
            <div className="flex-1 relative">
              <AdvancedSafetyMap
                onIncidentClick={handleIncidentClick}
                filters={filters}
              />

              {/* Location Status Indicator */}
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-2 z-30">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${userLocation ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-gray-600">
                    {userLocation ? 'Location Active' : 'No Location'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'report':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Report Incident</h2>
            <MobileReportForm />
          </div>
        );

      case 'analytics':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h2>
            <AnalyticsDashboard stats={stats} />
          </div>
        );

      case 'zones':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Monitoring Zones</h2>
            <MonitoringZones authState={authState} />
          </div>
        );

      case 'profile':
        return (
          <div className="p-6">
            <ProfileManager 
              authState={authState}
              onLogout={handleLogout}
              onAuthSuccess={handleAuthSuccess}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">SafeHood</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.view as any)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === item.view
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <Bell className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-900" />
              <Settings className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-900" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-8rem)]">
          {renderView()}
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 pb-safe" style={{ minHeight: '64px', paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
        <div className="grid grid-cols-5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.view as any)}
              className={`flex flex-col items-center justify-center py-3 text-xs font-medium transition-colors ${
                currentView === item.view
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{ minHeight: '60px' }}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <IncidentModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}

    </div>
  );
};

// Analytics Dashboard Component
const AnalyticsDashboard: React.FC<{ stats: any }> = ({ stats }) => {
  if (!stats) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Safety Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.safetyScore}/10</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Incidents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalIncidents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Bell className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{stats.weeklyIncidents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <User className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-gray-900">{stats.verifiedPercentage}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Incident Types</h3>
          <div className="space-y-3">
            {Object.entries(stats.typeBreakdown).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{type}</span>
                <span className="text-sm font-medium text-gray-900">{count as number}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Severity Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(stats.severityBreakdown).map(([severity, count]) => (
              <div key={severity} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{severity}</span>
                <span className="text-sm font-medium text-gray-900">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Incident Detail Modal
const IncidentModal: React.FC<{ incident: SafetyIncident; onClose: () => void }> = ({ incident, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-gray-900 capitalize">
              {incident.type} Incident
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-700">Location:</span>
              <p className="text-sm text-gray-900">{incident.address}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-700">Time:</span>
              <p className="text-sm text-gray-900">
                {incident.timestamp.toLocaleDateString()} at {incident.timestamp.toLocaleTimeString()}
              </p>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-700">Description:</span>
              <p className="text-sm text-gray-900">{incident.description}</p>
            </div>

            <div className="flex justify-between items-center pt-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                incident.severity === 'high' 
                  ? 'bg-red-100 text-red-800' 
                  : incident.severity === 'medium' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {incident.severity} severity
              </span>
              
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                incident.verified 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {incident.verified ? '✓ Verified' : 'Unverified'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafeHoodApp;
