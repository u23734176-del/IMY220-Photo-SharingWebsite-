import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/

//helpr frontend developme server knows where to find your backedn point
  //helps port bridigin 
export default defineConfig({
  plugins: [react()],
    server:{
        proxy:{
            '/api':{
                target: 'http://localhost:3000' ,
                changeOrigin: true ,
                secure :false,
            }     
        }
    }
})
