import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  const isProd = mode === 'production';

  return {
    plugins: [react()],
    define: {
      // In Production (Docker), we read from window.__RUNTIME_CONFIG__ injected by nginx.
      // In Development, we read from the local .env file.
      'process.env.API_KEY': isProd 
        ? 'window.__RUNTIME_CONFIG__?.API_KEY' 
        : JSON.stringify(env.API_KEY),
        
      'process.env.GOOGLE_CLIENT_ID': isProd 
        ? 'window.__RUNTIME_CONFIG__?.GOOGLE_CLIENT_ID' 
        : JSON.stringify(env.GOOGLE_CLIENT_ID),
        
      'process.env.APPLE_CLIENT_ID': isProd 
        ? 'window.__RUNTIME_CONFIG__?.APPLE_CLIENT_ID' 
        : JSON.stringify(env.APPLE_CLIENT_ID),
    },
    server: {
      port: 8080,
      host: true
    }
  };
});