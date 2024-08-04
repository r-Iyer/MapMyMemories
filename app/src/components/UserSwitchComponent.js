import React, { useState } from 'react';
import '../styles/userSwitchStyles.css';

const UserSwitchComponent = ({ currentUsername, onSwitchUser }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [error, setError] = useState('');

    const handleUserChange = () => {
        // Reset error message
        setError('');

        // Validate username (basic check for non-empty input)
        if (!newUsername.trim()) {
            setError('Username cannot be empty.');
            return;
        }

        // Check if username exists
        fetch(`/${newUsername.trim()}/places.csv`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                // If the file exists, switch the user
                onSwitchUser(newUsername.trim());
                setNewUsername('');
                setIsOpen(false);
            })
            .catch(error => {
                console.error('Error loading CSV file for username:', error);
                setError('User not found or error loading data.');
            });
    };

    return (
        <div className="user-switch-container">
            <button 
                className="user-switch-button" 
                onClick={() => setIsOpen(!isOpen)}
            >
                Switch User
            </button>
            {isOpen && (
                <div className="user-switch-dropdown">
                    <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="Enter username"
                    />
                    <button onClick={handleUserChange}>Switch</button>
                    {error && <div className="error-message">{error}</div>}
                </div>
            )}
            <p className="current-username">Current User: {currentUsername}</p>
        </div>
    );
};

export default UserSwitchComponent;
