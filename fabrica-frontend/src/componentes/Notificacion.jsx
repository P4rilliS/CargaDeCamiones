// src/components/SuccessBanner.jsx
export const SuccessBanner = ({ mostrar }) => {
  if (!mostrar) return null;
  return (
    <div className="fixed top-0 left-0 w-full bg-green-500 text-white p-4 text-center font-bold shadow-lg animate-bounce z-50">
      ✅ ¡PEDIDO ENVIADO A LA OFICINA!
    </div>
  );
};