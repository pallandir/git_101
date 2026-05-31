<script>
  import { scale } from "svelte/transition";
  import { backOut } from "svelte/easing";
  import GitDemo from "./GitDemo.svelte";
  import { DUR } from "./flow/graph.js";

  let packed = $state(false);

  // The loose object store: one zlib-compressed file per object under
  // .git/objects/, each named by its content hash.
  const loose = [
    { id: "o1", type: "commit", hash: "9a1f2b" },
    { id: "o2", type: "tree", hash: "4c7e0d" },
    { id: "o3", type: "blob", hash: "e21a8f", name: "app.js" },
    { id: "o4", type: "blob", hash: "77b3c1", name: "README.md" },
    { id: "o5", type: "commit", hash: "0d5e9a" },
    { id: "o6", type: "tree", hash: "bb12fc" },
    { id: "o7", type: "blob", hash: "3f9a04", name: "style.css" },
  ];

  let caption = $derived(
    packed
      ? "git gc rolled every loose object into a single packfile (.pack) with an index (.idx) so Git can still find each object instantly. Similar objects are stored as deltas against one another, so the pack is far smaller than the loose files combined."
      : "A fresh repo keeps each object as its own zlib-compressed file under .git/objects/, named by its hash. Run git gc to see what Git does as history grows.",
  );
</script>

<GitDemo {caption}>
  {#snippet controls()}
    <div class="gd__choices">
      <button
        class="git-demo__btn git-demo__btn--primary"
        onclick={() => (packed = true)}
        disabled={packed}
      >
        git gc ▸
      </button>
      <button
        class="git-demo__btn"
        onclick={() => (packed = false)}
        disabled={!packed}
      >
        ↺ Reset
      </button>
    </div>
  {/snippet}

  <div class="pk">
    <div class="pk__legend">
      <span class="pk__key pk__key--commit">commit</span>
      <span class="pk__key pk__key--tree">tree</span>
      <span class="pk__key pk__key--blob">blob</span>
    </div>

    <div class="pk__stage">
      <section class="pk__panel">
        <header class="pk__panel-title">
          <code>.git/objects/</code><span>loose</span>
        </header>
        <div class="pk__grid">
          {#if packed}
            <p class="pk__emptied">{loose.length} objects packed away</p>
          {:else}
            {#each loose as o, i (o.id)}
              <div
                class="pk__obj pk__obj--{o.type}"
                in:scale={{ duration: DUR.pop, start: 0.5, easing: backOut, delay: i * 40 }}
                out:scale={{ duration: DUR.move, start: 0.3, easing: backOut, delay: i * 35 }}
              >
                <span class="pk__obj-type">{o.type}</span>
                <span class="pk__obj-hash">{o.hash}</span>
                {#if o.name}<span class="pk__obj-name">{o.name}</span>{/if}
              </div>
            {/each}
          {/if}
        </div>
      </section>

      <div class="pk__bridge" class:pk__bridge--on={packed}>
        <span class="pk__bridge-cmd">git gc</span>
        <svg viewBox="0 0 48 16" class="pk__bridge-arrow" aria-hidden="true">
          <path d="M2 8 H40 M34 3 L41 8 L34 13" fill="none" />
        </svg>
      </div>

      <section class="pk__panel pk__panel--pack">
        <header class="pk__panel-title"><code>packfile</code></header>
        <div class="pk__grid pk__grid--center">
          {#if packed}
            <div class="pk__pack" in:scale={{ duration: DUR.pop, start: 0.5, easing: backOut, delay: 220 }}>
              <div class="pk__pack-icon">📦</div>
              <div class="pk__pack-name">pack-a1b2c3.pack</div>
              <div class="pk__pack-sub">+ pack-a1b2c3.idx</div>
              <ul class="pk__pack-facts">
                <li><strong>{loose.length}</strong> objects → <strong>1</strong> file</li>
                <li>stored as deltas</li>
                <li>zlib-compressed</li>
              </ul>
            </div>
          {:else}
            <p class="pk__hint">empty until <code>git gc</code></p>
          {/if}
        </div>
      </section>
    </div>
  </div>
</GitDemo>

<style>
  .pk {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }
  .pk__legend {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
  }
  .pk__key {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--sl-color-gray-2);
  }
  .pk__key::before {
    content: "";
    width: 0.7rem;
    height: 0.7rem;
    border-radius: 3px;
    background: currentColor;
  }
  .pk__key--commit::before {
    color: var(--git-orange);
  }
  .pk__key--tree::before {
    color: var(--gp-feature);
  }
  .pk__key--blob::before {
    color: var(--gp-green);
  }

  .pk__stage {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 0.5rem;
  }
  @media (max-width: 40rem) {
    .pk__stage {
      grid-template-columns: 1fr;
    }
    .pk__bridge {
      transform: rotate(90deg);
      justify-self: center;
    }
  }

  .pk__panel {
    border: 1px dashed var(--sl-color-gray-5);
    border-radius: 0.8rem;
    background: color-mix(in srgb, var(--sl-color-black) 70%, transparent);
    padding: 0.85rem;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }
  .pk__panel--pack {
    border-style: solid;
    border-color: color-mix(in srgb, var(--git-orange) 45%, var(--sl-color-gray-5));
  }
  .pk__panel-title {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    font-size: 0.78rem;
    color: var(--sl-color-gray-3);
  }
  .pk__panel-title code {
    font-family: var(--__sl-font-mono, monospace);
    font-weight: 700;
    color: var(--sl-color-gray-2);
  }
  .pk__panel-title span {
    font-size: 0.66rem;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--sl-color-gray-4);
  }

  .pk__grid {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(86px, 1fr));
    gap: 0.5rem;
    align-content: start;
  }
  .pk__grid--center {
    place-content: center;
    place-items: center;
  }

  .pk__obj {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    padding: 0.4rem 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid var(--sl-color-gray-5);
    border-left-width: 4px;
    background: var(--sl-color-black);
  }
  .pk__obj--commit {
    border-left-color: var(--git-orange);
  }
  .pk__obj--tree {
    border-left-color: var(--gp-feature);
  }
  .pk__obj--blob {
    border-left-color: var(--gp-green);
  }
  .pk__obj-type {
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 700;
    color: var(--sl-color-gray-3);
  }
  .pk__obj-hash {
    font-family: var(--__sl-font-mono, monospace);
    font-size: 0.78rem;
    color: var(--sl-color-white);
  }
  .pk__obj-name {
    font-size: 0.66rem;
    color: var(--sl-color-gray-3);
  }

  .pk__emptied,
  .pk__hint {
    margin: auto;
    font-size: 0.82rem;
    color: var(--sl-color-gray-4);
    text-align: center;
  }
  .pk__hint code {
    font-family: var(--__sl-font-mono, monospace);
    color: var(--sl-color-gray-3);
  }

  .pk__bridge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    color: var(--sl-color-gray-5);
    transition: color 0.3s ease;
  }
  .pk__bridge--on {
    color: var(--git-orange);
  }
  .pk__bridge-cmd {
    font-family: var(--__sl-font-mono, monospace);
    font-size: 0.7rem;
    font-weight: 600;
  }
  .pk__bridge-arrow {
    width: 44px;
    height: 16px;
  }
  .pk__bridge-arrow path {
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .pk__pack {
    width: 100%;
    text-align: center;
    padding: 0.4rem;
  }
  .pk__pack-icon {
    font-size: 1.9rem;
    line-height: 1;
  }
  .pk__pack-name {
    margin-top: 0.35rem;
    font-family: var(--__sl-font-mono, monospace);
    font-size: 0.85rem;
    font-weight: 800;
    color: var(--git-orange);
    white-space: nowrap;
  }
  .pk__pack-sub {
    font-family: var(--__sl-font-mono, monospace);
    font-size: 0.72rem;
    color: var(--sl-color-gray-2);
    white-space: nowrap;
  }
  .pk__pack-facts {
    margin: 0.6rem 0 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.18rem;
    font-size: 0.72rem;
    color: var(--sl-color-gray-3);
    white-space: nowrap;
  }
  .pk__pack-facts strong {
    color: var(--sl-color-white);
  }
</style>
