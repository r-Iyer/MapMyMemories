// src/components/UserSwitchContainer.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import UserSwitchComponent from './UserSwitchComponent';

const UserSwitchContainer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getUserFromQuery = () => {
    const params = new URLSearchParams(location.search);
    return params.get('user') || 'rohit';
  };

  const [currentUser, setCurrentUser] = useState(getUserFromQuery());

  useEffect(() => {
    setCurrentUser(getUserFromQuery());
  }, [location.search]);

  const handleSwitchUser = (username) => {
    const params = new URLSearchParams(location.search);
    params.set('user', username);
    navigate(`?${params.toString()}`, { replace: true });
    setCurrentUser(username);
  };

  return (
    <UserSwitchComponent
      currentUsername={currentUser}
      onSwitchUser={handleSwitchUser}
    />
  );
};

export default UserSwitchContainer;
