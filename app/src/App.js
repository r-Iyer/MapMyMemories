import React, { useState } from 'react';
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

  // This callback will be passed to UploadForm
  // so that UploadForm can hide itself and show the map again
  const handleUploadSuccess = () => {
    setShowForm(false); // Hide the form
  };

  return (
    <div className="app-container">
      {/* 🚀 Left Side: Add Place Button */}
      <div className="upload-container">
        <button
          className="add-place-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Close' : 'Add Place'}
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

      {/* Show UploadForm when button is clicked
          and pass the onUploadSuccess callback */}
      {showForm && (
        <UploadForm
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
};

export default App;
