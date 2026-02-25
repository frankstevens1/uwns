import type { Config } from "tailwindcss";
import path from "path";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    path.join(__dirname, "../../packages/ui/src/**/*.{ts,tsx}"),
    path.join(__dirname, "../../packages/providers/src/**/*.{ts,tsx}")
  ],
};

export default config;
