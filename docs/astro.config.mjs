// @ts-check

import starlight from "@astrojs/starlight";
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
      ],
    }),
  ],
});
