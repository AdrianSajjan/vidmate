import path from "path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "full-reload",
      handleHotUpdate({ server, file }) {
        if (file.includes("/src/stores/") || file.includes("/src/fabric/") || file.includes("/src/plugins/") || file.includes("/src/models/")) {
          server.ws.send({
            type: "full-reload",
          });
          return [];
        }
      },
    },
  ],
  build: {
    target: "esnext",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
  },
  server: {
    hmr: {},
  },
});
