import { defineConfig } from "tsup";

const config = defineConfig({
  format: ["cjs", "esm"],
  dts: true,
  entry: {
    index: "src/index.ts",
    client: "src/client.ts",
  },
});

export default config;
