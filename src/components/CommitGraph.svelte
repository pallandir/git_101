<script>
  import { onMount } from "svelte";
  import { SvelteFlow } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/style.css";
  import CommitDot from "./flow/CommitDot.svelte";
  import PointerPill from "./flow/PointerPill.svelte";
  import FlowEdge from "./flow/FlowEdge.svelte";
  import AnchorNode from "./flow/AnchorNode.svelte";
  import { R, pillW, DUR, prefersReducedMotion } from "./flow/graph.js";

  let {
    nodes = [],
    edges = [],
    pointers = [],
    width = 540,
    height = 230,
    label = "Git commit graph",
  } = $props();

  const nodeTypes = { commit: CommitDot, pill: PointerPill, anchor: AnchorNode };
  const edgeTypes = { flow: FlowEdge };

  const DOT = R * 2;
  const edgeVariant = (v) =>
    ({ main: "orange", feature: "blue", alt: "alt", pick: "pick", merge: "orange" })[v] ?? "orange";

  // Live positions per node id, tweened by anime.js so a connector bends and
  // follows its commit as it glides between lanes instead of snapping.
  const pos = new Map();
  const tweens = new Map();
  let frame = $state(0);
  let animate = null;
  let easeMove = null;
  let animeReady = $state(false);

  onMount(() => {
    let alive = true;
    import("animejs").then((m) => {
      if (!alive) return;
      animate = m.animate;
      easeMove = m.cubicBezier(0.34, 1.18, 0.64, 1);
      animeReady = true;
    });
    return () => {
      alive = false;
      for (const t of tweens.values()) t.pause();
    };
  });

  function tweenTo(p, x, y) {
    tweens.get(p.__id)?.pause();
    return animate(p, {
      x,
      y,
      duration: DUR.move,
      ease: easeMove,
      onUpdate: () => frame++,
      onComplete: () => frame++,
    });
  }

  $effect(() => {
    const reduced = prefersReducedMotion();
    for (const n of nodes) {
      const p = pos.get(n.id);
      if (!p) {
        if (n.enterFrom && animeReady && !reduced) {
          const start = { __id: n.id, x: n.enterFrom.x, y: n.enterFrom.y };
          pos.set(n.id, start);
          tweens.set(n.id, tweenTo(start, n.x, n.y));
        } else {
          pos.set(n.id, { __id: n.id, x: n.x, y: n.y });
        }
        continue;
      }
      if (p.x === n.x && p.y === n.y) continue;
      if (reduced || !animeReady) {
        p.x = n.x;
        p.y = n.y;
        frame++;
        continue;
      }
      tweens.set(n.id, tweenTo(p, n.x, n.y));
    }
    for (const id of [...pos.keys()]) {
      if (!nodes.some((n) => n.id === id)) {
        tweens.get(id)?.pause();
        tweens.delete(id);
        pos.delete(id);
      }
    }
  });

  const live = (id, fx, fy) => pos.get(id) ?? { x: fx, y: fy };

  let flowNodes = $state.raw([]);
  let flowEdges = $state.raw([]);

  $effect(() => {
    frame; // recompute on every animation frame while a tween runs
    const map = {};
    for (const n of nodes) map[n.id] = live(n.id, n.x, n.y);

    const commitNodes = nodes.map((n) => ({
      id: n.id,
      type: "commit",
      position: { x: map[n.id].x - R, y: map[n.id].y - R },
      data: { label: n.label ?? n.id, variant: n.variant ?? "main", ghost: n.ghost, size: DOT },
      draggable: false,
      selectable: false,
    }));

    const pillNodes = pointers
      .map((p) => {
        const a = map[p.at];
        if (!a) return null;
        const w = pillW(p.label);
        const lvl = p.level ?? 0;
        return {
          id: `ptr-${p.key}`,
          type: "pill",
          position: { x: a.x - w / 2, y: a.y - R - 34 - lvl * 30 },
          data: { label: p.label, variant: p.variant ?? "branch", detached: p.detached, w },
          draggable: false,
          selectable: false,
          zIndex: 10,
        };
      })
      .filter(Boolean);

    const anchors = [
      { id: "__a0", type: "anchor", position: { x: 0, y: 0 }, data: {}, draggable: false, selectable: false },
      { id: "__a1", type: "anchor", position: { x: width, y: height }, data: {}, draggable: false, selectable: false },
    ];

    flowNodes = [...anchors, ...commitNodes, ...pillNodes];

    flowEdges = edges
      .filter((e) => map[e.from] && map[e.to])
      .map((e) => {
        const a = map[e.from];
        const b = map[e.to];
        return {
          id: e.id,
          source: e.from,
          target: e.to,
          type: "flow",
          sourceHandle: "s-r",
          targetHandle: "t-l",
          data: {
            sx: a.x,
            sy: a.y,
            tx: b.x,
            ty: b.y,
            variant: e.ghost ? "muted" : edgeVariant(e.variant),
            dashed: !!e.ghost,
            animated: false,
            arrow: false,
            strokeWidth: 3,
          },
        };
      });
  });
</script>

<div class="cg" style={`aspect-ratio:${width} / ${height}`} role="img" aria-label={label}>
  <SvelteFlow
    nodes={flowNodes}
    edges={flowEdges}
    {nodeTypes}
    {edgeTypes}
    colorMode="dark"
    fitView
    fitViewOptions={{ padding: 0.08 }}
    nodesDraggable={false}
    nodesConnectable={false}
    elementsSelectable={false}
    zoomOnScroll={false}
    zoomOnDoubleClick={false}
    panOnScroll={false}
    panOnDrag={false}
    proOptions={{ hideAttribution: true }}
  ></SvelteFlow>
</div>

<style>
  .cg {
    width: 100%;
    position: relative;
  }
  .cg :global(.svelte-flow) {
    background: transparent;
  }
  .cg :global(.svelte-flow__edges) {
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .cg :global(.svelte-flow__edge-wrapper) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .cg :global(.svelte-flow__node) {
    cursor: default;
  }
</style>
