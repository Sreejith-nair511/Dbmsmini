# Detailed Backend and Frontend Code Structure

## Backend Code

### Config/db.js
```javascript
const mysql = require('mysql2');

require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3308,  // Make sure port is included
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'emergency_management_system'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err.message);
    console.log('💡 Make sure Docker container is running: docker-compose up -d');
  } else {
    console.log('✅ Connected to MySQL Docker container successfully!');
  }
});

module.exports = connection;
```

### Controllers/incidentController.js
```javascript
const db = require('../config/database');

// Business logic for auto-assigning services
const autoAssignService = (emergencyType) => {
  const serviceMap = {
    'Fire': 1,      // Fire Department
    'Medical': 3,   // Ambulance Service
    'Police': 2,    // Police Station
    'Accident': 3,  // Ambulance
    'Natural Disaster': 1, // Fire Department as first responder
    'Other': 2      // Default to Police
  };
  return serviceMap[emergencyType] || 2;
};

const incidentController = {
  // Report new incident
  reportIncident: (req, res) => {
    const { resident_id, emergency_type, description, location, user_name } = req.body;
    
    console.log('=== BACKEND RECEIVED DATA ===');
    console.log('resident_id:', resident_id);
    console.log('emergency_type:', emergency_type);
    console.log('description:', description);
    console.log('location:', location);
    console.log('user_name:', user_name);
    console.log('=============================');
    
    const service_id = autoAssignService(emergency_type);
    
    // Build the description that will be stored in database
    let comprehensiveDescription = '';
    
    if (user_name) {
      comprehensiveDescription += `Reported by: ${user_name}\n`;
    }
    comprehensiveDescription += `Emergency Type: ${emergency_type}\n`;
    comprehensiveDescription += `Location: ${location}\n`;
    
    // Add user description if provided
    if (description && description !== 'User chose to skip description') {
      comprehensiveDescription += `User Description: ${description}`;
    } else {
      comprehensiveDescription += `User Description: No additional details provided`;
    }
    
    console.log('Storing description in DB:', comprehensiveDescription);
    
    const query = `
      INSERT INTO Incident_Report 
      (Resident_ID, Description, Emergency_Type, Location, Service_ID, Status) 
      VALUES (?, ?, ?, ?, ?, 'Reported')
    `;
    
    db.query(query, [resident_id, comprehensiveDescription, emergency_type, location, service_id], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to report incident' });
      }
      
      res.status(201).json({
        success: true,
        incident_id: result.insertId,
        message: `Emergency reported successfully! Help is on the way to ${location}`,
        service_id: service_id
      });
    });
  },

  // Get all incidents (for handler)
  getAllIncidents: (req, res) => {
    const query = `
      SELECT 
        ir.Incident_ID, ir.Date_Time, ir.Description, ir.Emergency_Type, 
        ir.Location, ir.Status,
        r.Name as Resident_Name, r.Phone_number, r.Address,
        es.Service_Name, es.Service_Type, es.Contact_Number as Service_Contact
      FROM Incident_Report ir
      JOIN Resident r ON ir.Resident_ID = r.Resident_ID
      LEFT JOIN Emergency_Service es ON ir.Service_ID = es.Service_ID
      ORDER BY ir.Date_Time DESC
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch incidents' });
      }
      res.json(results);
    });
  },

  // Get incidents by resident
  getIncidentsByResident: (req, res) => {
    const residentId = req.params.residentId;
    
    const query = `
      SELECT 
        ir.*, es.Service_Name, es.Contact_Number as Service_Contact
      FROM Incident_Report ir
      LEFT JOIN Emergency_Service es ON ir.Service_ID = es.Service_ID
      WHERE ir.Resident_ID = ?
      ORDER BY ir.Date_Time DESC
    `;
    
    db.query(query, [residentId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch incidents' });
      }
      res.json(results);
    });
  },

  // Update incident status
  updateIncidentStatus: (req, res) => {
    const incidentId = req.params.id;
    const { status } = req.body;
    
    const query = 'UPDATE Incident_Report SET Status = ? WHERE Incident_ID = ?';
    
    db.query(query, [status, incidentId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update status' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Incident not found' });
      }
      
      res.json({ 
        success: true, 
        message: `Status updated to: ${status}` 
      });
    });
  },

  // Get incident by ID
  getIncidentById: (req, res) => {
    const incidentId = req.params.id;
    
    const query = `
      SELECT 
        ir.*, 
        r.Name as Resident_Name, r.Phone_number, r.Address,
        es.Service_Name, es.Service_Type, es.Contact_Number as Service_Contact
      FROM Incident_Report ir
      JOIN Resident r ON ir.Resident_ID = r.Resident_ID
      LEFT JOIN Emergency_Service es ON ir.Service_ID = es.Service_ID
      WHERE ir.Incident_ID = ?
    `;
    
    db.query(query, [incidentId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch incident' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Incident not found' });
      }
      
      res.json(results[0]);
    });
  }
};

module.exports = incidentController;
```

### Controllers/residentController.js
```javascript
const db = require('../config/database');

const residentController = {
  // Get all residents
  getAllResidents: (req, res) => {
    const query = 'SELECT * FROM Resident ORDER BY Name';
    
    db.query(query, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch residents' });
      }
      res.json(results);
    });
  },

  // Get resident by ID
  getResidentById: (req, res) => {
    const residentId = req.params.id;
    
    const query = 'SELECT * FROM Resident WHERE Resident_ID = ?';
    
    db.query(query, [residentId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch resident' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Resident not found' });
      }
      
      res.json(results[0]);
    });
  },

  // Get emergency contacts for a resident
  getResidentContacts: (req, res) => {
    const residentId = req.params.id;
    
    const query = `
      SELECT 
        ec.Contact_ID, ec.Name, ec.Contact_Type, ec.Phone_Number,
        rc.Relationship_Type, rc.Priority_level
      FROM Resident_Contact rc
      JOIN Emergency_Contact ec ON rc.Contact_ID = ec.Contact_ID
      WHERE rc.Resident_ID = ?
      ORDER BY rc.Priority_level ASC
    `;
    
    db.query(query, [residentId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch contacts' });
      }
      res.json(results);
    });
  },
  
  // Add this to residentController.js
  createResident: (req, res) => {
    const { name, address, phone_number, email, house_no } = req.body;
    
    const query = `
      INSERT INTO Resident (Name, Address, Phone_number, Email, House_No) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    db.query(query, [name, address, phone_number, email, house_no], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to create resident' });
      }
      
      res.status(201).json({
        success: true,
        resident_id: result.insertId,
        message: 'Resident created successfully'
      });
    });
  },
  
  // Add emergency contact for resident
  addEmergencyContact: (req, res) => {
    const residentId = req.params.id;
    const { name, contact_type, phone_number, relationship_type, priority_level } = req.body;
    
    // First create emergency contact
    const contactQuery = `
      INSERT INTO Emergency_Contact (Name, Contact_Type, Phone_Number) 
      VALUES (?, ?, ?)
    `;
    
    db.query(contactQuery, [name, contact_type, phone_number], (err, contactResult) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to create emergency contact' });
      }
      
      // Then link to resident
      const residentContactQuery = `
        INSERT INTO Resident_Contact (Resident_ID, Contact_ID, Relationship_Type, Priority_level) 
        VALUES (?, ?, ?, ?)
      `;
      
      db.query(residentContactQuery, [residentId, contactResult.insertId, relationship_type, priority_level], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to link contact to resident' });
        }
        
        res.status(201).json({
          success: true,
          contact_id: contactResult.insertId,
          message: 'Emergency contact added successfully'
        });
      });
    });
  }
};

module.exports = residentController;
```

### Controllers/serviceController.js
```javascript
const db = require('../config/database');

const serviceController = {
  // Get all emergency services
  getAllServices: (req, res) => {
    const query = 'SELECT * FROM Emergency_Service ORDER BY Service_Type';
    
    db.query(query, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch services' });
      }
      res.json(results);
    });
  },

  // Get service by ID
  getServiceById: (req, res) => {
    const serviceId = req.params.id;
    
    const query = 'SELECT * FROM Emergency_Service WHERE Service_ID = ?';
    
    db.query(query, [serviceId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch service' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Service not found' });
      }
      
      res.json(results[0]);
    });
  },

  // Update service allocation for incident
  updateServiceAllocation: (req, res) => {
    const incidentId = req.params.id;
    const { service_id } = req.body;
    
    const query = 'UPDATE Incident_Report SET Service_ID = ? WHERE Incident_ID = ?';
    
    db.query(query, [service_id, incidentId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update service allocation' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Incident not found' });
      }
      
      res.json({ 
        success: true, 
        message: 'Service allocation updated successfully' 
      });
    });
  }
};

module.exports = serviceController;
```

## Frontend Code

### Emergency Frontend Structure
```
emergency-frontend/
├── public/
│   └── index.html                  # HTML template
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx          # Shared header component
│   │   │   └── Navigation.jsx      # Navigation component
│   │   └── admin/                  # Admin-specific components
│   ├── pages/
│   │   ├── admin/                  # Admin pages
│   │   │   ├── AdminLayout.jsx     # Admin layout wrapper
│   │   │   ├── AdminDashboard.jsx  # Admin dashboard
│   │   │   ├── IncidentsManagement.jsx
│   │   │   ├── ResidentsManagement.jsx
│   │   │   ├── ContactsManagement.jsx
│   │   │   └── ServicesManagement.jsx
│   │   ├── EmergencyReport.jsx     # Main emergency reporting page
│   │   └── IncidentStatus.jsx      # Status checking page
│   ├── services/
│   │   └── api.js                  # API service functions
│   ├── App.jsx                     # Main app component with routing
│   ├── main.jsx                    # React app entry point
│   └── index.css                   # Global styles
├── package.json                    # Frontend dependencies
└── vite.config.js                  # Vite configuration
```

### Sample Frontend Component (EmergencyReport.jsx)
```jsx
import React, { useState } from 'react';
import { reportIncident } from '../services/api';

const EmergencyReport = () => {
  const [formData, setFormData] = useState({
    resident_id: '',
    emergency_type: '',
    description: '',
    location: '',
    user_name: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const response = await reportIncident(formData);
      if (response.success) {
        setSuccess(true);
        setFormData({
          resident_id: '',
          emergency_type: '',
          description: '',
          location: '',
          user_name: ''
        });
      }
    } catch (err) {
      setError('Failed to report incident. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="emergency-report">
      <h2>Report Emergency</h2>
      {success && <div className="success-message">Emergency reported successfully!</div>}
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="resident_id">Resident ID:</label>
          <input
            type="text"
            id="resident_id"
            name="resident_id"
            value={formData.resident_id}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <label htmlFor="user_name">Your Name:</label>
          <input
            type="text"
            id="user_name"
            name="user_name"
            value={formData.user_name}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <label htmlFor="emergency_type">Emergency Type:</label>
          <select
            id="emergency_type"
            name="emergency_type"
            value={formData.emergency_type}
            onChange={handleChange}
            required
          >
            <option value="">Select Emergency Type</option>
            <option value="Fire">Fire</option>
            <option value="Medical">Medical</option>
            <option value="Police">Police</option>
            <option value="Accident">Accident</option>
            <option value="Natural Disaster">Natural Disaster</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="location">Location:</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Reporting...' : 'Report Emergency'}
        </button>
      </form>
    </div>
  );
};

export default EmergencyReport;
```

### API Service (services/api.js)
```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Incident API
export const reportIncident = (incidentData) => {
  return api.post('/incidents/report', incidentData);
};

export const getAllIncidents = () => {
  return api.get('/incidents');
};

export const getIncidentById = (id) => {
  return api.get(`/incidents/${id}`);
};

export const updateIncidentStatus = (id, status) => {
  return api.put(`/incidents/${id}/status`, { status });
};

// Resident API
export const getAllResidents = () => {
  return api.get('/residents');
};

export const getResidentById = (id) => {
  return api.get(`/residents/${id}`);
};

export const getResidentContacts = (id) => {
  return api.get(`/residents/${id}/contacts`);
};

export const createResident = (residentData) => {
  return api.post('/residents', residentData);
};

export const addEmergencyContact = (residentId, contactData) => {
  return api.post(`/residents/${residentId}/contacts`, contactData);
};

// Service API
export const getAllServices = () => {
  return api.get('/services');
};

export const getServiceById = (id) => {
  return api.get(`/services/${id}`);
};

export const updateServiceAllocation = (incidentId, serviceId) => {
  return api.put(`/incidents/${incidentId}/service`, { service_id: serviceId });
};

export default api;
```

### Main App Component (App.jsx)
```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EmergencyReport from './pages/EmergencyReport';
import IncidentStatus from './pages/IncidentStatus';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import IncidentsManagement from './pages/admin/IncidentsManagement';
import ResidentsManagement from './pages/admin/ResidentsManagement';
import ServicesManagement from './pages/admin/ServicesManagement';
import Header from './components/common/Header';
import Navigation from './components/common/Navigation';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Navigation />
        
        <main>
          <Routes>
            <Route path="/" element={<EmergencyReport />} />
            <Route path="/status" element={<IncidentStatus />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="incidents" element={<IncidentsManagement />} />
              <Route path="residents" element={<ResidentsManagement />} />
              <Route path="services" element={<ServicesManagement />} />
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
```