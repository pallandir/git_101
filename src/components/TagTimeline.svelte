<script>
  import GitDemo from "./GitDemo.svelte";
  import TimelineControls from "./TimelineControls.svelte";
  import CommitGraph from "./CommitGraph.svelte";
  import { colX, laneY, stackLevels } from "./flow/graph.js";

  const scenario = [
    {
      tag: "history",
      commits: ["C1", "C2", "C3"],
      mainTip: "C3",
      tags: [],
      head: { branch: "main" },
      caption:
        "A linear history with three commits. The branch main points to the latest, C3, and there are no tags yet.",
    },
    {
      tag: "tag -a v1.0.0",
      commits: ["C1", "C2", "C3"],
      mainTip: "C3",
      tags: [{ name: "v1.0.0", at: "C3" }],
      head: { branch: "main" },
      caption:
        "git tag -a v1.0.0 plants a permanent marker on C3. Unlike a branch, a tag is meant to never move once you've shared it.",
    },
    {
      tag: "git commit",
      commits: ["C1", "C2", "C3", "C4"],
      mainTip: "C4",
      tags: [{ name: "v1.0.0", at: "C3" }],
      head: { branch: "main" },
      caption:
        "A new commit moves main forward to C4. Notice v1.0.0 stays exactly on C3. That's the whole point of a tag: it marks one fixed moment in history.",
    },
    {
      tag: "git commit",
      commits: ["C1", "C2", "C3", "C4", "C5"],
      mainTip: "C5",
      tags: [{ name: "v1.0.0", at: "C3" }],
      head: { branch: "main" },
      caption:
        "main keeps advancing to C5. The tag is still pinned to the exact code that v1.0.0 shipped.",
    },
    {
      tag: "tag -a v1.1.0",
      commits: ["C1", "C2", "C3", "C4", "C5"],
      mainTip: "C5",
      tags: [
        { name: "v1.0.0", at: "C3" },
        { name: "v1.1.0", at: "C5" },
      ],
      head: { branch: "main" },
      caption:
        "When C5 is ready to ship, tag it too. You've now named two distinct releases in the same line of history.",
    },
    {
      tag: "checkout v1.0.0",
      commits: ["C1", "C2", "C3", "C4", "C5"],
      mainTip: "C5",
      tags: [
        { name: "v1.0.0", at: "C3" },
        { name: "v1.1.0", at: "C5" },
      ],
      head: { commit: "C3" },
      caption:
        "git checkout v1.0.0 points HEAD straight at the tagged commit, a detached HEAD. This is how you inspect, or roll back to, the exact code a release shipped.",
    },
  ];

  let step = $state(0);
  let s = $derived(scenario[step]);

  const pos = {
    C1: { x: colX(0), y: laneY("main"), variant: "main" },
    C2: { x: colX(1), y: laneY("main"), variant: "main" },
    C3: { x: colX(2), y: laneY("main"), variant: "main" },
    C4: { x: colX(3), y: laneY("main"), variant: "main" },
    C5: { x: colX(4), y: laneY("main"), variant: "main" },
  };

  let nodes = $derived(s.commits.map((id) => ({ id, ...pos[id] })));

  let edges = $derived(
    [
      s.commits.includes("C2") && { id: "e12", from: "C1", to: "C2", variant: "main" },
      s.commits.includes("C3") && { id: "e23", from: "C2", to: "C3", variant: "main" },
      s.commits.includes("C4") && { id: "e34", from: "C3", to: "C4", variant: "main" },
      s.commits.includes("C5") && { id: "e45", from: "C4", to: "C5", variant: "main" },
    ].filter(Boolean),
  );

  let pointers = $derived.by(() => {
    const list = s.tags.map((t) => ({
      key: `tag-${t.name}`,
      label: t.name,
      at: t.at,
      variant: "tag",
    }));
    list.push({ key: "main", label: "main", at: s.mainTip, variant: "branch" });
    if (s.head.commit) {
      list.push({ key: "head", label: "HEAD ⚠", at: s.head.commit, variant: "head", detached: true });
    } else {
      list.push({ key: "head", label: "HEAD", at: s.mainTip, variant: "head" });
    }
    return stackLevels(list);
  });
</script>

<GitDemo caption={s.caption} {step} count={scenario.length}>
  {#snippet controls()}
    <TimelineControls
      count={scenario.length}
      bind:step
      interval={2600}
      labels={scenario.map((x) => x.tag)}
    />
  {/snippet}

  <CommitGraph
    {nodes}
    {edges}
    {pointers}
    label="A tag staying fixed on a release commit while main keeps moving forward"
  />
</GitDemo>
