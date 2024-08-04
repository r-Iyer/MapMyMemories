import React, { useState } from 'react';
import MapComponent from './components/MapComponent';
import UserSwitchComponent from './components/UserSwitchComponent';
import './styles/App.css';

const App = () => {
    const [currentUser, setCurrentUser] = useState('Rohit');

    const handleSwitchUser = (username) => {
        setCurrentUser(username); // Default to 'rohit' if no username is provided
    };

    return (
        <div className="app-container">
            <UserSwitchComponent 
                currentUsername={currentUser} 
                onSwitchUser={handleSwitchUser} 
            />
            {currentUser && <MapComponent username={currentUser} />}
        </div>
    );
};

export default App;
