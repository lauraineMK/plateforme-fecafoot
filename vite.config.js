import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" => les chemins des fichiers sont relatifs,
// ce qui fonctionne directement sur GitHub Pages (site de projet).
export default defineConfig({
  plugins: [react()],
  base: "./",
});
