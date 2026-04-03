import React, { useState } from 'react';
import { usePedidos } from '../hooks/usePedidos';
import { ModalOficina } from './ModalOficina';

export const VistaOficina = ({ API_URL, PUBLIC_KEY, auth, setVista }) => {
  const [pin, setPin] = useState("");
  const { isAuthenticated, errorPin, loginOficina, logout } = auth;
  const { historial } = usePedidos(API_URL, isAuthenticated);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  const manejarNotificaciones = async () => {
    try {
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") return alert("Necesitamos permiso");
      const registro = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: PUBLIC_KEY
      });
      await fetch(`${API_URL}/api/suscribir-oficina`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
      alert("✅ Notificaciones vinculadas");
    } catch (error) { console.error(error); }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto bg-white p-10 rounded-3xl shadow-xl text-center mt-10">
        <div className="text-5xl mb-4">🔐</div>
        <h3 className="text-xl font-bold mb-6">Acceso a Oficina</h3>
        <button onClick={manejarNotificaciones} className="mb-8 w-full bg-yellow-100 text-yellow-700 py-3 rounded-xl font-bold text-sm">
          Activar Notificaciones
        </button>
        <input 
          type="password" 
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          placeholder="PIN de Seguridad"
          inputMode='numeric'
          autoFocus
          className={`border-2 p-4 rounded-xl mb-2 w-full text-center text-2xl outline-none ${errorPin ? 'border-red-500' : 'border-gray-100 focus:border-green-500'}`}
        />
        <button onClick={() => loginOficina(pin)} className="bg-green-600 text-white w-full py-4 rounded-xl font-black text-lg shadow-lg">ENTRAR</button>
      </div>
    );
  }

  // --- LÓGICA DE ORDEN Y FILTRADO (Último enviado de primero) ---
  const pedidosRecientes = [...historial]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 4);

  // Función para sumar colchones de un pedido
  const sumarTotal = (productos) => {
    return Object.values(productos).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-20">
      
      {/* MODAL DE DETALLE */}
      {pedidoSeleccionado && (
        <ModalOficina
          pedido={pedidoSeleccionado} 
          onCerrar={() => setPedidoSeleccionado(null)} 
          sumarTotal={sumarTotal} 
        />
      )}

      <div className="flex justify-between items-center mb-6 mt-6 px-2">
        <h2 className="text-xl font-black text-green-700 italic tracking-tighter">PEDIDOS</h2>
        {/* <div className="mt-8 px-2"> */}
        {/* </div> */}
        <button onClick={() => { logout(); setVista("planta"); }} className="text-[10px] text-red-500 font-bold underline uppercase">Cerrar Sesión</button>
      </div>

      <div className="space-y-4">
        {pedidosRecientes.map((p, i) => (
          <button 
            key={p._id || i} 
            onClick={() => setPedidoSeleccionado(p)}
            className="w-full text-left bg-white p-5 rounded-[2.5rem] shadow-sm border-l-[12px] border-green-500 flex justify-between items-center hover:shadow-md active:scale-[0.97] transition-all border border-gray-100"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  {new Date(p.fecha).toLocaleTimeString()} - {new Date(p.fecha).toLocaleDateString()}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase">{p.planta}</p>
              </div>
              <h4 className="text-xl font-black text-blue-900 uppercase italic">{p.destino || "Sin nombre"}</h4>
              <p className="text-[10px] font-bold text-gray-300 uppercase mt-2 italic">Toca para ver la lista</p>

            </div>

            {/* CIRCULO DE SUMA TOTAL */}
            <div className="bg-green-50 w-16 h-16 rounded-full flex flex-col items-center justify-center border-2 border-green-100 shadow-inner">
              <span className="text-xs font-black text-green-500 leading-none">TOTAL</span>
              <span className="text-2xl font-black text-green-700 leading-none">{sumarTotal(p.productos)}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-12 text-center opacity-100">
        <button 
          onClick={() => setVista("historial_completo")}
          className="w-full bg-blue-50 text-blue-600 py-4 rounded-2xl font-black uppercase text-xs border-2 border-dashed border-blue-200 hover:bg-blue-100 transition-colors">
            Ver todo el historial de pedidos 📑
        </button>
        {/* <p className="text-[10px] font-black uppercase tracking-[0.4em]">Panel de Control Oficina</p> */}
      </div>
    </div>
  );
};