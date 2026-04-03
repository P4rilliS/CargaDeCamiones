import React, { useState } from 'react';
import { VistaPlanta } from './componentes/VistaPlanta';
import { VistaOficina } from './componentes/VistaOficina';
import { useAuth } from './hooks/useAuth';
import { COLCHONES } from './config/productos';
import { HistorialCompleto } from './componentes/HistorialCompleto';
import { usePedidos } from './hooks/usePedidos';


function App() {
  const [vista, setVista] = useState(localStorage.getItem("esOficina") === "si" ? "oficina" : "planta");
  
  // Usamos el Hook de autenticación
  const { isAuthenticated, errorPin, loginOficina, logout } = useAuth();

  const miIP = window.location.hostname; 
  const API_URL = "https://suenodeangelbackend.up.railway.app";
  const PUBLIC_KEY = process.env.REACT_APP_PUBLIC_KEY
  const USUARIOS_PLANTA = {
    [process.env.REACT_APP_PIN_MARINO]: "Marino Cardenas",
    [process.env.REACT_APP_PIN_DANIEL]: "Daniel Cardenas",
    [process.env.REACT_APP_PIN_SERGIO]: "Sergio Parilli"
  };
  // 1. Necesitamos el historial aquí arriba para compartirlo entre vistas
const { historial } = usePedidos(API_URL, isAuthenticated);

// 2. La función de sumar también debe estar aquí para que todos la usen
const sumarTotal = (productos) => {
  return Object.entries(productos || {}).reduce((acc, [_, cant]) => acc + (Number(cant) || 0), 0);
};

  return (
  <div className="min-h-screen bg-gray-100 p-4 font-sans text-gray-800">
    {/* Botones de navegación */}
    <div className="flex justify-center gap-4 mb-8">
      <button 
        onClick={() => setVista("planta")} 
        className={`px-6 py-3 rounded-xl font-bold ${vista === 'planta' ? 'bg-blue-600 text-white' : 'bg-white shadow-sm'}`}
      >
        🏭 PLANTA
      </button>
      <button 
        onClick={() => setVista("oficina")} 
        className={`px-6 py-3 rounded-xl font-bold ${vista === 'oficina' || vista === 'historial_completo' ? 'bg-green-600 text-white' : 'bg-white shadow-sm'}`}
      >
        🏢 OFICINA
      </button>
    </div>

    {/* Vista 1: Planta */}
    {vista === "planta" && (
      <VistaPlanta 
        API_URL={API_URL} 
        USUARIOS_PLANTA={USUARIOS_PLANTA}
        COLCHONES={COLCHONES}
      />
    )}

    {/* Vista 2: Oficina */}
    {vista === "oficina" && (
      <VistaOficina 
        API_URL={API_URL} 
        PUBLIC_KEY={PUBLIC_KEY}
        auth={{ isAuthenticated, errorPin, loginOficina, logout }}
        setVista={setVista}
        historial={historial}
        sumarTotal={sumarTotal}
      />
    )}

    {/* Vista 3: Historial Completo */}
    {vista === "historial_completo" && (
      <HistorialCompleto 
        historial={historial} 
        setVista={setVista} 
        sumarTotal={sumarTotal} 
      />
    )}
  </div>
);
}

export default App;