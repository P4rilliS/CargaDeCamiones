import React, { useState, useEffect } from 'react';

function App() {
  const [vista, setVista] = useState(localStorage.getItem("esOficina") === "si" ? "oficina" : "planta");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pedido, setPedido] = useState({ Individual: 0, Matrimonial: 0, Queen: 0, King: 0 });
  const [historial, setHistorial] = useState([]);
  const [operador, setOperador] = useState(null);
  const [pinPlanta, setPinPlanta] = useState("");
  // const [pedido, setPedido] = useState({ colchones: { Individual: 0, Matrimonial: 0, Queen: 0, King: 0 }
                                        // gomaEspuma: { "D20 10cm": 0, "D30 15cm": 0, "Bloque Estándar": 0 }
// });

// También necesitamos saber qué pestaña de productos está viendo el operador
// const [seccionActual, setSeccionActual] = useState("colchones");

  // --- PERSONAS PERMITIDAS ---
  const USUARIOS_PLANTA = {
    "9216794": "Marino Cardenas",
    "21152542": " Daniel Cardenas",
    "19274866": "Sergio Parilli"
  }
  
  // --- ESTADOS PARA MENSAJES (Nuevos) ---
  const [mensajeExito, setMensajeExito] = useState(false);
  const [errorPin, setErrorPin] = useState(false);
  
  // --- CONFIGURACION (IP) ---
  const miIP = "192.168.0.8"; 
  
  // --- CONFIGURACION DE NOTIFICACIONES () ---
  const activarNotificaciones = async () => {
    try {
      //1. Pedimos permiso para enviar notificaciones
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") {
        alert("Necesitamos permiso para enviar notificaciones");
        return;
      }
      //2. Registramos el Service Worker
      const registro = await navigator.serviceWorker.register('/sw.js');
      console.log("Service Worker registrado");
      console.log("llave detectada:", process.env.REACT_APP_PUBLIC_KEY);

      //3. Creamos la suscripción (el "ID" del teléfono)
      const subscription = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: "BD-NIGZw4hDIdJzjKkyCnDXq9OPwubj_Ao4JDEUkWFmEZR0iPo5JjsZnkxg-sJCLd3TRc5cdGg22AB2Hq3m3XcE"
      });
      console.log("Suscripción creada:", subscription);

      //4. Enviamos esa suscripción a nuestro servidor para guardarla
      await fetch(`http://${miIP}:3000/api/suscribir-oficina`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
      console.log("Suscripción enviada al servidor");
      // alert("¡Notificaciones activadas! Ahora recibirás un aviso cada vez que llegue un nuevo pedido a la oficina.");
    } catch (error) {
      console.error("Error al activar notificaciones:", error);
      // alert("Hubo un error activando las notificaciones. Revisa la consola para más detalles.");
    }
  };

  useEffect(() => {
    const permiso = localStorage.getItem("esOficina");
    if (permiso === "si") setIsAuthenticated(true);
  }, []);

  const verificarAcceso = () => {
    if (pin === "1234") {
      localStorage.setItem("esOficina", "si");
      setIsAuthenticated(true);
      setVista("oficina");
      setErrorPin(false);
    } else {
      setErrorPin(true);
      setPin("");
      // El mensaje de error desaparece a los 3 segundos
      setTimeout(() => setErrorPin(false), 3000);
    }
  };

  const enviarPedido = async () => {
    try {
      const res = await fetch(`http://${miIP}:3000/api/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planta: operador, productos: pedido })
      });
      if (res.ok) {
        setMensajeExito(true);
        setPedido({ Individual: 0, Matrimonial: 0, Queen: 0, King: 0 });
        // El banner de éxito desaparece a los 4 segundos
        setTimeout(() => setMensajeExito(false), 4000);
      }
    } catch (err) {
      console.error("Error al enviar");
    }
  };

  const obtenerPedidos = async () => {
    try {
      const res = await fetch(`http://${miIP}:3000/api/pedidos`);
      const datos = await res.json();
      setHistorial(datos);
    } catch (err) { console.log("Error"); }
  };

  useEffect(() => {
    if (vista === "oficina" && isAuthenticated) {
      obtenerPedidos();
      const intervalo = setInterval(obtenerPedidos, 5000);
      return () => clearInterval(intervalo);
    }
  }, [vista, isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans text-gray-800">
      
      {/* 1. NOTIFICACIÓN DE ÉXITO (Aparece arriba de todo) */}
      {mensajeExito && (
        <div className="fixed top-0 left-0 w-full bg-green-500 text-white p-4 text-center font-bold shadow-lg animate-bounce z-50">
          ✅ ¡PEDIDO ENVIADO A LA OFICINA!
        </div>
      )}

      <div className="flex justify-center gap-4 mb-8">
        <button onClick={() => setVista("planta")} className={`px-6 py-3 rounded-xl font-bold ${vista === 'planta' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500'}`}>
          🏭 PLANTA
        </button>
        <button onClick={() => setVista("oficina")} className={`px-6 py-3 rounded-xl font-bold ${vista === 'oficina' ? 'bg-green-600 text-white' : 'bg-white text-gray-500'}`}>
          🏢 OFICINA
        </button>
      </div>

      {vista === "planta" ? (
        <div className="max-w-md mx-auto">
          {!operador ? (
            <div className="bg-white p-8 rounded-3xl shadow-xl text-center">
              <div className="text-4xl mb-4">👷‍♂️</div>
              <h3 className="text-lg font-bold mb-4">Identificacion de planta</h3>
              <input 
                type="password" 
                value={pinPlanta}
                onChange={(e) => setPinPlanta(e.target.value.replace(/\D/g, ''))} // Solo permite números
                placeholder="Ingrese su PIN de planta"
                inputMode='numeric'
                pattern='[0-9]*'
                autoFocus
                className={`border-2 p-4 rounded-xl mb-4 w-full text-center text-xl outline-none ${errorPin ? 'border-red-500 animate-shake' : 'border-gray-100 focus:border-green-500'}`}
              />
              <button onClick={() => {
                if (USUARIOS_PLANTA[pinPlanta]) {
                  const nombre = USUARIOS_PLANTA[pinPlanta];
                  setOperador(nombre);
                  localStorage.setItem("operadorNombre", nombre);
                  setPinPlanta("");
                } else {
                  alert("PIN no reconocido. Intente nuevamente.");
                  setPinPlanta("");
                }
              }}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-black text-lg">
                INGRESAR
              </button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-black text-blue-800">OPERADOR: {operador}</h2>
                <button onClick={() => setOperador(null)} className="text-[10px] text-red-500 underline">CAMBIAR USUARIO</button>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                {Object.keys(pedido).map(m => (
                  <button key={m} onClick={() => setPedido({...pedido, [m]: pedido[m]+1})} className="bg-white p-6 border-b-4 border-blue-500 rounded-2xl shadow active:scale-95 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase">{m}</p>
                    <p className="text-3xl font-black text-blue-600">{pedido[m]}</p>
                  </button>
                ))}
              </div>
          <button onClick={enviarPedido} className="w-full bg-blue-600 text-white font-black py-5 mt-6 rounded-2xl shadow-lg text-xl uppercase">
            Enviar Pedido
          </button>
        </div>
          )}
      </div>

      ) : (!isAuthenticated ? (
        <div className="max-w-md mx-auto bg-white p-10 rounded-3xl shadow-xl text-center mt-10">
          <div className="text-5xl mb-4">🔐</div>
          <h3 className="text-xl font-bold mb-6">Acceso a Oficina</h3>
          <button onClick={activarNotificaciones} className="mb-8 w-full bg-yellow-100 text-yellow-700 border border-yellow-200 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-yellow-200 transition-all">
            Activar Notificaciones
          </button>
          <input 
            type="password" 
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} // Solo permite números
            placeholder="PIN de Seguridad"
            inputMode='numeric'
            pattern='[0-9]*'
            autoFocus
            className={`border-2 p-4 rounded-xl mb-2 w-full text-center text-2xl outline-none ${errorPin ? 'border-red-500 animate-shake' : 'border-gray-100 focus:border-green-500'}`}
          />
          
          {/* 2. MENSAJE DE ERROR (Aparece abajo del input) */}
          <div className="h-6 mb-4">
            {errorPin && <p className="text-red-500 text-sm font-bold">❌ PIN incorrecto</p>}
          </div>

          <button onClick={verificarAcceso} className="bg-green-600 text-white w-full py-4 rounded-xl font-black text-lg">
            ENTRAR
          </button>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <button onClick={activarNotificaciones} className="mb-8 w-full bg-yellow-100 text-yellow-700 border border-yellow-200 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-yellow-200 transition-all">
            Activar Notificaciones
          </button>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-green-700">HISTORIAL OFICINA</h2>
            <button onClick={() => {localStorage.removeItem("esOficina"); setIsAuthenticated(false); setVista("planta")}} className="text-[10px] text-red-500 font-bold">CERRAR SESION</button>
          </div>
          <div className="space-y-3">
            {historial.map((p, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border-l-8 border-green-500 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{new Date(p.fecha).toLocaleString()}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {Object.entries(p.productos).map(([nom, cant]) => cant > 0 && (
                      <span key={nom} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold border border-blue-100">{nom}: {cant}</span>
                    ))}
                  </div>
                </div>
                <div className="text-[10px] font-black text-gray-300 uppercase">{p.planta}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;