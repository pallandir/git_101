<script>
  const COLOR = {
    main: "var(--git-orange)",
    feat: "var(--gp-feature)",
    api: "var(--gp-alt)",
    pick: "var(--gp-pick)",
  };

  // One self-contained segment, 1200 wide, tiled twice and scrolled so the
  // braid loops forever. The main lane runs straight across the seam; every
  // feature branch opens and closes inside the segment so the tile is seamless.
  const SEG = 1200;
  const LANE = { up2: 60, up: 120, mid: 200, down: 280, down2: 340 };

  const MAIN_X = [100, 300, 500, 700, 900, 1100];

  const commits = [
    ...MAIN_X.map((x, i) => ({ id: `m${i}`, x, y: LANE.mid, c: "main", r: 9 })),
    { id: "a1", x: 500, y: LANE.up, c: "feat", r: 8 },
    { id: "a2", x: 700, y: LANE.up, c: "feat", r: 8 },
    { id: "a3", x: 620, y: LANE.up2, c: "feat", r: 7 },
    { id: "b1", x: 300, y: LANE.down, c: "api", r: 8 },
    { id: "b2", x: 500, y: LANE.down, c: "api", r: 8 },
    { id: "b3", x: 420, y: LANE.down2, c: "api", r: 7 },
    { id: "p1", x: 860, y: LANE.down, c: "pick", r: 7 },
    { id: "p2", x: 1000, y: LANE.down, c: "pick", r: 7 },
  ];

  const pt = Object.fromEntries(commits.map((c) => [c.id, c]));
  const at = (x, y) => ({ x, y });

  // Each edge is parent -> child; arc when the lanes differ.
  const links = [
    ["main", at(100, LANE.mid), at(300, LANE.mid)],
    ["main", at(300, LANE.mid), at(500, LANE.mid)],
    ["main", at(500, LANE.mid), at(700, LANE.mid)],
    ["main", at(700, LANE.mid), at(900, LANE.mid)],
    ["main", at(900, LANE.mid), at(1100, LANE.mid)],
    ["main", at(1100, LANE.mid), at(1300, LANE.mid)],

    ["feat", at(300, LANE.mid), pt.a1],
    ["feat", pt.a1, pt.a2],
    ["feat", pt.a1, pt.a3],
    ["feat", pt.a3, pt.a2],
    ["feat", pt.a2, at(900, LANE.mid)],

    ["api", at(100, LANE.mid), pt.b1],
    ["api", pt.b1, pt.b2],
    ["api", pt.b1, pt.b3],
    ["api", pt.b3, pt.b2],
    ["api", pt.b2, at(700, LANE.mid)],

    ["pick", at(700, LANE.mid), pt.p1],
    ["pick", pt.p1, pt.p2],
    ["pick", pt.p2, at(1100, LANE.mid)],
  ];

  function arc(a, z) {
    if (a.y === z.y) return `M ${a.x} ${a.y} L ${z.x} ${z.y}`;
    const mx = (a.x + z.x) / 2;
    return `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${z.y}, ${z.x} ${z.y}`;
  }

  const edges = links.map(([c, a, z], i) => ({ id: i, c, d: arc(a, z) }));
</script>

<div class="stage" aria-hidden="true">
  <div class="stage__glow"></div>
  <svg viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice" class="scene">
    <defs>
      <filter id="hs-glow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="6" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <g class="marquee">
      {#each [0, SEG] as ox (ox)}
        <g transform={`translate(${ox}, 0)`}>
          {#each edges as e (e.id)}
            <path class="edge edge--{e.c}" d={e.d} style={`stroke:${COLOR[e.c]}`} />
          {/each}
          {#each commits as c, i (c.id)}
            <g class="node node--{c.c}" style={`--ac:${COLOR[c.c]}; --d:${(i % 6) * 0.5}s`}>
              <circle class="node__halo" cx={c.x} cy={c.y} r={c.r * 2.1} />
              <circle class="node__core" cx={c.x} cy={c.y} r={c.r} />
            </g>
          {/each}
        </g>
      {/each}
    </g>
  </svg>
</div>

<style>
  .stage {
    position: relative;
    width: 100%;
    aspect-ratio: 1200 / 360;
    overflow: hidden;
    /* Feather all four edges so the braid dissolves into the page. */
    -webkit-mask-image:
      linear-gradient(to right, transparent 0%, #000 9%, #000 91%, transparent 100%),
      linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%);
    -webkit-mask-composite: source-in;
    mask-image:
      linear-gradient(to right, transparent 0%, #000 9%, #000 91%, transparent 100%),
      linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%);
    mask-composite: intersect;
  }

  .stage__glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(60% 90% at 72% 18%, color-mix(in srgb, var(--git-orange) 22%, transparent), transparent 60%),
      radial-gradient(55% 90% at 18% 92%, color-mix(in srgb, var(--gp-feature) 16%, transparent), transparent 60%),
      radial-gradient(45% 80% at 92% 80%, color-mix(in srgb, var(--gp-alt) 14%, transparent), transparent 60%);
    filter: blur(8px);
  }

  .scene {
    position: relative;
    width: 100%;
    height: 100%;
    display: block;
  }

  .marquee {
    will-change: transform;
    animation: hs-drift 26s linear infinite;
  }
  @keyframes hs-drift {
    to {
      transform: translateX(-1200px);
    }
  }

  .edge {
    fill: none;
    stroke-width: 3;
    stroke-linecap: round;
    opacity: 0.9;
    stroke-dasharray: 5 9;
    animation: hs-flow 1.1s linear infinite;
  }
  .edge--feat {
    animation-duration: 1.4s;
  }
  .edge--api {
    animation-duration: 1.7s;
  }
  .edge--pick {
    animation-duration: 1.25s;
  }
  @keyframes hs-flow {
    to {
      stroke-dashoffset: -28;
    }
  }

  .node__core {
    fill: var(--ac);
    stroke: color-mix(in srgb, var(--ac) 50%, #000);
    stroke-width: 1.5;
  }
  .node__halo {
    fill: var(--ac);
    opacity: 0.22;
    filter: url(#hs-glow);
    transform-box: fill-box;
    transform-origin: center;
    animation: hs-breathe 3.2s ease-in-out infinite;
    animation-delay: var(--d, 0s);
  }
  @keyframes hs-breathe {
    0%, 100% {
      opacity: 0.16;
      transform: scale(0.82);
    }
    50% {
      opacity: 0.32;
      transform: scale(1.12);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .marquee,
    .edge,
    .node__halo {
      animation: none;
    }
    .edge {
      stroke-dasharray: none;
    }
  }
</style>
