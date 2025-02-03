import React, { useState } from 'react';
import MapComponent from './components/MapComponent';
import UserSwitchComponent from './components/UserSwitchComponent';
import UploadForm from './components/UploadForm';

import './styles/App.css';
import './styles/userSwitchStyles.css';

const App = () => {
    const [currentUser, setCurrentUser] = useState('Rohit');
    const [showForm, setShowForm] = useState(false); // Toggle UploadForm

    const handleSwitchUser = (username) => {
        setCurrentUser(username);
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
            {!showForm && currentUser && <MapComponent username={currentUser} />}

            {/* Show UploadForm when button is clicked */}
            {showForm && <UploadForm />}
        </div>
    );
};

export default App;
