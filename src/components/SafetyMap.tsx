import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DataManager } from '../utils/dataManager';
import type { SafetyIncident } from '../utils/dataManager';

// Fix for default markers in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface SafetyMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  onIncidentClick?: (incident: SafetyIncident) => void;
  filters?: {
    type?: string;
    severity?: string;
    verified?: boolean;
  };
}

const getMarkerIcon = (type: string, severity: string) => {
  const colors = {
    theft: severity === 'high' ? '#dc2626' : severity === 'medium' ? '#ea580c' : '#f59e0b',
    vandalism: '#7c3aed',
    suspicious: '#2563eb',
    emergency: '#dc2626',
    other: '#6b7280'
  };

  const color = colors[type as keyof typeof colors] || '#6b7280';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        font-weight: bold;
      ">
        ${type.charAt(0).toUpperCase()}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
};

const SafetyMap: React.FC<SafetyMapProps> = ({ 
  center = { lat: 40.7128, lng: -74.0060 }, 
  zoom = 13,
  onIncidentClick,
  filters = {}
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);

  // Load incidents from DataManager
  useEffect(() => {
    const loadIncidents = () => {
      let allIncidents = DataManager.getIncidents();
      
      // Apply filters
      if (filters.type) {
        allIncidents = allIncidents.filter(incident => incident.type === filters.type);
      }
      if (filters.severity) {
        allIncidents = allIncidents.filter(incident => incident.severity === filters.severity);
      }
      if (typeof filters.verified === 'boolean') {
        allIncidents = allIncidents.filter(incident => incident.verified === filters.verified);
      }

      setIncidents(allIncidents);
    };

    loadIncidents();
  }, [filters]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    mapInstanceRef.current = L.map(mapRef.current).setView([center.lat, center.lng], zoom);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center.lat, center.lng, zoom]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    incidents.forEach(incident => {
      const marker = L.marker(
        [incident.location.lat, incident.location.lng],
        { icon: getMarkerIcon(incident.type, incident.severity) }
      );

      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #1f2937;">
            ${incident.type.charAt(0).toUpperCase() + incident.type.slice(1)} Incident
          </h3>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280;">
            <strong>Location:</strong> ${incident.address}
          </p>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280;">
            <strong>Time:</strong> ${incident.timestamp.toLocaleDateString()} ${incident.timestamp.toLocaleTimeString()}
          </p>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #374151;">
            ${incident.description}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="
              background-color: ${incident.severity === 'high' ? '#fef2f2' : incident.severity === 'medium' ? '#fef3c7' : '#f0fdf4'};
              color: ${incident.severity === 'high' ? '#dc2626' : incident.severity === 'medium' ? '#d97706' : '#16a34a'};
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 500;
            ">
              ${incident.severity} severity
            </span>
            ${incident.verified ? `
              <span style="
                background-color: #f0fdf4;
                color: #16a34a;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 500;
              ">
                ✓ Verified
              </span>
            ` : `
              <span style="
                background-color: #fef3c7;
                color: #d97706;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 500;
              ">
                Unverified
              </span>
            `}
          </div>
        </div>
      `);

      marker.on('click', () => {
        onIncidentClick?.(incident);
      });

      marker.addTo(mapInstanceRef.current!);
      markersRef.current.push(marker);
    });
  }, [incidents, onIncidentClick]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-lg overflow-hidden"
      style={{ minHeight: '400px' }}
    />
  );
};

export default SafetyMap;
