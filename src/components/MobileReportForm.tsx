import React, { useState, useEffect } from 'react';
import { MapPin, Camera, Image as ImageIcon, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { DataManager } from '../utils/dataManager';
import { NativeFeatures } from '../utils/nativeFeatures';
import { locationService } from '../utils/locationService';
import type { SafetyIncident } from '../utils/dataManager';

const MobileReportForm: React.FC = () => {
  const [formData, setFormData] = useState({
    type: 'theft' as SafetyIncident['type'],
    address: '',
    description: '',
    severity: 'medium' as SafetyIncident['severity']
  });
  
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationVerification, setLocationVerification] = useState<{
    allowed: boolean;
    distance: number;
    accuracy: number;
    message: string;
  } | null>(null);

  // Request permissions on component mount
  useEffect(() => {
    const requestPermissions = async () => {
      if (NativeFeatures.isNative()) {
        await NativeFeatures.requestLocationPermissions();
        await NativeFeatures.requestCameraPermissions();
        await NativeFeatures.requestNotificationPermissions();
      }
    };
    requestPermissions();
  }, []);

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const currentLocation = await NativeFeatures.getCurrentLocation();
      if (currentLocation) {
        setLocation(currentLocation);
        
        // Verify location for reporting
        const verification = await locationService.verifyReportingLocation(
          currentLocation.lat,
          currentLocation.lng
        );
        setLocationVerification(verification);
        
        // Auto-fill address if possible
        try {
          // Note: Reverse geocoding would be implemented here
          // const addressResult = await NativeFeatures.reverseGeocode(currentLocation.lat, currentLocation.lng);
          // if (addressResult) {
          //   setFormData(prev => ({ ...prev, address: addressResult }));
          // }
        } catch (error) {
          console.warn('Reverse geocoding failed:', error);
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Unable to get your location. Please enter the address manually.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const takePhoto = async () => {
    setIsTakingPhoto(true);
    try {
      const photo = await NativeFeatures.takePhoto();
      if (photo) {
        setPhotos(prev => [...prev, photo]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      alert('Unable to take photo. Please try again.');
    } finally {
      setIsTakingPhoto(false);
    }
  };

  const selectFromGallery = async () => {
    setIsTakingPhoto(true);
    try {
      const photo = await NativeFeatures.selectFromGallery();
      if (photo) {
        setPhotos(prev => [...prev, photo]);
      }
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      alert('Unable to select photo. Please try again.');
    } finally {
      setIsTakingPhoto(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location) {
      alert('Please get your current location first.');
      return;
    }

    if (locationVerification?.allowed === false) {
      alert('Location verification failed. You can only report incidents near your current location.');
      return;
    }

    setIsSubmitting(true);

    try {
      const incidentData = {
        type: formData.type,
        address: formData.address,
        description: formData.description,
        severity: formData.severity,
        location: {
          lat: location.lat,
          lng: location.lng
        },
        verified: false,
        reporterId: 'user123', // In real app, get from auth
        images: photos
      };

      DataManager.addIncident(incidentData);

      // Show native notification if available
      if (NativeFeatures.isNative()) {
        await NativeFeatures.showImmediateNotification(
          'Incident Reported',
          `Your ${formData.type} report has been submitted successfully.`
        );
      }

      // Reset form
      setFormData({
        type: 'theft',
        address: '',
        description: '',
        severity: 'medium'
      });
      setPhotos([]);
      setLocation(null);
      setLocationVerification(null);

      alert('Incident reported successfully!');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-6 px-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Report Safety Incident
          </h2>
          <p className="text-gray-600 text-base">Help keep your neighborhood safe and secure</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-all duration-300">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              Location Details
            </h3>
            
            <div className="space-y-4">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isGettingLocation ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <MapPin className="w-5 h-5" />
                )}
                <span>
                  {isGettingLocation ? 'Getting Location...' : 'Use Current Location'}
                </span>
              </button>

              {/* Location Verification Status */}
              {locationVerification && (
                <div className={`p-4 rounded-xl border-2 text-base font-medium ${
                  locationVerification.allowed 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800 shadow-green-100' 
                    : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800 shadow-red-100'
                } shadow-lg`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      locationVerification.allowed ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {locationVerification.allowed ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </div>
                    <span className="font-semibold">
                      {locationVerification.message}
                    </span>
                  </div>
                  {locationVerification.distance >= 0 && (
                    <p className="text-sm mt-2 opacity-80 bg-white/50 rounded-lg p-2">
                      📍 Distance: {locationVerification.distance}m | Accuracy: ±{locationVerification.accuracy}m
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Enter the incident location"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-gray-900 placeholder-gray-500 text-base font-medium bg-gray-50 focus:bg-white transition-all duration-300"
                  required
                />
              </div>

              {location && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-green-800 text-base">GPS Location Confirmed</p>
                      <p className="text-sm text-green-600 mt-1 font-mono bg-white/50 rounded-lg px-2 py-1">
                        📍 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Incident Details */}
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6 hover:shadow-xl transition-all duration-300">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              Incident Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">Incident Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as SafetyIncident['type']})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-gray-900 text-base font-medium bg-gray-50 focus:bg-white transition-all duration-300"
                >
                  <option value="theft">🔒 Theft</option>
                  <option value="vandalism">🏠 Vandalism</option>
                  <option value="suspicious">👀 Suspicious Activity</option>
                  <option value="emergency">🚨 Emergency</option>
                  <option value="other">📝 Other</option>
                </select>
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">Severity Level</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({...formData, severity: e.target.value as SafetyIncident['severity']})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-gray-900 text-base font-medium bg-gray-50 focus:bg-white transition-all duration-300"
                >
                  <option value="low">🟢 Low Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="high">🔴 High Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe what happened in detail..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-gray-900 placeholder-gray-500 resize-none text-base bg-gray-50 focus:bg-white transition-all duration-300"
                  required
                />
              </div>
            </div>
          </div>

          {/* Photos Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 hover:shadow-xl transition-all duration-300">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Camera className="w-4 h-4 text-white" />
              </div>
              Photo Evidence 
              <span className="ml-2 text-sm text-gray-500 font-normal bg-gray-100 px-2 py-1 rounded-full">(Optional)</span>
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={takePhoto}
                  disabled={isTakingPhoto}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isTakingPhoto ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                  <span>Take Photo</span>
                </button>

                <button
                  type="button"
                  onClick={selectFromGallery}
                  disabled={isTakingPhoto}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <ImageIcon className="w-5 h-5" />
                  <span>Gallery</span>
                </button>
              </div>

              {photos.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    📸 {photos.length} Photo{photos.length !== 1 ? 's' : ''} Added
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg shadow-md border-2 border-white"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
            <button
              type="submit"
              disabled={isSubmitting || (locationVerification?.allowed === false)}
              className={`w-full py-4 px-6 rounded-xl transition-all duration-300 font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                locationVerification?.allowed === false
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Submitting Report...</span>
                </>
              ) : locationVerification?.allowed === false ? (
                <>
                  <AlertTriangle className="w-6 h-6" />
                  <span>Location Verification Required</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6" />
                  <span>Submit Safety Report</span>
                </>
              )}
            </button>
            
            {/* Privacy Notice */}
            <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
              🔒 Your report is securely encrypted and helps improve neighborhood safety.
              <br />
              Personal information is protected according to our privacy policy.
            </p>
          </div>
        </form>

        {/* Platform Info */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 text-center">
          <p className="text-sm text-gray-600 font-medium">
            Platform: <span className="text-blue-600 font-bold">{NativeFeatures.getPlatform()}</span> | 
            Native: <span className="text-green-600 font-bold">{NativeFeatures.isNative() ? 'Yes' : 'No'}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileReportForm;
