import React, { useState } from 'react';
import '../styles/userSwitchStyles.css';

const UserSwitchComponent = ({ currentUsername, onSwitchUser }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [error, setError] = useState('');

    const handleUserChange = () => {
        setError(''); // Reset error message

        const trimmedUsername = newUsername.trim();
        if (!trimmedUsername) {
            setError('Username cannot be empty.');
            return;
        }

        fetch(`/${trimmedUsername}/places.csv`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                onSwitchUser(trimmedUsername);
                setNewUsername('');
                setIsOpen(false);
            })
            .catch(() => {
                setError('User not found or error loading data.');
            });
    };

    return (
        <div className="user-switch-container">
            <button 
                className="user-switch-button" 
                onClick={() => setIsOpen(prev => !prev)}
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
