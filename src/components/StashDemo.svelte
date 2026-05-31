<script>
  import { onMount, untrack } from "svelte";
  import { SvelteFlow, Position } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/style.css";
  import GitDemo from "./GitDemo.svelte";
  import TimelineControls from "./TimelineControls.svelte";
  import ZoneNode from "./flow/ZoneNode.svelte";
  import PacketEdge from "./flow/PacketEdge.svelte";

  const nodeTypes = { zone: ZoneNode };
  const edgeTypes = { packet: PacketEdge };

  const zones = ["📂 Working Directory", "📦 Stash stack"];

  // Each state is a full snapshot: which zone is active, what each zone holds,
  // and the command that produced it.
  const states = [
    {
      active: 0,
      label: "git stash",
      cards: [{ kind: "file", icon: "📄", text: "app.js" }, { kind: "empty", text: "empty" }],
      caption:
        "You have uncommitted edits in app.js, but you suddenly need a clean working directory to switch branches.",
    },
    {
      active: 1,
      label: "git stash",
      cards: [{ kind: "clean", text: "✓ clean" }, { kind: "stash", text: "stash@{0}" }],
      caption:
        "git stash tucked your changes onto the stash stack. Your working directory is now clean and safe to switch branches.",
    },
    {
      active: 0,
      label: "git stash pop",
      cards: [{ kind: "file", icon: "📄", text: "app.js" }, { kind: "empty", text: "empty" }],
      caption:
        "git stash pop brought your changes back from the stack into the working directory, right where you left off.",
    },
  ];

  const ZONE_W = 400;
  const ZONE_H = 290;
  const ZONE_GAP = 412;

  let step = $state(0);
  let prevStep = 0;
  let colorMode = $state("dark");

  const vis = $state({
    zones: [],
    activeEdge: -1,
    fire: [0],
    fireDir: "forward",
    edgeLabels: ["git stash"],
  });

  function updateZones(s, transit) {
    const m = states[s];
    vis.zones = zones.map((label, i) => ({
      active: i === m.active,
      card: transit ? null : m.cards[i],
    }));
    vis.edgeLabels = [m.label];
  }

  function onArrive() {
    vis.activeEdge = -1;
    updateZones(step, false);
  }

  const initialNodes = zones.map((label, i) => ({
    id: `z${i}`,
    type: "zone",
    position: { x: i * (ZONE_W + ZONE_GAP), y: 0 },
    width: ZONE_W,
    height: ZONE_H,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    draggable: false,
    selectable: false,
    data: { index: i, label, vis },
  }));

  const initialEdges = [
    {
      id: "e0",
      source: "z0",
      target: "z1",
      type: "packet",
      data: { index: 0, cmd: "git stash", vis, onArrive },
    },
  ];

  let nodes = $state.raw(initialNodes);
  let edges = $state.raw(initialEdges);

  updateZones(0, false);

  $effect(() => {
    const s = step;
    untrack(() => {
      if (s === prevStep) return;
      if (s === prevStep + 1) {
        // stash (0->1) sends the change to the stack; pop (1->2) brings it back.
        vis.fireDir = s === 1 ? "forward" : "reverse";
        vis.activeEdge = 0;
        updateZones(s, true);
        vis.fire[0] += 1;
      } else {
        vis.activeEdge = -1;
        updateZones(s, false);
      }
      prevStep = s;
    });
  });

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

<GitDemo caption={states[step].caption} {step} count={states.length} height="400px">
  {#snippet controls()}
    <TimelineControls
      count={states.length}
      bind:step
      interval={2200}
      labels={["", "git stash", "git stash pop"]}
    />
  {/snippet}

  <SvelteFlow
    bind:nodes
    bind:edges
    {nodeTypes}
    {edgeTypes}
    {colorMode}
    fitView
    fitViewOptions={{ padding: 0.1 }}
    nodesDraggable={false}
    nodesConnectable={false}
    elementsSelectable={false}
    zoomOnScroll={false}
    zoomOnDoubleClick={false}
    panOnScroll={false}
    panOnDrag={false}
    proOptions={{ hideAttribution: true }}
  ></SvelteFlow>
</GitDemo>

<style>
  :global(.gd--fixed .svelte-flow) {
    background-color: var(--sl-color-black);
    background-image: radial-gradient(
      circle,
      color-mix(in srgb, var(--sl-color-white) 7%, transparent) 1px,
      transparent 1.5px
    );
    background-size: 20px 20px;
  }
</style>
