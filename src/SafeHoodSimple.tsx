import React from 'react';
import { Shield, MapIcon, BarChart3, User, Plus } from 'lucide-react';
import BasicMap from './components/BasicMap';

const SafeHoodSimple: React.FC = () => {
  // const [currentView, setCurrentView] = useState<'map' | 'report' | 'analytics' | 'profile'>('map');

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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Neighborhood Safety Tracker</h2>
          <p className="text-gray-600 mb-6">Track and report safety incidents in your neighborhood.</p>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">Safety Score</p>
                  <p className="text-2xl font-bold text-blue-600">8.4</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">This Week</p>
                  <p className="text-2xl font-bold text-green-600">3</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center">
                <MapIcon className="w-8 h-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-800">Total Reports</p>
                  <p className="text-2xl font-bold text-yellow-600">247</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <User className="w-8 h-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-800">Verified</p>
                  <p className="text-2xl font-bold text-purple-600">89%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Safety Map</h3>
            <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ height: '400px' }}>
              <BasicMap />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:hidden">
        <div className="grid grid-cols-4">
          <button className="flex flex-col items-center justify-center py-3 text-xs font-medium text-blue-600 bg-blue-50">
            <MapIcon className="w-5 h-5 mb-1" />
            <span>Map</span>
          </button>
          <button className="flex flex-col items-center justify-center py-3 text-xs font-medium text-gray-600">
            <Plus className="w-5 h-5 mb-1" />
            <span>Report</span>
          </button>
          <button className="flex flex-col items-center justify-center py-3 text-xs font-medium text-gray-600">
            <BarChart3 className="w-5 h-5 mb-1" />
            <span>Analytics</span>
          </button>
          <button className="flex flex-col items-center justify-center py-3 text-xs font-medium text-gray-600">
            <User className="w-5 h-5 mb-1" />
            <span>Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default SafeHoodSimple;
