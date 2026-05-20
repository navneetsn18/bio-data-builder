import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    base: "/bio-data-builder"
  },
});


