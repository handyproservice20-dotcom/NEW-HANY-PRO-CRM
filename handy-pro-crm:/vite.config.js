import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: Change '/handy-pro-crm/' to match your GitHub repository name
// Example: if your repo is github.com/yourname/my-crm, use '/my-crm/'
export default defineConfig({
  plugins: [react()],
  base: '/handy-pro-crm/',
})
