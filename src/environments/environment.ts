
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // Supabase - Base de datos en la nube (funciona desde cualquier dispositivo)
  supabase: {
    url: 'https://htdvrcajzddfjzpbfjhb.supabase.co',
    key: 'sb_publishable_cVnJBQyNeNyuIJIqJx6fsA_330rGqLn'
  },
  // Backend API (opcional - solo si usas Spring Boot)
  apiUrl: 'http://192.168.18.225:8080/api', // IP local de tu PC para dispositivo real
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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
