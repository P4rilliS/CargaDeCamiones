import { useState } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem("esOficina") === "si");
  const [errorPin, setErrorPin] = useState(false);

  const loginOficina = (pin) => {
    if (pin === process.env.REACT_APP_PIN_OFICINA || pin === process.env.PIN_OFICINA) {
      localStorage.setItem("esOficina", "si");
      setIsAuthenticated(true);
      return true;
    } else {
      setErrorPin(true);
      setTimeout(() => setErrorPin(false), 3000);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("esOficina");
    setIsAuthenticated(false);
  };

  return { isAuthenticated, setIsAuthenticated, errorPin, loginOficina, logout };
};