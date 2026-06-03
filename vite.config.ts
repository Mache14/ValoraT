import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    open: true,   // abre el navegador automáticamente al arrancar
    host: true,   // permite abrir la app también desde el móvil en la misma red WiFi
  },
})
