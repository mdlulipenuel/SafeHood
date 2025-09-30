import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Bell, Shield, Target, AlertCircle } from 'lucide-react';
import { locationService } from '../utils/locationService';
import type { MonitoringZone } from '../utils/locationService';

interface MonitoringZonesProps {
  authState: any;
}

const MonitoringZones: React.FC<MonitoringZonesProps> = ({ authState }) => {
  const [zones, setZones] = useState<MonitoringZone[]>([]);
  const [showCreateZone, setShowCreateZone] = useState(false);
  const [newZone, setNewZone] = useState({
    name: '',
    radius: 1000,
    alertLevel: 'medium' as 'low' | 'medium' | 'high'
  });
  const [isCreating, setIsCreating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    loadZones();
    getCurrentLocation();
  }, []);

  const loadZones = () => {
    const existingZones = locationService.getMonitoringZones();
    setZones(existingZones);
  };

  const getCurrentLocation = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      setCurrentLocation({ lat: location.lat, lng: location.lng });
    } catch (error) {
      console.error('Failed to get current location:', error);
    }
  };

  const createZone = async () => {
    if (!currentLocation) {
      alert('Current location is required to create a monitoring zone.');
      return;
    }

    setIsCreating(true);
    try {
      const zone = locationService.addMonitoringZone(
        {
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          accuracy: 10,
          timestamp: Date.now()
        },
        newZone.radius,
        newZone.name
      );

      zone.alertLevel = newZone.alertLevel;
      setZones(prev => [...prev, zone]);
      
      // Reset form
      setNewZone({
        name: '',
        radius: 1000,
        alertLevel: 'medium'
      });
      setShowCreateZone(false);
      
      alert(`Monitoring zone "${zone.name}" created successfully!`);
    } catch (error) {
      console.error('Failed to create zone:', error);
      alert('Failed to create monitoring zone. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteZone = (zoneId: string) => {
    if (confirm('Are you sure you want to delete this monitoring zone?')) {
      setZones(prev => prev.filter(zone => zone.id !== zoneId));
      // In a real app, you'd also remove from the service
    }
  };

  const getAlertLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getZoneStats = (_zone: MonitoringZone) => {
    // Mock stats - in production, this would query real incident data
    const mockIncidents = Math.floor(Math.random() * 20);
    const mockSafetyScore = Math.floor(Math.random() * 40) + 60;
    const mockTrend = ['improving', 'stable', 'worsening'][Math.floor(Math.random() * 3)];
    
    return {
      incidents: mockIncidents,
      safetyScore: mockSafetyScore,
      trend: mockTrend as 'improving' | 'stable' | 'worsening'
    };
  };

  if (!authState.isAuthenticated) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Sign In Required</h3>
        <p className="text-gray-600">Please sign in to create and manage monitoring zones.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monitoring Zones</h2>
          <p className="text-gray-600">Create custom areas to monitor for safety incidents</p>
        </div>
        <button
          onClick={() => setShowCreateZone(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Zone</span>
        </button>
      </div>

      {/* Create Zone Modal */}
      {showCreateZone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create Monitoring Zone</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zone Name</label>
                <input
                  type="text"
                  value={newZone.name}
                  onChange={(e) => setNewZone(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., My Neighborhood, Work Area"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Radius: {newZone.radius}m ({(newZone.radius / 1000).toFixed(1)}km)
                </label>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={newZone.radius}
                  onChange={(e) => setNewZone(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alert Level</label>
                <select
                  value={newZone.alertLevel}
                  onChange={(e) => setNewZone(prev => ({ ...prev, alertLevel: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low - Minor incidents only</option>
                  <option value="medium">Medium - All incidents</option>
                  <option value="high">High - All incidents + trend alerts</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Current Location</p>
                    <p className="text-xs text-blue-600">
                      {currentLocation 
                        ? `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`
                        : 'Getting location...'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={createZone}
                disabled={!newZone.name || !currentLocation || isCreating}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isCreating ? 'Creating...' : 'Create Zone'}
              </button>
              <button
                onClick={() => setShowCreateZone(false)}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zones List */}
      {zones.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Monitoring Zones</h3>
          <p className="text-gray-600 mb-4">Create your first monitoring zone to start tracking safety in areas you care about.</p>
          <button
            onClick={() => setShowCreateZone(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Zone
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {zones.map((zone) => {
            const stats = getZoneStats(zone);
            return (
              <div key={zone.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{zone.name}</h3>
                    <p className="text-sm text-gray-600">
                      {(zone.radius / 1000).toFixed(1)}km radius
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => deleteZone(zone.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Alert Level</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertLevelColor(zone.alertLevel)}`}>
                      {zone.alertLevel.charAt(0).toUpperCase() + zone.alertLevel.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">{stats.safetyScore}</div>
                      <div className="text-xs text-gray-600">Safety Score</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-orange-600">{stats.incidents}</div>
                      <div className="text-xs text-gray-600">Recent Incidents</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Trend</span>
                    <div className="flex items-center space-x-1">
                      {stats.trend === 'improving' && <span className="text-green-600">↗ Improving</span>}
                      {stats.trend === 'stable' && <span className="text-blue-600">→ Stable</span>}
                      {stats.trend === 'worsening' && <span className="text-red-600">↘ Worsening</span>}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Created</span>
                      <span className="text-gray-900">
                        {new Date(zone.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="w-full bg-blue-50 text-blue-700 py-2 px-4 rounded-md hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2">
                    <Bell className="w-4 h-4" />
                    <span>Configure Alerts</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Premium Features Notice */}
      {!authState.user?.isPremium && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Upgrade to Premium</h3>
              <p className="text-purple-100 mb-4">
                Get unlimited monitoring zones, real-time alerts, advanced analytics, and priority support.
              </p>
              <button className="bg-white text-purple-600 px-6 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
                Upgrade Now - $9.99/month
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitoringZones;
