import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Requests that start with /api are sent to the Flask server,
// so the browser only talks to one address and CORS is not needed
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://127.0.0.1:5000"
    }
  }
});
