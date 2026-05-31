<script>
  import { Handle, Position } from "@xyflow/svelte";

  let { data } = $props();

  // Three vertical anchor points on the left and right sides so several edges
  // can run as clean parallel rails between two nodes instead of overlapping.
  const rails = [0.2, 0.5, 0.8];
</script>

<div
  class="fbox fbox--{data.variant ?? 'default'}"
  style={`animation-delay:${(data.order ?? 0) * 110}ms;${data.minHeight ? `min-height:${data.minHeight}px;` : ""}`}
>
  {#each rails as ry, i}
    <Handle type="source" id={`sl${i}`} position={Position.Left} isConnectable={false} class="fbox__h" style={`top:${ry * 100}%`} />
    <Handle type="target" id={`tl${i}`} position={Position.Left} isConnectable={false} class="fbox__h" style={`top:${ry * 100}%`} />
    <Handle type="source" id={`sr${i}`} position={Position.Right} isConnectable={false} class="fbox__h" style={`top:${ry * 100}%`} />
    <Handle type="target" id={`tr${i}`} position={Position.Right} isConnectable={false} class="fbox__h" style={`top:${ry * 100}%`} />
  {/each}
  <Handle type="source" id="s-t" position={Position.Top} isConnectable={false} class="fbox__h" />
  <Handle type="target" id="t-t" position={Position.Top} isConnectable={false} class="fbox__h" />
  <Handle type="source" id="s-b" position={Position.Bottom} isConnectable={false} class="fbox__h" />
  <Handle type="target" id="t-b" position={Position.Bottom} isConnectable={false} class="fbox__h" />

  <div class="fbox__row">
    <span class="fbox__dot"></span>
    {#if data.icon}<span class="fbox__icon">{data.icon}</span>{/if}
    <span class="fbox__label">{data.label}</span>
  </div>
  {#if data.sub}<span class="fbox__sub">{data.sub}</span>{/if}
</div>

<style>
  .fbox {
    --ac: var(--git-orange);
    box-sizing: border-box;
    min-width: 124px;
    max-width: 230px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 0.2rem;
    padding: 0.6rem 0.85rem;
    border-radius: 0.6rem;
    border: 1px solid color-mix(in srgb, var(--ac) 38%, var(--sl-color-gray-5));
    border-left: 3px solid var(--ac);
    background: color-mix(in srgb, var(--ac) 9%, var(--sl-color-black));
    box-shadow: 0 4px 16px -10px rgba(0, 0, 0, 0.8);
    opacity: 0;
    transform: translateY(6px) scale(0.96);
    animation: fbox-in 0.4s cubic-bezier(0.34, 1.18, 0.64, 1) forwards;
  }
  @keyframes fbox-in {
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  .fbox__row {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }
  .fbox__dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--ac);
    flex: none;
  }
  .fbox__icon {
    font-size: 1rem;
    line-height: 1;
  }
  .fbox__label {
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.01em;
    color: var(--sl-color-white);
    white-space: nowrap;
  }
  .fbox__sub {
    padding-left: 0.95rem;
    font-size: 0.68rem;
    color: var(--sl-color-gray-3);
  }

  .fbox--orange,
  .fbox--tool,
  .fbox--commit,
  .fbox--local {
    --ac: var(--git-orange);
  }
  .fbox--blue,
  .fbox--platform,
  .fbox--tree,
  .fbox--remote {
    --ac: var(--gp-feature);
  }
  .fbox--green,
  .fbox--blob {
    --ac: var(--gp-green);
  }

  .fbox :global(.fbox__h) {
    opacity: 0;
    pointer-events: none;
    border: none;
    min-width: 0;
    min-height: 0;
    width: 1px;
    height: 1px;
  }
  @media (prefers-reduced-motion: reduce) {
    .fbox {
      animation: none;
      opacity: 1;
      transform: none;
    }
  }
</style>
