// Enhanced Location Service with Verification
export interface LocationCoordinates {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

export interface MonitoringZone {
  id: string;
  center: LocationCoordinates;
  radius: number; // in meters
  name: string;
  alertLevel: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export class LocationService {
  private static instance: LocationService;
  private currentLocation: LocationCoordinates | null = null;
  private watchId: number | null = null;
  private monitoringZones: MonitoringZone[] = [];

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // Get current location with high accuracy
  async getCurrentLocation(highAccuracy = true): Promise<LocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: LocationCoordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };
          this.currentLocation = coords;
          resolve(coords);
        },
        (error) => {
          reject(new Error(`Location error: ${error.message}`));
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    });
  }

  // Start watching location changes
  startLocationWatching(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };
          resolve();
        },
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 10000
        }
      );
    });
  }

  // Stop watching location
  stopLocationWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // Verify if user is within allowed reporting radius (100m)
  verifyReportingLocation(reportLat: number, reportLng: number): Promise<{
    allowed: boolean;
    distance: number;
    accuracy: number;
    message: string;
  }> {
    return new Promise(async (resolve) => {
      try {
        if (!this.currentLocation) {
          await this.getCurrentLocation();
        }

        if (!this.currentLocation) {
          resolve({
            allowed: false,
            distance: -1,
            accuracy: -1,
            message: 'Unable to verify your location. Please enable GPS.'
          });
          return;
        }

        const distance = this.calculateDistance(
          this.currentLocation.lat,
          this.currentLocation.lng,
          reportLat,
          reportLng
        );

        const maxDistance = 100; // 100 meters max reporting distance
        const allowed = distance <= maxDistance;

        resolve({
          allowed,
          distance: Math.round(distance),
          accuracy: Math.round(this.currentLocation.accuracy),
          message: allowed 
            ? `Location verified (${Math.round(distance)}m away)`
            : `Too far from incident location (${Math.round(distance)}m). You can only report incidents within 100m of your location.`
        });
      } catch (error) {
        resolve({
          allowed: false,
          distance: -1,
          accuracy: -1,
          message: 'Location verification failed. Please check your GPS settings.'
        });
      }
    });
  }

  // Add monitoring zone
  addMonitoringZone(center: LocationCoordinates, radius: number, name: string): MonitoringZone {
    const zone: MonitoringZone = {
      id: `zone_${Date.now()}`,
      center,
      radius,
      name,
      alertLevel: 'medium',
      createdAt: new Date()
    };
    this.monitoringZones.push(zone);
    this.saveMonitoringZones();
    return zone;
  }

  // Get monitoring zones
  getMonitoringZones(): MonitoringZone[] {
    return this.monitoringZones;
  }

  // Check if location is within any monitoring zone
  isWithinMonitoringZone(lat: number, lng: number): MonitoringZone[] {
    return this.monitoringZones.filter(zone => {
      const distance = this.calculateDistance(
        zone.center.lat,
        zone.center.lng,
        lat,
        lng
      );
      return distance <= zone.radius;
    });
  }

  // Get current location (cached)
  getCurrentLocationCached(): LocationCoordinates | null {
    return this.currentLocation;
  }

  // Create default monitoring zone around user location
  async createDefaultMonitoringZone(): Promise<MonitoringZone | null> {
    try {
      const location = await this.getCurrentLocation();
      return this.addMonitoringZone(
        location,
        1000, // 1km radius
        'My Neighborhood'
      );
    } catch (error) {
      console.error('Failed to create default monitoring zone:', error);
      return null;
    }
  }

  // Save monitoring zones to localStorage
  private saveMonitoringZones(): void {
    localStorage.setItem('safehood_monitoring_zones', JSON.stringify(this.monitoringZones));
  }

  // Load monitoring zones from localStorage
  loadMonitoringZones(): void {
    const saved = localStorage.getItem('safehood_monitoring_zones');
    if (saved) {
      try {
        this.monitoringZones = JSON.parse(saved);
      } catch (error) {
        console.error('Failed to load monitoring zones:', error);
        this.monitoringZones = [];
      }
    }
  }

  // Get safety score for area
  getAreaSafetyScore(_lat: number, _lng: number, _radius: number = 500): Promise<{
    score: number;
    incidents: number;
    trend: 'improving' | 'stable' | 'worsening';
    lastUpdated: Date;
  }> {
    // This would integrate with the incident data to calculate real safety scores
    return new Promise((resolve) => {
      // Mock implementation - in production, this would analyze real incident data
      const mockScore = Math.floor(Math.random() * 40) + 60; // 60-100 range
      const mockIncidents = Math.floor(Math.random() * 20);
      const trends: ('improving' | 'stable' | 'worsening')[] = ['improving', 'stable', 'worsening'];
      
      resolve({
        score: mockScore,
        incidents: mockIncidents,
        trend: trends[Math.floor(Math.random() * trends.length)],
        lastUpdated: new Date()
      });
    });
  }
}

export const locationService = LocationService.getInstance();
