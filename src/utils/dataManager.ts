// Types
export interface SafetyIncident {
  id: string;
  type: 'theft' | 'vandalism' | 'suspicious' | 'emergency' | 'other';
  location: { lat: number; lng: number };
  address: string;
  description: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  verified: boolean;
  reportedBy?: string;
  photos?: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
  isProfessional: boolean;
  joinDate: Date;
  reportsSubmitted: number;
  communityScore: number;
}

export interface Neighborhood {
  id: string;
  name: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  safetyScore: number;
  totalIncidents: number;
  population: number;
}

// Mock data for development
export const mockIncidents: SafetyIncident[] = [
  {
    id: '1',
    type: 'theft',
    location: { lat: 40.7128, lng: -74.0060 },
    address: '123 Main St, New York, NY',
    description: 'Bike stolen from front yard while owner was inside for 10 minutes',
    timestamp: new Date('2025-09-29T14:30:00'),
    severity: 'medium',
    verified: true,
    reportedBy: 'user1',
    photos: []
  },
  {
    id: '2',
    type: 'suspicious',
    location: { lat: 40.7130, lng: -74.0058 },
    address: '456 Oak Ave, New York, NY',
    description: 'Person checking car doors in parking lot around midnight',
    timestamp: new Date('2025-09-29T22:15:00'),
    severity: 'low',
    verified: false,
    reportedBy: 'user2'
  },
  {
    id: '3',
    type: 'vandalism',
    location: { lat: 40.7125, lng: -74.0065 },
    address: '789 Pine St, New York, NY',
    description: 'Graffiti on building wall, appears to be gang-related',
    timestamp: new Date('2025-09-28T16:45:00'),
    severity: 'medium',
    verified: true,
    reportedBy: 'user3'
  },
  {
    id: '4',
    type: 'emergency',
    location: { lat: 40.7135, lng: -74.0055 },
    address: '321 Elm Dr, New York, NY',
    description: 'House fire reported, emergency services responded',
    timestamp: new Date('2025-09-27T03:20:00'),
    severity: 'high',
    verified: true,
    reportedBy: 'system'
  },
  {
    id: '5',
    type: 'theft',
    location: { lat: 40.7120, lng: -74.0070 },
    address: '654 Maple Ln, New York, NY',
    description: 'Package stolen from doorstep during delivery',
    timestamp: new Date('2025-09-26T11:30:00'),
    severity: 'low',
    verified: true,
    reportedBy: 'user4'
  }
];

export const mockUser: User = {
  id: 'user1',
  email: 'john.doe@example.com',
  name: 'John Doe',
  isPremium: false,
  isProfessional: false,
  joinDate: new Date('2025-01-15'),
  reportsSubmitted: 12,
  communityScore: 95
};

export const mockNeighborhood: Neighborhood = {
  id: 'manhattan-downtown',
  name: 'Downtown Manhattan',
  bounds: {
    north: 40.7150,
    south: 40.7100,
    east: -74.0040,
    west: -74.0080
  },
  safetyScore: 8.4,
  totalIncidents: 247,
  population: 15000
};

// Local storage utilities
const STORAGE_KEYS = {
  INCIDENTS: 'safehood_incidents',
  USER: 'safehood_user',
  PREFERENCES: 'safehood_preferences'
};

export class DataManager {
  // Incidents
  static getIncidents(): SafetyIncident[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
      if (stored) {
        const incidents = JSON.parse(stored);
        return incidents.map((incident: any) => ({
          ...incident,
          timestamp: new Date(incident.timestamp)
        }));
      }
      // Initialize with mock data
      this.saveIncidents(mockIncidents);
      return mockIncidents;
    } catch (error) {
      console.error('Error loading incidents:', error);
      return mockIncidents;
    }
  }

  static saveIncidents(incidents: SafetyIncident[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
    } catch (error) {
      console.error('Error saving incidents:', error);
    }
  }

  static addIncident(incident: Omit<SafetyIncident, 'id' | 'timestamp'>): SafetyIncident {
    const newIncident: SafetyIncident = {
      ...incident,
      id: Date.now().toString(),
      timestamp: new Date(),
      verified: false
    };

    const incidents = this.getIncidents();
    incidents.unshift(newIncident);
    this.saveIncidents(incidents);
    
    return newIncident;
  }

  static updateIncident(id: string, updates: Partial<SafetyIncident>): void {
    const incidents = this.getIncidents();
    const index = incidents.findIndex(incident => incident.id === id);
    
    if (index !== -1) {
      incidents[index] = { ...incidents[index], ...updates };
      this.saveIncidents(incidents);
    }
  }

  static deleteIncident(id: string): void {
    const incidents = this.getIncidents();
    const filtered = incidents.filter(incident => incident.id !== id);
    this.saveIncidents(filtered);
  }

  // User management
  static getUser(): User | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      if (stored) {
        const user = JSON.parse(stored);
        return {
          ...user,
          joinDate: new Date(user.joinDate)
        };
      }
      return null;
    } catch (error) {
      console.error('Error loading user:', error);
      return null;
    }
  }

  static saveUser(user: User): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }

  static loginUser(): void {
    // Mock login - in real app this would involve API calls
    this.saveUser(mockUser);
  }

  static logoutUser(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  // Analytics
  static getNeighborhoodStats() {
    const incidents = this.getIncidents();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentIncidents = incidents.filter(incident => incident.timestamp >= thirtyDaysAgo);
    const weeklyIncidents = incidents.filter(incident => incident.timestamp >= sevenDaysAgo);

    const typeBreakdown = incidents.reduce((acc, incident) => {
      acc[incident.type] = (acc[incident.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const severityBreakdown = incidents.reduce((acc, incident) => {
      acc[incident.severity] = (acc[incident.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate safety score based on recent incidents and severity
    const highSeverityCount = weeklyIncidents.filter(i => i.severity === 'high').length;
    const mediumSeverityCount = weeklyIncidents.filter(i => i.severity === 'medium').length;
    const lowSeverityCount = weeklyIncidents.filter(i => i.severity === 'low').length;

    const safetyScore = Math.max(0, 10 - (highSeverityCount * 2) - (mediumSeverityCount * 1) - (lowSeverityCount * 0.5));

    return {
      totalIncidents: incidents.length,
      recentIncidents: recentIncidents.length,
      weeklyIncidents: weeklyIncidents.length,
      safetyScore: Math.round(safetyScore * 10) / 10,
      typeBreakdown,
      severityBreakdown,
      verifiedPercentage: Math.round((incidents.filter(i => i.verified).length / incidents.length) * 100),
      averageResponseTime: '12 minutes' // Mock data
    };
  }

  // Premium features
  static isPremiumUser(): boolean {
    const user = this.getUser();
    return user?.isPremium || false;
  }

  static isProfessionalUser(): boolean {
    const user = this.getUser();
    return user?.isProfessional || false;
  }

  // Search and filtering
  static searchIncidents(filters: {
    type?: string;
    severity?: string;
    dateRange?: { start: Date; end: Date };
    verified?: boolean;
    location?: { lat: number; lng: number; radius: number };
  }): SafetyIncident[] {
    let incidents = this.getIncidents();

    if (filters.type) {
      incidents = incidents.filter(incident => incident.type === filters.type);
    }

    if (filters.severity) {
      incidents = incidents.filter(incident => incident.severity === filters.severity);
    }

    if (filters.dateRange) {
      incidents = incidents.filter(incident => 
        incident.timestamp >= filters.dateRange!.start && 
        incident.timestamp <= filters.dateRange!.end
      );
    }

    if (typeof filters.verified === 'boolean') {
      incidents = incidents.filter(incident => incident.verified === filters.verified);
    }

    if (filters.location) {
      // Simple distance calculation (in real app, use proper geospatial queries)
      incidents = incidents.filter(incident => {
        const distance = this.calculateDistance(
          filters.location!.lat,
          filters.location!.lng,
          incident.location.lat,
          incident.location.lng
        );
        return distance <= filters.location!.radius;
      });
    }

    return incidents;
  }

  // Utility function for distance calculation
  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}
