import React, { useState, useEffect } from 'react';
import MapComponent from './components/MapComponent';
import UserSwitchComponent from './components/UserSwitchComponent';
import UploadForm from './components/UploadForm';

import './styles/App.css';
import './styles/userSwitchStyles.css';

const App = () => {
  // 1. Initialize currentUser from localStorage or default to "Rohit"
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem('lastUser');
    return storedUser || 'Rohit';
  });

  const [showForm, setShowForm] = useState(false);
  const [reloadMap, setReloadMap] = useState(false);

  // 2. When switching user, also store in localStorage
  const handleSwitchUser = (username) => {
    setCurrentUser(username);
    localStorage.setItem('lastUser', username);  // <-- store in localStorage here
    setReloadMap(prev => !prev);
  };

  const handleUploadSuccess = () => {
    setShowForm(false);
    setReloadMap(prev => !prev);
  };

  // Inject Google Places API only once
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

      {/* Right Side: Switch User */}
      <UserSwitchComponent
        currentUsername={currentUser}
        onSwitchUser={handleSwitchUser}
      />

      {/* Hide Map When Upload Form is Open */}
      {!showForm && currentUser && (
        <MapComponent username={currentUser} key={reloadMap} />
      )}

      {showForm && (
        <UploadForm onUploadSuccess={handleUploadSuccess} />
      )}
    </div>
  );
};

export default App;
