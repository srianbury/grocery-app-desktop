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
  <div className="container-fluid">
    <div className="d-flex justify-content-end">
      <h5>
        <span className="align-middle">{username}</span>
        <span className="ml-2">
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={handleLogout}
          >
            <i className="fas fa-sign-out-alt" />
          </button>
        </span>
      </h5>
    </div>
  </div>
);

export default HeaderContainer;
