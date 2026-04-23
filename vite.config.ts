import { defineConfig, loadEnv, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import path from "node:path";
import { readFileSync } from "node:fs";

interface PackageJson {
  version: string;
}

const pkg: PackageJson = JSON.parse(
  readFileSync(path.resolve(__dirname, "package.json"), "utf-8")
);

function normalizeBase(base?: string): string {
  if (!base) return "/";
  if (base === "./") return "./";

  let normalized = base;
  if (!normalized.startsWith("/")) normalized = `/${normalized}`;
  if (!normalized.endsWith("/")) normalized = `${normalized}/`;
  return normalized;
}

export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, process.cwd(), "");
  const isLib: boolean = mode === "lib";
  const isSdk: boolean = mode === "sdk";
  const base: string = normalizeBase(env.VITE_BASE_PATH);

  const sharedResolve: UserConfig["resolve"] = {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "@tanstack/react-query",
    ],
  };

  if (isSdk) {
    return {
      define: {
        "process.env.NODE_ENV": JSON.stringify("production"),
        __SDK_VERSION__: JSON.stringify(pkg.version),
      },
      plugins: [react(), cssInjectedByJsPlugin()],
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
        },
        dedupe: [
          "react",
          "react-dom",
          "react/jsx-runtime",
          "@tanstack/react-query",
        ],
      },
      build: {
        target: "es2018",
        outDir: "dist/sdk",
        emptyOutDir: true,
        lib: {
          entry: path.resolve(__dirname, "src/sdk/index.ts"),
          name: "ChainItAuth",
          formats: ["umd", "es"],
          fileName: (format: string) =>
            format === "es"
              ? "chainit-auth.esm.js"
              : "chainit-auth.umd.js",
        },
        rollupOptions: {
          external: [],
          output: {
            inlineDynamicImports: true,
            extend: true,
          },
        },
        sourcemap: true,
        minify: "esbuild",
      },
    };
  }

  if (isLib) {
    return {
      define: {
        "process.env.NODE_ENV": JSON.stringify("production"),
      },
      plugins: [react(), cssInjectedByJsPlugin()],
      resolve: sharedResolve,
      build: {
        target: "es2018",
        lib: {
          entry: path.resolve(__dirname, "src/index.ts"),
          formats: ["es", "cjs"],
          fileName: (format: string) =>
            format === "es" ? "index.js" : "index.cjs",
        },
        rollupOptions: {
          external: [
            "react",
            "react-dom",
            "react/jsx-runtime",
            "axios",
            "@tanstack/react-query",
          ],
        },
        sourcemap: true,
        minify: true,
      },
    };
  }

  return {
    base,
    plugins: [react()],
    resolve: sharedResolve,
  };
});