<script>
  import { Handle, Position } from "@xyflow/svelte";
  import { scale } from "svelte/transition";
  import { backOut } from "svelte/easing";
  import { DUR } from "./graph.js";

  let { data } = $props();

  const vis = data.vis;
  const index = data.index;

  let zone = $derived(vis?.zones?.[index] ?? {});
  let active = $derived(!!zone.active);
  let card = $derived(zone.card ?? null);
  let accent = $derived(data.accent ?? null);
</script>

<div
  class="zone"
  class:zone--active={active}
  style={accent ? `--zone-accent:${accent}` : undefined}
>
  <Handle
    type="target"
    position={Position.Left}
    isConnectable={false}
    class="zone__handle"
  />

  <div class="zone__head">
    <span class="zone__dot"></span>
    <span class="zone__label">{data.label}</span>
  </div>

  <div class="zone__body">
    {#if card}
      {#key card.kind + card.text}
        <div
          class="card card--{card.kind}"
          in:scale={{ duration: DUR.card, start: 0.6, easing: backOut }}
        >
          {#if card.icon}<span class="card__icon">{card.icon}</span>{/if}
          {#if card.kind === "commit"}<span class="card__commit-dot"></span>{/if}
          {card.text}
        </div>
      {/key}
    {/if}
  </div>

  <Handle
    type="source"
    position={Position.Right}
    isConnectable={false}
    class="zone__handle"
  />
</div>

<style>
  .zone {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    border: 1px dashed var(--sl-color-gray-5);
    border-radius: 0.85rem;
    background: color-mix(in srgb, var(--sl-color-black) 80%, transparent);
    padding: 1rem;
    transition:
      border-color 0.3s ease,
      box-shadow 0.3s ease,
      background 0.3s ease;
  }
  .zone--active {
    border-style: solid;
    border-color: var(--zone-accent, var(--git-orange));
    background: color-mix(in srgb, var(--zone-accent, var(--git-orange)) 8%, transparent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--zone-accent, var(--git-orange)) 22%, transparent);
  }
  .zone__head {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    padding-bottom: 0.85rem;
    margin-bottom: 0.2rem;
    border-bottom: 1px solid var(--sl-color-gray-5);
  }
  .zone__dot {
    width: 0.65rem;
    height: 0.65rem;
    border-radius: 50%;
    background: var(--sl-color-gray-4);
    flex: none;
    transition: background 0.3s ease;
  }
  .zone--active .zone__dot {
    background: var(--zone-accent, var(--git-orange));
  }
  .zone__label {
    font-size: 1.05rem;
    font-weight: 600;
    line-height: 1.2;
    color: var(--sl-color-gray-2);
    white-space: nowrap;
  }
  .zone__body {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .card {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.65rem 0.95rem;
    border-radius: 0.6rem;
    font-size: 1.15rem;
    font-family: var(--__sl-font-mono, monospace);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
  }
  .card--file {
    background: var(--git-orange);
    color: #fff;
  }
  .card--commit {
    background: var(--sl-color-gray-6);
    color: var(--sl-color-white);
    border: 1px solid var(--git-orange);
  }
  .card--stash {
    background: #6b4bb0;
    color: #fff;
  }
  .card--clean {
    background: none;
    box-shadow: none;
    color: #7ee2a8;
    font-weight: 600;
  }
  .card--empty {
    background: none;
    box-shadow: none;
    color: var(--sl-color-gray-4);
  }
  .card__commit-dot {
    width: 0.65rem;
    height: 0.65rem;
    border-radius: 50%;
    background: var(--git-orange);
  }
  .zone :global(.zone__handle) {
    opacity: 0;
    pointer-events: none;
  }
</style>
