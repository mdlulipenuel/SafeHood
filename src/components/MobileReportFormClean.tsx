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
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location Section */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 text-blue-600 mr-3" />
            Location Details
          </h3>
          
          <div className="space-y-4">
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              <div className={`p-3 border rounded-md ${
                locationVerification.allowed 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  {locationVerification.allowed ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                  <span className="font-medium">
                    {locationVerification.message}
                  </span>
                </div>
                {locationVerification.distance >= 0 && (
                  <p className="text-sm mt-2 opacity-75">
                    Distance: {locationVerification.distance}m | Accuracy: ±{locationVerification.accuracy}m
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Enter the incident location"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {location && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">GPS Location Confirmed</p>
                    <p className="text-sm text-green-600 mt-1">
                      📍 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Incident Details */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
            Incident Details
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Incident Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as SafetyIncident['type']})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="theft">🔒 Theft</option>
                <option value="vandalism">🏠 Vandalism</option>
                <option value="suspicious">👀 Suspicious Activity</option>
                <option value="emergency">🚨 Emergency</option>
                <option value="other">📝 Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({...formData, severity: e.target.value as SafetyIncident['severity']})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe what happened in detail..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Photos Section */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Camera className="w-5 h-5 text-purple-600 mr-3" />
            Photos <span className="ml-2 text-sm text-gray-500 font-normal">(Optional)</span>
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={takePhoto}
                disabled={isTakingPhoto}
                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ImageIcon className="w-5 h-5" />
                <span>From Gallery</span>
              </button>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-20 object-cover rounded-md border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || (locationVerification?.allowed === false)}
          className={`w-full py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2 ${
            locationVerification?.allowed === false
              ? 'bg-gray-500 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Submitting Report...</span>
            </>
          ) : locationVerification?.allowed === false ? (
            <>
              <AlertTriangle className="w-5 h-5" />
              <span>Location Verification Required</span>
            </>
          ) : (
            <span>Submit Incident Report</span>
          )}
        </button>
      </form>

      {/* Platform Info */}
      <div className="bg-white rounded-lg shadow-xl p-4 text-center">
        <p className="text-sm text-gray-600">
          Platform: <span className="text-blue-600 font-medium">{NativeFeatures.getPlatform()}</span> | 
          Native: <span className="text-green-600 font-medium">{NativeFeatures.isNative() ? 'Yes' : 'No'}</span>
        </p>
      </div>
    </div>
  );
};

export default MobileReportForm;
