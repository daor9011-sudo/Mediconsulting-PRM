// Función serverless de Vercel — la única pieza que sí puede enviar el push
// de verdad, porque necesita una clave secreta (nunca debe estar en el navegador).
//
// ═══════════════════════════════════════════
// CÓMO DESPLEGAR ESTO (una sola vez):
// ═══════════════════════════════════════════
// 1. En tu proyecto de Firebase: ⚙️ Configuración del proyecto → pestaña
//    "Cuentas de servicio" → botón "Generar nueva clave privada".
//    Se descarga un archivo .json — NUNCA lo subas a GitHub.
//
// 2. En el dashboard de Vercel de este proyecto: Settings → Environment
//    Variables → agrega una variable llamada FIREBASE_SERVICE_ACCOUNT,
//    y pega ahí el CONTENIDO COMPLETO de ese archivo .json (como texto).
//
// 3. Coloca este archivo en la carpeta /api del repo (junto al HTML), y
//    agrega "firebase-admin" a las dependencias (package.json):
//    { "dependencies": { "firebase-admin": "^12.0.0" } }
//
// 4. Vercel detecta automáticamente cualquier archivo en /api como un
//    endpoint — quedará disponible en https://tu-dominio.vercel.app/api/notificar-llego
// ═══════════════════════════════════════════

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { doctora, paciente } = req.body;
    if (!doctora || !paciente) {
      return res.status(400).json({ error: 'Falta doctora o paciente' });
    }

    // 1. Buscar el token guardado de esa doctora en Firestore
    const db = admin.firestore();
    const doc = await db.collection('tokensDoctoras').doc(doctora).get();
    if (!doc.exists || !doc.data().token) {
      return res.status(404).json({ error: 'Esa doctora no tiene notificaciones activadas' });
    }
    const token = doc.data().token;

    // 2. Enviar la notificación push real
    await admin.messaging().send({
      token,
      notification: {
        title: '🚶 Llegó ' + paciente,
        body: 'Tu paciente ya está en recepción.'
      }
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Error enviando notificación:', e);
    return res.status(500).json({ error: 'No se pudo enviar la notificación' });
  }
};
