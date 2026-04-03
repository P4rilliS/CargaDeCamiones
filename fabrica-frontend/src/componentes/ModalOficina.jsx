import React from 'react';

// Solo debe haber UN "export const ModalOficina" en todo el archivo
export const ModalOficina = ({ pedido, onCerrar, sumarTotal }) => {
  
  // Si no hay pedido, no mostramos nada
  if (!pedido) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Cabecera Verde */}
        <div className="bg-green-600 p-6 text-white text-center">
          <h3 className="text-2xl font-black uppercase italic">{pedido.destino || "SIN NOMBRE"}</h3>
          <p className="text-[14px] font-bold uppercase tracking-widest mt-1">
             Enviado por: {pedido.planta}
          </p>
        </div>

        {/* Lista de Colchones */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          <table className="w-full text-left">
            <tbody className="divide-y divide-gray-50">
              {Object.entries(pedido.productos).map(([nom, cant]) => cant > 0 && (
                <tr key={nom}>
                  <td className="py-3 text-xs font-bold text-gray-600 uppercase italic">
                    {nom.replace('-', ' ')}
                  </td>
                  <td className="py-3 text-right font-black text-green-600 text-xl">
                    {cant}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Botón para salir */}
        <div className="p-4 bg-gray-50 border-t">
          <button 
            onClick={onCerrar} 
            className="w-full bg-gray-800 text-white py-4 rounded-2xl font-black uppercase text-xs"
          >
            Cerrar Detalles
          </button>
        </div>
      </div>
    </div>
  );
};