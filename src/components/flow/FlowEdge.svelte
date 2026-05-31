<script>
  import { getBezierPath, EdgeLabel } from "@xyflow/svelte";

  let props = $props();

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
    alt: "var(--gp-alt)",
    pick: "var(--gp-pick)",
    muted: "var(--sl-color-gray-5)",
  };

  let variant = $derived(props.data?.variant ?? "orange");
  let color = $derived(COLOR[variant] ?? "var(--git-orange)");
  let markerKey = $derived(
    ["blue", "platform", "tree", "remote"].includes(variant)
      ? "blue"
      : ["green", "blob"].includes(variant)
        ? "green"
        : variant === "muted"
          ? "muted"
          : "orange",
  );

  let dashed = $derived(!!props.data?.dashed);
  let animated = $derived(!dashed && props.data?.animated !== false);
  let arrow = $derived(props.data?.arrow !== false);
  let strokeWidth = $derived(props.data?.strokeWidth ?? 2);

  // Commit graphs pass exact endpoints (commit centres) through data, so edges
  // route from real geometry instead of handle positions; concept diagrams fall
  // back to SvelteFlow's handle-derived coordinates.
  let explicit = $derived(props.data?.sx != null);
  let sx = $derived(explicit ? props.data.sx : props.sourceX);
  let sy = $derived(explicit ? props.data.sy : props.sourceY);
  let tx = $derived(explicit ? props.data.tx : props.targetX);
  let ty = $derived(explicit ? props.data.ty : props.targetY);

  let geom = $derived(
    getBezierPath({
      sourceX: props.sourceX,
      sourceY: props.sourceY,
      sourcePosition: props.sourcePosition,
      targetX: props.targetX,
      targetY: props.targetY,
      targetPosition: props.targetPosition,
    }),
  );
  let path = $derived.by(() => {
    if (!explicit) return geom[0];
    if (Math.abs(sy - ty) < 2) return `M ${sx},${sy} L ${tx},${ty}`;
    const mx = (sx + tx) / 2;
    return `M ${sx},${sy} C ${mx},${sy} ${mx},${ty} ${tx},${ty}`;
  });
  let labelX = $derived(explicit ? (sx + tx) / 2 : geom[1]);
  let labelY = $derived(explicit ? (sy + ty) / 2 : geom[2]);
</script>

<path
  d={path}
  fill="none"
  class="fe-path"
  class:fe-path--animated={animated}
  style={`stroke:${color};stroke-width:${strokeWidth};${dashed ? "stroke-dasharray:6 5;" : ""}`}
  marker-end={arrow ? `url(#fd-arrow-${markerKey})` : undefined}
/>

{#if props.label}
  <EdgeLabel x={labelX} y={labelY}>
    <span class="fe-label">{props.label}</span>
  </EdgeLabel>
{/if}

<style>
  .fe-path {
    fill: none;
    stroke-linecap: round;
  }
  .fe-path--animated {
    stroke-dasharray: 6 6;
    animation: fe-march 0.6s linear infinite;
  }
  @keyframes fe-march {
    to {
      stroke-dashoffset: -24;
    }
  }
  .fe-label {
    display: inline-block;
    padding: 0.12rem 0.45rem;
    border-radius: 0.35rem;
    font-family: var(--__sl-font-mono, monospace);
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--sl-color-white);
    background: var(--sl-color-black);
    border: 1px solid var(--sl-color-gray-5);
    white-space: nowrap;
  }
  @media (prefers-reduced-motion: reduce) {
    .fe-path--animated {
      animation: none;
    }
  }
</style>
