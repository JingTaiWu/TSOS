import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // For GitHub Pages: set to '/<repo-name>/' if deploying to https://<user>.github.io/<repo-name>/
  // Set to '/' if deploying to https://<user>.github.io/ (user site)
  base: '/TSOS/',
})
