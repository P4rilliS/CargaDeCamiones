import React, { useState } from 'react';
import { ModalOficina } from './ModalOficina';


export const HistorialCompleto = ({ historial, setVista, sumarTotal }) => {
  const [paginaActual, setPaginaActual] = useState(1);
  const pedidosPorPagina = 10;

  // Lógica de paginación
  const indiceUltimo = paginaActual * pedidosPorPagina;
  const indicePrimero = indiceUltimo - pedidosPorPagina;
  const pedidosVisibles = historial.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(historial.length / pedidosPorPagina);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  return (
    <div className="max-w-2xl mx-auto px-4 pb-20 pt-6">
      
      {/* 3. LLAMADA AL MODAL (Igual que en oficina) */}
      <ModalOficina 
        pedido={pedidoSeleccionado} 
        onCerrar={() => setPedidoSeleccionado(null)} 
        sumarTotal={sumarTotal} 
      />

      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setVista("oficina")} className="bg-gray-100 p-3 rounded-full">⬅️</button>
        <h2 className="text-2xl font-black text-blue-900 italic tracking-tighter">HISTORIAL COMPLETO</h2>
      </div>

      <div className="space-y-3">
        {pedidosVisibles.map((p, i) => (
          <button 
            key={p._id || i} 
            onClick={() => setPedidoSeleccionado(p)} // <--- 4. Al tocar, se abre
            className="w-full text-left bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center active:scale-[0.98] transition-transform"
          >
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">
                {new Date(p.fecha).toLocaleString()}
              </p>
              <h4 className="text-lg font-black text-blue-900 uppercase italic leading-none">{p.destino || "Sin Nombre"}</h4>
              <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">{p.planta}</p>
            </div>
            
            <div className="text-right">
              <span className="block text-[10px] font-black text-green-500 uppercase">Total</span>
              <span className="text-xl font-black text-green-700">{sumarTotal(p.productos)}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Navegación de páginas */}
      <div className="flex justify-center items-center gap-6 mt-10">
        <button 
          disabled={paginaActual === 1}
          onClick={() => { setPaginaActual(p => p - 1); window.scrollTo(0,0); }}
          className="bg-white border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-xl font-bold disabled:opacity-20"
        >
          Anterior
        </button>
        <span className="font-black text-blue-900">{paginaActual} / {totalPaginas}</span>
        <button 
          disabled={paginaActual === totalPaginas}
          onClick={() => { setPaginaActual(p => p + 1); window.scrollTo(0,0); }}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold disabled:opacity-20"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};