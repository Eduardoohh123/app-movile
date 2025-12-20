import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'app-movile',
  webDir: 'www',
  server: {
    // Permite conexiones HTTP en desarrollo
    cleartext: true,
    // Para desarrollo con dispositivo real, usa la IP de tu PC
    // androidScheme: 'http'
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    }
  }
};

export default config;
