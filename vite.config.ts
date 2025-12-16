import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // In development, we use the local .env values.
  // In production (Docker), these strings are replaced by entrypoint.sh
  const isProd = mode === 'production';

  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(isProd ? '__RUNTIME_API_KEY__' : env.API_KEY),
      'process.env.GOOGLE_CLIENT_ID': JSON.stringify(isProd ? '__RUNTIME_GOOGLE_CLIENT_ID__' : env.GOOGLE_CLIENT_ID),
      'process.env.APPLE_CLIENT_ID': JSON.stringify(isProd ? '__RUNTIME_APPLE_CLIENT_ID__' : env.APPLE_CLIENT_ID),
    },
    server: {
      port: 8080,
      host: true
    }
  };
});