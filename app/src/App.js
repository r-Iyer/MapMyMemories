import React, { useState, useEffect } from 'react';
import MapComponent from './components/MapComponent';
import UserSwitchComponent from './components/UserSwitchComponent';
import UploadForm from './components/UploadForm';

import './styles/App.css';
import './styles/userSwitchStyles.css';

const App = () => {
  const [currentUser, setCurrentUser] = useState('Rohit');
  const [showForm, setShowForm] = useState(false);

  const handleSwitchUser = (username) => {
    setCurrentUser(username);
  };

  // This callback will be passed to UploadForm so that UploadForm can hide itself and show the map again
  const handleUploadSuccess = () => {
    setShowForm(false); // Hide the form after a successful upload
  };

  // Dynamically inject the Google Maps API script into the document head
  useEffect(() => {
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

    // Cleanup: remove the script when the component unmounts
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="app-container">
      {/* 🚀 Left Side: Add Destination Button */}
      <div className="upload-container">
        <button
          className="add-place-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Close' : 'Add Destination'}
        </button>
      </div>

      {/* 🚀 Right Side: Switch User */}
      <UserSwitchComponent 
        currentUsername={currentUser} 
        onSwitchUser={handleSwitchUser} 
      />

      {/* 🚀 Hide Map When Upload Form is Open */}
      {!showForm && currentUser && (
        <MapComponent username={currentUser} />
      )}

      {/* Show UploadForm when button is clicked and pass the onUploadSuccess callback */}
      {showForm && (
        <UploadForm onUploadSuccess={handleUploadSuccess} />
      )}
    </div>
  );
};

export default App;
