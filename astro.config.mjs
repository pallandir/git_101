import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import svelte from "@astrojs/svelte";
import mermaid from "astro-mermaid";
import remarkGfm from "remark-gfm";

// Deployed at https://pallandir.github.io/git-primer
export default defineConfig({
  site: "https://pallandir.github.io",
  base: "/git-primer",
  // astro-mermaid (v2) injects its remark plugin through Astro 6's markdown
  // config and, in doing so, drops Astro's built-in GitHub-flavoured Markdown,
  // which is what turns `| ... |` blocks into real tables. Re-adding remark-gfm
  // here restores table (and strikethrough/task-list) rendering across chapters.
  markdown: {
    remarkPlugins: [remarkGfm],
  },
  integrations: [
    // astro-mermaid must run before Starlight's markdown processing
    mermaid({
      theme: "default",
      autoTheme: true,
    }),
    starlight({
      title: "A brief debunk of Git",
      description:
        "An interactive, animated introduction to Git, from your first commit to advanced workflows.",
      logo: {
        src: "./src/assets/git.svg",
        alt: "Git logo",
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/pallandir/git-primer",
        },
      ],
      tableOfContents: false,
      customCss: ["./src/styles/custom.css"],
      components: {
        Hero: "./src/components/Hero.astro",
      },
      sidebar: [
        {
          label: "Start here",
          items: [
            { label: "Welcome", link: "/" },
            { label: "1. Introduction to Git", slug: "introduction" },
            { label: "2. Setting Up a Repository", slug: "setup" },
          ],
        },
        {
          label: "Everyday Git",
          items: [
            { label: "3. Basic Git Workflow", slug: "basic-workflow" },
            { label: "4. Working with Branches", slug: "branches" },
            { label: "5. Remote Repositories", slug: "remotes" },
            { label: "6. Undoing Changes", slug: "undoing-changes" },
          ],
        },
        {
          label: "Under the Hood",
          items: [
            { label: "7. Understanding Git Internals", slug: "internals" },
          ],
        },
        {
          label: "Advanced Git",
          items: [
            { label: "8. Advanced Git Commands", slug: "advanced-commands" },
            { label: "9. Git Hooks & Automation", slug: "hooks-automation" },
            {
              label: "12. Submodules & Large Repos",
              slug: "submodules-large-repos",
            },
          ],
        },
        {
          label: "Working Well",
          items: [
            { label: "10. Git Best Practices", slug: "best-practices" },
            { label: "11. Troubleshooting", slug: "troubleshooting" },
            { label: "13. Git with Other Tools", slug: "other-tools" },
            {
              label: "14. Real-World Scenarios",
              slug: "real-world-scenarios",
            },
          ],
        },
        {
          label: "Keep Learning",
          items: [{ label: "15. Learning Resources", slug: "resources" }],
        },
      ],
    }),
    svelte(),
  ],
});
