import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isUserOrOrgPage = repositoryName?.toLowerCase().endsWith(".github.io");
const githubPagesBase =
  process.env.GITHUB_ACTIONS && repositoryName && !isUserOrOrgPage
    ? `/${repositoryName}/`
    : "/";

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? githubPagesBase,
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://127.0.0.1:8000",
    },
  },
});
