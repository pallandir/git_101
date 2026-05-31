<script>
  import FlowDiagram from "./FlowDiagram.svelte";

  const nodes = [
    { id: "git", label: "Git", sub: "the version-control tool", icon: "🔧", variant: "tool", x: 0, y: 130, order: 0 },
    { id: "gh", label: "GitHub", sub: "hosting · built on Git", variant: "platform", x: 360, y: 0, order: 1 },
    { id: "gl", label: "GitLab", sub: "hosting · built on Git", variant: "platform", x: 360, y: 130, order: 2 },
    { id: "bb", label: "Bitbucket", sub: "hosting · built on Git", variant: "platform", x: 360, y: 260, order: 3 },
  ];

  const edges = [
    { source: "git", target: "gh", label: "push / pull", variant: "orange" },
    { source: "git", target: "gl", label: "push / pull", variant: "orange" },
    { source: "git", target: "bb", label: "push / pull", variant: "orange" },
  ];
</script>

<FlowDiagram
  {nodes}
  {edges}
  height="360px"
  label="Git the tool versus the platforms that host Git repositories"
/>
