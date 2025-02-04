import React, { useState, useEffect } from 'react';
import '../styles/userSwitchStyles.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL?.replace(/\/$/, '') || "https://visited-places-backend.vercel.app";

const UserSwitchComponent = ({ currentUsername, onSwitchUser }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [users, setUsers] = useState([]); // ✅ Stores users fetched from DB
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // ✅ Fetch users once when the component loads
    useEffect(() => {
        fetchUsers();
    }, []);

    // ✅ Fetch users from backend
    const fetchUsers = async () => {
        try {
            console.log("📡 Fetching user list from backend...");
            const response = await fetch(`${BACKEND_URL}/api/user/list`);
            const data = await response.json();
            if (data.users) {
                setUsers(data.users); // ✅ Store users from DB
            } else {
                setUsers([]); // ✅ If no users found, clear list
            }
        } catch (error) {
            console.error("❌ Error fetching user list:", error);
        }
    };

    // ✅ Handle Selecting User from Dropdown
    const handleSelectUser = (selectedUser) => {
        setNewUsername(selectedUser);
        setDropdownOpen(false); // ✅ Close dropdown after selection
    };

    // ✅ Handle Switching User by checking if the user exists in the users list (case-insensitive)
    const handleUserChange = () => {
        setError('');
        const trimmedUsername = newUsername.trim().toLowerCase();

        if (!trimmedUsername) {
            setError('Username cannot be empty.');
            return;
        }

        // Check if the user exists in the fetched users list
        const userExists = users.some(user => user.toLowerCase() === trimmedUsername);
        if (userExists) {
            onSwitchUser(trimmedUsername);
            setNewUsername('');
            setIsOpen(false);
        } else {
            setError('User does not exist.');
        }
    };

    // ✅ Handle Adding New User
    const handleAddUser = () => {
        setError('');
        setMessage('');
        const trimmedUsername = newUsername.trim().toLowerCase();
        const trimmedPassword = newPassword.trim();

        if (!trimmedUsername || !trimmedPassword) {
            setError('Username and password cannot be empty.');
            return;
        }

        fetch(`${BACKEND_URL}/api/user/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: trimmedUsername, password: trimmedPassword })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                setError(data.error);
            } else {
                setMessage('User registered successfully! You can now switch to this user.');
                fetchUsers(); // ✅ Fetch updated user list after adding
                setNewUsername('');
                setNewPassword('');
                setIsAddingUser(false);
            }
        })
        .catch(err => setError('Error creating user.'));
    };

    // ✅ Toggle dropdown open state and clear message when opening
    const toggleDropdown = () => {
        setIsOpen(prev => {
            const newState = !prev;
            if (newState) {
                setMessage('');
            }
            return newState;
        });
    };

    return (
        <div className="user-switch-container">
            <button className="user-switch-button" onClick={toggleDropdown}>
                {isAddingUser ? 'Back to Switch User' : 'Switch User / Add User'}
            </button>

            {isOpen && (
                <div className="user-switch-dropdown">
                    <div className="dropdown-input-container">
                        <input
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="Enter Username"
                            className="username-input"
                        />
                        <button 
                            className="dropdown-button" 
                            onClick={() => setDropdownOpen(prev => !prev)} // ✅ Toggle dropdown
                        >
                            ▼
                        </button>
                        
                        {/* ✅ Dropdown always shows latest users from backend */}
                        {dropdownOpen && users.length > 0 && (
                            <ul className="dropdown-list">
                                {users.map((user, index) => (
                                    <li key={index} onClick={() => handleSelectUser(user)} className="dropdown-item">
                                        {user}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {isAddingUser ? (
                        <>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter password"
                            />
                            <button onClick={handleAddUser}>Register</button>
                        </>
                    ) : (
                        <button onClick={handleUserChange}>Switch</button>
                    )}

                    <button onClick={() => setIsAddingUser(prev => !prev)}>
                        {isAddingUser ? 'Switch User Instead' : 'Create New User'}
                    </button>

                    {error && <div className="error-message">{error}</div>}
                    {message && <div className="success-message">{message}</div>}
                </div>
            )}

            <p className="current-username">
                Current User: {currentUsername.charAt(0).toUpperCase() + currentUsername.slice(1).toLowerCase()}
            </p>
        </div>
    );
};

export default UserSwitchComponent;
