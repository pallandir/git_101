<script>
  import { scale } from "svelte/transition";
  import { backOut } from "svelte/easing";
  import GitDemo from "./GitDemo.svelte";
  import CommitGraph from "./CommitGraph.svelte";
  import { laneY, DUR } from "./flow/graph.js";

  const commits = ["C1", "C2", "C3", "C4"];
  const COL_X0 = 74;
  const COL_STEP = 150;
  const colAt = (i) => COL_X0 + i * COL_STEP;

  let head = $state(3);
  let mode = $state("clean"); // clean | staged | discarded

  const CLEAN_CAPTION =
    "HEAD points at C4, the latest commit. Your working directory is clean.";

  let caption = $state(CLEAN_CAPTION);

  function soft() {
    if (head <= 0) return;
    head -= 1;
    mode = "staged";
    caption =
      "git reset --soft HEAD~ moved HEAD back one commit. The changes from C4 are kept and sit in your staging area, ready to recommit.";
  }
  function hard() {
    if (head <= 0) return;
    head -= 1;
    mode = "discarded";
    caption =
      "git reset --hard HEAD~ moved HEAD back AND threw away the changes from C4. Your working directory is clean again. Use with care!";
  }
  function restart() {
    head = 3;
    mode = "clean";
    caption = CLEAN_CAPTION;
  }

  let nodes = $derived(
    commits.map((id, i) => ({
      id,
      x: colAt(i),
      y: laneY("main"),
      variant: "main",
      ghost: i > head,
    })),
  );

  let edges = $derived(
    commits.slice(1).map((id, i) => ({
      id: `e${i}`,
      from: commits[i],
      to: id,
      variant: "main",
      ghost: i + 1 > head,
    })),
  );

  let pointers = $derived([
    { key: "head", label: "HEAD", at: commits[head], variant: "head" },
    ...(mode !== "clean" && head < commits.length - 1
      ? [
          {
            key: "fate",
            label: mode === "staged" ? "kept → staged" : "discarded",
            at: commits[head + 1],
            variant: mode === "staged" ? "feature" : "detached",
          },
        ]
      : []),
  ]);
</script>

<GitDemo {caption}>
  {#snippet controls()}
    <div class="gd__choices">
      <button class="git-demo__btn git-demo__btn--primary" onclick={soft} disabled={head <= 0}>
        git reset --soft HEAD~
      </button>
      <button class="git-demo__btn" onclick={hard} disabled={head <= 0}>
        git reset --hard HEAD~
      </button>
      <button class="git-demo__btn" onclick={restart} disabled={head === 3 && mode === "clean"}>
        ↺ Restart
      </button>
    </div>
  {/snippet}

  <CommitGraph {nodes} {edges} {pointers} width={600} height={170} label="HEAD movement during git reset" />

  <div class="state">
    <span class="state__label">Working directory / staging:</span>
    {#key mode}
      <span
        class="pill pill--{mode === 'clean' ? 'ok' : mode === 'staged' ? 'warn' : 'danger'}"
        in:scale={{ duration: DUR.card, start: 0.7, easing: backOut }}
      >
        {#if mode === "clean"}clean{:else if mode === "staged"}📄 app.js — staged (changes kept){:else}🗑 discarded (working dir back to C3){/if}
      </span>
    {/key}
  </div>
</GitDemo>

<style>
  .state {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    font-size: 0.85rem;
  }
  .state__label {
    color: var(--sl-color-gray-3);
  }
  .pill {
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 600;
  }
  .pill--ok {
    background: #1f3d2b;
    color: #7ee2a8;
  }
  .pill--warn {
    background: #3d2f0f;
    color: #f5cd6b;
  }
  .pill--danger {
    background: #3d1a14;
    color: #f59b86;
  }
</style>
