import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "HintergrundAuth",
            formats: ["es", "umd"],
            fileName: "hintergrund-auth",
        },
        rollupOptions: {
            // No external dependencies to declare
            // as this library uses only Web APIs (crypto, btoa, etc.)
        },
    },
    plugins: [
        dts({
            insertTypesEntry: true,
        }),
    ],
});
