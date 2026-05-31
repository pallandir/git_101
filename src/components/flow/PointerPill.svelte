<script>
  import { Handle, Position } from "@xyflow/svelte";

  let { data } = $props();
</script>

<div
  class="pp pp--{data.variant ?? 'branch'}"
  class:pp--detached={data.detached}
>
  <Handle type="target" id="t" position={Position.Bottom} isConnectable={false} class="pp__h" />
  <span class="pp__label">{data.label}</span>
  <span class="pp__tip"></span>
</div>

<style>
  .pp {
    --ac: var(--git-orange);
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.2rem 0.5rem;
    border-radius: 0.45rem;
    background: var(--sl-color-gray-6);
    border: 1.5px solid var(--ac);
    white-space: nowrap;
  }
  .pp__label {
    font-family: var(--__sl-font-mono, monospace);
    font-size: 11px;
    font-weight: 700;
    color: var(--sl-color-white);
    pointer-events: none;
  }
  .pp__tip {
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 6px solid var(--ac);
  }
  .pp--branch {
    --ac: var(--git-orange);
  }
  .pp--feature {
    --ac: var(--gp-feature);
  }
  .pp--alt {
    --ac: var(--gp-alt);
  }
  .pp--head {
    --ac: var(--git-orange);
    background: var(--git-orange);
  }
  .pp--head .pp__label {
    color: #fff;
    font-weight: 800;
    letter-spacing: 0.03em;
  }
  .pp--origin {
    --ac: var(--gp-feature);
    background: color-mix(in srgb, var(--gp-feature) 14%, var(--sl-color-gray-6));
  }
  .pp--origin .pp__label {
    color: #9ccbff;
  }
  .pp--detached {
    --ac: #b3261e;
    background: #b3261e;
  }
  .pp--detached .pp__label {
    color: #fff;
  }
  .pp :global(.pp__h) {
    opacity: 0;
    pointer-events: none;
    width: 1px;
    height: 1px;
    min-width: 0;
    min-height: 0;
    border: none;
  }
</style>
