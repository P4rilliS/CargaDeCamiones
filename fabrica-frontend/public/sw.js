self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.message,
    icon: '/logo192.png', // O el icono que tengas en public
    badge: '/logo192.png',
    vibrate: [200, 100, 200, 100, 200], // Patrón de vibración
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      { action: 'explore', title: 'Ver Pedido' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Esto hace que al tocar la notificación se abra la app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});