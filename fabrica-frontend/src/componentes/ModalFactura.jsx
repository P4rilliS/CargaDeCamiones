import React, { useState } from 'react';

export const ModalFactura = ({ pedido, onConfirmar, onCancelar }) => {
  // 1. Creamos un espacio en la memoria para guardar el nombre que escriban
  const [nombreDestino, setNombreDestino] = useState("");
  const [error, setError] = useState(false);
  
  const items = Object.entries(pedido).filter(([_, cant]) => cant > 0);

  // 2. Esta función revisa que hayan escrito algo antes de enviar
  const validarYEnviar = () => {
    if (nombreDestino.trim() === "") {
      setError(true);
      return;
    }
    setError(false);
    onConfirmar(nombreDestino); // Le pasamos el nombre a la función de envío
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl shadow-2xl p-6">
        <h2 className="text-xl font-black text-blue-900 mb-4 uppercase">📄 Resumen y Destino</h2>
        
        {/* --- AQUÍ SE ESCRIBE EL NOMBRE --- */}
        <div className="mb-6">
          <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">¿Para quién es este despacho?</label>
          <input 
            type="text"
            placeholder="Nombre del CLiente"
            value={nombreDestino}
            onChange={(e) => setNombreDestino(e.target.value)}
            className="w-full p-4 bg-gray-50 border-2 border-blue-100 rounded-2xl focus:border-blue-500 outline-none font-bold uppercase"
          />
          <div className="h-6 mb-4">
          {error && <p className="text-[15px] font-black mt-1 animate-pulse text-red-500 text-sm">⚠️ Por favor, ingresa el nombre del cliente</p>}
        </div>
        </div>

        {/* Lista de productos (lo que ya tenías) */}
        <div className="max-h-[30vh] overflow-y-auto mb-6">
          {items.map(([id, cant]) => (
            <div key={id} className="flex justify-between py-2 border-b border-gray-50">
              <span className="font-bold text-gray-600 text-sm uppercase">{id.replace('-', ' ')}</span>
              <span className="font-black text-blue-600 text-lg">{cant}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onCancelar} className="flex-1 bg-gray-100 py-4 rounded-2xl font-bold text-gray-400">CORREGIR</button>
          <button onClick={validarYEnviar} className="flex-[2] bg-green-600 text-white py-4 rounded-2xl font-black shadow-lg">ENVIAR AHORA</button>
        </div>
      </div>
    </div>
  );
};

