<script>
  import { useSvelteFlow } from "@xyflow/svelte";

  let { padding = 0.16 } = $props();

  const { getNodes, setViewport } = useSvelteFlow();

  let anchor = $state();

  function center() {
    const flow = anchor?.closest(".svelte-flow");
    if (!flow) return false;

    const nodes = getNodes();
    if (!nodes.length || nodes.some((n) => !n.measured?.width || !n.measured?.height)) {
      return false;
    }

    const W = flow.clientWidth;
    const H = flow.clientHeight;
    if (!W || !H) return false;

    const minX = Math.min(...nodes.map((n) => n.position.x));
    const minY = Math.min(...nodes.map((n) => n.position.y));
    const maxX = Math.max(...nodes.map((n) => n.position.x + n.measured.width));
    const maxY = Math.max(...nodes.map((n) => n.position.y + n.measured.height));
    const bw = maxX - minX;
    const bh = maxY - minY;
    if (!bw || !bh) return false;

    const zoom = Math.min(
      (W * (1 - padding * 2)) / bw,
      (H * (1 - padding * 2)) / bh,
    );
    const x = W / 2 - (minX + bw / 2) * zoom;
    const y = H / 2 - (minY + bh / 2) * zoom;

    setViewport({ x, y, zoom });
    return true;
  }

  $effect(() => {
    const flow = anchor?.closest(".svelte-flow");
    if (!flow) return;

    let frame = 0;
    let settled = false;
    const tick = () => {
      if (settled) return;
      if (center()) settled = true;
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => center());
    ro.observe(flow);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  });
</script>

<div bind:this={anchor} style="display:none" aria-hidden="true"></div>
