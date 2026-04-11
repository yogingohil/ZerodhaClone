import React, { useState, useContext } from 'react';

const AuthContext = React.createContext({
  user: null,
  setUser: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return { user: null, setUser: () => {} };
  }
  return context;
};

export const AuthProvider = (props) => {
  const [user, setUser] = useState(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
