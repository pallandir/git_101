<script>
  import { onMount } from "svelte";
  import GitDemo from "./GitDemo.svelte";
  import { DUR, prefersReducedMotion } from "./flow/graph.js";

  const HEAD_X = { attached: 480, detached: 120 };
  const END_Y = { attached: 104, detached: 163 };

  const captions = {
    attached:
      "Attached: .git/HEAD holds ref: refs/heads/main. HEAD points to the branch main, which points to the latest commit C3.",
    detached:
      "Detached HEAD: .git/HEAD holds a commit hash directly. HEAD skips the branch and points straight at C1, so new commits here belong to no branch.",
  };

  let detached = $state(false);
  let frame = $state(0);
  let pv = { v: 0 };

  let animate = null;
  let easeMove = null;
  let timer = null;

  const lerp = (a, b, t) => a + (b - a) * t;
  let hx = $derived((frame, lerp(HEAD_X.attached, HEAD_X.detached, pv.v)));
  let endY = $derived((frame, lerp(END_Y.attached, END_Y.detached, pv.v)));
  let caption = $derived(detached ? captions.detached : captions.attached);

  function toggle() {
    detached = !detached;
    const target = detached ? 1 : 0;
    if (animate) {
      animate(pv, {
        v: target,
        duration: DUR.move + 700,
        ease: easeMove,
        onUpdate: () => frame++,
        onComplete: () => frame++,
      });
    } else {
      pv.v = target;
      frame++;
    }
  }

  onMount(() => {
    let alive = true;
    const reduced = prefersReducedMotion();
    if (!reduced) {
      import("animejs").then((m) => {
        if (!alive) return;
        animate = m.animate;
        easeMove = m.cubicBezier(0.34, 1.12, 0.64, 1);
      });
    }
    timer = setInterval(toggle, reduced ? 5600 : 4600);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  });
</script>

<GitDemo {caption}>
  <div class="dh" role="img" aria-label="HEAD pointing to a branch versus a detached HEAD pointing straight at a commit">
    <svg viewBox="0 0 560 220" preserveAspectRatio="xMidYMid meet">
      <line class="dh__edge" x1="120" y1="180" x2="300" y2="180" />
      <line class="dh__edge" x1="300" y1="180" x2="480" y2="180" />

      {#each [{ id: "C1", x: 120 }, { id: "C2", x: 300 }, { id: "C3", x: 480 }] as c}
        <circle class="dh__dot" cx={c.x} cy="180" r="20" />
        <text class="dh__dot-label" x={c.x} y="180">{c.id}</text>
      {/each}

      <g class="dh__main">
        <rect x="452" y="106" width="56" height="28" rx="7" />
        <text x="480" y="120">main</text>
        <line x1="480" y1="135" x2="480" y2="163" />
        <polygon points="475,163 485,163 480,170" />
      </g>

      <g class="dh__head" class:dh__head--detached={detached}>
        <line x1={hx} y1="76" x2={hx} y2={endY - 8} />
        <polygon points={`${hx - 5},${endY - 9} ${hx + 5},${endY - 9} ${hx},${endY - 1}`} />
        <rect x={hx - 30} y="44" width="60" height="28" rx="7" />
        <text x={hx} y="58">HEAD</text>
      </g>
    </svg>
  </div>
</GitDemo>

<style>
  .dh {
    width: 100%;
  }
  .dh svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .dh__edge {
    stroke: var(--git-orange);
    stroke-width: 3;
    stroke-linecap: round;
  }

  .dh__dot {
    fill: var(--sl-color-gray-6);
    stroke: var(--git-orange);
    stroke-width: 2.5;
  }
  .dh__dot-label {
    fill: var(--sl-color-white);
    font-family: var(--__sl-font-mono, monospace);
    font-size: 13px;
    font-weight: 700;
    text-anchor: middle;
    dominant-baseline: central;
  }

  .dh__main rect {
    fill: var(--sl-color-gray-6);
    stroke: var(--git-orange);
    stroke-width: 1.5;
  }
  .dh__main text {
    fill: var(--sl-color-white);
    font-family: var(--__sl-font-mono, monospace);
    font-size: 12px;
    font-weight: 700;
    text-anchor: middle;
    dominant-baseline: central;
  }
  .dh__main line {
    stroke: var(--git-orange);
    stroke-width: 2.5;
  }
  .dh__main polygon {
    fill: var(--git-orange);
  }

  .dh__head rect {
    fill: var(--git-orange);
    stroke: var(--git-orange);
    transition: fill 0.45s ease, stroke 0.45s ease;
    filter: drop-shadow(0 0 6px color-mix(in srgb, var(--git-orange) 55%, transparent));
  }
  .dh__head text {
    fill: #fff;
    font-family: var(--__sl-font-mono, monospace);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.03em;
    text-anchor: middle;
    dominant-baseline: central;
  }
  .dh__head line {
    stroke: var(--git-orange);
    stroke-width: 2.5;
    transition: stroke 0.45s ease;
  }
  .dh__head polygon {
    fill: var(--git-orange);
    transition: fill 0.45s ease;
  }

  .dh__head--detached rect {
    fill: #b3261e;
    stroke: #b3261e;
    filter: drop-shadow(0 0 7px color-mix(in srgb, #b3261e 60%, transparent));
  }
  .dh__head--detached line,
  .dh__head--detached polygon {
    stroke: #b3261e;
    fill: #b3261e;
  }

  @media (prefers-reduced-motion: reduce) {
    .dh__head rect {
      filter: none;
    }
  }
</style>
