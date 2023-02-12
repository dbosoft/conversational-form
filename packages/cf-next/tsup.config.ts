import { defineConfig, Options } from "tsup";

export default defineConfig((options: Options) => ({
  treeshake: false,
  splitting: false,
  entry: ["src/**/*.tsx"],
  format: ["esm"],
  dts: true,
  minify: true,
  clean: true,
  external: ["react"],
  ...options,
}));
