<script>
  import FlowDiagram from "./FlowDiagram.svelte";

  const nodes = [
    { id: "local", label: "Local repository", sub: "your machine", variant: "local", x: 0, y: 0, order: 0, minHeight: 184 },
    { id: "remote", label: "Remote (origin)", sub: "GitHub / GitLab / …", variant: "remote", x: 460, y: 0, order: 1, minHeight: 184 },
  ];

  const edges = [
    { source: "local", target: "remote", sourceHandle: "sr0", targetHandle: "tl0", label: "git push", variant: "orange" },
    { source: "remote", target: "local", sourceHandle: "sl1", targetHandle: "tr1", label: "git fetch", variant: "blue" },
    { source: "remote", target: "local", sourceHandle: "sl2", targetHandle: "tr2", label: "git pull  (fetch + merge)", variant: "green" },
  ];
</script>

<FlowDiagram
  {nodes}
  {edges}
  height="300px"
  label="Pushing, fetching and pulling between your local repository and the remote"
/>
