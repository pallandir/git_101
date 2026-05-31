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

  const areas = [
    "Working Directory",
    "Staging Area",
    "Local Repository",
    "Remote Repository",
  ];
  const cmds = ["git add", "git commit", "git push"];

  const accents = [
    "var(--git-orange)",
    "var(--gp-feature)",
    "var(--gp-green)",
    "var(--gp-alt)",
  ];

  const captions = [
    "You edited app.js. It sits in your working directory, untracked by the next commit.",
    "git add moved the change into the staging area, ready to be committed.",
    "git commit recorded a snapshot in your local repository. It is yours alone for now.",
    "git push uploaded the commit to the remote. Now your teammates can see it.",
  ];

  const ZONE_W = 210;
  const ZONE_H = 290;
  const ZONE_GAP = 124;

  let stage = $state(0);
  let prevStage = 0;
  let arrived = true;
  let colorMode = $state("dark");

  const payloadFor = (s) =>
    s < 2
      ? { kind: "file", icon: "📄", text: "app.js" }
      : { kind: "commit", text: "a1b2c3d" };

  const vis = $state({
    zones: [],
    activeEdge: -1,
    fire: [0, 0, 0],
    fireDir: "forward",
  });

  function updateZones() {
    vis.zones = areas.map((label, i) => ({
      active: i === stage,
      card: arrived && i === stage ? payloadFor(stage) : null,
    }));
  }

  function onArrive() {
    arrived = true;
    vis.activeEdge = -1;
    updateZones();
  }

  const initialNodes = areas.map((label, i) => ({
    id: `z${i}`,
    type: "zone",
    position: { x: i * (ZONE_W + ZONE_GAP), y: 0 },
    width: ZONE_W,
    height: ZONE_H,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    draggable: false,
    selectable: false,
    data: { index: i, label, vis, accent: accents[i] },
  }));

  const initialEdges = cmds.map((cmd, i) => ({
    id: `e${i}`,
    source: `z${i}`,
    target: `z${i + 1}`,
    type: "packet",
    data: { index: i, cmd, vis, onArrive },
  }));

  let nodes = $state.raw(initialNodes);
  let edges = $state.raw(initialEdges);

  updateZones();

  $effect(() => {
    const s = stage;
    untrack(() => {
      if (s === prevStage) return;
      if (s === prevStage + 1) {
        arrived = false;
        vis.fireDir = "forward";
        vis.activeEdge = prevStage;
        vis.fire[prevStage] += 1;
      } else {
        arrived = true;
        vis.activeEdge = -1;
      }
      prevStage = s;
      updateZones();
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

<GitDemo caption={captions[stage]} step={stage} count={captions.length} height="440px">
  {#snippet controls()}
    <TimelineControls
      count={4}
      bind:step={stage}
      interval={2000}
      labels={["", "git add", "git commit", "git push"]}
    />
  {/snippet}

  <div class="cf__canvas">
    <SvelteFlow
      bind:nodes
      bind:edges
      {nodeTypes}
      {edgeTypes}
      {colorMode}
      fitView
      fitViewOptions={{ padding: 0.05 }}
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
</GitDemo>

<style>
  .cf__canvas {
    position: absolute;
    inset: 0;
  }
  .cf__canvas :global(.svelte-flow) {
    background-color: var(--sl-color-black);
    background-image: radial-gradient(
      circle,
      color-mix(in srgb, var(--sl-color-white) 7%, transparent) 1px,
      transparent 1.5px
    );
    background-size: 20px 20px;
  }
  .cf__canvas :global(.svelte-flow__node) {
    cursor: default;
  }
</style>
