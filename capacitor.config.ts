import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'app-movile',
  webDir: 'www',
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    }
  }
};

export default config;
