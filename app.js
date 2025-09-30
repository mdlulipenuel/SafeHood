// SafeHood Application
class SafeHood {
    constructor() {
        this.incidents = this.loadIncidents();
        this.init();
    }

    init() {
        this.renderIncidents();
        this.setupEventListeners();
        this.loadSampleData();
    }

    setupEventListeners() {
        const form = document.getElementById('incidentForm');
        const filterType = document.getElementById('filterType');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        filterType.addEventListener('change', (e) => {
            this.filterIncidents(e.target.value);
        });
    }

    handleFormSubmit() {
        const incident = {
            id: Date.now(),
            type: document.getElementById('incidentType').value,
            location: document.getElementById('location').value,
            description: document.getElementById('description').value,
            severity: document.getElementById('severity').value,
            date: new Date().toISOString()
        };

        this.addIncident(incident);
        this.showSuccessMessage();
        document.getElementById('incidentForm').reset();
    }

    addIncident(incident) {
        this.incidents.unshift(incident);
        this.saveIncidents();
        this.renderIncidents();
    }

    filterIncidents(type) {
        const filtered = type === 'all' 
            ? this.incidents 
            : this.incidents.filter(incident => incident.type === type);
        this.renderIncidents(filtered);
    }

    renderIncidents(incidents = this.incidents) {
        const incidentsList = document.getElementById('incidentsList');
        
        if (incidents.length === 0) {
            incidentsList.innerHTML = `
                <div class="empty-state">
                    <p>No incidents reported yet. Your neighborhood is safe! 🎉</p>
                </div>
            `;
            return;
        }

        incidentsList.innerHTML = incidents.map(incident => `
            <div class="incident-card">
                <div class="incident-header">
                    <div class="incident-type">${this.formatType(incident.type)}</div>
                    <span class="severity-badge severity-${incident.severity}">${incident.severity.toUpperCase()}</span>
                </div>
                <div class="incident-location">${incident.location}</div>
                <div class="incident-description">${incident.description}</div>
                <div class="incident-date">${this.formatDate(incident.date)}</div>
            </div>
        `).join('');
    }

    formatType(type) {
        const types = {
            'theft': '🚨 Theft',
            'vandalism': '🔨 Vandalism',
            'suspicious': '👀 Suspicious Activity',
            'lighting': '💡 Poor Lighting',
            'other': '📝 Other'
        };
        return types[type] || type;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString();
    }

    showSuccessMessage() {
        const reportSection = document.querySelector('.report-section');
        const message = document.createElement('div');
        message.className = 'success-message';
        message.textContent = '✅ Incident reported successfully!';
        
        reportSection.insertBefore(message, reportSection.firstChild);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    saveIncidents() {
        localStorage.setItem('safehood_incidents', JSON.stringify(this.incidents));
    }

    loadIncidents() {
        const stored = localStorage.getItem('safehood_incidents');
        return stored ? JSON.parse(stored) : [];
    }

    loadSampleData() {
        // Only load sample data if there are no incidents
        if (this.incidents.length === 0) {
            const sampleIncidents = [
                {
                    id: 1,
                    type: 'suspicious',
                    location: 'Main Street & 5th Avenue',
                    description: 'Unknown person loitering around parked cars late at night.',
                    severity: 'medium',
                    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 2,
                    type: 'lighting',
                    location: 'Park Lane',
                    description: 'Street lights have been out for several days, making the area very dark at night.',
                    severity: 'high',
                    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 3,
                    type: 'theft',
                    location: 'Oak Street Parking Lot',
                    description: 'Car window was broken and items were stolen from the vehicle.',
                    severity: 'high',
                    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
                }
            ];
            
            this.incidents = sampleIncidents;
            this.saveIncidents();
            this.renderIncidents();
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SafeHood();
});
