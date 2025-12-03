import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/starbharat": "http://51.15.7.9:2905",
      "/stargold2": "http://51.15.7.9:2905",
      "/stargold": "http://51.15.7.9:2905",
      "/pix": "http://51.15.7.9:2905",
      "/starmovies": "http://51.15.7.9:2905",
      "/starplus": "http://51.15.7.9:2905",
    },
  },
});
