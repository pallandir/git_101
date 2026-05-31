<script>
  import { onMount } from "svelte";
  import { SvelteFlow } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/style.css";
  import GitDemo from "./GitDemo.svelte";
  import TimelineControls from "./TimelineControls.svelte";
  import FlowBox from "./flow/FlowBox.svelte";
  import FlowEdge from "./flow/FlowEdge.svelte";
  import AnchorNode from "./flow/AnchorNode.svelte";

  const nodeTypes = { box: FlowBox, anchor: AnchorNode };
  const edgeTypes = { flow: FlowEdge };

  const ANCHORS = [
    { id: "__a0", type: "anchor", position: { x: -60, y: -20 }, data: {}, draggable: false, selectable: false },
    { id: "__a1", type: "anchor", position: { x: 660, y: 420 }, data: {}, draggable: false, selectable: false },
  ];

  const captions = [
    "Press play, or step forward, to peel back the three object types behind one commit.",
    "A commit is a snapshot. It stores metadata — author, date, message — and points to exactly one tree.",
    "The tree is your project folder turned into data: it lists each file by name and points every name to a blob.",
    "Blobs hold the raw file content, addressed by a hash. A later commit that didn't change README points its tree at the very same blob — identical content is stored only once.",
  ];

  let revealed = $state(0);

  // [id, label, sub, variant, x, y, minStep]
  const NODE_DEFS = [
    ["commit", "commit", "a1b2c3d · \"Add login form\"", "commit", 150, 0, 1],
    ["tree", "tree", "f9e8d7c · lists files → blobs", "tree", 150, 150, 2],
    ["bApp", "blob", "📄 app.js", "blob", -20, 320, 3],
    ["bReadme", "blob", "📄 README.md · shared", "blob", 230, 320, 3],
    ["commit2", "later commit", "e4f5a6b · README unchanged", "commit", 470, 0, 3],
    ["tree2", "tree", "c0ffee1", "tree", 470, 150, 3],
  ];

  // [id, from, to, sourceHandle, targetHandle, variant, dashed, minStep]
  const EDGE_DEFS = [
    ["c-t", "commit", "tree", "s-b", "t-t", "commit", false, 2],
    ["t-ba", "tree", "bApp", "s-b", "t-t", "blob", false, 3],
    ["t-br", "tree", "bReadme", "s-b", "t-t", "blob", false, 3],
    ["c2-t2", "commit2", "tree2", "s-b", "t-t", "commit", false, 3],
    ["t2-br", "tree2", "bReadme", "s-b", "t-t", "muted", true, 3],
  ];

  let nodes = $state.raw([]);
  let edges = $state.raw([]);

  function rebuild(step) {
    nodes = [
      ...ANCHORS,
      ...NODE_DEFS.filter((d) => step >= d[6]).map((d, i) => ({
        id: d[0],
        type: "box",
        position: { x: d[4], y: d[5] },
        data: { label: d[1], sub: d[2], variant: d[3], order: i },
        draggable: false,
        selectable: false,
      })),
    ];
    edges = EDGE_DEFS.filter((d) => step >= d[7]).map((d) => ({
      id: d[0],
      source: d[1],
      target: d[2],
      type: "flow",
      sourceHandle: d[3],
      targetHandle: d[4],
      data: { variant: d[5], dashed: d[6], animated: false, arrow: true, strokeWidth: 2 },
    }));
  }

  rebuild(0);
  $effect(() => rebuild(revealed));
</script>

<GitDemo caption={captions[revealed]} step={revealed} count={captions.length} height="440px">
  {#snippet controls()}
    <TimelineControls
      count={4}
      bind:step={revealed}
      interval={2400}
      labels={["", "Commit", "Tree", "Blobs + reuse"]}
    />
  {/snippet}

  <svg width="0" height="0" class="om__defs" aria-hidden="true">
    <defs>
      {#each [["orange", "var(--git-orange)"], ["blue", "var(--gp-feature)"], ["green", "var(--gp-green)"], ["muted", "var(--sl-color-gray-5)"]] as [key, fill]}
        <marker id={`fd-arrow-${key}`} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" style={`fill:${fill}`} />
        </marker>
      {/each}
    </defs>
  </svg>

  <div class="om">
    <div class="om__legend">
      <span class="om__key om__key--commit">commit</span>
      <span class="om__key om__key--tree">tree</span>
      <span class="om__key om__key--blob">blob</span>
    </div>
    <div class="om__canvas">
      {#if revealed === 0}
        <p class="om__hint">Press play, or step forward, to peel back the layers of a commit.</p>
      {:else}
        <SvelteFlow
          {nodes}
          {edges}
          {nodeTypes}
          {edgeTypes}
          colorMode="dark"
          fitView
          fitViewOptions={{ padding: 0.16 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll={false}
          zoomOnDoubleClick={false}
          panOnScroll={false}
          panOnDrag={false}
          proOptions={{ hideAttribution: true }}
        ></SvelteFlow>
      {/if}
    </div>
  </div>
</GitDemo>

<style>
  .om__defs {
    position: absolute;
    width: 0;
    height: 0;
  }
  .om {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    height: 100%;
  }
  .om__legend {
    display: flex;
    gap: 0.8rem;
    flex-wrap: wrap;
  }
  .om__key {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--sl-color-gray-2);
  }
  .om__key::before {
    content: "";
    width: 0.7rem;
    height: 0.7rem;
    border-radius: 3px;
    background: currentColor;
  }
  .om__key--commit::before {
    color: var(--git-orange);
  }
  .om__key--tree::before {
    color: var(--gp-feature);
  }
  .om__key--blob::before {
    color: var(--gp-green);
  }
  .om__canvas {
    position: relative;
    flex: 1;
    min-height: 0;
  }
  .om__hint {
    position: absolute;
    inset: 0;
    margin: 0;
    display: grid;
    place-items: center;
    text-align: center;
    color: var(--sl-color-gray-4);
    font-size: 0.9rem;
  }
  .om__canvas :global(.svelte-flow) {
    background: transparent;
  }
  .om__canvas :global(.svelte-flow__edges) {
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .om__canvas :global(.svelte-flow__edge-wrapper) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .om__canvas :global(.svelte-flow__node) {
    cursor: default;
  }
</style>
