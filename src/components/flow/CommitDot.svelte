<script>
  import { Handle, Position } from "@xyflow/svelte";

  let { data } = $props();
</script>

<div
  class="cd cd--{data.variant ?? 'main'}"
  class:cd--ghost={data.ghost}
  class:cd--merge={data.variant === 'merge'}
  class:cd--on={data.revealed !== false}
  style={`width:${data.size ?? 44}px;height:${data.size ?? 44}px`}
>
  <Handle type="target" id="t-l" position={Position.Left} isConnectable={false} class="cd__h" />
  <Handle type="source" id="s-r" position={Position.Right} isConnectable={false} class="cd__h" />
  <span class="cd__label">{data.label}</span>
</div>

<style>
  .cd {
    --ac: var(--git-orange);
    box-sizing: border-box;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--ac);
    border: 2px solid color-mix(in srgb, var(--ac) 45%, #000);
    box-shadow: 0 3px 10px -3px rgba(0, 0, 0, 0.6);
    opacity: 0;
    transform: scale(0.3);
    transition:
      opacity 0.35s ease,
      transform 0.42s cubic-bezier(0.34, 1.18, 0.64, 1),
      background 0.4s ease,
      border-color 0.4s ease;
  }
  .cd--on {
    opacity: 1;
    transform: scale(1);
  }
  .cd--main {
    --ac: var(--git-orange);
  }
  .cd--feature {
    --ac: var(--gp-feature);
  }
  .cd--alt {
    --ac: var(--gp-alt);
  }
  .cd--pick {
    --ac: var(--gp-pick);
  }
  .cd--merge {
    background: var(--sl-color-gray-6);
    border-color: var(--git-orange);
  }
  .cd--ghost {
    background: var(--sl-color-gray-6);
    border: 2px dashed var(--sl-color-gray-4);
  }
  .cd--ghost.cd--on {
    opacity: 0.45;
  }
  .cd__label {
    font-family: var(--__sl-font-mono, monospace);
    font-size: 12.5px;
    font-weight: 700;
    color: #fff;
    pointer-events: none;
  }
  .cd--merge .cd__label,
  .cd--ghost .cd__label {
    color: var(--sl-color-gray-2);
  }
  .cd :global(.cd__h) {
    opacity: 0;
    pointer-events: none;
    border: none;
    width: 1px;
    height: 1px;
    min-width: 0;
    min-height: 0;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd {
      transition: none;
    }
  }
</style>
