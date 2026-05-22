import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.texinspect.ai',
  appName: 'TEXINSPECT',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
