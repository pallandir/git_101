<script>
  import { fade } from "svelte/transition";

  let {
    caption = "",
    step = null,
    count = null,
    height = null,
    controls = null,
    children,
  } = $props();
</script>

<div class="gd not-content" class:gd--fixed={height} style={height ? `height:${height}` : null}>
  <header class="gd__bar">
    {#if controls}
      <div class="gd__controls">{@render controls()}</div>
    {/if}

    <div class="gd__caption">
      {#if step !== null && count}
        <span class="gd__step">Step {step + 1} of {count}</span>
      {/if}
      {#key caption}
        <p class="gd__caption-text" in:fade={{ duration: 240 }}>{caption}</p>
      {/key}
    </div>
  </header>

  <div class="gd__body">
    {@render children?.()}
  </div>
</div>

<style>
  .gd {
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 0.85rem;
    background: var(--sl-color-black);
    margin: 1.75rem 0;
    overflow: hidden;
  }
  .gd--fixed {
    display: flex;
    flex-direction: column;
  }

  .gd__bar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 0.9rem 1.1rem;
    border-bottom: 1px solid var(--sl-color-gray-5);
  }

  .gd__controls {
    flex: 1 1 auto;
    min-width: 0;
  }
  /* Compact, baseline-aligned controls for the header bar. The margin reset
     cancels Starlight's prose sibling spacing, which would otherwise push
     every button after the first down by 1rem. */
  .gd__controls :global(.tl) {
    --ctl-h: 2rem;
    gap: 0.55rem;
  }
  .gd__controls :global(.tl *),
  .gd__controls :global(.gd__choices *) {
    margin: 0;
  }
  .gd__controls :global(.tl__btn),
  .gd__controls :global(.git-demo__btn) {
    height: 2rem;
    font-size: 0.78rem;
    padding: 0 0.7rem;
  }

  .gd__caption {
    flex: 0 1 22rem;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    text-align: right;
  }
  .gd__step {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--git-orange);
    font-variant-numeric: tabular-nums;
  }
  .gd__caption-text {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.45;
    color: var(--sl-color-gray-1);
  }

  .gd__body {
    padding: 1.5rem 1.25rem;
  }
  .gd--fixed .gd__body {
    flex: 1;
    min-height: 0;
    padding: 0;
    position: relative;
  }

  @media (max-width: 640px) {
    .gd__bar {
      flex-direction: column;
      gap: 0.85rem;
    }
    .gd__caption {
      flex: none;
      text-align: left;
    }
  }
</style>
