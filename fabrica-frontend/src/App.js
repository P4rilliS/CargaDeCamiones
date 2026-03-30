import React, { useState } from 'react';

function App() {
  const [pedido, setPedido] = useState({
    Individual: 0,
    Matrimonial: 0,
    Queen: 0,
    King: 0
  });

  const [mensaje, setMensaje] = useState("");

  const sumarCuna = (modelo) => {
    setPedido({ ...pedido, [modelo]: pedido[modelo] + 1 });
  };

  const resetear = () => {
    setPedido({ Individual: 0, Matrimonial: 0, Queen: 0, King: 0 });
    setMensaje("");
  };

  const enviarOficina = async () => {
    try {
      const response = await fetch('http://192.168.0.11:3000/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planta: "Galpon",
          productos: pedido
        })
      });
      
      if (response.ok) {
        setMensaje("✅ ¡Pedido enviado a oficina!");
        setTimeout(resetear, 3000);
      }
    } catch (error) {
      setMensaje("❌ Error de conexión con el servidor");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">DESPACHO DE COLCHONES</h1>
      
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {Object.keys(pedido).map((modelo) => (
          <button
            key={modelo}
            onClick={() => sumarCuna(modelo)}
            className="bg-white border-2 border-blue-500 p-6 rounded-xl shadow-lg active:scale-95 transition-all"
          >
            <p className="text-lg font-semibold">{modelo}</p>
            <p className="text-3xl font-bold text-blue-600">{pedido[modelo]}</p>
          </button>
        ))}
      </div>

      <div className="mt-10 w-full max-w-md space-y-4">
        <button
          onClick={enviarOficina}
          className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl text-xl shadow-xl active:bg-green-700"
        >
          ENVIAR A OFICINA
        </button>
        
        <button onClick={resetear} className="w-full text-gray-500 font-semibold">
          Limpiar pantalla
        </button>
      </div>

      {mensaje && (
        <div className="mt-6 p-4 bg-white rounded-lg shadow-md font-bold text-center">
          {mensaje}
        </div>
      )}
    </div>
  );
}

export default App;