<script>
  import { onMount } from "svelte";
  import { SvelteFlow } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/style.css";
  import FlowBox from "./flow/FlowBox.svelte";
  import FlowEdge from "./flow/FlowEdge.svelte";
  import FitView from "./flow/FitView.svelte";

  let {
    nodes: nodeData = [],
    edges: edgeData = [],
    height = "320px",
    label = "Diagram",
    legend = null,
  } = $props();

  const nodeTypes = { box: FlowBox };
  const edgeTypes = { flow: FlowEdge };

  const COLOR = {
    orange: "var(--git-orange)",
    tool: "var(--git-orange)",
    commit: "var(--git-orange)",
    local: "var(--git-orange)",
    blue: "var(--gp-feature)",
    platform: "var(--gp-feature)",
    tree: "var(--gp-feature)",
    remote: "var(--gp-feature)",
    green: "var(--gp-green)",
    blob: "var(--gp-green)",
    muted: "var(--sl-color-gray-4)",
  };

  let colorMode = $state("dark");

  const initialNodes = nodeData.map((n, i) => ({
    id: n.id,
    type: "box",
    position: { x: n.x, y: n.y },
    initialWidth: n.w ?? 190,
    initialHeight: n.h ?? n.minHeight ?? 84,
    data: { label: n.label, sub: n.sub, icon: n.icon, variant: n.variant, order: n.order ?? i, minHeight: n.minHeight },
    draggable: false,
    selectable: false,
  }));

  const initialEdges = edgeData.map((e, i) => ({
    id: e.id ?? `e${i}`,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle ?? "sr1",
    targetHandle: e.targetHandle ?? "tl1",
    type: "flow",
    label: e.label,
    data: { variant: e.variant ?? "orange", dashed: !!e.dashed, animated: e.animated },
  }));

  let nodes = $state.raw(initialNodes);
  let edges = $state.raw(initialEdges);

  onMount(() => {
    const sync = () =>
      (colorMode =
        document.documentElement.dataset.theme === "light" ? "light" : "dark");
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => obs.disconnect();
  });
</script>

<svg width="0" height="0" class="fd__defs" aria-hidden="true">
  <defs>
    {#each [["orange", COLOR.orange], ["blue", COLOR.blue], ["green", COLOR.green], ["muted", COLOR.muted]] as [key, fill]}
      <marker
        id={`fd-arrow-${key}`}
        viewBox="0 0 10 10"
        refX="8.5"
        refY="5"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M0 0 L10 5 L0 10 z" style={`fill:${fill}`} />
      </marker>
    {/each}
  </defs>
</svg>

<div class="fd not-content" style={`height:${height}`}>
  {#if legend}
    <div class="fd__legend">
      {#each legend as item}
        <span class="fd__key" style={`--k:${COLOR[item.variant] ?? COLOR.orange}`}>
          {item.label}
        </span>
      {/each}
    </div>
  {/if}
  <div class="fd__canvas">
    <SvelteFlow
      bind:nodes
      bind:edges
      {nodeTypes}
      {edgeTypes}
      {colorMode}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      zoomOnScroll={false}
      zoomOnDoubleClick={false}
      panOnScroll={false}
      panOnDrag={false}
      proOptions={{ hideAttribution: true }}
      aria-label={label}
    >
      <FitView padding={0.08} />
    </SvelteFlow>
  </div>
</div>

<style>
  .fd__defs {
    position: absolute;
    width: 0;
    height: 0;
  }
  .fd {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 0.7rem;
    overflow: hidden;
    background: var(--sl-color-black);
  }
  .fd__legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    padding: 0.7rem 0.9rem 0;
  }
  .fd__key {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--sl-color-gray-2);
  }
  .fd__key::before {
    content: "";
    width: 0.7rem;
    height: 0.7rem;
    border-radius: 3px;
    background: var(--k);
  }
  .fd__canvas {
    flex: 1;
    min-height: 0;
  }
  .fd__canvas :global(.svelte-flow) {
    background-color: var(--sl-color-black);
    background-image: radial-gradient(
      circle,
      color-mix(in srgb, var(--sl-color-white) 7%, transparent) 1px,
      transparent 1.5px
    );
    background-size: 20px 20px;
  }
  .fd__canvas :global(.svelte-flow__node) {
    cursor: default;
  }
  /* The edges container and each per-edge wrapper svg collapse to 0x0 by
     default, so their absolutely-positioned paths rely on overflow:visible to
     show — which hit-tests but never rasterises in this compositing path. Size
     the whole chain to the viewport so every path falls inside a real svg
     viewport and paints reliably. */
  .fd__canvas :global(.svelte-flow__edges) {
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .fd__canvas :global(.svelte-flow__edge-wrapper) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
</style>
