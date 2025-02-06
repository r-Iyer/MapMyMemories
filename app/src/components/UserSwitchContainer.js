// src/components/UserSwitchContainer.js
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import UserSwitchComponent from './UserSwitchComponent';

const UserSwitchContainer = ({ collapse }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getUserFromQuery = useCallback(() => {
    const params = new URLSearchParams(location.search);
    return params.get('user') || 'rohit';
  }, [location.search]);

  const [currentUser, setCurrentUser] = useState(getUserFromQuery());

  useEffect(() => {
    setCurrentUser(getUserFromQuery());
  }, [getUserFromQuery]);

  useEffect(() => {
    setCurrentUser(getUserFromQuery());
  }, [getUserFromQuery]);

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
      collapse={collapse}
    />
  );
};

export default UserSwitchContainer;
