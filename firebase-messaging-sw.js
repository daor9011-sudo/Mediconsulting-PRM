// Service worker de Firebase Cloud Messaging.
// Este archivo debe vivir en la RAÍZ del sitio (mismo nivel que index.html),
// no dentro de una subcarpeta — si no, el navegador no lo encuentra.

importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBPi78epig3Axp0-n9w7e5sv5pB5Jx9n3E",
  authDomain: "notificaciones-de-agenda.firebaseapp.com",
  projectId: "notificaciones-de-agenda",
  storageBucket: "notificaciones-de-agenda.firebasestorage.app",
  messagingSenderId: "217171904219",
  appId: "1:217171904219:web:5a8b24a85e9260f9d3aefe"
});

const messaging = firebase.messaging();

// Qué hacer cuando llega una notificación y la doctora NO tiene la pestaña abierta.
// IMPORTANTE: usa la MISMA "tag" que la app usa en primer plano
// (new Notification(titulo, {tag:'agenda-llego'})) — así, si por algún
// estado ambiguo del navegador se llegan a disparar las dos rutas para el
// mismo aviso, la segunda REEMPLAZA a la primera en vez de amontonarse
// como dos notificaciones separadas.
messaging.onBackgroundMessage((payload) => {
  const titulo = payload.notification?.title || 'Agenda';
  const opciones = {
    body: payload.notification?.body || '',
    icon: '/icono-agenda.png', // opcional: pon aquí el logo de Mediconsulting si quieres
    tag: 'agenda-llego'
  };
  self.registration.showNotification(titulo, opciones);
});
