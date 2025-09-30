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

interface AdvancedSafetyMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  onIncidentClick?: (incident: SafetyIncident) => void;
  filters?: {
    type?: string;
    severity?: string;
    verified?: boolean;
  };
}

const getMarkerIcon = (type: string, severity: string, verified: boolean) => {
  const colors = {
    theft: severity === 'high' ? '#dc2626' : severity === 'medium' ? '#ea580c' : '#f59e0b',
    vandalism: '#7c3aed',
    suspicious: '#2563eb',
    emergency: '#dc2626',
    other: '#6b7280'
  };

  const color = colors[type as keyof typeof colors] || '#6b7280';
  const borderColor = verified ? '#22c55e' : '#ef4444';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid ${borderColor};
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 11px;
        font-weight: bold;
        position: relative;
      ">
        ${type.charAt(0).toUpperCase()}
        ${!verified ? '<div style="position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background: #ef4444; border-radius: 50%; border: 1px solid white;"></div>' : ''}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const AdvancedSafetyMap: React.FC<AdvancedSafetyMapProps> = ({ 
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

    try {
      // Initialize map
      mapInstanceRef.current = L.map(mapRef.current).setView([center.lat, center.lng], zoom);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

    } catch (error) {
      console.error('Error initializing map:', error);
    }

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

    // Add new markers for incidents
    incidents.forEach(incident => {
      try {
        const marker = L.marker(
          [incident.location.lat, incident.location.lng],
          { icon: getMarkerIcon(incident.type, incident.severity, incident.verified) }
        );

        const popupContent = `
          <div style="min-width: 250px; font-family: system-ui, -apple-system, sans-serif;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #1f2937; text-transform: capitalize;">
                ${incident.type} Incident
              </h3>
              <span style="
                margin-left: auto;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 500;
                background-color: ${incident.severity === 'high' ? '#fef2f2' : incident.severity === 'medium' ? '#fef3c7' : '#f0fdf4'};
                color: ${incident.severity === 'high' ? '#dc2626' : incident.severity === 'medium' ? '#d97706' : '#16a34a'};
              ">
                ${incident.severity}
              </span>
            </div>
            
            <div style="margin-bottom: 8px;">
              <strong style="color: #6b7280; font-size: 12px;">Location:</strong>
              <p style="margin: 2px 0; font-size: 13px; color: #374151;">${incident.address}</p>
            </div>
            
            <div style="margin-bottom: 8px;">
              <strong style="color: #6b7280; font-size: 12px;">Time:</strong>
              <p style="margin: 2px 0; font-size: 13px; color: #374151;">
                ${incident.timestamp.toLocaleDateString()} at ${incident.timestamp.toLocaleTimeString()}
              </p>
            </div>

            <div style="margin-bottom: 12px;">
              <strong style="color: #6b7280; font-size: 12px;">Description:</strong>
              <p style="margin: 2px 0; font-size: 13px; color: #374151; line-height: 1.4;">
                ${incident.description}
              </p>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid #e5e7eb;">
              ${incident.verified ? `
                <span style="
                  background-color: #f0fdf4;
                  color: #16a34a;
                  padding: 4px 8px;
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
                  padding: 4px 8px;
                  border-radius: 12px;
                  font-size: 11px;
                  font-weight: 500;
                ">
                  Unverified
                </span>
              `}
              
              <button 
                onclick="window.dispatchEvent(new CustomEvent('incident-details', {detail: '${incident.id}'}))"
                style="
                  background-color: #3b82f6;
                  color: white;
                  border: none;
                  padding: 4px 12px;
                  border-radius: 6px;
                  font-size: 11px;
                  cursor: pointer;
                  font-weight: 500;
                "
              >
                View Details
              </button>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'custom-popup'
        });

        marker.on('click', () => {
          onIncidentClick?.(incident);
        });

        marker.addTo(mapInstanceRef.current!);
        markersRef.current.push(marker);
      } catch (error) {
        console.error('Error adding marker for incident:', incident.id, error);
      }
    });

    // Fit map to show all markers if there are any
    if (markersRef.current.length > 0 && mapInstanceRef.current) {
      const group = L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }

  }, [incidents, onIncidentClick]);

  // Listen for custom events from popup buttons
  useEffect(() => {
    const handleIncidentDetails = (event: CustomEvent) => {
      const incidentId = event.detail;
      const incident = incidents.find(i => i.id === incidentId);
      if (incident && onIncidentClick) {
        onIncidentClick(incident);
      }
    };

    window.addEventListener('incident-details', handleIncidentDetails as EventListener);
    
    return () => {
      window.removeEventListener('incident-details', handleIncidentDetails as EventListener);
    };
  }, [incidents, onIncidentClick]);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ minHeight: '400px' }}
      />
      
      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-green-500"></div>
            <span>High severity (verified)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-green-500"></div>
            <span>Medium severity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full border-2 border-green-500"></div>
            <span>Low severity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded-full border-2 border-red-500"></div>
            <span>Unverified</span>
          </div>
        </div>
      </div>

      {/* Incident Count */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <div className="text-sm font-semibold text-gray-900">
          {incidents.length} incident{incidents.length !== 1 ? 's' : ''} shown
        </div>
        <div className="text-xs text-gray-600">
          {incidents.filter(i => i.verified).length} verified
        </div>
      </div>
    </div>
  );
};

export default AdvancedSafetyMap;
