// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MapComponent from './components/MapComponent';
import UserSwitchContainer from './components/UserSwitchContainer';
import UploadForm from './components/UploadForm';

import './styles/App.css';
import './styles/userSwitchStyles.css';

const AppContent = () => {
  const [showForm, setShowForm] = useState(false);
  const [reloadMap, setReloadMap] = useState(false);
  const [collapseUserSwitch, setCollapseUserSwitch] = useState(false);

  const handleUploadSuccess = () => {
    setShowForm(false);
    setReloadMap(prev => !prev);
  };

  // When the map (or its container) is clicked, collapse the user switch.
  const handleMapClick = () => {
    setCollapseUserSwitch(true);
    // Optionally reset after a short delay so the collapse prop goes back to false.
    setTimeout(() => {
      setCollapseUserSwitch(false);
    }, 100);
  };

  // Inject Google Places API only once.
  useEffect(() => {
    if (!window.google) {
      const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
      if (!apiKey) {
        console.error("Google API key not found in environment variables.");
        return;
      }
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="app-container">
      {/* Left Side: Add Destination Button */}
      <div className="upload-container">
        <button
          className="add-place-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Close' : 'Add Destination'}
        </button>
      </div>

      {/* Render UserSwitchContainer only if the upload form is not open */}
      {!showForm && <UserSwitchContainer collapse={collapseUserSwitch} />}

      {/* Wrap the MapComponent in a div with an onClick handler */}
      {!showForm && (
        <div onClick={handleMapClick}>
          <MapComponent key={reloadMap} />
        </div>
      )}

      {showForm && <UploadForm onUploadSuccess={handleUploadSuccess} />}
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
