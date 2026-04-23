import { defineConfig, loadEnv, type Plugin, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import path from "node:path";
import { readFileSync } from "node:fs";

interface PackageJson {
  version: string;
}

const pkg: PackageJson = JSON.parse(
  readFileSync(path.resolve(__dirname, "package.json"), "utf-8"),
);

/**
 * Replaces `require("node-fetch")` / `import "node-fetch"` from transitive
 * deps (e.g. @tensorflow/tfjs-core via @aws-amplify/ui-react-liveness)
 * with a tiny shim that delegates to the browser's native fetch.
 *
 * Without this, esbuild dep-optimization in the consumer fails with:
 *   Could not resolve "node-fetch"
 */
const SHIM_ID = "\0virtual:node-fetch-browser-shim";
function shimNodeFetch(): Plugin {
  return {
    name: "shim-node-fetch",
    enforce: "pre",
    resolveId(source) {
      if (source === "node-fetch") {
        return { id: SHIM_ID, moduleSideEffects: false };
      }
      return null;
    },
    load(id) {
      if (id === SHIM_ID) {
        return `
const f = (...args) => globalThis.fetch(...args);
f.default = f;
export default f;
export const Headers = globalThis.Headers;
export const Request = globalThis.Request;
export const Response = globalThis.Response;
export const FormData = globalThis.FormData;
export const Blob = globalThis.Blob;
`;
      }
      return null;
    },
  };
}

const BROWSER_CONDITIONS = ["browser", "import", "module", "default"];
const BROWSER_MAIN_FIELDS = [
  "browser",
  "module",
  "jsnext:main",
  "jsnext",
  "main",
];

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
    conditions: [...BROWSER_CONDITIONS],
    mainFields: [...BROWSER_MAIN_FIELDS],
  };

  if (isSdk) {
    return {
      define: {
        "process.env.NODE_ENV": JSON.stringify("production"),
        __SDK_VERSION__: JSON.stringify(pkg.version),
      },
      plugins: [shimNodeFetch(), react(), cssInjectedByJsPlugin()],
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
        conditions: [...BROWSER_CONDITIONS],
        mainFields: [...BROWSER_MAIN_FIELDS],
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
            format === "es" ? "chainit-auth.esm.js" : "chainit-auth.umd.js",
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
      plugins: [shimNodeFetch(), react(), cssInjectedByJsPlugin()],
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
