<script>
  import { onMount } from "svelte";

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
  const LANE = { up2: 45, up: 110, mid: 180, down: 250, down2: 315 };

  // Uniform 150px main spacing → tiles seamlessly across the seam.
  const MAIN_X = [75, 225, 375, 525, 675, 825, 975, 1125];

  const commits = [
    ...MAIN_X.map((x, i) => ({ id: `m${i}`, x, y: LANE.mid, c: "main", r: 9 })),
    { id: "a1", x: 375, y: LANE.up, c: "feat", r: 8 },
    { id: "a2", x: 525, y: LANE.up, c: "feat", r: 8 },
    { id: "a3", x: 450, y: LANE.up2, c: "feat", r: 7 },
    { id: "b1", x: 225, y: LANE.down, c: "api", r: 8 },
    { id: "b2", x: 375, y: LANE.down, c: "api", r: 8 },
    { id: "b3", x: 300, y: LANE.down2, c: "api", r: 7 },
    { id: "p1", x: 825, y: LANE.down, c: "pick", r: 8 },
    { id: "p2", x: 975, y: LANE.down, c: "pick", r: 8 },
    { id: "d1", x: 975, y: LANE.up, c: "feat", r: 8 },
  ];

  const pt = Object.fromEntries(commits.map((c) => [c.id, c]));
  const at = (x, y) => ({ x, y });

  // Each edge is parent -> child; arc when the lanes differ. The child end (z)
  // is the newer commit, so the edge is "born" when that end scrolls in.
  const links = [
    ...MAIN_X.map((x) => ["main", at(x, LANE.mid), at(x + 150, LANE.mid)]),

    ["feat", at(225, LANE.mid), pt.a1],
    ["feat", pt.a1, pt.a2],
    ["feat", pt.a1, pt.a3],
    ["feat", pt.a3, pt.a2],
    ["feat", pt.a2, at(675, LANE.mid)],

    ["api", at(75, LANE.mid), pt.b1],
    ["api", pt.b1, pt.b2],
    ["api", pt.b1, pt.b3],
    ["api", pt.b3, pt.b2],
    ["api", pt.b2, at(525, LANE.mid)],

    ["pick", at(675, LANE.mid), pt.p1],
    ["pick", pt.p1, pt.p2],
    ["pick", pt.p2, at(1125, LANE.mid)],

    ["feat", at(825, LANE.mid), pt.d1],
    ["feat", pt.d1, at(1125, LANE.mid)],
  ];

  function arc(a, z) {
    if (a.y === z.y) return `M ${a.x} ${a.y} L ${z.x} ${z.y}`;
    const mx = (a.x + z.x) / 2;
    return `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${z.y}, ${z.x} ${z.y}`;
  }

  const edges = links.map(([c, a, z], i) => ({ id: i, c, d: arc(a, z), cx: z.x }));

  // Birth: an element is unborn at the right edge, forms as it crosses this
  // window, then rides left as settled history. Tied to on-screen position so
  // both tiles stay in lock-step and the loop has no seam.
  const PERIOD_MS = 22000;
  const PX_PER_MS = SEG / PERIOD_MS;
  const BIRTH_START = 1150;
  const BIRTH_DONE = 970;
  const DASH = 14; // 5 + 9 marching pattern
  const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const birth = (screenX) => clamp((BIRTH_START - screenX) / (BIRTH_START - BIRTH_DONE));

  let root;
  let marquee;

  onMount(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const nodeEls = [...root.querySelectorAll(".node")];
    const edgeEls = [...root.querySelectorAll(".edge")];
    const lens = edgeEls.map((p) => p.getTotalLength());

    const place = (offset, t) => {
      marquee.style.transform = `translateX(${-offset}px)`;

      for (const g of nodeEls) {
        const x = +g.dataset.x;
        const y = +g.dataset.y;
        const screen = x + +g.dataset.ox - offset;
        const b = birth(screen);
        g.style.opacity = b;
        g.style.transform = `translate(${x}px, ${y}px) scale(${0.32 + 0.68 * b})`;
      }

      for (let i = 0; i < edgeEls.length; i++) {
        const p = edgeEls[i];
        const len = lens[i];
        const screen = +p.dataset.cx + +p.dataset.ox - offset;
        const b = birth(screen);
        if (b < 1) {
          p.style.strokeDasharray = `${len}`;
          p.style.strokeDashoffset = `${len * (1 - b)}`;
        } else {
          p.style.strokeDasharray = "5 9";
          p.style.strokeDashoffset = `${-((t * 0.032) % DASH)}`;
        }
      }
    };

    if (reduced) {
      place(0, 0);
      return;
    }

    let raf;
    let start;
    const tick = (now) => {
      if (start === undefined) start = now;
      const t = now - start;
      place((t * PX_PER_MS) % SEG, t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });
</script>

<div class="stage" aria-hidden="true" bind:this={root}>
  <div class="stage__glow"></div>
  <svg viewBox="0 0 1200 360" preserveAspectRatio="xMidYMid slice" class="scene">
    <defs>
      <filter id="hs-glow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="6" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <g class="marquee" bind:this={marquee}>
      {#each [0, SEG] as ox (ox)}
        <g transform={`translate(${ox}, 0)`}>
          {#each edges as e (e.id)}
            <path
              class="edge edge--{e.c}"
              d={e.d}
              data-cx={e.cx}
              data-ox={ox}
              style={`stroke:${COLOR[e.c]}`}
            />
          {/each}
          {#each commits as c, i (c.id)}
            <g
              class="node node--{c.c}"
              data-x={c.x}
              data-y={c.y}
              data-ox={ox}
              style={`--ac:${COLOR[c.c]}; --d:${(i % 6) * 0.5}s; transform:translate(${c.x}px, ${c.y}px); opacity:0`}
            >
              <circle class="node__halo" cx="0" cy="0" r={c.r * 2.1} />
              <circle class="node__core" cx="0" cy="0" r={c.r} />
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
  }

  .edge {
    fill: none;
    stroke-width: 3;
    stroke-linecap: round;
    opacity: 0.9;
  }

  .node {
    will-change: transform, opacity;
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
    animation: hs-breathe 4.2s ease-in-out infinite;
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
    .node__halo {
      animation: none;
    }
  }
</style>
