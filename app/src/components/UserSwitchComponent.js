import React, { useState } from 'react';
import '../styles/userSwitchStyles.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

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

        // ✅ Fetch from API dynamically (Works both locally & on Vercel)
        fetch(`${BACKEND_URL}/api/fetch/user/${trimmedUsername}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('User not found.');
                }
                return response.json();
            })
            .then(data => {
                if (!data.places || data.places.length === 0) {
                    throw new Error('User has no saved places.');
                }

                onSwitchUser(trimmedUsername);
                setNewUsername('');
                setIsOpen(false);
            })
            .catch(err => {
                setError(err.message || 'Error switching user.');
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
