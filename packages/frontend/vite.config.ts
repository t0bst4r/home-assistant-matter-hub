import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  clearScreen: false,
  server: {
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
  plugins: [react(), svgr(), markdown()],
});

function markdown(): Plugin {
  return {
    name: "markdown-loader",
    transform(code, id) {
      if (id.slice(-3) === ".md") {
        return `export default ${JSON.stringify(code)}`;
      }
    },
  };
}
