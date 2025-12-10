import react from "@vitejs/plugin-react-swc";
import { defineConfig, type Plugin } from "vite";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  clearScreen: false,
  base: "./",
  server: {
    proxy: {
      "/api": "http://localhost:8482",
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.APP_VERSION || "0.0.0-dev"),
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
