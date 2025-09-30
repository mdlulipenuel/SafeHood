import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { LocalNotifications } from '@capacitor/local-notifications';

export class NativeFeatures {
  // Geolocation Services
  static async getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
    try {
      const position = await Geolocation.getCurrentPosition();
      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  static async requestLocationPermissions(): Promise<boolean> {
    try {
      const status = await Geolocation.requestPermissions();
      return status.location === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  static async watchLocation(callback: (position: { lat: number; lng: number }) => void): Promise<string | null> {
    try {
      const watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000
        },
        (position) => {
          if (position) {
            callback({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          }
        }
      );
      return watchId;
    } catch (error) {
      console.error('Error watching location:', error);
      return null;
    }
  }

  static async clearLocationWatch(watchId: string): Promise<void> {
    try {
      await Geolocation.clearWatch({ id: watchId });
    } catch (error) {
      console.error('Error clearing location watch:', error);
    }
  }

  // Camera Services
  static async takePhoto(): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });
      return image.dataUrl || null;
    } catch (error) {
      console.error('Error taking photo:', error);
      return null;
    }
  }

  static async selectFromGallery(): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });
      return image.dataUrl || null;
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      return null;
    }
  }

  static async requestCameraPermissions(): Promise<boolean> {
    try {
      const status = await Camera.requestPermissions();
      return status.camera === 'granted' && status.photos === 'granted';
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  }

  // Notification Services
  static async requestNotificationPermissions(): Promise<boolean> {
    try {
      const status = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  static async scheduleNotification(
    title: string, 
    body: string, 
    id?: number,
    scheduledAt?: Date
  ): Promise<boolean> {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title,
          body,
          id: id || Date.now(),
          schedule: scheduledAt ? { at: scheduledAt } : undefined,
          sound: 'default',
          attachments: [],
          actionTypeId: '',
          extra: {}
        }]
      });
      return true;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return false;
    }
  }

  static async showImmediateNotification(title: string, body: string): Promise<boolean> {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title,
          body,
          id: Date.now(),
          sound: 'default',
          attachments: [],
          actionTypeId: '',
          extra: {}
        }]
      });
      return true;
    } catch (error) {
      console.error('Error showing notification:', error);
      return false;
    }
  }

  // Device Information
  static isNative(): boolean {
    return window.Capacitor?.isNativePlatform() || false;
  }

  static getPlatform(): string {
    return window.Capacitor?.getPlatform() || 'web';
  }

  // Safety Features
  static async reportLocationBasedIncident(
    type: string,
    description: string,
    severity: string
  ): Promise<{ success: boolean; location?: { lat: number; lng: number } }> {
    try {
      // Get current location
      const location = await this.getCurrentLocation();
      
      if (!location) {
        return { success: false };
      }

      // You would integrate this with your backend API
      const incident = {
        type,
        description,
        severity,
        location,
        timestamp: new Date(),
        verified: false
      };

      // For now, just store locally
      console.log('Incident reported:', incident);

      // Send notification
      await this.showImmediateNotification(
        'Incident Reported',
        'Your safety report has been submitted successfully.'
      );

      return { success: true, location };
    } catch (error) {
      console.error('Error reporting incident:', error);
      return { success: false };
    }
  }
}

// Extend Window interface for Capacitor
declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform(): boolean;
      getPlatform(): string;
    };
  }
}
