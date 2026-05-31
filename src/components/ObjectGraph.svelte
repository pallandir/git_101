<script>
  import FlowDiagram from "./FlowDiagram.svelte";

  const nodes = [
    { id: "c1", label: "commit 1", variant: "commit", x: 0, y: 40, order: 0 },
    { id: "c2", label: "commit 2", variant: "commit", x: 0, y: 220, order: 1 },
    { id: "t1", label: "tree", variant: "tree", x: 220, y: 40, order: 2 },
    { id: "t2", label: "tree", variant: "tree", x: 220, y: 220, order: 3 },
    { id: "b2", label: "blob", sub: "app.js (v1)", variant: "blob", x: 460, y: -50, order: 4 },
    { id: "b1", label: "blob", sub: "README · shared", variant: "blob", x: 460, y: 130, order: 5 },
    { id: "b3", label: "blob", sub: "app.js (v2)", variant: "blob", x: 460, y: 310, order: 6 },
  ];

  const edges = [
    { source: "c1", target: "t1", variant: "commit" },
    { source: "c2", target: "t2", variant: "commit" },
    { source: "t1", target: "b1", variant: "blob" },
    { source: "t1", target: "b2", variant: "blob" },
    { source: "t2", target: "b1", variant: "blob", label: "shared" },
    { source: "t2", target: "b3", variant: "blob" },
    { source: "c2", target: "c1", sourceHandle: "s-t", targetHandle: "t-b", variant: "muted", dashed: true, label: "parent" },
  ];

  const legend = [
    { label: "commit", variant: "commit" },
    { label: "tree", variant: "tree" },
    { label: "blob", variant: "blob" },
  ];
</script>

<FlowDiagram
  {nodes}
  {edges}
  {legend}
  height="400px"
  label="How commits point to trees, and trees to blobs, with one blob shared by two commits"
/>
