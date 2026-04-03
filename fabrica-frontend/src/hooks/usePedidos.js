import { useState, useEffect, useCallback } from 'react';

export const usePedidos = (API_URL, isAuthenticated) => {
  const [historial, setHistorial] = useState([]);

  const obtenerPedidos = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch(`${API_URL}/api/pedidos`);
      const datos = await res.json();
      setHistorial(datos);
    } catch (err) {
      console.log("Error al cargar historial");
    }
  }, [API_URL, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      obtenerPedidos();
      const intervalo = setInterval(obtenerPedidos, 5000);
      return () => clearInterval(intervalo);
    }
  }, [isAuthenticated, obtenerPedidos]);

  return { historial, obtenerPedidos };
};