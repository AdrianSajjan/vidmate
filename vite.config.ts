import path from "path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";

export default defineConfig({
  plugins: [react(), selectiveHotModuleReload()],
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
});

function selectiveHotModuleReload(): PluginOption {
  return {
    name: "selective-hmr",
    handleHotUpdate({ server, file }) {
      if (file.includes("/src/store/") || file.includes("/src/fabric/") || file.includes("/src/plugins/") || file.includes("/src/models/")) {
        server.ws.send({
          type: "full-reload",
        });
        return [];
      }
    },
  };
}
