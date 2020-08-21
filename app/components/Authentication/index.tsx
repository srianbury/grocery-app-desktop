import React, { useState, useEffect } from 'react'
import Login from '../Login'
import Spinner from '../Spinner'

/*
    user: {
        user: {
            _id: string,
            username: string,
            _v: int
        },
        token: json web token
    }
*/

const USER_LOGIN_KEY = 'user_login_key';

const AuthenticationContext = React.createContext(null);
const Authentication = ({ children }): JSX.Element => {
    const [state, setState] = useState({
        user: null,
        loading: true
    })

    useEffect(()=>{
        const user = localStorage.getItem(USER_LOGIN_KEY);
        if(user){
            setState(prev => ({
                ...prev,
                user: JSON.parse(user),
                loading: false
            }))
        } else {
            setState(prev => ({
                ...prev,
                loading: false
            }))
        }
    }, [])

    function setUser(user){
        setState(prev => ({
            ...prev,
            user
        }))
        if(user){
            localStorage.setItem(USER_LOGIN_KEY, JSON.stringify(user))
        } else {
            localStorage.removeItem(USER_LOGIN_KEY)
        }
    }

    if(state.loading){
        return (
            <div className="d-flex justify-content-center mt-4">
              <Spinner />
            </div>
          );
    }

    return(
        <AuthenticationContext.Provider
            value={{
                user: state.user,
                setUser
            }}
        >
            {state.user ? children : <Login />}
        </AuthenticationContext.Provider>
    )
}

export default Authentication
export { AuthenticationContext }
