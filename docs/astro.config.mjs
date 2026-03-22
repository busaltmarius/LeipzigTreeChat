// @ts-check

import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const [githubOwner, githubRepo] = (process.env.GITHUB_REPOSITORY ?? "").split("/");
const isGitHubActions = process.env.GITHUB_ACTIONS === "true";

// https://astro.build/config
export default defineConfig({
  site: githubOwner ? `https://${githubOwner}.github.io` : undefined,
  base: isGitHubActions && githubRepo ? `/${githubRepo}` : undefined,

  integrations: [
    starlight({
      title: "Baumbart Documentation",
      favicon: "/baumbart-docs-logo.png",
      logo: {
        src: "./src/assets/baumbart-docs-logo.png",
        alt: "Baumbart logo",
      },
      customCss: ["./src/styles/global.css"],
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/busaltmarius/LeipzigTreeChat" }],
      sidebar: [
        {
          label: "Guides",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Getting Started", slug: "guides/getting-started" },
          ],
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
        {
          label: "Source Code",
          collapsed: true,
          autogenerate: { directory: "source-code" },
        },
      ],
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
