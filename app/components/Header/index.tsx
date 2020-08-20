import React, { useContext } from 'react';
import { AuthenticationContext } from '../Authentication';

const HeaderContainer = () => {
  const { user, setUser } = useContext(AuthenticationContext);
  function handleLogout() {
    setUser(null);
  }
  return (
    <HeaderView username={user.user.username} handleLogout={handleLogout} />
  );
};

const HeaderView = ({ username, handleLogout }) => (
  <div className='d-flex justify-content-end ml-3 mr-3'>
    <div className='pr-1'>{username}</div>
    <button type="button" className='btn btn-sm btn-secondary' onClick={handleLogout}>Logout</button>
  </div>
);

export default HeaderContainer;
