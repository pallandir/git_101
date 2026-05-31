<script>
  import GitDemo from "./GitDemo.svelte";
  import TimelineControls from "./TimelineControls.svelte";
  import CommitGraph from "./CommitGraph.svelte";
  import { colX, laneY, stackLevels } from "./flow/graph.js";

  const captions = [
    "Start on main. init and setup are your stable base — the line everyone ships from.",
    "git switch -c feature-x branches off, then you commit work. main stays untouched.",
    "You keep going on the branch — work, then review fixes — while main stays stable and releasable.",
    "git merge feature-x joins the branch back into main as a merge commit (M).",
    "Back on main, deploy ships the merged work. The feature branch can now be deleted.",
  ];

  const labels = [
    "Stable main",
    "Branch + commit",
    "More branch work",
    "Merge to main",
    "Ship it",
  ];

  let step = $state(0);

  const N = {
    init: { id: "init", x: colX(0), y: laneY("main"), variant: "main" },
    setup: { id: "setup", x: colX(1), y: laneY("main"), variant: "main" },
    work: { id: "work", x: colX(2), y: laneY("feature"), variant: "feature" },
    review: { id: "review", x: colX(3), y: laneY("feature"), variant: "feature", label: "fix" },
    M: { id: "M", x: colX(4), y: laneY("main"), variant: "merge", label: "M" },
    deploy: { id: "deploy", x: colX(5), y: laneY("main"), variant: "main", label: "dep" },
  };

  let nodes = $derived(
    [
      N.init,
      N.setup,
      step >= 1 && N.work,
      step >= 2 && N.review,
      step >= 3 && N.M,
      step >= 4 && N.deploy,
    ].filter(Boolean),
  );

  let edges = $derived(
    [
      { id: "e-init-setup", from: "init", to: "setup", variant: "main" },
      step >= 1 && { id: "e-setup-work", from: "setup", to: "work", variant: "feature" },
      step >= 2 && { id: "e-work-review", from: "work", to: "review", variant: "feature" },
      step >= 3 && { id: "e-setup-m", from: "setup", to: "M", variant: "main" },
      step >= 3 && { id: "e-review-m", from: "review", to: "M", variant: "feature" },
      step >= 4 && { id: "e-m-deploy", from: "M", to: "deploy", variant: "main" },
    ].filter(Boolean),
  );

  let pointers = $derived(
    stackLevels(
      [
        {
          key: "main",
          label: "main",
          at: step >= 4 ? "deploy" : step >= 3 ? "M" : "setup",
          variant: "branch",
        },
        step >= 1 &&
          step < 4 && {
            key: "feature",
            label: "feature-x",
            at: step >= 2 ? "review" : "work",
            variant: "feature",
          },
      ].filter(Boolean),
    ),
  );
</script>

<GitDemo caption={captions[step]} {step} count={captions.length}>
  {#snippet controls()}
    <TimelineControls count={captions.length} bind:step interval={2000} {labels} />
  {/snippet}

  <CommitGraph {nodes} {edges} {pointers} label="A feature branch workflow: branch, commit, merge, deploy" />
</GitDemo>
