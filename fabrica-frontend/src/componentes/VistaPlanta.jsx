import React, { useState } from 'react';
import { ModalFactura } from './ModalFactura';

export const VistaPlanta = ({ API_URL, USUARIOS_PLANTA, COLCHONES = [] }) => {
  const [operador, setOperador] = useState(localStorage.getItem("operadorPlanta") || null);
  const [pinPlanta, setPinPlanta] = useState("");
  const [mensajeExito, setMensajeExito] = useState(false);
  const [errorPin, setErrorPin] = useState(false);
  
  // 1. Estado para controlar el modal
  const [mostrarFactura, setMostrarFactura] = useState(false);
  

  const limpiarPedido = () => {
    const inicial = {};
    COLCHONES.forEach(grupo => {
      grupo.medidas.forEach(medida => {
        inicial[`${grupo.modelo}-${medida}`] = 0;
      });
    });
    return inicial;
  };

  const [pedido, setPedido] = useState(() => limpiarPedido());

  // Funciones de control
  const sumar = (id) => {
    setPedido(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const restar = (e, id) => {
    e.stopPropagation();
    setPedido(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) - 1)
    }));
  };

  // 2. Función de envío movida para ser llamada desde el modal
  const enviarPedido = async (nombreDestino) => {
    try {
      const res = await fetch(`${API_URL}/api/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Enviamos el nuevo campo 'destino'
        body: JSON.stringify({ 
          planta: operador, 
          destino: nombreDestino, 
          productos: pedido 
        })
      });
      console.log(nombreDestino)
      if (res.ok) {
        setMensajeExito(true); 
        setPedido(limpiarPedido());
        setMostrarFactura(false);
        setTimeout(() => setMensajeExito(false), 3000);
      }
    } catch (err) { console.error("Error al enviar", err); }
  };

  if (!operador) {
    return (
      <div className="max-w-md mx-auto bg-white p-10 rounded-3xl shadow-xl text-center mt-10">
        <div className="text-5xl mb-4">🏭</div>
        <h3 className="text-xl font-bold mb-6 text-gray-800">Identificación de Planta</h3>
        <input 
          type="tel"
          value={pinPlanta}
          onChange={(e) => setPinPlanta(e.target.value.replace(/\D/g, ''))}
          placeholder="PIN de Operador"
          inputMode="numeric"
          autoFocus
          style={{ WebkitTextSecurity: 'disc' }}
          className={`border-2 p-4 rounded-xl mb-2 w-full text-center text-2xl outline-none ${
            errorPin ? 'border-red-500 animate-shake' : 'border-gray-100 focus:border-blue-500'
          }`}
        />
        <div className="h-6 mb-4">
          {errorPin && <p className="text-red-500 text-sm font-bold">❌ PIN no reconocido</p>}
        </div>
        <button 
          onClick={() => {
            if (USUARIOS_PLANTA[pinPlanta]) {
              const nombre = USUARIOS_PLANTA[pinPlanta];
              setOperador(nombre);
              localStorage.setItem("operadorPlanta", nombre);
              setPinPlanta("");
              setErrorPin(false);
            } else {
              setErrorPin(true); setPinPlanta("");
              setTimeout(() => setErrorPin(false), 3000);
            }
          }}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-lg uppercase shadow-lg"
        >INGRESAR</button>
      </div>
    );
  }

  return (
    
    <div className="max-w-md mx-auto pb-24">
      {/* 3. MODAL DE FACTURA (RESUMEN) */}
      {mostrarFactura && (
        <ModalFactura
        pedido={pedido}
        onCancelar={() => setMostrarFactura(false)}
        onConfirmar={(nombreDelCliente) => enviarPedido(nombreDelCliente)}
        />
      )}

      {mensajeExito && (
        <div className="fixed top-0 left-0 w-full bg-green-500 text-white p-6 text-center z-50 font-black shadow-2xl text-xl animate-bounce">
          ✅ ¡PEDIDO ENVIADO CON ÉXITO!
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6 px-4">
        <h2 className="text-sm font-black text-blue-800 uppercase">👷 {operador}</h2>
        <button onClick={() => {
          setOperador(null);
          localStorage.removeItem("operadorPlanta");
        }} className="text-[15px] text-red-500 font-bold underline">SALIR</button>
      </div>

      {COLCHONES.map(grupo => (
        <div key={grupo.modelo} className="mb-2 bg-gray-50 p-4 rounded-3xl border border-gray-100">
          <h3 className="text-xs text-center font-black text-gray-500 mb-3 uppercase tracking-widest">
            {grupo.modelo}
          </h3>
          
          <div className='grid grid-cols-4 gap-2'>
            {grupo.medidas.map(medida => {
              const idProd = `${grupo.modelo}-${medida}`;
              const cantidad = pedido[idProd] || 0;
              return (
                <div key={medida} className="relative group">
                  <button 
                    onClick={() => sumar(idProd)} 
                    className="w-full bg-white pt-4 pb-2 border-b-8 border-blue-500 rounded-3xl shadow-md active:scale-95 transition-all flex flex-col items-center"
                  >
                    <p className="text-[12px] font-bold text-gray-400 uppercase">{medida}</p>
                    <p className="text-[24px] font-black text-blue-600 leading-none my-1">{cantidad}</p>
                  </button>

                  {cantidad > 0 && (
                    <button 
                      onClick={(e) => restar(e, idProd)}
                      className="absolute -top-2 -right-1 bg-red-500 text-white w-7 h-7 rounded-full font-bold shadow-lg border-2 border-white flex items-center justify-center active:scale-75 transition-transform"
                    > - </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md z-40">
        <button 
          onClick={() => setMostrarFactura(true)} 
          className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl text-2xl shadow-xl active:bg-blue-800 transition-colors uppercase"
        >
          Confirmar Pedido
        </button>
      </div>

      <button 
        onClick={() => setPedido(limpiarPedido())}
        className="w-full text-gray-400 font-bold py-3 mt-4 text-xs uppercase mb-20"
      >
        Limpiar cantidades
      </button>
    </div>
  );
};