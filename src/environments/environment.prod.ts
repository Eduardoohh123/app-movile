export const environment = {
  production: true,
  // Supabase - Base de datos en la nube
  supabase: {
    url: 'https://htdvrcajzddfjzpbfjhb.supabase.co',
    key: 'sb_publishable_cVnJBQyNeNyuIJIqJx6fsA_330rGqLn'
  },
  // API backend URL - reemplaza por tu URL de producción o por un túnel de desarrollo
  // Ejemplos:
  // - IPv6 (si tu móvil también usa Cloudflare WARP):
  //    apiUrl: 'http://[2606:4700:110:81cc:f737:3048:f4c:fc51]:8080/api'
  // - Ngrok / Cloudflare Tunnel (recomendado si no usas WARP):
  //    apiUrl: 'https://abcd1234.ngrok.io/api'
  // Usar IPv6 WARP (ejemplo):
  apiUrl: 'https://automatically-produce-shipping-consolidated.trycloudflare.com/api', // túnel Cloudflare (http2) a localhost:8080
  firebase: {
    apiKey: "AIzaSyCRT2DDKCVo6F5Yp3yMGri2exM_QStaiDU",
    authDomain: "app-mobile-2025-b833b.firebaseapp.com",
    databaseURL: "https://app-mobile-2025-b833b-default-rtdb.firebaseio.com",
    projectId: "app-mobile-2025-b833b",
    storageBucket: "app-mobile-2025-b833b.firebasestorage.app",
    messagingSenderId: "39113356850",
    appId: "1:39113356850:web:89ae9882ab6230f4d46e2b",
    measurementId: "G-MXTLKKXRYV"
  }
};
