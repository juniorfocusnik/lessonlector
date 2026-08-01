// The full content catalog: subject types, webs (skill trees), and the
// node-graph generator that turns short topic descriptions into a full
// branching/merging lesson graph with parts, quizzes, and a final exam.
//
// To add a new web: copy one of the entries in RAW_WEBS below and change
// the metadata + the 14 topic slots + medal/project names. Nothing else
// needs to change — the graph shape, tiered gem values, and quiz/slide
// generation are all derived automatically by buildWeb().

export const TYPES = [
  "Maths",
  "Science",
  "Music and Art",
  "Programming",
  "Languages",
  "Humanities"
];

export const TYPE_COLORS = {
  "Maths": "#3ec5ff",
  "Science": "#9b5cff",
  "Music and Art": "#ff5cd8",
  "Programming": "#4dd6a8",
  "Languages": "#ffd166",
  "Humanities": "#ff8c42"
};

// Three difficulty "blocks". Each block fans an intro out into THREE
// branches, then converges them into TWO overlapping hub nodes — hub1
// takes branchA+branchB, hub2 takes branchB+branchC, so branchB feeds
// both hubs and the paths genuinely cross rather than merging cleanly
// in a straight line. Each hub also sprouts its own dead-end lesson
// that never reconnects to anything. Blocks 2 and 3 route their two
// hubs through a project before the test; block 3 additionally has two
// more standalone dead-ends. A review lesson and final exam cap it off.
// Three genuinely different graph topologies, all sharing the exact
// same 31 slot names (so every web's authored topic content works with
// any of them, unchanged) but wired and laid out completely
// differently — different webs feel structurally different to
// navigate, not just re-skinned copies of one template.

// MESH: the original — three branches fan out, then converge into two
// *overlapping* hubs (branchB feeds both), so either hub is reachable
// with just 2 of 3 branches done. Permissive, criss-crossing.
const SHAPE_MESH = {
  u1_intro:   { requires: [],                        kind: "lesson", tier: 1, x: 2.5, y: 0 },
  u1_branchA: { requires: ["u1_intro"],               kind: "lesson", tier: 1, x: 0.5, y: 1 },
  u1_branchB: { requires: ["u1_intro"],               kind: "lesson", tier: 1, x: 2.5, y: 1 },
  u1_branchC: { requires: ["u1_intro"],               kind: "lesson", tier: 1, x: 4.5, y: 1 },
  u1_merge:   { requires: ["u1_branchA", "u1_branchB"], kind: "lesson", tier: 1, x: 1.5, y: 2.2 },
  u1_hub2:    { requires: ["u1_branchB", "u1_branchC"], kind: "lesson", tier: 1, x: 3.5, y: 2.2 },
  bonus1:     { requires: ["u1_merge"],               kind: "lesson", tier: 1, x: 0, y: 3.4, optional: true },
  bonus2:     { requires: ["u1_hub2"],                kind: "lesson", tier: 1, x: 5, y: 3.4, optional: true },
  test1:      { requires: ["u1_merge", "u1_hub2"],    kind: "test", tier: 1, x: 2.5, y: 3.6 },

  u2_intro:   { requires: ["test1"],                  kind: "lesson", tier: 2, x: 2.5, y: 4.8 },
  u2_branchA: { requires: ["u2_intro"],               kind: "lesson", tier: 2, x: 0.5, y: 5.8 },
  u2_branchB: { requires: ["u2_intro"],               kind: "lesson", tier: 2, x: 2.5, y: 5.8 },
  u2_branchC: { requires: ["u2_intro"],               kind: "lesson", tier: 2, x: 4.5, y: 5.8 },
  u2_merge:   { requires: ["u2_branchA", "u2_branchB"], kind: "lesson", tier: 2, x: 1.5, y: 7 },
  u2_hub2:    { requires: ["u2_branchB", "u2_branchC"], kind: "lesson", tier: 2, x: 3.5, y: 7 },
  sideQuestA: { requires: ["u2_merge"],               kind: "lesson", tier: 2, x: 0, y: 8.2, optional: true },
  sideQuestB: { requires: ["u2_hub2"],                kind: "lesson", tier: 2, x: 5, y: 8.2, optional: true },
  project1:   { requires: ["u2_merge", "u2_hub2"],    kind: "project", tier: 2, x: 2.5, y: 8.4 },
  test2:      { requires: ["project1"],               kind: "test", tier: 2, x: 2.5, y: 9.6 },

  u3_intro:   { requires: ["test2"],                  kind: "lesson", tier: 3, x: 2.5, y: 10.8 },
  u3_branchA: { requires: ["u3_intro"],               kind: "lesson", tier: 3, x: 0.5, y: 11.8 },
  u3_branchB: { requires: ["u3_intro"],               kind: "lesson", tier: 3, x: 2.5, y: 11.8 },
  u3_branchC: { requires: ["u3_intro"],               kind: "lesson", tier: 3, x: 4.5, y: 11.8 },
  u3_merge:   { requires: ["u3_branchA", "u3_branchB"], kind: "lesson", tier: 3, x: 1.5, y: 13 },
  u3_hub2:    { requires: ["u3_branchB", "u3_branchC"], kind: "lesson", tier: 3, x: 3.5, y: 13 },
  u3_dead1:   { requires: ["u3_merge"],               kind: "lesson", tier: 3, x: 0, y: 14.2, optional: true },
  u3_dead2:   { requires: ["u3_hub2"],                 kind: "lesson", tier: 3, x: 5, y: 14.2, optional: true },
  project2:   { requires: ["u3_merge", "u3_hub2"],    kind: "project", tier: 3, x: 2.5, y: 14.4 },
  test3:      { requires: ["project2"],               kind: "test", tier: 3, x: 2.5, y: 15.6 },

  review:     { requires: ["test3"],                  kind: "lesson", tier: 3, x: 2.5, y: 16.8 },
  final:      { requires: ["review"],                 kind: "finalExam", tier: 4, x: 2.5, y: 18 }
};

// CHAIN: mostly one long serpentine path (intro→A→B→merge) down one
// side, with a single parallel side-path (intro→C→hub2) down the
// other side that only reconnects at the test — far more sequential
// and gated than MESH, with just one real fork per unit instead of a
// wide fan.
const SHAPE_CHAIN = {
  u1_intro:   { requires: [],                          kind: "lesson", tier: 1, x: 2.5, y: 0 },
  u1_branchA: { requires: ["u1_intro"],                 kind: "lesson", tier: 1, x: 1, y: 1.2 },
  u1_branchB: { requires: ["u1_branchA"],               kind: "lesson", tier: 1, x: 1, y: 2.4 },
  u1_branchC: { requires: ["u1_intro"],                 kind: "lesson", tier: 1, x: 4, y: 1.2 },
  u1_merge:   { requires: ["u1_branchB"],               kind: "lesson", tier: 1, x: 1, y: 3.6 },
  u1_hub2:    { requires: ["u1_branchC"],               kind: "lesson", tier: 1, x: 4, y: 2.4 },
  bonus1:     { requires: ["u1_merge"],                 kind: "lesson", tier: 1, x: 0, y: 4.8, optional: true },
  bonus2:     { requires: ["u1_hub2"],                  kind: "lesson", tier: 1, x: 5, y: 3.6, optional: true },
  test1:      { requires: ["u1_merge", "u1_hub2"],      kind: "test", tier: 1, x: 2.5, y: 5.2 },

  u2_intro:   { requires: ["test1"],                    kind: "lesson", tier: 2, x: 2.5, y: 6.4 },
  u2_branchA: { requires: ["u2_intro"],                 kind: "lesson", tier: 2, x: 1, y: 7.6 },
  u2_branchB: { requires: ["u2_branchA"],               kind: "lesson", tier: 2, x: 1, y: 8.8 },
  u2_branchC: { requires: ["u2_intro"],                 kind: "lesson", tier: 2, x: 4, y: 7.6 },
  u2_merge:   { requires: ["u2_branchB"],               kind: "lesson", tier: 2, x: 1, y: 10 },
  u2_hub2:    { requires: ["u2_branchC"],               kind: "lesson", tier: 2, x: 4, y: 8.8 },
  sideQuestA: { requires: ["u2_merge"],                 kind: "lesson", tier: 2, x: 0, y: 11.2, optional: true },
  sideQuestB: { requires: ["u2_hub2"],                  kind: "lesson", tier: 2, x: 5, y: 10, optional: true },
  project1:   { requires: ["u2_merge", "u2_hub2"],      kind: "project", tier: 2, x: 2.5, y: 11.4 },
  test2:      { requires: ["project1"],                 kind: "test", tier: 2, x: 2.5, y: 12.6 },

  u3_intro:   { requires: ["test2"],                    kind: "lesson", tier: 3, x: 2.5, y: 13.8 },
  u3_branchA: { requires: ["u3_intro"],                 kind: "lesson", tier: 3, x: 1, y: 15 },
  u3_branchB: { requires: ["u3_branchA"],               kind: "lesson", tier: 3, x: 1, y: 16.2 },
  u3_branchC: { requires: ["u3_intro"],                 kind: "lesson", tier: 3, x: 4, y: 15 },
  u3_merge:   { requires: ["u3_branchB"],               kind: "lesson", tier: 3, x: 1, y: 17.4 },
  u3_hub2:    { requires: ["u3_branchC"],               kind: "lesson", tier: 3, x: 4, y: 16.2 },
  u3_dead1:   { requires: ["u3_merge"],                 kind: "lesson", tier: 3, x: 0, y: 18.6, optional: true },
  u3_dead2:   { requires: ["u3_hub2"],                  kind: "lesson", tier: 3, x: 5, y: 17.4, optional: true },
  project2:   { requires: ["u3_merge", "u3_hub2"],      kind: "project", tier: 3, x: 2.5, y: 18.8 },
  test3:      { requires: ["project2"],                 kind: "test", tier: 3, x: 2.5, y: 20 },

  review:     { requires: ["test3"],                    kind: "lesson", tier: 3, x: 2.5, y: 21.2 },
  final:      { requires: ["review"],                   kind: "finalExam", tier: 4, x: 2.5, y: 22.4 }
};

// STAR: all three branches must converge into a single shared hub
// (harder gate — needs all 3, not just 2 of 3), and every dead-end
// hangs directly off that same hub like spokes, instead of a tiered
// mesh. A visually and functionally distinct hub-and-spoke feel.
const SHAPE_STAR = {
  u1_intro:   { requires: [],                                     kind: "lesson", tier: 1, x: 2.5, y: 0 },
  u1_branchA: { requires: ["u1_intro"],                            kind: "lesson", tier: 1, x: 0.5, y: 1.2 },
  u1_branchB: { requires: ["u1_intro"],                            kind: "lesson", tier: 1, x: 2.5, y: 1.2 },
  u1_branchC: { requires: ["u1_intro"],                            kind: "lesson", tier: 1, x: 4.5, y: 1.2 },
  u1_merge:   { requires: ["u1_branchA", "u1_branchB", "u1_branchC"], kind: "lesson", tier: 1, x: 2.5, y: 2.4 },
  u1_hub2:    { requires: ["u1_merge"],                            kind: "lesson", tier: 1, x: 2.5, y: 3.6 },
  bonus1:     { requires: ["u1_merge"],                            kind: "lesson", tier: 1, x: 0.5, y: 3.6, optional: true },
  bonus2:     { requires: ["u1_merge"],                            kind: "lesson", tier: 1, x: 4.5, y: 3.6, optional: true },
  test1:      { requires: ["u1_hub2"],                             kind: "test", tier: 1, x: 2.5, y: 4.8 },

  u2_intro:   { requires: ["test1"],                               kind: "lesson", tier: 2, x: 2.5, y: 6 },
  u2_branchA: { requires: ["u2_intro"],                            kind: "lesson", tier: 2, x: 0.5, y: 7.2 },
  u2_branchB: { requires: ["u2_intro"],                            kind: "lesson", tier: 2, x: 2.5, y: 7.2 },
  u2_branchC: { requires: ["u2_intro"],                            kind: "lesson", tier: 2, x: 4.5, y: 7.2 },
  u2_merge:   { requires: ["u2_branchA", "u2_branchB", "u2_branchC"], kind: "lesson", tier: 2, x: 2.5, y: 8.4 },
  u2_hub2:    { requires: ["u2_merge"],                            kind: "lesson", tier: 2, x: 2.5, y: 9.6 },
  sideQuestA: { requires: ["u2_merge"],                            kind: "lesson", tier: 2, x: 0.5, y: 9.6, optional: true },
  sideQuestB: { requires: ["u2_merge"],                            kind: "lesson", tier: 2, x: 4.5, y: 9.6, optional: true },
  project1:   { requires: ["u2_hub2"],                             kind: "project", tier: 2, x: 2.5, y: 10.8 },
  test2:      { requires: ["project1"],                            kind: "test", tier: 2, x: 2.5, y: 12 },

  u3_intro:   { requires: ["test2"],                               kind: "lesson", tier: 3, x: 2.5, y: 13.2 },
  u3_branchA: { requires: ["u3_intro"],                            kind: "lesson", tier: 3, x: 0.5, y: 14.4 },
  u3_branchB: { requires: ["u3_intro"],                            kind: "lesson", tier: 3, x: 2.5, y: 14.4 },
  u3_branchC: { requires: ["u3_intro"],                            kind: "lesson", tier: 3, x: 4.5, y: 14.4 },
  u3_merge:   { requires: ["u3_branchA", "u3_branchB", "u3_branchC"], kind: "lesson", tier: 3, x: 2.5, y: 15.6 },
  u3_hub2:    { requires: ["u3_merge"],                            kind: "lesson", tier: 3, x: 2.5, y: 16.8 },
  u3_dead1:   { requires: ["u3_merge"],                            kind: "lesson", tier: 3, x: 0.5, y: 16.8, optional: true },
  u3_dead2:   { requires: ["u3_merge"],                            kind: "lesson", tier: 3, x: 4.5, y: 16.8, optional: true },
  project2:   { requires: ["u3_hub2"],                             kind: "project", tier: 3, x: 2.5, y: 18 },
  test3:      { requires: ["project2"],                            kind: "test", tier: 3, x: 2.5, y: 19.2 },

  review:     { requires: ["test3"],                               kind: "lesson", tier: 3, x: 2.5, y: 20.4 },
  final:      { requires: ["review"],                              kind: "finalExam", tier: 4, x: 2.5, y: 21.6 }
};

const SHAPE_VARIANTS = [SHAPE_MESH, SHAPE_CHAIN, SHAPE_STAR];

const TEST_SECTIONS = {
  test1: ["u1_intro", "u1_branchA", "u1_branchB", "u1_branchC", "u1_merge", "u1_hub2", "bonus1", "bonus2"],
  test2: ["u2_intro", "u2_branchA", "u2_branchB", "u2_branchC", "u2_merge", "u2_hub2", "sideQuestA", "sideQuestB"],
  test3: ["u3_intro", "u3_branchA", "u3_branchB", "u3_branchC", "u3_merge", "u3_hub2", "u3_dead1", "u3_dead2"]
};

const LESSON_GEMS_BY_TIER = { 1: 10, 2: 15, 3: 20 };
const TEST_GEMS_BY_TIER = { 1: 20, 2: 30, 3: 40 };
const PROJECT_GEMS_BY_TIER = { 2: 25, 3: 35 };
const OPTIONAL_GEMS_BY_TIER = { 1: 10, 2: 15, 3: 20 };
const REVIEW_GEMS = 25;
const FINAL_GEMS = 50;

function gemsFor(slot, shape) {
  if (shape.optional) return OPTIONAL_GEMS_BY_TIER[shape.tier];
  if (slot === "review") return REVIEW_GEMS;
  if (shape.kind === "lesson") return LESSON_GEMS_BY_TIER[shape.tier];
  if (shape.kind === "test") return TEST_GEMS_BY_TIER[shape.tier];
  if (shape.kind === "project") return PROJECT_GEMS_BY_TIER[shape.tier];
  return FINAL_GEMS;
}

const DISTRACTOR_POOL = [
  "This idea was only used in the past and isn't relevant anymore.",
  "This only works if you already know the answer in advance.",
  "This has nothing to do with what this lesson actually covered.",
  "This is only true about one time in a thousand.",
  "This was disproven as soon as it was first discovered.",
  "This applies exclusively to a completely different subject.",
  "This is a common myth with no real basis.",
  "This only matters in a made-up, imaginary scenario.",
  "This is the opposite of what was actually taught.",
  "This is a detail so minor it's never actually tested."
];

function seededShuffle(array, seed) {
  const arr = array.slice();
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// A topic carries several genuine, distinct facts (its blurb plus any
// authored `points`) rather than one sentence recycled across every
// slide — each slide in a lesson can then test a DIFFERENT fact.
function factsFor(topic) {
  return topic.points && topic.points.length ? [topic.blurb, ...topic.points] : [topic.blurb];
}

// ---- Six distinct interactive question mechanics, generated from a
// topic's own title/blurb/points (no per-question authoring) ----

// Given the title, pick the correct statement out of four — which
// specific fact is being tested rotates via factIndex.
function conceptMatchQuestion(topic, seed, factIndex = 0) {
  const facts = factsFor(topic);
  const correctFact = facts[factIndex % facts.length];
  const distractors = seededShuffle(DISTRACTOR_POOL, seed).slice(0, 3);
  const options = seededShuffle([correctFact, ...distractors], seed + 7);
  const correctIndex = options.indexOf(correctFact);
  return {
    type: "quiz",
    question: `Which statement is true about "${topic.title}"?`,
    options,
    correctIndex
  };
}

function pickOtherTopics(allTopics, topic, seed, count) {
  const others = allTopics.filter((t) => t.title !== topic.title);
  return seededShuffle(others, seed).slice(0, count);
}

// The reverse direction: given the statement, pick the correct title
// out of four real titles from this web (not generic filler).
function termMatchQuestion(topic, allTopics, seed, factIndex = 0) {
  const facts = factsFor(topic);
  const fact = facts[factIndex % facts.length];
  const distractorTitles = pickOtherTopics(allTopics, topic, seed, 3).map((t) => t.title);
  const options = seededShuffle([topic.title, ...distractorTitles], seed + 9);
  const correctIndex = options.indexOf(topic.title);
  return {
    type: "quiz",
    question: `Which idea does this describe: "${fact}"`,
    options,
    correctIndex
  };
}

// A rapid true/false check — half the time it shows one of this
// topic's own facts (true), half the time a different topic's
// statement mismatched against this title (false).
function trueFalseQuestion(topic, allTopics, seed, factIndex = 0) {
  const facts = factsFor(topic);
  const ownFact = facts[factIndex % facts.length];
  const useOwn = seed % 2 === 0;
  const other = useOwn ? null : pickOtherTopics(allTopics, topic, seed, 1)[0];
  const shownStatement = other ? other.blurb : ownFact;
  return {
    type: "truefalse",
    prompt: `True or False: "${shownStatement}" is true about "${topic.title}".`,
    answer: shownStatement === ownFact
  };
}

// Builds a small matching set (this topic + N-1 others from the same
// web) shared by the table and drag question types below.
function buildMatchSet(topic, allTopics, seed, count) {
  const others = pickOtherTopics(allTopics, topic, seed, count - 1);
  return seededShuffle([topic, ...others], seed + 3);
}

// A table of concepts, each needing its matching description chosen
// from a dropdown — several matches checked at once, not one at a time.
function tableMatchQuestion(topic, allTopics, seed) {
  const items = buildMatchSet(topic, allTopics, seed, 3);
  const rowOrder = seededShuffle(items.map((_, i) => i), seed + 11);
  const optionOrder = seededShuffle(items.map((_, i) => i), seed + 19);
  const rows = rowOrder.map((itemIdx) => ({ title: items[itemIdx].title, itemIdx }));
  const options = optionOrder.map((itemIdx) => items[itemIdx].blurb);
  const correct = rows.map((row) => optionOrder.indexOf(row.itemIdx));
  return {
    type: "table",
    instruction: `Match each idea below to its correct description.`,
    rows: rows.map((r) => ({ title: r.title })),
    options,
    correct
  };
}

// Draggable term chips that must land on their matching description —
// a physically different mechanic from picking a multiple-choice option.
function dragMatchQuestion(topic, allTopics, seed) {
  const items = buildMatchSet(topic, allTopics, seed, 3);
  const chipOrder = seededShuffle(items.map((_, i) => i), seed + 23);
  const zoneOrder = seededShuffle(items.map((_, i) => i), seed + 29);
  return {
    type: "drag",
    instruction: `Drag each term onto the description it matches.`,
    items: chipOrder.map((idx) => ({ id: idx, title: items[idx].title })),
    zones: zoneOrder.map((idx) => ({ id: idx, blurb: items[idx].blurb }))
  };
}

// A free-response prompt: type an explanation, then reveal a model
// answer to self-check against — generative recall, not recognition.
function writingQuestion(topic) {
  return {
    type: "writing",
    prompt: `In your own words, explain what "${topic.title}" means and why it matters.`,
    sampleAnswer: topic.blurb
  };
}

// Universal (every subject): drag this topic's title and three real
// sibling titles into alphabetical order. Unlike the fact-based
// mechanics above, ordering never depends on invented content — it's
// always objectively gradable from titles the web already has, so it
// fits every subject without exception.
function orderQuestion(topic, allTopics, seed) {
  const items = buildMatchSet(topic, allTopics, seed, 4);
  const shown = seededShuffle(items, seed + 41);
  const correctOrder = [...shown.keys()].sort((a, b) => shown[a].title.localeCompare(shown[b].title));
  return {
    type: "order",
    instruction: "Drag these into alphabetical order (A to Z).",
    items: shown.map((t) => t.title),
    correctOrder
  };
}

function makeSeededRand(seed) {
  let s = seed;
  return (min, max) => {
    s = (s * 9301 + 49297) % 233280;
    return min + Math.floor((s / 233280) * (max - min + 1));
  };
}

// Maths-only: a typed numeric answer, scaled to the node's own
// difficulty tier — tier 1 is single-step arithmetic, tier 2 is
// multiplication, tier 3 is a one-step linear equation. Always exactly
// computable, so it's never at risk of feeling arbitrary.
function numericalQuestion(seed, tier) {
  const rand = makeSeededRand(seed);
  if (tier === 2) {
    const a = rand(3, 12);
    const b = rand(3, 12);
    return { type: "numerical", question: `What is ${a} × ${b}?`, answer: a * b, tolerance: 0 };
  }
  if (tier >= 3) {
    const x = rand(2, 12);
    const a = rand(2, 6);
    const b = rand(1, 20);
    const c = a * x + b;
    return {
      type: "numerical",
      question: `Solve for x: ${a}x + ${b} = ${c}. What is x?`,
      answer: x,
      tolerance: 0
    };
  }
  const a = rand(15, 60);
  const b = rand(5, 40);
  const isAdd = rand(0, 1) === 0;
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  return {
    type: "numerical",
    question: isAdd ? `What is ${a} + ${b}?` : `What is ${hi} − ${lo}?`,
    answer: isAdd ? a + b : hi - lo,
    tolerance: 0
  };
}

const SCALE_TARGETS = [12, 18, 25, 34, 42, 55, 63, 71, 78, 88];

// Maths-only: drag a single slider until it shows a target number —
// distinct from the 2D rectangle-resize manipulative below, this is a
// one-axis "scale" interaction (brilliant.org-style estimation).
function scaleQuestion(seed) {
  const target = seededShuffle(SCALE_TARGETS, seed)[0];
  return {
    type: "scale",
    instruction: `Drag the slider until it shows ${target}.`,
    min: 0,
    max: 100,
    target,
    tolerance: 3
  };
}

const SHAPE_TARGET_AREAS = [8, 10, 12, 15, 18, 20, 24, 28, 32, 36, 40];

// Maths-only: drag a corner to resize a rectangle until it matches a
// target area — a hands-on manipulative, not a question about one.
function shapeQuestion(seed) {
  const targetArea = seededShuffle(SHAPE_TARGET_AREAS, seed)[0];
  return {
    type: "shape",
    instruction: `Drag the corner to resize the rectangle until its area is approximately ${targetArea} square units.`,
    targetArea,
    tolerance: 0.12,
    initialWidth: 4,
    initialHeight: 3,
    minSize: 1,
    maxSize: 12
  };
}

// Every web gets the same core rotation of seven genuinely different
// mechanics; Maths webs additionally get three hands-on manipulatives
// (shape-resize, typed numerical entry, and a slider scale), since
// those only make sense where a genuine number or geometry is involved.
// factIndex picks which of a topic's several facts is under test —
// only the generators that examine a single topic's own claims use it.
function buildGeneratorList(webType, tier) {
  const generators = [
    (topic, seed, allTopics, factIndex) => conceptMatchQuestion(topic, seed, factIndex),
    (topic, seed, allTopics, factIndex) => termMatchQuestion(topic, allTopics, seed, factIndex),
    (topic, seed, allTopics, factIndex) => trueFalseQuestion(topic, allTopics, seed, factIndex),
    (topic, seed, allTopics) => tableMatchQuestion(topic, allTopics, seed),
    (topic, seed, allTopics) => dragMatchQuestion(topic, allTopics, seed),
    (topic, seed, allTopics) => orderQuestion(topic, allTopics, seed),
    (topic) => writingQuestion(topic)
  ];
  if (webType === "Maths") {
    generators.push((topic, seed) => shapeQuestion(seed));
    generators.push((topic, seed) => numericalQuestion(seed, tier));
    generators.push((topic, seed) => scaleQuestion(seed));
  }
  return generators;
}

// One grounding slide covering every fact the topic has, then a
// rotation of genuinely different interactive mechanics that each
// probe a different fact — 8 slides means 8 distinct things checked,
// not one sentence rephrased eight times.
function lessonParts(topic, allTopics, seed, webType, tier) {
  const generatorList = buildGeneratorList(webType, tier);
  const facts = factsFor(topic);
  const parts = [{ type: "content", heading: topic.title, body: topic.blurb, points: topic.points || [] }];
  for (let i = 0; i < 8; i++) {
    const generator = generatorList[i % generatorList.length];
    const factIndex = i % facts.length;
    parts.push(generator(topic, seed + i * 17, allTopics, factIndex));
  }
  return parts;
}

function testParts(sectionTopics, allTopics, seed, webType, tier) {
  const generatorList = buildGeneratorList(webType, tier);
  return sectionTopics.map((topic, i) => {
    const generator = generatorList[i % generatorList.length];
    const facts = factsFor(topic);
    const factIndex = i % facts.length;
    return generator(topic, seed + i * 13, allTopics, factIndex);
  });
}

// 3 parts per project: the brief, the interactive checklist, and a
// free-response reflection — no generic padding restating the checklist.
function projectParts(project) {
  return [
    { type: "content", heading: "Project Brief", body: project.brief },
    { type: "project", heading: "Checklist", checklist: project.checklist },
    {
      type: "writing",
      prompt: "Reflect: what was the hardest part of this project, and what would you do differently next time?",
      sampleAnswer: "There's no single right answer here — the point is to genuinely reflect on your own process, not match specific words."
    }
  ];
}

function finalExamParts(allLessonTopics, seed, webType) {
  const generatorList = buildGeneratorList(webType, 3);
  return allLessonTopics.map((topic, i) => {
    const generator = generatorList[i % generatorList.length];
    const facts = factsFor(topic);
    const factIndex = i % facts.length;
    return generator(topic, seed + i * 31, allLessonTopics, factIndex);
  });
}

function buildWeb(config, variantIndex) {
  const webId = config.id;
  const nodes = [];
  const lessonTopicsInOrder = [];
  const SHAPE = SHAPE_VARIANTS[variantIndex % SHAPE_VARIANTS.length];

  const allTopics = Object.values(config.topics);
  const slots = Object.keys(SHAPE);
  slots.forEach((slot, index) => {
    const shape = SHAPE[slot];
    const topic = config.topics[slot];
    const nodeId = `${webId}__${slot}`;
    const requires = shape.requires.map((r) => `${webId}__${r}`);

    let parts;
    let title;
    const extra = {};

    if (shape.kind === "test") {
      const sectionTopics = TEST_SECTIONS[slot].map((s) => config.topics[s]);
      parts = testParts(sectionTopics, allTopics, index * 17 + 3, config.type, shape.tier);
      title = config.specialTitles[slot];
      extra.medalId = nodeId;
      extra.medalName = config.medalNames[slot];
    } else if (shape.kind === "project") {
      const project = config.projects[slot];
      parts = projectParts(project);
      title = project.title;
    } else if (shape.kind === "finalExam") {
      parts = finalExamParts(lessonTopicsInOrder, index * 11 + 5, config.type);
      title = config.finalTitle;
    } else {
      parts = lessonParts(topic, allTopics, index * 19 + 1, config.type, shape.tier);
      lessonTopicsInOrder.push(topic);
      title = topic.title;
    }

    nodes.push({
      id: nodeId,
      webId,
      slot,
      title,
      kind: shape.kind,
      gems: gemsFor(slot, shape),
      requires,
      requiredForStar: !shape.optional,
      x: shape.x,
      y: shape.y,
      parts,
      ...extra
    });
  });

  return {
    id: webId,
    title: config.title,
    type: config.type,
    yeargroups: config.yeargroups,
    description: config.description,
    color: TYPE_COLORS[config.type],
    starId: `${webId}__star`,
    starName: config.title,
    nodes
  };
}

const RAW_WEBS = [
  {
    id: "algebra-starter",
    title: "Algebra Starter",
    type: "Maths",
    yeargroups: "7-9",
    description: "Meet algebra for the first time: expressions, equations, and inequalities.",
    medalNames: { test1: "Algebra Beginner", test2: "Algebra Solver", test3: "Algebra Master" },
    specialTitles: { test1: "Expressions Check", test2: "Equations Check", test3: "Inequalities Check" },
    projects: {
      project1: {
        title: "Build-an-Equation Project",
        brief: "Design three real-world word problems and write the equation that solves each one.",
        checklist: ["Write problem 1 and its equation", "Write problem 2 and its equation", "Write problem 3 and its equation"]
      },
      project2: {
        title: "Inequality Storyboard",
        brief: "Write a short story where a character's situation is described using an inequality, and solve it.",
        checklist: ["Describe the situation", "Write the inequality", "Solve and explain the answer"]
      }
    },
    finalTitle: "Algebra Starter Final Exam",
    topics: {
      u1_intro: { title: "What is Algebra?", blurb: "Letters can stand in for unknown numbers — that's the whole idea behind algebra.", points: ["The letter used doesn't matter — x, n, or any symbol works exactly the same as a stand-in for the unknown.", "Algebra lets you write one general rule, like 2n, instead of a separate sentence for every possible number."] },
      u1_branchA: { title: "Writing Expressions", blurb: "Word problems can be turned into symbols, like turning 'five more than a number' into x + 5.", points: ["Key words are clues: 'more than' and 'sum' usually mean addition, while 'less than' and 'difference' usually mean subtraction.", "Order matters for subtraction — 'five less than a number' is x − 5, not 5 − x."] },
      u1_branchB: { title: "Like Terms", blurb: "Matching terms can be combined, so 2x + 3x becomes 5x.", points: ["Terms are 'like' only if they share the exact same variable raised to the exact same power — 3x and 3x² can never be combined.", "Only the coefficients get added or subtracted; the variable part itself never changes."] },
      u1_branchC: { title: "Order of Operations", blurb: "Following PEMDAS in the right order is what makes an expression's value unambiguous.", points: ["Multiplication and division are done left-to-right in the order they appear — neither automatically outranks the other.", "Anything inside parentheses is always worked out first, no matter what operations are hiding inside them."] },
      u1_merge: { title: "Simplifying Expressions", blurb: "Writing expressions and combining like terms together lets you simplify messy expressions.", points: ["A fully simplified expression has no like terms left to combine and no unnecessary parentheses remaining.", "Simplifying never changes an expression's value for any input — it only changes how it looks."] },
      u1_hub2: { title: "Simplifying with Order of Operations", blurb: "Combining like terms only works correctly once the order of operations has been respected.", points: ["Skipping order of operations before combining like terms is one of the most common sources of algebra mistakes.", "Working step-by-step rather than all at once makes it much easier to spot your own errors."] },
      bonus1: { title: "Algebra Puzzles", blurb: "Brain-teaser puzzles use algebra to help you find a hidden number step by step.", points: ["Working backwards from the final clue, one step at a time, is usually the fastest way to crack a number puzzle.", "Many classic 'think of a number' tricks always land on the same answer because the algebra behind them cancels out."] },
      bonus2: { title: "Algebra in Games", blurb: "Many video games secretly use algebra to calculate scores, damage, and timing behind the scenes.", points: ["A simple formula like damage = base × multiplier lets designers rebalance an entire game by changing one number.", "Timers, cooldowns, and score multipliers are usually just linear or exponential expressions running behind the scenes."] },
      u2_intro: { title: "One-Step Equations", blurb: "Equations like x + 4 = 9 are solved by undoing a single operation.", points: ["Whatever you do to one side of the equation, you must do to the other side too, to keep it balanced.", "Addition and subtraction undo each other, so the opposite operation is what isolates the variable."] },
      u2_branchA: { title: "Two-Step Equations", blurb: "Equations like 2x + 3 = 11 are solved by undoing two operations in order.", points: ["The usual strategy is to undo addition or subtraction first, and save multiplication or division for last.", "Doing the steps in the wrong order still often produces an answer — just the wrong one."] },
      u2_branchB: { title: "Equations with Negative Numbers", blurb: "Equations can include negative coefficients and negative solutions too.", points: ["Dividing both sides by a negative number is where most sign errors creep in, so it's worth double-checking.", "A negative solution isn't a mistake — it just means the unknown value is below zero."] },
      u2_branchC: { title: "Equations with Fractions", blurb: "Equations with fractional coefficients can be cleared by multiplying every term by the denominator.", points: ["Multiplying every single term by the denominator, not just one of them, is what keeps the equation balanced.", "Once the fractions are cleared, the equation solves exactly like any other two-step equation."] },
      u2_merge: { title: "Checking Your Solutions", blurb: "Substituting your answer back into the original equation confirms whether it's actually correct.", points: ["If substituting your answer makes both sides equal, your solution is correct — no other proof is needed.", "Checking your work this way catches arithmetic slips even when your overall method was correct."] },
      u2_hub2: { title: "Equations with Multiple Steps", blurb: "Two-step equations and fraction-clearing together handle almost any linear equation you'll meet.", points: ["Multi-step equations are just two-step equations with an extra layer, like parentheses or terms on both sides.", "Simplifying each side fully before isolating the variable makes even a messy equation manageable."] },
      sideQuestA: { title: "Coefficients & Constants", blurb: "A coefficient multiplies a variable, while a constant stands alone as a fixed number.", points: ["In the term 7x, 7 is the coefficient, and there is no separate constant hiding in that term.", "A constant's value never changes no matter what the variable is set to."] },
      sideQuestB: { title: "Distributing Terms", blurb: "Multiplying a number across everything inside parentheses is called distributing.", points: ["The sign outside the parentheses matters — distributing a negative flips the sign of every term inside.", "Distributing before combining like terms is often the key step that unlocks a stuck equation."] },
      u3_intro: { title: "Inequalities", blurb: "An inequality like x > 5 describes a whole range of possible values, not just one.", points: ["The four inequality symbols (<, >, ≤, ≥) each describe a different boundary and whether it counts as a solution.", "An inequality can have infinitely many correct solutions, unlike an equation which usually has just one."] },
      u3_branchA: { title: "Graphing on a Number Line", blurb: "A number line makes it easy to see every value that satisfies an inequality.", points: ["An open circle means the boundary value itself isn't included; a filled circle means it is.", "The arrow on the number line shows every value in that direction is also a solution."] },
      u3_branchB: { title: "Combining Like Terms with Inequalities", blurb: "The same simplifying skills from expressions apply directly to solving inequalities.", points: ["Simplifying both sides of an inequality works exactly the same way as it does for an equation.", "The inequality symbol itself stays pointed the same direction through every simplifying step."] },
      u3_branchC: { title: "Solving Inequalities with Multiplication", blurb: "Multiplying or dividing an inequality by a negative number flips the direction of the inequality sign.", points: ["This flip only happens when multiplying or dividing by a negative — adding or subtracting a negative never flips it.", "Forgetting to flip the sign is the single most common mistake when solving inequalities."] },
      u3_merge: { title: "Two-Variable Expressions", blurb: "Expressions with two letters, like 2x + 3y, describe a relationship between two unknown values.", points: ["Swapping in different values for x changes what y comes out to be — the two variables are linked.", "These expressions are the building blocks behind graphing lines and equations of two variables later on."] },
      u3_hub2: { title: "Inequalities with Two Variables", blurb: "A two-variable inequality describes an entire region of solutions, not just a line.", points: ["The boundary line is drawn solid for ≤ or ≥, and dashed for strict < or >.", "Shading shows every point that makes the inequality true, not just the points sitting on the line itself."] },
      u3_dead1: { title: "Absolute Value Basics", blurb: "Absolute value measures distance from zero, so it's always zero or positive.", points: ["Both -5 and 5 have an absolute value of 5, since both sit exactly 5 units away from zero.", "Absolute value equations like |x| = 5 usually have two separate solutions, not just one."] },
      u3_dead2: { title: "Algebra Word Problem Strategies", blurb: "Underlining the unknown and translating each phrase into symbols turns any word problem into an equation.", points: ["Reading the problem twice before writing anything down helps you spot what's actually being asked.", "Checking whether your final answer makes sense in the real-world context catches translation mistakes early."] },
      review: { title: "Algebra in the Real World", blurb: "From budgeting to building, algebra shows up anywhere unknown quantities need to be worked out.", points: ["A phone plan's total cost, like $20 plus $0.10 per text, is a linear expression in disguise.", "Engineers and architects use algebra constantly to work out unknown measurements before anything gets built."] }
    }
  },
  {
    id: "number-geometry-foundations",
    title: "Number & Geometry Foundations",
    type: "Maths",
    yeargroups: "3-6",
    description: "Build number sense and shape sense side by side, from place value to fractions.",
    medalNames: { test1: "Number Ninja", test2: "Shape Scholar", test3: "Fraction Finder" },
    specialTitles: { test1: "Number Sense Check", test2: "Shapes & Measurement Check", test3: "Fractions Check" },
    projects: {
      project1: {
        title: "Design a Playground",
        brief: "Sketch a playground on grid paper and calculate the perimeter of each shape you use.",
        checklist: ["Sketch at least 3 shapes", "Label every side length", "Calculate each perimeter"]
      },
      project2: {
        title: "Fraction Pizza Menu",
        brief: "Design a pizza menu where each pizza is divided into different fractions of toppings.",
        checklist: ["Draw 3 pizzas", "Divide each into fractions", "Label each fraction"]
      }
    },
    finalTitle: "Number & Geometry Foundations Final Exam",
    topics: {
      u1_intro: { title: "Place Value Refresher", blurb: "Every digit in a number has a value based on its position, like tens or hundreds.", points: ["Moving one place to the left multiplies a digit's value by ten.", "Zero acts as a placeholder, keeping every other digit in its correct position."] },
      u1_branchA: { title: "Addition & Subtraction Strategies", blurb: "Breaking numbers apart can make addition and subtraction much faster in your head.", points: ["Rounding one number to a friendly value first, then adjusting, often beats counting step by step.", "The same strategy works for both operations: split a number into tens and ones, then combine each part."] },
      u1_branchB: { title: "Multiplication Arrays", blurb: "Arranging objects into rows and columns shows exactly what multiplication means.", points: ["The same array read by rows or by columns gives two ways to write the same multiplication fact.", "An array makes it visually obvious why 3×4 and 4×3 give the same total."] },
      u1_branchC: { title: "Introducing Division", blurb: "Division splits a total into equal groups, the inverse operation of multiplication.", points: ["If a total can't be split into equal groups exactly, whatever is left over is called the remainder.", "Division answers either 'how many groups' or 'how many in each group', depending on how it's set up."] },
      u1_merge: { title: "Mixed Operations Practice", blurb: "Addition, subtraction, and multiplication can all show up together in one problem.", points: ["Working left to right through each operation as it appears keeps a mixed problem manageable.", "Estimating the answer first helps you catch a mistake if your final answer looks way off."] },
      u1_hub2: { title: "Multiplication & Division Together", blurb: "Multiplication and division are inverse operations that can check each other's answers.", points: ["If 6×7=42, then dividing 42 by either 6 or 7 gets you straight back to the other number.", "Checking a division answer by multiplying it back out is a fast way to confirm you're correct."] },
      bonus1: { title: "Number Patterns", blurb: "Spotting the rule behind a sequence of numbers helps you predict what comes next.", points: ["Some patterns grow by a constant difference each time, while others multiply by the same amount each time.", "Writing down the difference between each pair of numbers is often the fastest way to spot the rule."] },
      bonus2: { title: "Skip Counting Tricks", blurb: "Skip counting by 2s, 5s, or 10s is a fast shortcut hiding inside multiplication.", points: ["Skip counting by 5s always lands on a number ending in 0 or 5.", "Once skip counting feels automatic, the matching multiplication facts become much easier to recall."] },
      u2_intro: { title: "2D Shapes & Their Properties", blurb: "Shapes can be sorted by their number of sides, corners, and angles.", points: ["A shape's number of sides always matches its number of corners.", "Regular shapes have all sides and all angles equal; irregular shapes don't."] },
      u2_branchA: { title: "Perimeter Basics", blurb: "Adding up every side of a shape gives you its perimeter.", points: ["Opposite sides of a rectangle are equal, so you only need to measure two sides to find its perimeter.", "Perimeter is always measured in a single unit of length, like centimetres, not square units."] },
      u2_branchB: { title: "Introducing Area", blurb: "Counting how many unit squares fit inside a shape gives you its area.", points: ["Area is always measured in square units, since it's counting how many unit squares fit inside.", "Two shapes can look very different but still cover the exact same area."] },
      u2_branchC: { title: "Area of Rectangles", blurb: "A rectangle's area is found simply by multiplying its length by its width.", points: ["This shortcut works because multiplying length by width is really just counting rows of unit squares.", "A square is just a special rectangle where the length and width happen to be equal."] },
      u2_merge: { title: "Perimeter vs. Area", blurb: "Two shapes can share the same perimeter but have very different areas, or the other way around.", points: ["A long thin rectangle can have a large perimeter but a small area compared to a square shape.", "Fencing a garden is a perimeter problem, while carpeting a floor is an area problem."] },
      u2_hub2: { title: "Perimeter and Area of Rectangles", blurb: "Rectangles are the easiest shape to practice both perimeter and area on at once.", points: ["Practicing both side-by-side on the same rectangle makes the difference between the two much clearer.", "A common mistake is mixing up the two formulas, since they use the exact same measurements."] },
      sideQuestA: { title: "Symmetry in Shapes", blurb: "A shape has symmetry if it can be folded or mirrored into two matching halves.", points: ["A shape can have more than one line of symmetry, like a square which has four.", "Some shapes, like a scalene triangle, have no lines of symmetry at all."] },
      sideQuestB: { title: "Tiling Patterns", blurb: "Some shapes, like squares and hexagons, can tile a floor perfectly with no gaps.", points: ["A shape tiles perfectly only if its angles divide evenly into 360 degrees where its corners meet.", "Regular pentagons cannot tile a floor alone, which is why they're rarely seen in tile patterns."] },
      u3_intro: { title: "Fractions of Shapes", blurb: "Shapes can be split into equal parts to show fractions like halves and quarters.", points: ["The denominator tells you how many equal parts the whole shape is split into.", "Every part of a fraction shape must be exactly equal in size, not just equal in number."] },
      u3_branchA: { title: "Comparing Fractions", blurb: "Fractions with the same-size pieces can be compared just by looking at their numerators.", points: ["This shortcut only works when the denominators are the same — otherwise the pieces aren't the same size.", "A fraction with a bigger denominator but the same numerator actually represents a smaller amount."] },
      u3_branchB: { title: "Fractions on a Number Line", blurb: "Placing fractions on a number line shows exactly how they relate to whole numbers.", points: ["A fraction's position on the number line shows exactly how close it is to 0 or to 1.", "Equivalent fractions, like 1/2 and 2/4, always land on the exact same point on the line."] },
      u3_branchC: { title: "Equivalent Fractions", blurb: "Multiplying or dividing the top and bottom of a fraction by the same number keeps its value equal.", points: ["Multiplying top and bottom by the same number never changes what portion of the whole the fraction represents.", "Simplifying a fraction is just this same idea used in reverse, dividing instead of multiplying."] },
      u3_merge: { title: "Adding Simple Fractions", blurb: "Fractions with the same denominator can be added by just adding their numerators.", points: ["The denominator never changes when adding fractions with the same denominator — only the numerators combine.", "If the numerators add up to more than the denominator, the answer converts into a mixed number."] },
      u3_hub2: { title: "Simplifying Fractions", blurb: "Equivalent fractions let you shrink a fraction down to its simplest form.", points: ["A fraction is fully simplified when its numerator and denominator share no common factor besides 1.", "Simplifying makes it much easier to compare or add fractions later on."] },
      u3_dead1: { title: "Fractions as Decimals", blurb: "Dividing a fraction's numerator by its denominator converts it directly into a decimal.", points: ["A fraction like 1/4 converts to exactly 0.25 because 1 divided by 4 equals 0.25.", "Some fractions, like 1/3, produce a decimal that repeats forever rather than ending neatly."] },
      u3_dead2: { title: "Rounding Numbers", blurb: "Rounding replaces a number with a simpler, nearby value based on a chosen place value.", points: ["If the digit after the rounding place is 5 or more, you round up; otherwise you round down.", "Rounding to a bigger place value, like the nearest hundred, changes the number by more than rounding to the nearest ten."] },
      review: { title: "Number & Shape All Together", blurb: "Number sense and geometry often combine, like measuring the area of a shape using multiplication.", points: ["Calculating how many tiles are needed for a floor combines multiplication with an area formula.", "Recipes that need scaling up or down mix fraction skills with basic arithmetic."] }
    }
  },
  {
    id: "geometry-and-measurement",
    title: "Geometry & Measurement",
    type: "Maths",
    yeargroups: "9-11",
    description: "Angles, triangles, circles, and volume — the geometry that underpins design and engineering.",
    medalNames: { test1: "Angle Ace", test2: "Triangle Tactician", test3: "Measurement Master" },
    specialTitles: { test1: "Angles Check", test2: "Triangles Check", test3: "Circles & Volume Check" },
    projects: {
      project1: {
        title: "Triangle Scavenger Hunt",
        brief: "Find and photograph or sketch five real triangles, then classify each one.",
        checklist: ["Find 5 triangles", "Classify each type", "Measure or estimate one angle"]
      },
      project2: {
        title: "Design a Water Tank",
        brief: "Design a cylindrical water tank and calculate its volume and surface area.",
        checklist: ["Choose dimensions", "Calculate volume", "Calculate surface area"]
      }
    },
    finalTitle: "Geometry & Measurement Final Exam",
    topics: {
      u1_intro: { title: "Angles & Their Types", blurb: "Angles are measured in degrees and classified as acute, right, obtuse, or reflex.", points: ["An angle of exactly 90 degrees is called a right angle and is often marked with a small square.", "A reflex angle is always greater than 180 degrees, making it the largest of the four categories."] },
      u1_branchA: { title: "Angles on a Straight Line", blurb: "Angles on a straight line always add up to exactly 180 degrees.", points: ["This means two angles on a straight line are always supplementary to each other.", "Knowing one angle on a straight line instantly tells you the other by subtracting from 180."] },
      u1_branchB: { title: "Angles Around a Point", blurb: "Angles that meet at a single point always add up to exactly 360 degrees.", points: ["This rule applies no matter how many angles meet at that point, as long as they go all the way around.", "It's the full-circle version of the straight-line rule, just doubled to 360 degrees."] },
      u1_branchC: { title: "Vertically Opposite Angles", blurb: "Two lines crossing always create a pair of equal angles directly opposite each other.", points: ["The two pairs of vertically opposite angles created are always equal to their own opposite partner.", "Adjacent angles in the same crossing are supplementary, adding up to 180 degrees."] },
      u1_merge: { title: "Angle Rules in Practice", blurb: "Combining angle rules lets you find a missing angle without measuring it directly.", points: ["Most missing-angle problems are solved by combining two or more of these rules in sequence.", "Labelling every known angle on the diagram first makes it much easier to spot which rule applies next."] },
      u1_hub2: { title: "Angle Rules with Crossing Lines", blurb: "Vertically opposite angles combine with straight-line and point rules to solve almost any angle diagram.", points: ["When a line crosses two parallel lines, several equal and supplementary angle pairs are created at once.", "Spotting parallel lines in a diagram is usually the first clue that vertically opposite rules will help."] },
      bonus1: { title: "Angles in Everyday Objects", blurb: "Buildings, bridges, and furniture all rely on carefully chosen angles.", points: ["A roof's pitch is really just an angle chosen to shed rain and snow effectively.", "Chair and table legs are often angled slightly outward for extra stability."] },
      bonus2: { title: "Angles in Nature", blurb: "Honeycombs, snowflakes, and flower petals all form strikingly precise natural angles.", points: ["Honeycomb cells meet at 120-degree angles, the most efficient shape for packing without wasted space.", "Many flowers arrange their petals using the golden angle, about 137.5 degrees, to maximise sunlight exposure."] },
      u2_intro: { title: "Triangles & Their Properties", blurb: "Every triangle's three interior angles always add up to 180 degrees.", points: ["This is true no matter how the triangle is stretched, flipped, or resized.", "Knowing any two angles of a triangle instantly gives you the third by subtracting from 180."] },
      u2_branchA: { title: "Types of Triangles", blurb: "Triangles can be classified by their side lengths or by their angles.", points: ["A scalene triangle has three different side lengths and three different angles.", "An isosceles triangle's two equal sides always sit opposite its two equal angles."] },
      u2_branchB: { title: "The Pythagorean Theorem", blurb: "In a right triangle, the square of the hypotenuse equals the sum of the squares of the other two sides.", points: ["This only works for right triangles — it doesn't apply to any other triangle shape.", "The hypotenuse is always the longest side, since it's opposite the right angle."] },
      u2_branchC: { title: "Angle Sum in Polygons", blurb: "Any polygon's interior angles can be found by splitting it into triangles.", points: ["Each triangle inside a polygon contributes exactly 180 degrees to the total angle sum.", "A polygon with n sides can always be split into exactly (n − 2) triangles."] },
      u2_merge: { title: "Solving Triangle Problems", blurb: "Angle rules and the Pythagorean theorem together can solve almost any triangle problem.", points: ["Missing side problems usually call for Pythagoras, while missing angle problems call for the angle sum rule.", "Sketching the triangle and labelling every known value first prevents mixing up which rule to use."] },
      u2_hub2: { title: "Triangles Inside Polygons", blurb: "Every polygon's angle rules are really just triangle rules applied repeatedly.", points: ["This is exactly why the angle sum formula for any polygon is built from 180 degrees times the number of triangles.", "Even irregular polygons follow this same triangle-splitting logic."] },
      sideQuestA: { title: "Congruent Shapes", blurb: "Two shapes are congruent if they're exactly the same size and shape, just possibly rotated or flipped.", points: ["Congruent shapes have exactly matching side lengths and exactly matching angles, in the same order.", "A shape and its mirror image are still congruent, even though they can't be slid on top of each other without flipping."] },
      sideQuestB: { title: "Similar Shapes & Scale", blurb: "Similar shapes have the same proportions but different overall sizes.", points: ["All corresponding angles in similar shapes are exactly equal, even though the side lengths differ.", "The ratio between any pair of corresponding sides is the same throughout the whole shape."] },
      u3_intro: { title: "Circles: Radius, Diameter & Circumference", blurb: "A circle's circumference is always a bit more than three times its diameter.", points: ["The diameter is always exactly twice the length of the radius.", "That 'bit more than three times' ratio is the constant pi, roughly 3.14159."] },
      u3_branchA: { title: "Area of a Circle", blurb: "A circle's area is found using its radius and the constant pi.", points: ["The formula uses the radius squared, not the diameter, so halving the diameter first is a common step.", "Doubling a circle's radius actually quadruples its area, since the radius is squared."] },
      u3_branchB: { title: "Volume of Simple 3D Shapes", blurb: "Volume measures how much space a 3D shape takes up, built from its base area and height.", points: ["For a prism, multiplying the base area by the height gives the volume directly.", "Volume is always measured in cubic units, since it's counting three-dimensional space."] },
      u3_branchC: { title: "Composite Shapes", blurb: "A composite shape's area is found by splitting it into simpler shapes and adding their areas together.", points: ["Sometimes it's easier to surround the composite shape with a simple one and subtract the extra piece instead.", "Every split must use lines that don't overlap, so no area is counted twice."] },
      u3_merge: { title: "Surface Area Basics", blurb: "Surface area adds up the area of every face of a 3D shape.", points: ["A cube's surface area is just six identical squares added together.", "Unfolding a 3D shape into its net makes every face visible and easy to add up."] },
      u3_hub2: { title: "Area of Composite 3D Shapes", blurb: "Surface area and composite shapes together let you measure almost any real object.", points: ["Complex real objects, like a house shape, are usually surface areas of several simple solids combined.", "Missing a hidden face is the most common mistake when calculating composite surface area."] },
      u3_dead1: { title: "Nets of 3D Shapes", blurb: "A net is a flat shape that folds up into a 3D solid.", points: ["The same 3D solid can often be represented by more than one valid net layout.", "Counting the faces in a net before folding is a quick way to check it matches the intended solid."] },
      u3_dead2: { title: "Scale Drawings", blurb: "A scale drawing shrinks or enlarges a real object by a consistent ratio.", points: ["A scale of 1:100 means every centimetre on the drawing represents 100 centimetres in real life.", "Map distances are scale drawings in disguise, letting you estimate real-world distances with a ruler."] },
      review: { title: "Geometry in Architecture", blurb: "Architects rely on angles, triangles, and volume calculations every single day.", points: ["Triangles are used in bridge trusses because their fixed angles make them naturally rigid.", "Calculating a dome's surface area and volume is essential before deciding how much material to order."] }
    }
  },
  {
    id: "statistics-and-probability-basics",
    title: "Statistics & Probability Basics",
    type: "Maths",
    yeargroups: "10-12",
    description: "Learn to describe data, read charts, and calculate probability.",
    medalNames: { test1: "Data Detective", test2: "Chart Champion", test3: "Probability Pro" },
    specialTitles: { test1: "Averages Check", test2: "Charts & Graphs Check", test3: "Probability Check" },
    projects: {
      project1: {
        title: "Class Survey Project",
        brief: "Run a short survey of your own, then present the results using at least two different chart types.",
        checklist: ["Collect at least 10 responses", "Create 2 chart types", "Write one conclusion"]
      },
      project2: {
        title: "Design a Fair Game",
        brief: "Design a simple dice or card game and calculate the probability of winning.",
        checklist: ["Describe the game rules", "Calculate the probability of winning", "Explain if it's fair"]
      }
    },
    finalTitle: "Statistics & Probability Basics Final Exam",
    topics: {
      u1_intro: { title: "What is Data?", blurb: "Data is just organized information that can be collected, measured, and compared.", points: ["Data can be numerical, like heights, or categorical, like favourite colours.", "Collecting data consistently, the same way every time, is what makes it fair to compare."] },
      u1_branchA: { title: "Mean, Median & Mode", blurb: "These three averages each describe the 'middle' of a data set in a different way.", points: ["The mean is the sum of all values divided by how many there are.", "The mode is simply whichever value appears most often, and a data set can have more than one."] },
      u1_branchB: { title: "Range & Spread", blurb: "The range shows how spread out a data set is, from its smallest to largest value.", points: ["Range is calculated by subtracting the smallest value from the largest.", "A small range suggests the data is tightly clustered, while a large range suggests it's spread out."] },
      u1_branchC: { title: "Outliers", blurb: "An outlier is a value far away from the rest of the data that can distort an average.", points: ["An outlier can come from a genuine unusual event or from a simple measurement mistake.", "Even a single outlier can shift the mean noticeably, while barely affecting the median."] },
      u1_merge: { title: "Choosing the Right Average", blurb: "Outliers can make the mean misleading, which is when median or mode tell a clearer story.", points: ["The median is just the middle value once the data is sorted, so extreme values don't affect it as much.", "House prices are a classic example where the median gives a fairer typical value than the mean."] },
      u1_hub2: { title: "Handling Outliers", blurb: "Recognising an outlier is often the deciding factor in which average to trust.", points: ["Sometimes an outlier is removed before analysis, but only if there's good reason to believe it's an error.", "Reporting both the mean and median together can reveal whether outliers are distorting the picture."] },
      bonus1: { title: "Sneaky Statistics", blurb: "The same data can be presented in misleading ways depending on which average is highlighted.", points: ["Choosing the mean instead of the median, or vice versa, can make the exact same data look better or worse.", "A misleading graph often starts its axis at a number other than zero to exaggerate small differences."] },
      bonus2: { title: "Statistics in the News", blurb: "News headlines often quote a statistic without the context needed to judge if it's meaningful.", points: ["A percentage increase can sound dramatic even when the actual numbers involved are tiny.", "Knowing the sample size behind a statistic is essential for judging how much to trust it."] },
      u2_intro: { title: "Reading Charts & Graphs", blurb: "Bar charts, pie charts, and line graphs each highlight data in a different way.", points: ["Line graphs are best for showing how a value changes over time.", "Bar charts are best for comparing separate categories against each other."] },
      u2_branchA: { title: "Bar Charts vs. Histograms", blurb: "A histogram groups continuous data into ranges, unlike a bar chart's separate categories.", points: ["Because histogram bars represent ranges, there are no gaps between them, unlike a bar chart.", "Changing the width of the ranges in a histogram can noticeably change its overall shape."] },
      u2_branchB: { title: "Scatter Graphs & Correlation", blurb: "A scatter graph reveals whether two variables tend to rise and fall together.", points: ["A tightly clustered upward line of points suggests a strong positive correlation.", "Correlation between two variables doesn't prove that one actually causes the other."] },
      u2_branchC: { title: "Pie Charts & Proportions", blurb: "A pie chart shows how a whole is divided into proportional slices.", points: ["All the slices of a pie chart must add up to exactly 100 percent of the whole.", "Pie charts work best with a small number of categories — too many slices become hard to read."] },
      u2_merge: { title: "Picking the Right Chart", blurb: "The best chart depends entirely on what kind of data you're trying to show.", points: ["Trends over time call for a line graph, while parts of a whole call for a pie chart.", "Choosing the wrong chart type can make even accurate data look confusing or misleading."] },
      u2_hub2: { title: "Comparing Chart Types", blurb: "Bar charts, pie charts, and scatter graphs each answer a different kind of question about data.", points: ["The same data set can often be shown correctly in more than one chart type, just emphasising different things.", "Practising with the same data across chart types builds a feel for each one's strengths."] },
      sideQuestA: { title: "Sampling", blurb: "A sample is a smaller group used to estimate something about a much larger population.", points: ["A bigger sample size usually gives a more reliable estimate of the whole population.", "A random sample, where everyone has an equal chance of being picked, helps avoid unfair bias."] },
      sideQuestB: { title: "Bias in Data Collection", blurb: "How and who you ask can quietly skew a survey's results without anyone intending it.", points: ["Asking a leading question, like 'don't you agree that...', can quietly push people toward a certain answer.", "Surveying only one place or group rarely reflects a wider population fairly."] },
      u3_intro: { title: "What is Probability?", blurb: "Probability measures how likely an event is, from impossible to certain.", points: ["Probability is always a number between 0, impossible, and 1, certain.", "An event with a probability of 0.5 is exactly as likely to happen as not."] },
      u3_branchA: { title: "Calculating Simple Probability", blurb: "Probability is calculated as favourable outcomes divided by total possible outcomes.", points: ["Rolling a specific number on a six-sided die has a probability of 1 out of 6.", "All the possible outcomes together must always add up to a total probability of 1."] },
      u3_branchB: { title: "Probability of Combined Events", blurb: "The probability of two independent events both happening is found by multiplying their individual probabilities.", points: ["This only works when the two events don't affect each other at all.", "Flipping two coins and getting heads both times has a probability of 1/2 times 1/2, or 1/4."] },
      u3_branchC: { title: "Probability as Fractions, Decimals & Percentages", blurb: "The same probability can be written as a fraction, a decimal, or a percentage.", points: ["A probability of 1/4 is exactly the same as 0.25 or 25 percent.", "Percentages are often the easiest form for comparing probabilities at a glance."] },
      u3_merge: { title: "Probability in Games", blurb: "Dice, cards, and coin flips are classic real-world examples of probability in action.", points: ["Knowing the true odds behind a game is what separates a fair game from an unfair one.", "Casino games are deliberately designed so the odds favour the house slightly over many plays."] },
      u3_hub2: { title: "Expressing Probability Clearly", blurb: "Games and real predictions often require converting probability between these three forms.", points: ["Being able to switch between all three forms fluently makes it easier to compare different games or predictions.", "News reports and weather forecasts often mix these forms, so converting between them fluently is a genuinely useful skill."] },
      u3_dead1: { title: "Expected Value", blurb: "Expected value estimates the average outcome if a probability event were repeated many times.", points: ["Expected value multiplies each possible outcome by its probability, then adds all of those together.", "A game with a negative expected value will, on average, lose you money the more times you play it."] },
      u3_dead2: { title: "Independent vs. Dependent Events", blurb: "In a dependent event, the outcome of one event changes the probability of the next.", points: ["Drawing a card without replacing it makes the next draw a dependent event, since the deck has changed.", "Rolling a die twice in a row is a classic example of two independent events."] },
      review: { title: "Statistics & Probability Together", blurb: "Real data analysis often combines describing what happened with predicting what might happen next.", points: ["Weather forecasts combine historical data analysis with a probability of rain.", "Sports commentators constantly blend statistics, like batting averages, with probability, like win chances."] }
    }
  },
  {
    id: "forces-and-energy",
    title: "Forces & Energy",
    type: "Science",
    yeargroups: "7-9",
    description: "Explore pushes, pulls, motion, and the many forms energy can take and move between.",
    medalNames: { test1: "Force Finder", test2: "Motion Mechanic", test3: "Energy Explorer" },
    specialTitles: { test1: "Forces Check", test2: "Motion & Friction Check", test3: "Energy Check" },
    projects: {
      project1: {
        title: "Design a Parachute",
        brief: "Design and describe a parachute, explaining how air resistance would slow its fall.",
        checklist: ["Sketch the design", "Explain the air resistance", "Predict what would make it fall slower"]
      },
      project2: {
        title: "Design a Roller Coaster",
        brief: "Plan a roller coaster track and explain the energy transfers at each section.",
        checklist: ["Sketch the track", "Label 3 energy transfers", "Explain the fastest point"]
      }
    },
    finalTitle: "Forces & Energy Final Exam",
    topics: {
      u1_intro: { title: "What is a Force?", blurb: "A force is simply a push or a pull acting on an object.", points: ["Forces are measured in a unit called the newton.", "A force always has both a size and a direction, which is why it's called a vector."] },
      u1_branchA: { title: "Balanced & Unbalanced Forces", blurb: "An object only changes its motion when the forces on it are unbalanced.", points: ["Balanced forces cancel each other out perfectly, leaving the object's motion completely unchanged.", "Even a stationary object can have forces acting on it, as long as they're balanced."] },
      u1_branchB: { title: "Gravity & Weight", blurb: "Gravity pulls objects toward the Earth, and that pull is what we feel as weight.", points: ["Weight is measured in newtons, since it's actually a force, not a mass.", "The strength of gravity's pull depends on the mass of the planet or body doing the pulling."] },
      u1_branchC: { title: "Mass vs. Weight", blurb: "Mass stays constant everywhere, but weight changes depending on the strength of gravity around it.", points: ["An astronaut's mass stays exactly the same on the Moon, but their weight drops dramatically.", "Mass is measured in kilograms, while weight is measured in newtons."] },
      u1_merge: { title: "Newton's First Law", blurb: "An object keeps doing what it's doing unless a force makes it change.", points: ["This law is often called the law of inertia, since objects resist changes to their motion.", "A ball rolling on a frictionless surface would keep rolling forever under this law."] },
      u1_hub2: { title: "Gravity, Mass & Motion", blurb: "Newton's first law only makes full sense once mass and weight are clearly told apart.", points: ["An object's inertia depends directly on its mass — heavier objects resist changes in motion more.", "Newton's first law explains why passengers lurch forward when a car suddenly stops."] },
      bonus1: { title: "Forces in Sports", blurb: "Every kick, throw, and jump in sport is really just forces acting on a body.", points: ["A sprinter accelerates by pushing backward against the ground, and the ground pushes them forward in response.", "A goalkeeper diving to save a ball is fighting against their own body's inertia."] },
      bonus2: { title: "Forces in Space", blurb: "Without air resistance or much gravity, objects in space move in ways that feel completely unfamiliar.", points: ["Astronauts float because they're constantly falling around Earth together with their spacecraft.", "Without air resistance, a thrown object in space would travel in a straight line forever unless acted on by another force."] },
      u2_intro: { title: "Newton's Second Law", blurb: "A bigger force or a smaller mass both make an object accelerate faster.", points: ["This relationship is written as the famous equation force equals mass times acceleration.", "Pushing the same object with double the force produces exactly double the acceleration."] },
      u2_branchA: { title: "Friction", blurb: "Friction is a force that resists motion between two surfaces in contact.", points: ["Rougher surfaces generally create more friction than smoother ones.", "Friction always acts in the direction opposite to an object's motion."] },
      u2_branchB: { title: "Air Resistance", blurb: "Air resistance is a type of friction that pushes back against objects moving through air.", points: ["A wider or less streamlined shape experiences more air resistance than a narrow, sleek one.", "Air resistance increases as an object moves faster through the air."] },
      u2_branchC: { title: "Terminal Velocity", blurb: "Terminal velocity is reached when air resistance grows strong enough to balance gravity's pull.", points: ["Once terminal velocity is reached, a falling object stops accelerating and falls at a constant speed.", "A skydiver reaches a lower terminal velocity once their parachute opens, due to greatly increased air resistance."] },
      u2_merge: { title: "Forces in Motion", blurb: "Friction and air resistance both explain why moving objects naturally slow down.", points: ["Without friction or air resistance, a moving object would never naturally slow down on its own.", "Both forces convert an object's kinetic energy into heat as they act against its motion."] },
      u2_hub2: { title: "Falling Objects & Resistance", blurb: "Friction, air resistance, and terminal velocity together explain how falling objects actually behave.", points: ["A feather and a hammer fall at the same rate in a vacuum, since air resistance is what usually makes them different.", "Terminal velocity is reached faster by objects with more surface area relative to their weight."] },
      sideQuestA: { title: "Simple Machines", blurb: "Levers, pulleys, and ramps all make a task easier by changing the force needed to do it.", points: ["A lever reduces the force needed by increasing the distance over which that force is applied.", "A pulley changes the direction of a force, making it easier to lift heavy objects."] },
      sideQuestB: { title: "Machines in Daily Life", blurb: "Scissors, doorknobs, and bottle openers are all simple machines in disguise.", points: ["A doorknob is a simple wheel-and-axle machine that multiplies your turning force.", "A pair of scissors combines two levers with a wedge-shaped cutting edge."] },
      u3_intro: { title: "What is Energy?", blurb: "Energy is the ability to make things move, heat up, light up, or change.", points: ["Energy is measured in a unit called the joule.", "Energy can never be created or destroyed, only changed from one form into another."] },
      u3_branchA: { title: "Kinetic & Potential Energy", blurb: "Kinetic energy comes from motion, while potential energy comes from position or state.", points: ["A faster-moving object has more kinetic energy than a slower one of the same mass.", "A stretched rubber band stores elastic potential energy until it's released."] },
      u3_branchB: { title: "Energy Transfers", blurb: "Energy doesn't disappear — it transfers from one form or object to another.", points: ["A light bulb transfers electrical energy into both light energy and unwanted heat energy.", "No energy transfer is ever perfectly efficient — some energy always escapes as heat."] },
      u3_branchC: { title: "Gravitational Potential Energy", blurb: "An object's gravitational potential energy depends on both its height and its mass.", points: ["Doubling an object's height above the ground doubles its gravitational potential energy.", "A heavier object at the same height stores more gravitational potential energy than a lighter one."] },
      u3_merge: { title: "Conservation of Energy", blurb: "The total amount of energy in a closed system always stays the same.", points: ["This is why energy problems can be solved by tracking where it goes rather than where it's lost.", "A swinging pendulum constantly converts energy between kinetic and potential, but the total never changes."] },
      u3_hub2: { title: "Energy of a Falling Object", blurb: "As an object falls, its gravitational potential energy steadily converts into kinetic energy.", points: ["At the very top of a fall, an object's energy is almost entirely gravitational potential energy.", "Right before hitting the ground, nearly all of that potential energy has become kinetic energy."] },
      u3_dead1: { title: "Renewable vs. Non-Renewable Energy", blurb: "Renewable energy sources naturally replenish, while non-renewable ones take millions of years to form.", points: ["Solar, wind, and hydro power are all classic examples of renewable energy sources.", "Coal, oil, and natural gas are non-renewable because they took millions of years to form."] },
      u3_dead2: { title: "Energy Efficiency", blurb: "An efficient device wastes less energy as heat and converts more of it into useful work.", points: ["An incandescent bulb wastes most of its energy as heat, while an LED wastes far less.", "Improving energy efficiency reduces both cost and environmental impact for the same amount of useful work."] },
      review: { title: "Forces & Energy Working Together", blurb: "Almost every machine, from bicycles to rockets, relies on forces creating and transferring energy.", points: ["A bicycle converts the rider's muscular energy into kinetic energy through a system of forces and gears.", "A rocket launch relies on a massive force to overcome gravity and convert fuel's stored energy into motion."] }
    }
  },
  {
    id: "cells-and-genetics",
    title: "Cells & Genetics",
    type: "Science",
    yeargroups: "12-13",
    description: "A deeper dive into cell structure, DNA, inheritance, and evolution.",
    medalNames: { test1: "Cell Specialist", test2: "Genetics Ace", test3: "Evolution Expert" },
    specialTitles: { test1: "Cell Biology Check", test2: "Genetics Check", test3: "Evolution Check" },
    projects: {
      project1: {
        title: "Build a Family Tree of Traits",
        brief: "Track a chosen trait through three generations of a fictional family using a Punnett square.",
        checklist: ["Choose a trait and alleles", "Draw 3 generations", "Complete a Punnett square"]
      },
      project2: {
        title: "Design an Adapted Creature",
        brief: "Design a fictional creature adapted to a specific extreme environment, and explain each adaptation.",
        checklist: ["Choose an environment", "Design 3 adaptations", "Explain each adaptation's purpose"]
      }
    },
    finalTitle: "Cells & Genetics Final Exam",
    topics: {
      u1_intro: { title: "Cell Structure Recap", blurb: "Every living cell is built from a set of specialized parts working together.", points: ["The nucleus acts as the cell's control center, holding its genetic instructions.", "Every organelle inside a cell has a specific role that keeps the whole cell functioning."] },
      u1_branchA: { title: "Organelles & Their Jobs", blurb: "Each organelle inside a cell has a specific job, like the mitochondria making energy.", points: ["Ribosomes are the organelles responsible for building proteins from genetic instructions.", "The mitochondria are often called the powerhouse of the cell because they generate most of its energy."] },
      u1_branchB: { title: "Cell Membrane & Transport", blurb: "The cell membrane controls exactly what moves in and out of the cell.", points: ["The membrane is selectively permeable, letting some substances through while blocking others.", "Small molecules like oxygen can pass directly through the membrane, while larger ones need special transport."] },
      u1_branchC: { title: "Diffusion & Osmosis", blurb: "Osmosis is simply the diffusion of water across a membrane from an area of high to low concentration.", points: ["Diffusion always moves particles from an area of high concentration to an area of low concentration.", "Osmosis specifically involves water molecules moving across a partially permeable membrane."] },
      u1_merge: { title: "Comparing Plant & Animal Cells", blurb: "Plant cells have extra structures, like a cell wall and chloroplasts, that animal cells lack.", points: ["Chloroplasts allow plant cells to photosynthesize, a process animal cells cannot perform.", "A rigid cell wall gives plant cells a fixed shape that animal cells lack entirely."] },
      u1_hub2: { title: "Transport Across the Membrane", blurb: "Diffusion and osmosis together explain how substances constantly move in and out of a cell.", points: ["Both diffusion and osmosis happen passively, without the cell needing to use any energy.", "A cell in salty water can lose water through osmosis and shrink as a result."] },
      bonus1: { title: "Cells Under the Microscope", blurb: "A microscope reveals structures inside cells far too small to see with the naked eye.", points: ["A light microscope can magnify a cell hundreds of times, while an electron microscope can magnify it thousands of times.", "Staining a cell sample often makes its internal structures far easier to see clearly."] },
      bonus2: { title: "Cell Discovery History", blurb: "Cells were only discovered once microscopes became powerful enough to reveal them.", points: ["Robert Hooke first coined the word 'cell' after examining cork under an early microscope.", "It took nearly two centuries after their discovery for scientists to establish that all living things are made of cells."] },
      u2_intro: { title: "DNA & Chromosomes", blurb: "DNA is coiled up tightly into structures called chromosomes inside the nucleus.", points: ["Humans typically have 46 chromosomes, arranged in 23 pairs.", "DNA's double helix shape allows it to be copied accurately whenever a cell divides."] },
      u2_branchA: { title: "Genes & Alleles", blurb: "A gene can come in different versions, called alleles, that produce different traits.", points: ["You inherit one allele for each gene from each parent, giving you two copies total.", "A single gene can influence a visible trait like eye colour or blood type."] },
      u2_branchB: { title: "Dominant & Recessive Traits", blurb: "A dominant allele can mask a recessive one when both are present.", points: ["A recessive trait only appears in an organism when it inherits two copies of the recessive allele.", "Just one dominant allele is enough for a dominant trait to be expressed."] },
      u2_branchC: { title: "Genotype vs. Phenotype", blurb: "A genotype is the genetic code itself, while a phenotype is the physical trait it produces.", points: ["Two organisms can have different genotypes but still show the exact same phenotype.", "Environment can sometimes influence how a genotype is expressed as a phenotype."] },
      u2_merge: { title: "Punnett Squares", blurb: "A Punnett square predicts the possible genetic combinations of offspring.", points: ["Each box in a Punnett square represents one possible combination of the parents' alleles.", "A Punnett square shows probabilities, not guaranteed outcomes, for any single offspring."] },
      u2_hub2: { title: "Predicting Phenotypes", blurb: "Punnett squares predict genotypes, but it's the genotype-phenotype link that tells you what you'll actually see.", points: ["Knowing an organism's genotype from a Punnett square is only useful once you know which alleles are dominant.", "This is why genetics problems usually require both a Punnett square and a dominance rule together."] },
      sideQuestA: { title: "Genetic Disorders", blurb: "Some inherited conditions are caused directly by a single changed gene.", points: ["Some genetic disorders are caused by an error in just a single gene out of thousands.", "Genetic counselling can help families understand the risk of passing on an inherited condition."] },
      sideQuestB: { title: "Genetic Testing Today", blurb: "Modern genetic testing can reveal inherited risks long before any symptoms appear.", points: ["Genetic tests can now be performed from just a small saliva or blood sample.", "Testing can reveal a predisposition to a condition without guaranteeing the person will ever develop it."] },
      u3_intro: { title: "Mutations & Variation", blurb: "Small changes in DNA, called mutations, are a source of variation between individuals.", points: ["Most mutations have no noticeable effect at all, while a few can be harmful or occasionally helpful.", "Mutations are the ultimate source of all genetic variation in a population."] },
      u3_branchA: { title: "Natural Selection", blurb: "Traits that help an organism survive are more likely to be passed on to the next generation.", points: ["Natural selection doesn't act on individuals directly — it acts on which traits get passed to the next generation.", "A trait doesn't need to be helpful in every environment, just the one the organism actually lives in."] },
      u3_branchB: { title: "Evidence for Evolution", blurb: "Fossils, DNA, and anatomy all provide evidence for how species change over time.", points: ["Similar bone structures across very different species, like a whale's flipper and a human hand, hint at a shared ancestor.", "DNA comparisons between species can reveal exactly how closely related they are."] },
      u3_branchC: { title: "Selective Breeding", blurb: "Selective breeding is humans deliberately choosing which organisms reproduce, speeding up traits natural selection would take ages to favour.", points: ["Nearly all modern dog breeds were shaped by centuries of humans selectively breeding for specific traits.", "Selective breeding can happen far faster than natural selection because humans choose the traits directly."] },
      u3_merge: { title: "Adaptation in Action", blurb: "Adaptations are traits shaped by natural selection to suit a specific environment.", points: ["A polar bear's thick fur and layer of fat are adaptations suited specifically to a freezing environment.", "An adaptation that helps in one environment can be completely useless, or even harmful, in another."] },
      u3_hub2: { title: "Human-Driven vs. Natural Change", blurb: "Selective breeding and natural selection both change a population, just by very different mechanisms.", points: ["Selective breeding can produce dramatic changes in just a few generations, while natural selection usually takes far longer.", "Both processes work by the same basic principle: passing certain traits on more than others."] },
      u3_dead1: { title: "Extinction", blurb: "A species goes extinct when it can no longer adapt fast enough to survive a changing environment.", points: ["A sudden environmental change, like an asteroid impact, can cause extinction even for well-adapted species.", "Once a species goes extinct, its unique genetic information is gone forever."] },
      u3_dead2: { title: "Biodiversity", blurb: "Biodiversity is the sheer variety of life, and it's what gives ecosystems resilience against change.", points: ["A high level of biodiversity makes an ecosystem more resilient to disease and environmental change.", "Losing even one species from an ecosystem can have ripple effects on many others."] },
      review: { title: "From Cells to Species", blurb: "Everything from inherited traits to entire species changing over time traces back to what happens inside a single cell.", points: ["A single mutation inside one cell can, over generations, eventually shape an entire species.", "Studying cells, genetics, and evolution together reveals how life connects across every possible scale."] }
    }
  },
  {
    id: "chemistry-essentials",
    title: "Chemistry Essentials",
    type: "Science",
    yeargroups: "9-11",
    description: "Atoms, compounds, and chemical reactions — the basics that explain how matter behaves.",
    medalNames: { test1: "Element Explorer", test2: "Compound Chemist", test3: "Reaction Researcher" },
    specialTitles: { test1: "Atoms & Elements Check", test2: "Compounds & Mixtures Check", test3: "Reactions Check" },
    projects: {
      project1: {
        title: "Kitchen Chemistry Investigation",
        brief: "Investigate a safe kitchen mixture and explain how you could separate its parts.",
        checklist: ["Choose a mixture", "Describe a separation method", "Explain why it would work"]
      },
      project2: {
        title: "Acid-Base Investigation",
        brief: "Test several household liquids and classify each as acidic, neutral, or basic.",
        checklist: ["Test 3+ liquids", "Classify each one", "Explain your reasoning"]
      }
    },
    finalTitle: "Chemistry Essentials Final Exam",
    topics: {
      u1_intro: { title: "Atoms & Elements", blurb: "Every substance in the universe is built from atoms of just over 100 different elements.", points: ["An atom is the smallest unit of an element that still keeps that element's properties.", "Every known element is organised and catalogued on the periodic table."] },
      u1_branchA: { title: "The Periodic Table", blurb: "The periodic table arranges elements so similar ones line up in the same columns.", points: ["Elements in the same column, called a group, tend to react in similar ways.", "The table is arranged in order of increasing atomic number, the number of protons in each atom."] },
      u1_branchB: { title: "Protons, Neutrons & Electrons", blurb: "An atom's identity is determined entirely by its number of protons.", points: ["Protons and neutrons live in the atom's nucleus, while electrons orbit around it.", "The number of electrons usually matches the number of protons in a neutral atom."] },
      u1_branchC: { title: "Isotopes", blurb: "Isotopes are atoms of the same element with a different number of neutrons.", points: ["Isotopes of the same element behave almost identically chemically, since chemistry depends on electrons, not neutrons.", "Some isotopes are unstable and radioactive, decaying over time into different elements."] },
      u1_merge: { title: "Reading Element Symbols", blurb: "Every element has a unique one- or two-letter symbol used as shorthand worldwide.", points: ["Some symbols come from Latin names, like Na for sodium, rather than the modern English name.", "The first letter of an element's symbol is always capitalized, and any second letter is always lowercase."] },
      u1_hub2: { title: "Atomic Structure in Detail", blurb: "Isotopes only make sense once you fully understand how protons, neutrons, and electrons define an atom.", points: ["Changing the number of neutrons creates an isotope, but changing the number of protons creates an entirely different element.", "The number of protons alone is what the periodic table's order is actually based on."] },
      bonus1: { title: "Elements in Everyday Life", blurb: "Oxygen, carbon, and iron are elements you rely on every single day without noticing.", points: ["Oxygen makes up roughly 21 percent of the air you breathe.", "Iron is a key ingredient in steel, one of the most widely used materials in construction."] },
      bonus2: { title: "Elements Named After Places", blurb: "Several elements, like Francium and Germanium, are named directly after countries.", points: ["Californium was named after the U.S. state where it was first synthesized.", "Several elements are named after the countries or labs of the scientists who discovered them."] },
      u2_intro: { title: "Compounds & Mixtures", blurb: "A compound is chemically bonded elements, while a mixture is just physically combined substances.", points: ["Water is a compound made of hydrogen and oxygen chemically bonded together in a fixed ratio.", "A mixture, unlike a compound, can be separated back into its original substances by physical means."] },
      u2_branchA: { title: "Chemical Bonds", blurb: "Atoms bond by sharing or transferring electrons to become more stable.", points: ["Atoms bond because having a full outer shell of electrons makes them more chemically stable.", "The type of bond formed depends on how strongly each atom attracts electrons."] },
      u2_branchB: { title: "Chemical Formulas", blurb: "A chemical formula shows exactly which atoms, and how many of each, make up a compound.", points: ["The formula H2O shows that water is made of two hydrogen atoms and one oxygen atom.", "A subscript number in a formula shows exactly how many atoms of that element are present."] },
      u2_branchC: { title: "Ionic vs. Covalent Bonds", blurb: "Ionic bonds transfer electrons between atoms, while covalent bonds share them.", points: ["Ionic bonds typically form between a metal and a non-metal.", "Covalent bonds typically form between two non-metal atoms."] },
      u2_merge: { title: "Separating Mixtures", blurb: "Filtering, evaporating, and distilling are all ways to separate a mixture back into its parts.", points: ["Filtering works by separating a solid from a liquid based on particle size.", "Distilling separates liquids with different boiling points by evaporating and then re-condensing one of them."] },
      u2_hub2: { title: "Bonding and Formulas Together", blurb: "The type of bond an element forms directly determines how its chemical formula is written.", points: ["Ionic compounds are often written showing simple whole-number ratios of their ions.", "Covalent compounds are written showing exactly how many atoms share bonds within a single molecule."] },
      sideQuestA: { title: "States of Matter", blurb: "Solids, liquids, and gases differ mainly in how tightly their particles are packed and how freely they move.", points: ["In a solid, particles vibrate in place but don't move past each other.", "In a gas, particles move freely and spread out to fill their entire container."] },
      sideQuestB: { title: "Changes of State", blurb: "Melting, freezing, and boiling are all changes of state caused by adding or removing heat energy.", points: ["Adding heat energy generally moves a substance from solid to liquid to gas.", "A substance's particles don't change what they are during a state change, only how they're arranged."] },
      u3_intro: { title: "What is a Chemical Reaction?", blurb: "A chemical reaction rearranges atoms into new substances with new properties.", points: ["The original substances in a reaction are called reactants, and the new ones formed are called products.", "No atoms are created or destroyed in a chemical reaction, only rearranged."] },
      u3_branchA: { title: "Signs of a Chemical Reaction", blurb: "Bubbles, colour changes, and temperature changes can all signal a reaction has occurred.", points: ["Producing a gas, seen as bubbles, is one of the clearest signs a reaction is occurring.", "An unexpected temperature change during mixing often signals a chemical reaction rather than just physical mixing."] },
      u3_branchB: { title: "Acids & Bases", blurb: "Acids and bases are opposite ends of the pH scale that can neutralize each other.", points: ["Mixing an acid and a base together is called neutralization, and it often produces water and a salt.", "Common acids include vinegar and lemon juice, while common bases include soap and baking soda."] },
      u3_branchC: { title: "The pH Scale", blurb: "The pH scale runs from 0 to 14, with 7 marking the exact midpoint of neutral.", points: ["A pH below 7 indicates an acid, while a pH above 7 indicates a base.", "Each whole step on the pH scale represents a tenfold change in acidity or alkalinity."] },
      u3_merge: { title: "Balancing Chemical Equations", blurb: "A balanced equation shows the same number of each atom on both sides of the reaction.", points: ["Balancing usually involves adjusting the numbers in front of each formula, never the subscripts within them.", "An unbalanced equation would imply atoms were created or destroyed, which never actually happens."] },
      u3_hub2: { title: "Acids, Bases & Balanced Equations", blurb: "Reactions between acids and bases are a classic example of an equation that must balance perfectly.", points: ["A neutralization reaction between an acid and base must still balance perfectly like any other equation.", "Balancing these reactions confirms exactly how much acid and base are needed to neutralize each other."] },
      u3_dead1: { title: "Catalysts", blurb: "A catalyst speeds up a chemical reaction without being used up itself.", points: ["Catalysts are not consumed in the reaction, so the same amount can be reused repeatedly.", "Enzymes in your body act as natural catalysts, speeding up essential biological reactions."] },
      u3_dead2: { title: "Combustion Reactions", blurb: "Combustion is a fast reaction with oxygen that releases heat and usually light.", points: ["Combustion always requires oxygen to react with a fuel source.", "Burning wood or gasoline are both everyday examples of combustion reactions."] },
      review: { title: "Chemistry All Around Us", blurb: "From cooking to cleaning, chemical reactions are happening around you constantly.", points: ["Baking a cake relies on chemical reactions between ingredients like baking soda and an acid.", "Cleaning products often work through acid-base or oxidation chemical reactions."] }
    }
  },
  {
    id: "space-and-astronomy",
    title: "Space & Astronomy",
    type: "Science",
    yeargroups: "5-7",
    description: "Tour the solar system, the Moon's phases, and the stars beyond.",
    medalNames: { test1: "Planet Pioneer", test2: "Moon Mapper", test3: "Stargazer" },
    specialTitles: { test1: "Solar System Check", test2: "Earth & Moon Check", test3: "Stars & Galaxies Check" },
    projects: {
      project1: {
        title: "Moon Phase Journal",
        brief: "Observe and sketch the Moon's shape every few nights for two weeks.",
        checklist: ["Sketch 4+ observations", "Label the date of each", "Identify the phase pattern"]
      },
      project2: {
        title: "Build a Constellation Map",
        brief: "Choose three constellations and create a labeled star map showing each one.",
        checklist: ["Choose 3 constellations", "Draw the star pattern", "Label each star's name"]
      }
    },
    finalTitle: "Space & Astronomy Final Exam",
    topics: {
      u1_intro: { title: "Our Solar System", blurb: "The Sun is orbited by eight planets, each at a different distance and size.", points: ["All eight planets orbit the Sun in roughly the same flat plane.", "The Sun makes up more than 99 percent of all the mass in the entire solar system."] },
      u1_branchA: { title: "The Inner Planets", blurb: "Mercury, Venus, Earth, and Mars are rocky planets close to the Sun.", points: ["The four inner planets are all made mostly of rock and metal.", "Mercury, being closest to the Sun, has the shortest year of any planet."] },
      u1_branchB: { title: "The Outer Planets", blurb: "Jupiter, Saturn, Uranus, and Neptune are much larger and made mostly of gas.", points: ["Jupiter is by far the largest planet, more massive than all the other planets combined.", "The outer planets all have ring systems, though Saturn's are by far the most visible."] },
      u1_branchC: { title: "The Asteroid Belt", blurb: "The asteroid belt sits between Mars and Jupiter, marking the rough divide between the inner and outer planets.", points: ["Most asteroids in the belt are far smaller than Earth's Moon.", "The asteroid belt likely formed from material that never managed to combine into a full planet."] },
      u1_merge: { title: "Comparing the Planets", blurb: "Every planet differs enormously in size, temperature, and distance from the Sun.", points: ["Venus is the hottest planet, even hotter than Mercury, due to its thick, heat-trapping atmosphere.", "A planet's distance from the Sun generally determines how long its year lasts."] },
      u1_hub2: { title: "What Divides the Solar System", blurb: "The asteroid belt is exactly where the rocky inner planets give way to the gas giants.", points: ["Everything beyond the asteroid belt is dramatically colder and largely gas-based rather than rocky.", "This natural boundary reflects how differently the solar system's materials settled during its formation."] },
      bonus1: { title: "Dwarf Planets", blurb: "Pluto and other dwarf planets orbit the Sun but don't meet every requirement to be a full planet.", points: ["A dwarf planet must have enough gravity to be round, but hasn't cleared its orbital neighborhood of other debris.", "Pluto was reclassified as a dwarf planet in 2006 after new criteria for planets were defined."] },
      bonus2: { title: "Space Exploration History", blurb: "Human spaceflight only began in 1961, yet we've already sent probes past every planet.", points: ["Yuri Gagarin became the first human in space in 1961.", "The Voyager probes, launched in 1977, are now the farthest human-made objects from Earth."] },
      u2_intro: { title: "Day, Night & the Earth's Rotation", blurb: "Earth's spin on its axis is what creates day and night.", points: ["Earth completes one full rotation approximately every 24 hours.", "It's always daytime on the half of Earth currently facing the Sun."] },
      u2_branchA: { title: "Seasons & Earth's Orbit", blurb: "Earth's tilt, not its distance from the Sun, is what actually causes the seasons.", points: ["Earth's distance from the Sun barely changes throughout the year, which is why tilt matters so much more.", "The hemisphere tilted toward the Sun experiences summer, while the other experiences winter."] },
      u2_branchB: { title: "The Moon's Phases", blurb: "The Moon's changing appearance comes from how much of its sunlit side faces Earth.", points: ["The Moon doesn't produce its own light — it only reflects light from the Sun.", "A full Moon cycle from new Moon back to new Moon takes about 29.5 days."] },
      u2_branchC: { title: "Earth's Tilt", blurb: "Earth's 23.5-degree tilt is the single biggest reason the seasons exist at all.", points: ["Without this tilt, Earth would experience almost no seasonal variation at all.", "The tilt stays pointed in roughly the same direction throughout Earth's entire orbit."] },
      u2_merge: { title: "Eclipses", blurb: "An eclipse happens when the Sun, Earth, and Moon line up in just the right way.", points: ["A solar eclipse happens when the Moon passes directly between the Sun and Earth.", "A lunar eclipse happens when Earth passes directly between the Sun and the Moon."] },
      u2_hub2: { title: "Tilt, Orbit & the Sky", blurb: "Earth's tilt, its orbit, and the Moon's own orbit together explain nearly everything we see change in the sky.", points: ["The same three factors, tilt, orbit, and the Moon's motion, together explain seasons, moon phases, and eclipses.", "Predicting an eclipse accurately requires understanding exactly how these orbits line up."] },
      sideQuestA: { title: "Comets & Asteroids", blurb: "Comets are icy leftovers from the solar system's formation, while asteroids are mostly rocky.", points: ["A comet's glowing tail always points away from the Sun, no matter which direction the comet is travelling.", "Asteroids are concentrated mostly in the belt between Mars and Jupiter."] },
      sideQuestB: { title: "Meteors & Meteorites", blurb: "A meteor burns up in the atmosphere, but a meteorite actually survives to reach the ground.", points: ["The bright streak of a meteor, sometimes called a shooting star, is caused by friction with the atmosphere.", "Very few meteors are large enough to survive their fall and become meteorites."] },
      u3_intro: { title: "Stars & Constellations", blurb: "A constellation is a pattern of stars that, from Earth, appear to form a shape.", points: ["The stars in a constellation are usually not actually close to each other in real distance.", "Different cultures throughout history have drawn very different constellation patterns from the same stars."] },
      u3_branchA: { title: "The Life Cycle of a Star", blurb: "Stars are born, shine for millions of years, and eventually die in dramatic ways.", points: ["A star spends most of its life fusing hydrogen into helium in its core.", "The most massive stars live the shortest lives and often end in a dramatic supernova explosion."] },
      u3_branchB: { title: "Galaxies", blurb: "A galaxy is a massive collection of billions of stars, and our Sun lives inside one.", points: ["Our own galaxy, the Milky Way, contains hundreds of billions of stars.", "Galaxies themselves are often organised into even larger clusters across the universe."] },
      u3_branchC: { title: "Black Holes", blurb: "A black hole forms when a massive star's core collapses under its own gravity after it dies.", points: ["A black hole's gravity is so strong that not even light can escape it.", "Scientists detect black holes indirectly, by observing their powerful effect on nearby matter and light."] },
      u3_merge: { title: "Our Place in the Universe", blurb: "Earth, the Sun, and our entire galaxy are just one small part of a vast universe.", points: ["The observable universe contains an estimated hundreds of billions of galaxies.", "Light from the most distant galaxies has taken billions of years to reach us."] },
      u3_hub2: { title: "The Fate of Stars", blurb: "A star's life cycle and the black holes some leave behind both stem from the same core physics.", points: ["A star like our Sun will eventually swell into a red giant before shrinking into a white dwarf.", "Only the most massive stars are capable of collapsing into a black hole."] },
      u3_dead1: { title: "The Big Bang Theory", blurb: "The Big Bang theory describes the universe expanding rapidly from an extremely hot, dense point.", points: ["Evidence for the Big Bang includes the observation that distant galaxies are moving away from us.", "The theory estimates the universe began expanding roughly 13.8 billion years ago."] },
      u3_dead2: { title: "Space Telescopes", blurb: "Space telescopes avoid Earth's atmosphere entirely, capturing far clearer images of deep space.", points: ["Earth's atmosphere blurs and blocks many wavelengths of light before they reach ground-based telescopes.", "The Hubble Space Telescope has captured some of the most detailed images of deep space ever taken."] },
      review: { title: "Exploring Space", blurb: "Telescopes and spacecraft continue to reveal new discoveries about our solar system and beyond.", points: ["Modern telescopes can detect planets orbiting stars trillions of miles away.", "Space agencies around the world continue to plan missions back to the Moon and onward to Mars."] }
    }
  },
  {
    id: "music-theory-basics",
    title: "Music Theory Basics",
    type: "Music and Art",
    yeargroups: "5-7",
    description: "Learn to read music, keep rhythm, and build your first melodies, chords, and expression.",
    medalNames: { test1: "Notation Novice", test2: "Melody Maker", test3: "Performance Pro" },
    specialTitles: { test1: "Notation Check", test2: "Scales & Chords Check", test3: "Expression Check" },
    projects: {
      project1: {
        title: "Compose a 4-Bar Melody",
        brief: "Write a short melody using the major scale and at least one chord you learned.",
        checklist: ["Write a 4-bar melody", "Use the major scale", "Add one chord"]
      },
      project2: {
        title: "Perform with Expression",
        brief: "Take a melody you know and mark it up with dynamics, tempo changes, and articulation.",
        checklist: ["Choose a melody", "Mark 3 dynamic changes", "Perform or describe your interpretation"]
      }
    },
    finalTitle: "Music Theory Basics Final Exam",
    topics: {
      u1_intro: { title: "Reading the Staff", blurb: "Notes are placed on lines and spaces of a staff to show their pitch.", points: ["The staff has five lines and four spaces, each representing a different pitch.", "A clef at the start of the staff tells you exactly which pitch each line and space represents."] },
      u1_branchA: { title: "Note Names & Values", blurb: "Every note has both a letter name and a length, like a quarter note or half note.", points: ["Note names cycle through just seven letters, A through G, repeating in every octave.", "A whole note lasts twice as long as a half note, which lasts twice as long as a quarter note."] },
      u1_branchB: { title: "Rhythm & Beat", blurb: "Music is organized into a steady, repeating beat that rhythm patterns fit inside.", points: ["Tapping your foot along to a song is a natural way of feeling its underlying beat.", "Rhythm patterns can vary widely, but the beat underneath usually stays perfectly steady."] },
      u1_branchC: { title: "Time Signatures Basics", blurb: "A time signature's top number tells you how many beats fill each measure.", points: ["The bottom number of a time signature tells you which note value counts as one beat.", "4/4 time, sometimes called common time, is the most frequently used time signature in music."] },
      u1_merge: { title: "Putting Rhythm to Notes", blurb: "Combining note names with rhythm is what turns notes on a page into real music.", points: ["The same rhythm can sound completely different depending on which notes it's applied to.", "Musicians read both pitch and rhythm simultaneously every time they play from notation."] },
      u1_hub2: { title: "Rhythm Inside a Time Signature", blurb: "Rhythm patterns only make full sense once you know how many beats each measure actually holds.", points: ["A measure in 3/4 time can only hold three quarter-note beats before moving to the next measure.", "Recognising the time signature first makes reading any rhythm pattern far more intuitive."] },
      bonus1: { title: "Clapping Games", blurb: "Clapping rhythm patterns is a fun, hands-on way to feel the beat before playing an instrument.", points: ["Clapping games often introduce rhythmic concepts, like syncopation, long before formal music lessons do.", "Group clapping games naturally teach the skill of staying in time with others."] },
      bonus2: { title: "Music Without Instruments", blurb: "Beatboxing and body percussion prove music doesn't need a single instrument to exist.", points: ["Beatboxing uses the mouth and voice to imitate an entire drum kit.", "Body percussion, like stomping and clapping, can create surprisingly complex rhythms."] },
      u2_intro: { title: "Major Scales", blurb: "A major scale is a set pattern of eight notes that sounds bright and happy.", points: ["Every major scale follows the exact same pattern of whole and half steps, no matter which note it starts on.", "The C major scale uses no sharps or flats, making it the simplest major scale to read."] },
      u2_branchA: { title: "Minor Scales", blurb: "A minor scale uses a different pattern of notes that often sounds more serious or sad.", points: ["A natural minor scale shares the same notes as a related major scale, just starting from a different point.", "Minor scales are often chosen deliberately to give a piece a more emotional or mysterious feel."] },
      u2_branchB: { title: "Simple Chords", blurb: "Playing three or more notes together at once creates a chord.", points: ["The most basic chord, called a triad, is built from three notes stacked in specific intervals.", "Chords provide the harmonic backing that supports a melody."] },
      u2_branchC: { title: "Major vs. Minor Chords", blurb: "A chord's middle note is what decides whether it sounds bright (major) or sad (minor).", points: ["Shifting that middle note by just a single half step is enough to change a chord's entire mood.", "Major chords are often described as sounding happy, while minor chords are often described as sounding sad."] },
      u2_merge: { title: "Chords Within a Scale", blurb: "Every scale contains a built-in set of chords that naturally sound good together.", points: ["Stacking notes from the scale on top of each of its own notes generates every chord that scale naturally contains.", "Songwriters often build entire songs using just a handful of chords from a single scale."] },
      u2_hub2: { title: "Building Chords from Scales", blurb: "Every scale, major or minor, naturally builds its own matching set of major and minor chords.", points: ["Every major scale contains a predictable mix of major, minor, and one diminished chord.", "Knowing this pattern lets a musician predict which chords will sound good together in any key."] },
      sideQuestA: { title: "Intervals", blurb: "An interval is simply the distance in pitch between any two notes.", points: ["The distance from one note to the very next note with the same name is called an octave.", "Intervals are the basic building blocks used to construct both scales and chords."] },
      sideQuestB: { title: "Harmony vs. Melody", blurb: "A melody is a single line of notes, while harmony is multiple notes supporting it at once.", points: ["A melody is usually the part of a song you'd hum or whistle on its own.", "Harmony adds depth and emotional colour underneath the melody without competing with it for attention."] },
      u3_intro: { title: "Dynamics & Tempo", blurb: "How loud or soft, and how fast or slow, a piece is played changes its whole feeling.", points: ["Dynamics range from extremely quiet, marked pianissimo, to extremely loud, marked fortissimo.", "Changing tempo gradually, called a ritardando or accelerando, can build tension or release it."] },
      u3_branchA: { title: "Articulation", blurb: "How smoothly or sharply a note is played changes the character of a performance.", points: ["A staccato note is played short and detached, while a legato note is played smooth and connected.", "The same melody played staccato versus legato can sound like two completely different pieces."] },
      u3_branchB: { title: "Musical Form", blurb: "Many songs repeat and vary simple sections, like verse and chorus, to create structure.", points: ["A verse-chorus structure is one of the most common musical forms in popular music.", "Repetition with small variations is what makes a musical form feel both familiar and interesting."] },
      u3_branchC: { title: "Phrasing", blurb: "A musical phrase is a short musical 'sentence' that a performer shapes with a beginning, middle, and end.", points: ["A well-shaped phrase usually rises in intensity before settling back down, much like a spoken sentence.", "Breathing naturally at the end of a phrase is a technique singers and wind players rely on constantly."] },
      u3_merge: { title: "Expression in Performance", blurb: "Dynamics, tempo, and articulation together are what make a performance feel expressive.", points: ["Two performers can play the exact same notes yet sound completely different through their expressive choices.", "Expression is often what separates a technically correct performance from a genuinely moving one."] },
      u3_hub2: { title: "Shaping a Musical Phrase", blurb: "Articulation and form both come alive through how a performer phrases each musical idea.", points: ["A performer's articulation choices are one of the main tools used to shape a phrase's character.", "Recognising the musical form of a piece helps a performer decide how each individual phrase should build toward it."] },
      u3_dead1: { title: "Reading Chord Symbols", blurb: "A chord symbol like 'Am' or 'G7' tells a performer which chord to play without writing every note.", points: ["A chord symbol lets a musician improvise their own version of a chord rather than playing a fixed notation.", "Chord symbols are especially common in jazz and pop sheet music, called lead sheets."] },
      u3_dead2: { title: "Improvisation Basics", blurb: "Improvising means creating melody in the moment, usually by staying within a chosen scale.", points: ["Staying within the notes of a single scale is one of the simplest ways to begin improvising confidently.", "Skilled improvisers often build phrases by responding directly to what other musicians just played."] },
      review: { title: "Putting It All Together", blurb: "Notation, harmony, and expression combine in every piece of music you'll ever play.", points: ["A single pop song usually combines notation, chords built from a scale, and deliberate expressive choices.", "Understanding all three areas together is what lets a musician move beyond just reading notes to genuinely making music."] }
    }
  },
  {
    id: "colour-and-composition",
    title: "Colour & Composition",
    type: "Music and Art",
    yeargroups: "10-11",
    description: "Study how colour, composition, and depth work together to make art feel intentional.",
    medalNames: { test1: "Colour Theorist", test2: "Composition Pro", test3: "Perspective Pro" },
    specialTitles: { test1: "Colour Theory Check", test2: "Composition Check", test3: "Depth & Perspective Check" },
    projects: {
      project1: {
        title: "Compose a Still Life Sketch",
        brief: "Arrange three objects and sketch them using the rule of thirds and a chosen colour palette.",
        checklist: ["Arrange 3 objects", "Sketch using rule of thirds", "Apply your colour palette"]
      },
      project2: {
        title: "Create a Scene with Depth",
        brief: "Draw or paint a scene using perspective and shading to create a strong sense of depth.",
        checklist: ["Sketch a scene with perspective", "Add shading for depth", "Add at least one textured surface"]
      }
    },
    finalTitle: "Colour & Composition Final Exam",
    topics: {
      u1_intro: { title: "The Colour Wheel", blurb: "The colour wheel arranges colours so you can see how they relate to each other.", points: ["The three primary colours, red, blue, and yellow, can't be created by mixing any other colours.", "Secondary colours are created by mixing two primary colours together in equal amounts."] },
      u1_branchA: { title: "Warm & Cool Colours", blurb: "Warm colours tend to feel energetic, while cool colours tend to feel calm.", points: ["Reds, oranges, and yellows are classic examples of warm colours.", "Blues, greens, and purples are classic examples of cool colours."] },
      u1_branchB: { title: "Complementary Colours", blurb: "Colours opposite each other on the wheel create the strongest contrast when paired.", points: ["Red and green, and blue and orange, are classic complementary colour pairs.", "Placing complementary colours side by side makes both of them appear more vivid."] },
      u1_branchC: { title: "Analogous Colours", blurb: "Analogous colours sit right next to each other on the colour wheel and blend together harmoniously.", points: ["Blue, blue-green, and green are a typical example of an analogous colour group.", "Analogous palettes tend to feel more calming and cohesive than contrasting ones."] },
      u1_merge: { title: "Mixing Colour Palettes", blurb: "Choosing a small, deliberate set of colours makes a piece of art feel unified.", points: ["Limiting a palette to just a handful of colours often makes a piece feel more intentional and polished.", "A palette can combine warm and cool colours deliberately to create both harmony and contrast."] },
      u1_hub2: { title: "Palette Choices Compared", blurb: "Complementary and analogous colour schemes create opposite moods: one contrasts, the other blends.", points: ["A complementary palette tends to feel bold and energetic, while an analogous one tends to feel soft and unified.", "Many professional artists choose their palette strategy before they even begin sketching."] },
      bonus1: { title: "Colour in Famous Paintings", blurb: "Famous painters often chose colour palettes deliberately to set a mood.", points: ["Van Gogh's frequent use of blues and yellows helped define the emotional tone of his most famous works.", "Studying a painter's palette choices can reveal a lot about the mood they intended to create."] },
      bonus2: { title: "Colour Psychology", blurb: "Colours are often chosen deliberately in branding and design to trigger a specific feeling.", points: ["Red is often used deliberately in branding to grab attention or suggest urgency.", "Blue is commonly used by companies wanting to convey trust and calm."] },
      u2_intro: { title: "Rule of Thirds", blurb: "Placing the subject off-centre, along imaginary gridlines, often creates a more interesting composition.", points: ["The rule of thirds divides a composition into a 3-by-3 grid using two horizontal and two vertical lines.", "Placing a subject at one of the grid's intersections tends to feel more dynamic than placing it dead center."] },
      u2_branchA: { title: "Balance & Focal Points", blurb: "A composition needs one clear focal point balanced by the rest of the piece.", points: ["A composition can be balanced even without perfect symmetry, using visual weight instead.", "Too many competing focal points can leave a viewer unsure where to look first."] },
      u2_branchB: { title: "Leading Lines", blurb: "Lines within an artwork can guide the viewer's eye directly toward the focal point.", points: ["A road, river, or fence in a photo can act as a leading line drawing the eye toward the subject.", "Leading lines don't have to be straight — a gentle curve can guide the eye just as effectively."] },
      u2_branchC: { title: "The Golden Ratio", blurb: "The golden ratio is a proportion artists have used for centuries to arrange a composition pleasingly.", points: ["The golden ratio is roughly 1 to 1.618, a proportion found repeatedly throughout nature.", "Some artists use a golden spiral, based on this ratio, to arrange elements within a composition."] },
      u2_merge: { title: "Framing the Subject", blurb: "Elements around the edges of a composition can frame and draw attention to the subject.", points: ["A natural frame, like an archway or overhanging branches, can draw a viewer's eye straight to the subject.", "Framing also helps separate the main subject visually from a busy background."] },
      u2_hub2: { title: "Classic Composition Rules", blurb: "The rule of thirds and the golden ratio are two different tools for achieving the same balanced feel.", points: ["Both rules aim to avoid a static, centered subject in favour of a more visually engaging arrangement.", "Many artists blend several composition techniques together within the very same piece."] },
      sideQuestA: { title: "Negative Space", blurb: "The empty space around a subject can be just as important to a composition as the subject itself.", points: ["Effective use of negative space can make a subject feel more striking by giving it room to breathe.", "Some famous logos cleverly use negative space to hide a second image within the design."] },
      sideQuestB: { title: "Symmetry in Art", blurb: "A symmetrical composition can feel calm and formal, while an asymmetrical one often feels more dynamic.", points: ["Perfect symmetry is often used deliberately in formal portraits or architectural drawings.", "Asymmetrical compositions often feel more like a candid, natural moment."] },
      u3_intro: { title: "Light & Shadow", blurb: "Light and shadow give a flat drawing the illusion of depth and form.", points: ["The direction a light source comes from determines exactly where the shadows fall in a drawing.", "Strong contrast between light and shadow is what creates a dramatic, three-dimensional look."] },
      u3_branchA: { title: "Perspective Basics", blurb: "Perspective tricks the eye into seeing depth and distance on a flat surface.", points: ["Objects are typically drawn smaller the further away they're meant to appear.", "One-point perspective uses a single vanishing point, while two-point perspective uses two."] },
      u3_branchB: { title: "Texture & Detail", blurb: "Texture suggests how a surface would feel, even though a painting is completely flat.", points: ["Rough, choppy brush strokes can suggest a coarse texture even on a perfectly smooth canvas.", "Adding fine detail selectively, rather than everywhere, often draws more attention to the focal point."] },
      u3_branchC: { title: "Vanishing Points", blurb: "A vanishing point is where parallel lines in a perspective drawing appear to converge in the distance.", points: ["All parallel lines heading away from the viewer converge at exactly the same vanishing point.", "A drawing can use more than one vanishing point to depict a more complex three-dimensional scene."] },
      u3_merge: { title: "Depth in a Finished Piece", blurb: "Light, perspective, and texture together are what make a 2D piece feel three-dimensional.", points: ["Combining perspective, shading, and texture together is what fully convinces the eye of real depth.", "Missing just one of these elements can make an otherwise skilled drawing feel oddly flat."] },
      u3_hub2: { title: "Perspective in Practice", blurb: "Vanishing points are the technical trick that makes perspective drawing actually work on paper.", points: ["Every perspective drawing ultimately relies on correctly placed vanishing points to feel convincing.", "Practicing simple boxes and roads in perspective builds the skill needed for more complex scenes."] },
      u3_dead1: { title: "Colour Mixing Basics", blurb: "Mixing two primary colours together always produces one of the three secondary colours.", points: ["Red and yellow mix to create orange, one of the three classic secondary colours.", "Mixing all three primary colours together typically produces a muddy brown."] },
      u3_dead2: { title: "Value & Contrast", blurb: "Value describes how light or dark a colour is, and strong contrast in value is what makes a piece pop.", points: ["A black and white photo of a painting reveals its value structure with the colour removed entirely.", "High contrast in value can make a piece feel bold, while low contrast can make it feel soft and subtle."] },
      review: { title: "Your Personal Style", blurb: "Every artist combines colour, composition, and depth differently — that combination becomes their style.", points: ["Two artists using the identical subject can produce completely different pieces based on their personal style choices.", "A recognisable personal style usually develops from consistently favouring certain colours, compositions, or techniques."] }
    }
  },
  {
    id: "digital-art-fundamentals",
    title: "Digital Art Fundamentals",
    type: "Music and Art",
    yeargroups: "9-11",
    description: "Layers, digital colouring, and exporting — the essentials of making art on a screen.",
    medalNames: { test1: "Digital Rookie", test2: "Shading Specialist", test3: "Digital Finisher" },
    specialTitles: { test1: "Digital Basics Check", test2: "Colouring & Shading Check", test3: "Export & Composition Check" },
    projects: {
      project1: {
        title: "Colour a Character Sketch",
        brief: "Take a simple line drawing and fully colour and shade it using layers.",
        checklist: ["Add a base colour layer", "Add a shading layer", "Use at least one blending mode"]
      },
      project2: {
        title: "Publish a Digital Piece",
        brief: "Finish a digital artwork and prepare it at the right size and format to share online.",
        checklist: ["Finish the artwork", "Choose an appropriate resolution", "Export in a suitable format"]
      }
    },
    finalTitle: "Digital Art Fundamentals Final Exam",
    topics: {
      u1_intro: { title: "Digital Canvas Basics", blurb: "A digital canvas is made of pixels, tiny squares of colour arranged in a grid.", points: ["A higher pixel count generally means a sharper, more detailed image.", "Zooming far enough into any digital image eventually reveals its individual pixels."] },
      u1_branchA: { title: "Layers", blurb: "Layers let you edit one part of an artwork without disturbing anything else underneath.", points: ["Layers can be reordered, hidden, or deleted individually without affecting the rest of the artwork.", "Working in layers is one of the biggest advantages digital art has over traditional paper drawing."] },
      u1_branchB: { title: "Brushes & Tools", blurb: "Different digital brushes can mimic pencils, paint, or entirely new textures.", points: ["A single digital brush can be adjusted for size, opacity, and texture on the fly.", "Custom brush settings let a digital artist mimic tools they may not even own physically."] },
      u1_branchC: { title: "Layer Opacity", blurb: "Lowering a layer's opacity lets you see through it, which is perfect for sketching over a rough draft.", points: ["Lowering opacity to around 30 or 40 percent is a common technique for tracing over a rough sketch.", "Opacity can be adjusted independently on every single layer in a piece."] },
      u1_merge: { title: "Building a Simple Digital Sketch", blurb: "Layers and brushes together let you sketch, refine, and adjust without starting over.", points: ["Sketching on a low-opacity layer underneath a clean final layer is a standard digital workflow.", "This non-destructive approach means mistakes can be undone without ruining the whole piece."] },
      u1_hub2: { title: "Sketching with Layers & Opacity", blurb: "Combining opacity control with separate layers is what makes digital sketching so much more forgiving than paper.", points: ["Reducing a rough sketch's opacity and adding a clean layer on top is one of the most common digital art workflows.", "This technique lets an artist refine linework repeatedly without ever damaging the original sketch."] },
      bonus1: { title: "Digital Art in Games & Film", blurb: "Nearly every video game and animated film relies on digital art tools.", points: ["Concept artists often use digital tools to rapidly explore dozens of ideas before a final design is chosen.", "Modern animated films rely almost entirely on digital art pipelines from concept through final render."] },
      bonus2: { title: "AI & Digital Art Tools", blurb: "New software tools are changing how digital art gets made, but the same core principles still apply.", points: ["AI-assisted tools can now generate or modify images, but composition and colour theory still guide good results.", "Many professional artists use new digital tools as a starting point rather than a finished replacement for their own skill."] },
      u2_intro: { title: "Colour Picking Digitally", blurb: "Digital tools let you sample and adjust colours with total precision.", points: ["A digital colour picker lets an artist select the exact same colour used anywhere else in an image.", "Digital colour values can be described precisely using codes, unlike mixing physical paint."] },
      u2_branchA: { title: "Blending Modes", blurb: "Blending modes control how one layer's colours combine with the layer beneath it.", points: ["A 'multiply' blending mode darkens colours beneath it, which is useful for adding shadows.", "Different blending modes can produce dramatically different results from the exact same two layers."] },
      u2_branchB: { title: "Digital Shading", blurb: "Digital shading uses layers and blending to add light and shadow non-destructively.", points: ["Shading on a separate layer set to a blending mode keeps the original colours fully editable underneath.", "This non-destructive shading approach lets an artist adjust lighting even after the shading is finished."] },
      u2_branchC: { title: "Selections & Masks", blurb: "A selection or mask limits exactly which part of the canvas your next edit will affect.", points: ["A mask can be painted over freely without any risk of affecting pixels outside the selection.", "Selections ensure that colouring stays neatly within the lines of a drawing."] },
      u2_merge: { title: "Colouring a Line Drawing", blurb: "Colour picking, blending, and shading combine to bring a flat line drawing to life.", points: ["A typical digital colouring workflow moves from flat base colours, to shading, to fine detail.", "Masks and blending modes together are what let colourists work quickly without constant careful erasing."] },
      u2_hub2: { title: "Precise Digital Colouring", blurb: "Masks combined with blending modes are how professional digital colourists stay perfectly inside the lines.", points: ["Combining masks with blending modes lets a colourist shade an entire complex drawing in just a few layers.", "This combination is standard practice in professional illustration and animation studios."] },
      sideQuestA: { title: "Custom Brushes", blurb: "A custom brush can be built to mimic almost any real-world texture or tool.", points: ["A custom brush can be built from a scanned real-world texture, like paper or canvas.", "Many digital artists share and download custom brush packs built by other artists."] },
      sideQuestB: { title: "Keyboard Shortcuts", blurb: "Fast digital artists rely on shortcuts to switch tools without ever touching a menu.", points: ["Memorising just a handful of shortcuts, like undo and brush size, can dramatically speed up a workflow.", "Professional digital artists rarely touch a menu, relying almost entirely on keyboard and stylus shortcuts."] },
      u3_intro: { title: "Exporting & File Formats", blurb: "Different file formats are suited to different uses, like print, web, or animation.", points: ["A PNG file supports transparency, while a JPEG typically does not.", "Choosing the wrong file format can noticeably reduce an image's quality when it's shared or printed."] },
      u3_branchA: { title: "Resolution & Canvas Size", blurb: "Higher resolution images hold more detail but take up more file space.", points: ["Print work typically requires a much higher resolution than an image intended only for a screen.", "Starting a piece at a higher resolution makes it easy to shrink down later, but hard to enlarge without losing quality."] },
      u3_branchB: { title: "Digital Composition", blurb: "The same composition rules from traditional art — like the rule of thirds — apply just as much digitally.", points: ["Digital tools often include grid overlays specifically to help apply the rule of thirds.", "Composition principles from traditional art transfer directly to digital canvases without any real changes."] },
      u3_branchC: { title: "Colour Modes (RGB vs. CMYK)", blurb: "RGB is built for screens, while CMYK is built for physical printing, and colours can shift between the two.", points: ["RGB mixes light and can produce far more vivid colours than CMYK's ink-based mixing.", "Switching an image from RGB to CMYK before printing helps avoid unexpected colour shifts."] },
      u3_merge: { title: "Preparing Art to Share", blurb: "Choosing the right size, format, and composition makes digital art ready to publish anywhere.", points: ["Choosing the correct resolution, format, and colour mode together avoids most common publishing mistakes.", "A piece prepared incorrectly for its destination can lose significant quality even if the artwork itself is excellent."] },
      u3_hub2: { title: "Preparing Art for Print vs. Screen", blurb: "Resolution and colour mode both need to be chosen differently depending on where the art will end up.", points: ["Print work demands higher resolution and CMYK colour, while screen work favours RGB at a lower resolution.", "Mixing up these two preparation paths is one of the most common mistakes new digital artists make."] },
      u3_dead1: { title: "Digital Art Portfolios", blurb: "A strong portfolio shows a small, well-chosen selection of your best work, not everything you've ever made.", points: ["A focused portfolio of ten strong pieces usually impresses more than fifty mediocre ones.", "Arranging a portfolio to show range across different subjects or styles can make a stronger impression."] },
      u3_dead2: { title: "Getting Feedback on Art", blurb: "Specific, focused feedback requests almost always produce more useful critiques than just asking 'what do you think?'", points: ["Asking a specific question, like 'does this composition feel balanced?', gets far more useful feedback than a general one.", "Being open to critique, without becoming defensive, is what actually leads to noticeable improvement over time."] },
      review: { title: "Your Digital Art Toolkit", blurb: "Layers, colour, and export knowledge together form the toolkit behind almost all professional digital art.", points: ["A finished digital piece, ready to publish, draws on layering, colouring, and export knowledge all at once.", "These same core digital skills apply whether the final piece is a game asset, an animation frame, or a personal illustration."] }
    }
  },
  {
    id: "rhythm-and-percussion",
    title: "Rhythm & Percussion",
    type: "Music and Art",
    yeargroups: "3-5",
    description: "Feel the beat, meet the percussion family, and build your own group rhythms.",
    medalNames: { test1: "Rhythm Rookie", test2: "Percussion Pal", test3: "Groove Guide" },
    specialTitles: { test1: "Rhythm Basics Check", test2: "Percussion Family Check", test3: "Group Rhythm Check" },
    projects: {
      project1: {
        title: "Build a Body Percussion Piece",
        brief: "Create a short rhythm piece using only clapping, stomping, and tapping.",
        checklist: ["Create a 4-beat pattern", "Use 3 different body sounds", "Perform it twice in a row"]
      },
      project2: {
        title: "Compose a Group Rhythm",
        brief: "Write a short rhythm piece for three players, each with a different simple part.",
        checklist: ["Write 3 separate parts", "Make sure they fit together", "Perform or describe how it sounds together"]
      }
    },
    finalTitle: "Rhythm & Percussion Final Exam",
    topics: {
      u1_intro: { title: "What is Rhythm?", blurb: "Rhythm is the pattern of long and short sounds and silences in music.", points: ["Rhythm exists in everyday sounds too, like a ticking clock or footsteps walking down a hallway.", "Even a single instrument playing alone can create a rich and varied rhythm."] },
      u1_branchA: { title: "Steady Beat", blurb: "A steady beat is like a musical heartbeat that keeps everyone playing together.", points: ["A metronome is a tool musicians use specifically to practice keeping a perfectly steady beat.", "Losing track of the steady beat is one of the most common challenges for beginning musicians."] },
      u1_branchB: { title: "Simple Rhythm Patterns", blurb: "Short repeating patterns of claps or taps are the building blocks of rhythm.", points: ["A simple four-beat clapping pattern can be repeated and layered into something far more complex.", "Learning short patterns by ear is often easier for beginners than reading them from notation first."] },
      u1_branchC: { title: "Rests in Rhythm", blurb: "A rest is a deliberate silence that's just as important to a rhythm as the sounds themselves.", points: ["A rest still takes up exact counted time, just like a note does.", "Leaving space with rests is often what gives a rhythm its distinctive groove."] },
      u1_merge: { title: "Combining Beat & Pattern", blurb: "A rhythm pattern only makes sense when it's lined up with a steady beat underneath it.", points: ["A rhythm pattern that ignores the underlying beat will sound disconnected from the rest of the music.", "Musicians constantly feel the steady beat internally, even during more complex patterns."] },
      u1_hub2: { title: "Silence as Part of Rhythm", blurb: "Rests combined with steady patterns are what give rhythm its sense of space and groove.", points: ["Skilled percussionists treat rests with just as much intention as the notes they play.", "A pattern full of rests can feel just as rhythmically interesting as one full of sound."] },
      bonus1: { title: "Rhythm Games", blurb: "Clapping games and echo games are a fun way to practice rhythm without an instrument.", points: ["Echo games, where one person claps a pattern and others repeat it, build listening skills alongside rhythm.", "Rhythm games are often used in music classrooms specifically because they require no instrument at all."] },
      bonus2: { title: "Rhythm Around the World", blurb: "Different cultures have developed completely distinct percussion traditions, from djembe to taiko.", points: ["The djembe, a West African hand drum, is central to entire genres of traditional music.", "Taiko drumming from Japan often involves large, dramatic group performances built around precise rhythm."] },
      u2_intro: { title: "Meet the Percussion Family", blurb: "Percussion instruments make sound by being hit, shaken, or scraped.", points: ["Percussion instruments are typically divided into pitched and unpitched categories.", "The human body itself, through clapping and stomping, can function as a percussion instrument."] },
      u2_branchA: { title: "Pitched vs. Unpitched Percussion", blurb: "Some percussion instruments, like xylophones, play specific pitches, while others just play a beat.", points: ["A xylophone can play an actual melody, while a snare drum typically cannot.", "Unpitched percussion instruments are often used specifically to keep time or add texture."] },
      u2_branchB: { title: "Playing Techniques", blurb: "Where and how hard you strike a drum changes the sound it makes.", points: ["Striking a drum near its edge produces a different tone than striking it dead center.", "Different striking techniques, like using a mallet versus a hand, dramatically change an instrument's sound."] },
      u2_branchC: { title: "Dynamics in Percussion", blurb: "Playing softer or louder on the same drum can completely change the feel of a rhythm.", points: ["A single drum can range from a barely audible tap to an extremely loud strike.", "Controlling dynamics carefully is often what separates a beginner performance from a skilled one."] },
      u2_merge: { title: "Choosing the Right Instrument", blurb: "Different percussion instruments suit different rhythms and moods.", points: ["A quiet, gentle passage might call for a soft shaker rather than a loud bass drum.", "Choosing an instrument thoughtfully is as important to the final sound as how it's actually played."] },
      u2_hub2: { title: "Technique & Dynamics Together", blurb: "How you strike an instrument and how loud you play it both shape its final sound.", points: ["The exact same drum can sound completely different depending on both technique and dynamic choices.", "Skilled percussionists constantly adjust both technique and dynamics together in real time."] },
      sideQuestA: { title: "Tempo Markings", blurb: "A tempo marking tells performers roughly how fast or slow a piece should be played.", points: ["A tempo marking like 'allegro' tells a performer to play at a fast, lively speed.", "Modern sheet music often gives an exact tempo in beats per minute alongside a traditional marking."] },
      sideQuestB: { title: "Call and Response", blurb: "In call and response, one rhythm is played and then echoed or answered by another.", points: ["Call and response patterns appear across many musical traditions, from gospel to West African drumming.", "This structure naturally builds group listening skills, since the response must fit what was just played."] },
      u3_intro: { title: "Time Signatures", blurb: "A time signature tells you how many beats are in each measure of music.", points: ["A time signature is written as two stacked numbers at the very start of a piece of music.", "4/4 is by far the most common time signature across popular and traditional music."] },
      u3_branchA: { title: "Playing in Groups", blurb: "Playing percussion with others means listening as much as playing.", points: ["A group of percussionists must all agree on both tempo and dynamics to sound unified.", "Listening to the other performers is often considered even more important than watching your own part."] },
      u3_branchB: { title: "Layering Rhythms", blurb: "Different simple rhythms played together can combine into something much more complex.", points: ["Layering several simple patterns together is a technique found in music from countless cultures worldwide.", "Even very simple individual parts can combine into a surprisingly rich overall rhythm."] },
      u3_branchC: { title: "Syncopation", blurb: "Syncopation happens when a rhythm accents an unexpected beat instead of the obvious one.", points: ["Syncopation is a defining feature of genres like jazz, funk, and reggae.", "An unexpected accent in the 'wrong' place is often exactly what makes a rhythm feel catchy."] },
      u3_merge: { title: "Group Rhythm Pieces", blurb: "A great group rhythm piece layers several simple, steady parts together.", points: ["A well-built group piece usually balances simple, steady parts with just a touch of syncopated surprise.", "Each performer's individual part might sound plain alone but essential once layered with the others."] },
      u3_hub2: { title: "Adding Surprise to Rhythm", blurb: "Syncopation layered into a group piece is often what makes a rhythm feel exciting instead of predictable.", points: ["Introducing syncopation into an otherwise steady group piece is a classic way to build excitement.", "Too much syncopation at once can make a rhythm feel chaotic rather than exciting."] },
      u3_dead1: { title: "Rhythm Notation", blurb: "Rhythm notation uses different note shapes to show exactly how long or short each sound should last.", points: ["A filled-in notehead with a flag represents a shorter rhythmic value than an open notehead.", "Learning to read rhythm notation lets a musician play an unfamiliar piece accurately on the first try."] },
      u3_dead2: { title: "Warm-Up Exercises for Percussion", blurb: "Simple warm-up patterns build the hand control needed for more complex rhythms later.", points: ["Simple stick or hand exercises build the muscle control needed for fast, precise playing later.", "Regular warm-ups also help prevent strain injuries common among percussionists."] },
      review: { title: "Rhythm Everywhere", blurb: "From heartbeats to footsteps to music, rhythm is a pattern you can find absolutely everywhere.", points: ["A washing machine's spin cycle or a dripping tap can accidentally create a recognisable rhythmic pattern.", "Recognising rhythm in everyday sounds is a skill that sharpens a musician's ear over time."] }
    }
  },
  {
    id: "intro-to-python",
    title: "Intro to Python",
    type: "Programming",
    yeargroups: "8-10",
    description: "Write your first lines of code and build up to logic, loops, lists, and functions.",
    medalNames: { test1: "Variable Rookie", test2: "Logic Builder", test3: "Loop Legend" },
    specialTitles: { test1: "Variables Check", test2: "Logic Check", test3: "Loops & Lists Check" },
    projects: {
      project1: {
        title: "Build a Number Guessing Game",
        brief: "Use a loop and an if statement to build a game that checks guesses against a secret number.",
        checklist: ["Store a secret number", "Loop until it's guessed", "Give a higher/lower hint"]
      },
      project2: {
        title: "Build a To-Do List Program",
        brief: "Build a simple program that stores tasks in a list and prints them all using a loop.",
        checklist: ["Store 3+ tasks in a list", "Loop through and print them", "Add one new task with code"]
      }
    },
    finalTitle: "Intro to Python Final Exam",
    topics: {
      u1_intro: { title: "What is a Program?", blurb: "A program is just a list of instructions a computer follows, in order, one at a time.", points: ["A program follows its instructions in the exact order they're written, unless told otherwise.", "Even a tiny mistake in one instruction can cause an entire program to behave unexpectedly."] },
      u1_branchA: { title: "Variables & Data Types", blurb: "A variable stores a piece of data, like a number or a word, under a name you choose.", points: ["A variable's value can be changed later in the program simply by assigning it something new.", "Common data types include numbers, text strings, and booleans."] },
      u1_branchB: { title: "Printing Output", blurb: "The print() function shows text or values on the screen so you can see what's happening.", points: ["print() is often the very first function a new programmer learns to use.", "Printing values while a program runs is one of the simplest ways to check what it's actually doing."] },
      u1_branchC: { title: "Type Conversion", blurb: "Converting a number to a string (or back) is often necessary before combining or printing values together.", points: ["Trying to add a number directly to a string without converting it usually causes an error.", "The str() function converts a number into text, while int() converts text back into a number."] },
      u1_merge: { title: "Working with Strings & Numbers", blurb: "Variables holding text and variables holding numbers can be combined and displayed together.", points: ["Combining text and numbers in a single print statement almost always requires a type conversion first.", "Getting data types right early prevents a huge share of beginner programming errors."] },
      u1_hub2: { title: "Combining Different Data Types", blurb: "Printing strings and numbers together usually requires converting between data types first.", points: ["Forgetting a type conversion is one of the most common bugs beginner programmers encounter.", "Python will raise a specific error message pointing to exactly which types couldn't be combined."] },
      bonus1: { title: "Fun with Emoji Strings", blurb: "Strings can hold any character, including emoji, making output playful and fun.", points: ["Emoji are just special characters, and strings can hold them exactly like any letter.", "Printing playful output is a great way for beginners to stay motivated while learning syntax."] },
      bonus2: { title: "Python in the Real World", blurb: "Python powers everything from websites to scientific research to game development.", points: ["Python is one of the most popular languages for data science and machine learning.", "Major websites and companies rely on Python code running behind the scenes every day."] },
      u2_intro: { title: "If Statements", blurb: "An if statement lets a program make a decision and run different code depending on a condition.", points: ["An if statement only runs its indented block of code when its condition evaluates to true.", "Without any matching condition, a program can simply skip past an entire block of code."] },
      u2_branchA: { title: "Comparison Operators", blurb: "Operators like ==, <, and > let a program compare two values.", points: ["The double equals sign (==) checks for equality, while a single equals sign assigns a value.", "Comparison operators always produce a boolean result: True or False."] },
      u2_branchB: { title: "Else & Elif", blurb: "Else and elif let a program handle multiple different possible conditions in order.", points: ["An elif lets a program check additional conditions only if the earlier ones were false.", "An else block acts as a catch-all, running only when none of the previous conditions matched."] },
      u2_branchC: { title: "Boolean Values", blurb: "A boolean is a value that's always either True or False, nothing in between.", points: ["Booleans are named after the mathematician George Boole, who first formalized this kind of logic.", "Almost every condition in a program, however complex, ultimately reduces to a single boolean value."] },
      u2_merge: { title: "Combining Conditions", blurb: "The and/or keywords let a single if statement check more than one condition at once.", points: ["The 'and' keyword requires both conditions to be true, while 'or' only needs one.", "Combining conditions lets a program check something like 'age over 18 AND has a ticket' in one line."] },
      u2_hub2: { title: "Conditions Built from Booleans", blurb: "Every comparison and every combined condition ultimately just evaluates down to True or False.", points: ["Even a complex nested set of conditions can be traced back to individual True/False comparisons.", "Understanding booleans deeply makes debugging complicated conditional logic much easier."] },
      sideQuestA: { title: "Comments in Code", blurb: "A comment is a note left in code that the computer ignores, meant only for humans reading it.", points: ["In Python, a comment starts with a hash symbol and is ignored when the program runs.", "Good comments explain why code does something, not just what it does."] },
      sideQuestB: { title: "Debugging Basics", blurb: "Debugging means carefully reading error messages and output to find out why code isn't working.", points: ["Error messages usually point to the exact line number where something went wrong.", "Reading an error message carefully, from the bottom up, is often the fastest way to understand it."] },
      u3_intro: { title: "Loops", blurb: "A loop repeats a block of code automatically instead of copying it over and over.", points: ["Loops prevent programmers from having to copy and paste the same code dozens of times.", "A poorly designed loop can accidentally run forever if its stopping condition is never met."] },
      u3_branchA: { title: "For Loops vs. While Loops", blurb: "A for loop repeats a set number of times, while a while loop repeats until a condition changes.", points: ["A for loop is ideal when you already know exactly how many times to repeat something.", "A while loop is ideal when you don't know in advance how many repetitions will be needed."] },
      u3_branchB: { title: "Lists", blurb: "A list stores many values together in a single ordered variable.", points: ["A single list can hold numbers, strings, or even other lists all together.", "Lists in Python can grow or shrink in size while the program is running."] },
      u3_branchC: { title: "List Indexing", blurb: "Each item in a list has a position number, called an index, starting from zero.", points: ["Because indexing starts at zero, the first item in a list is found at index 0, not 1.", "Trying to access an index beyond the end of a list causes an error."] },
      u3_merge: { title: "Looping Through Lists", blurb: "Loops and lists combine to let a program process many pieces of data automatically.", points: ["Looping through a list lets a program process every single item without writing repetitive code.", "This combination is one of the most common patterns in real-world programming."] },
      u3_hub2: { title: "Accessing List Items Directly", blurb: "Indexing lets you jump straight to one specific item in a list instead of looping through all of them.", points: ["Indexing is faster than looping when you already know exactly which item you need.", "Combining indexing with loops lets a program both process everything and jump to specific items when needed."] },
      u3_dead1: { title: "Dictionaries", blurb: "A dictionary stores data as labeled key-value pairs instead of a plain ordered list.", points: ["A dictionary looks up values by a meaningful key, like a name, instead of a numeric position.", "Dictionaries are ideal for storing information that naturally pairs a label with a value."] },
      u3_dead2: { title: "Importing Modules", blurb: "Importing a module gives your program instant access to code other people have already written.", points: ["Python's standard library includes dozens of built-in modules ready to import for free.", "Importing a module avoids reinventing code that thousands of other programmers already rely on."] },
      review: { title: "Functions", blurb: "A function packages up a block of code so it can be reused just by calling its name.", points: ["A function only needs to be written once but can be called as many times as needed.", "Breaking a program into functions makes it far easier to read, test, and fix."] }
    }
  },
  {
    id: "web-building-basics",
    title: "Web Building Basics",
    type: "Programming",
    yeargroups: "11-13",
    description: "Learn how HTML, CSS, and a touch of JavaScript combine to build a real web page.",
    medalNames: { test1: "HTML Helper", test2: "CSS Stylist", test3: "Layout Legend" },
    specialTitles: { test1: "HTML Check", test2: "CSS Check", test3: "Layout & Interactivity Check" },
    projects: {
      project1: {
        title: "Style Your Own Bio Page",
        brief: "Style an HTML page about yourself using at least five different CSS properties.",
        checklist: ["Write the HTML structure", "Apply 5+ CSS properties", "Preview it in a browser"]
      },
      project2: {
        title: "Build a Mini Portfolio Page",
        brief: "Build a small portfolio page with a flexible layout and at least one interactive element.",
        checklist: ["Use flexbox for layout", "Make it responsive", "Add one interactive element"]
      }
    },
    finalTitle: "Web Building Basics Final Exam",
    topics: {
      u1_intro: { title: "How Web Pages Work", blurb: "A browser reads HTML files and turns them into the page you see on screen.", points: ["A browser downloads a page's HTML file before it can display anything at all.", "The exact same HTML file will render identically in any standards-compliant browser."] },
      u1_branchA: { title: "HTML Structure", blurb: "Every HTML page is built from nested tags that describe the structure of the content.", points: ["Tags almost always come in pairs, with an opening tag and a matching closing tag.", "Nesting tags incorrectly can cause a page to display in unexpected ways."] },
      u1_branchB: { title: "Common HTML Tags", blurb: "Tags like headings, paragraphs, and links each describe a different kind of content.", points: ["Heading tags range from <h1>, the most important, down to <h6>, the least important.", "The <a> tag is specifically what creates a clickable link to another page."] },
      u1_branchC: { title: "Attributes in HTML", blurb: "An attribute adds extra information to a tag, like a link's destination or an image's source.", points: ["An attribute is written inside the opening tag itself, as a name and value pair.", "The same tag can behave very differently depending on which attributes are added to it."] },
      u1_merge: { title: "Building Your First Page", blurb: "Structure tags and content tags combine to build a complete, working web page.", points: ["A complete page usually needs a mix of structural tags and specific content tags working together.", "Even a very simple page benefits from being organized with clear, purposeful structure."] },
      u1_hub2: { title: "Tags and Attributes Together", blurb: "Most useful HTML tags rely on attributes to actually do anything beyond just displaying text.", points: ["A link tag without an href attribute technically exists but goes nowhere.", "Learning a tag's common attributes is often just as important as learning the tag itself."] },
      bonus1: { title: "Semantic HTML", blurb: "Choosing tags that describe meaning, not just appearance, makes pages easier to understand.", points: ["Tags like <header>, <nav>, and <footer> describe their purpose, not just their appearance.", "Search engines and screen readers both rely heavily on semantic tags to understand a page's structure."] },
      bonus2: { title: "Accessibility Basics", blurb: "Accessible web pages are built so people using screen readers or keyboards alone can still use them fully.", points: ["Alt text on an image lets a screen reader describe that image to a visually impaired visitor.", "A page that works well with just a keyboard is a strong sign of good accessibility."] },
      u2_intro: { title: "CSS Selectors", blurb: "A CSS selector targets exactly which HTML elements a style should apply to.", points: ["A selector can target a single element, every element of one type, or a specific class.", "Multiple CSS rules can sometimes conflict, with more specific selectors usually winning."] },
      u2_branchA: { title: "Colours, Fonts & Spacing", blurb: "CSS properties control the colours, fonts, and spacing of everything on the page.", points: ["CSS colours can be written as names, hex codes, or RGB values.", "Consistent spacing rules are often what makes a page feel clean and professional rather than cluttered."] },
      u2_branchB: { title: "The Box Model", blurb: "Every HTML element is treated as a box with content, padding, border, and margin.", points: ["Padding sits inside an element's border, while margin sits outside it.", "Misunderstanding the box model is a common source of confusing, unexpected page layouts."] },
      u2_branchC: { title: "CSS Classes & IDs", blurb: "Classes and IDs let a CSS selector target one specific element or a whole group of them.", points: ["A class can be reused on many elements, while an ID should only ever be used once per page.", "Classes are generally preferred for styling since they're more flexible and reusable."] },
      u2_merge: { title: "Styling a Full Page", blurb: "Selectors and the box model together let you style an entire page consistently.", points: ["Consistent selectors and a clear grasp of the box model together prevent most common layout bugs.", "A well-styled page usually relies on just a handful of reusable classes rather than one-off styles everywhere."] },
      u2_hub2: { title: "Targeting Elements Precisely", blurb: "Classes and IDs are what let styling rules apply exactly where you want, instead of everywhere at once.", points: ["Overusing IDs for styling can make a stylesheet harder to maintain and reuse later.", "Precise targeting with classes is what allows large websites to stay visually consistent."] },
      sideQuestA: { title: "Images on the Web", blurb: "The <img> tag and alt text together control both how an image looks and what it means to someone who can't see it.", points: ["Missing alt text means a screen reader has nothing meaningful to describe about that image.", "Compressing images properly keeps a page loading quickly without looking noticeably worse."] },
      sideQuestB: { title: "Links & Navigation", blurb: "Links are what turn separate web pages into one connected, navigable website.", points: ["A broken link, pointing to a page that no longer exists, is a common and frustrating web issue.", "Clear navigation menus are often what determines whether visitors can actually find what they're looking for."] },
      u3_intro: { title: "Flexbox Layout Basics", blurb: "Flexbox arranges elements in a row or column and controls how they share space.", points: ["Flexbox can instantly center content both horizontally and vertically with just a couple of properties.", "Before flexbox, achieving simple layouts like this required much more complicated workarounds."] },
      u3_branchA: { title: "Responsive Layout Basics", blurb: "A responsive layout adjusts itself so a page still looks good on any screen size.", points: ["A responsive layout might stack elements vertically on a phone but arrange them side by side on a desktop.", "Testing a page at multiple screen widths is essential to confirm a layout is genuinely responsive."] },
      u3_branchB: { title: "Basic Interactivity with JavaScript", blurb: "A small bit of JavaScript can make a page respond to clicks and other actions.", points: ["A single line of JavaScript can change text, hide an element, or respond to a button click.", "JavaScript is what turns a static page into one that can react to what a user actually does."] },
      u3_branchC: { title: "Media Queries", blurb: "A media query lets CSS apply different rules depending on the size of the screen viewing the page.", points: ["A media query might apply special styles only when the screen is narrower than a certain width.", "Media queries are the core mechanism behind virtually every mobile-friendly website."] },
      u3_merge: { title: "Putting a Page Together", blurb: "Layout, responsiveness, and a touch of interactivity together make a page feel modern.", points: ["A polished modern page typically blends flexible layout, thoughtful styling, and a touch of interactivity.", "Skipping any one of these three elements usually makes a page feel noticeably dated."] },
      u3_hub2: { title: "Responsive Design in Practice", blurb: "Media queries are the actual mechanism behind every responsive layout you've ever used.", points: ["Flexbox handles the flexible arrangement, while media queries decide exactly when that arrangement should change.", "Together, these two tools are what let one single page look great on both a phone and a desktop monitor."] },
      u3_dead1: { title: "Forms & Inputs", blurb: "HTML forms collect information from a user, like text, checkboxes, or button clicks.", points: ["Different input types, like email or number, can automatically validate what a user types.", "A form needs a way to actually submit its data somewhere, usually to a server."] },
      u3_dead2: { title: "Web Hosting Basics", blurb: "Hosting is simply storing your website's files on a server so anyone can visit it online.", points: ["A domain name and web hosting are actually two separate services that typically work together.", "Without hosting, a finished website exists only on the creator's own computer."] },
      review: { title: "From Structure to Style to Behaviour", blurb: "HTML, CSS, and JavaScript are the three languages that together build every website you visit.", points: ["Nearly every website you've ever visited relies on this exact same three-layer combination.", "Learning all three languages together is what turns a static mockup into a fully working website."] }
    }
  },
  {
    id: "scratch-and-block-coding",
    title: "Scratch & Block Coding",
    type: "Programming",
    yeargroups: "3-6",
    description: "Snap blocks together to build animations and simple games — no typing required.",
    medalNames: { test1: "Block Beginner", test2: "Loop Learner", test3: "Game Logic Guru" },
    specialTitles: { test1: "Block Coding Basics Check", test2: "Loops & Events Check", test3: "Game Logic Check" },
    projects: {
      project1: {
        title: "Animate a Sprite",
        brief: "Use loops and costume changes to make a sprite perform a short repeating animation.",
        checklist: ["Use a loop block", "Change costumes at least twice", "Trigger it with an event"]
      },
      project2: {
        title: "Build a Catch-the-Object Game",
        brief: "Build a simple game where a sprite catches falling objects and a variable tracks the score.",
        checklist: ["Add a falling object", "Detect when it's caught", "Update a score variable"]
      }
    },
    finalTitle: "Scratch & Block Coding Final Exam",
    topics: {
      u1_intro: { title: "What is Block Coding?", blurb: "Block coding snaps together instruction blocks like puzzle pieces instead of typing text.", points: ["Because blocks only fit together in valid ways, block coding avoids many typing-based syntax errors.", "Block coding is often used to teach the same core ideas found in text-based programming languages."] },
      u1_branchA: { title: "Sprites & the Stage", blurb: "A sprite is a character or object that moves and acts on the stage.", points: ["A single Scratch project can contain many different sprites acting independently at the same time.", "The stage is the visible area where every sprite's actions actually play out."] },
      u1_branchB: { title: "Motion Blocks", blurb: "Motion blocks tell a sprite exactly how far and which direction to move.", points: ["Motion blocks can move a sprite by a set number of steps or to an exact coordinate.", "Combining several motion blocks in sequence can create a smooth, complex path of movement."] },
      u1_branchC: { title: "Looks Blocks", blurb: "Looks blocks change how a sprite appears, like its size, visibility, or speech bubble.", points: ["A 'say' block can make a sprite display a speech bubble with custom text.", "Looks blocks can also change a sprite's size or make it appear and disappear."] },
      u1_merge: { title: "Making a Sprite Move", blurb: "Combining sprites with motion blocks is the very first step toward an animation or game.", points: ["Even a simple animation usually combines several motion blocks working in sequence.", "Testing a sprite's movement early helps catch mistakes before adding more complexity."] },
      u1_hub2: { title: "Moving and Changing Appearance", blurb: "Motion and looks blocks together are what make a sprite feel like a real character.", points: ["A sprite that both moves and changes its look feels far more alive than one that only does one or the other.", "Many simple animations are really just motion and looks blocks layered together cleverly."] },
      bonus1: { title: "Costume Changes", blurb: "Switching a sprite's costume can make it look like it's walking, jumping, or talking.", points: ["Switching quickly between two similar costumes is a classic trick for simulating a walking animation.", "A sprite can have many costumes prepared in advance, ready to switch between at any moment."] },
      bonus2: { title: "Sound Blocks", blurb: "Sound blocks let a sprite play notes or recorded sounds in time with the action on screen.", points: ["Sound blocks can play a note, a recorded clip, or an entire background track.", "Timing sound effects to match on-screen actions makes a project feel much more polished."] },
      u2_intro: { title: "Loops in Block Coding", blurb: "A repeat block runs the same set of blocks over and over automatically.", points: ["A repeat block set to a specific number will run its contents exactly that many times before stopping.", "Loops are one of the biggest time-savers available once a project needs repeated actions."] },
      u2_branchA: { title: "Forever Loops", blurb: "A forever block keeps repeating its blocks until the program is stopped.", points: ["A forever loop is ideal for actions that should never stop, like a background animation.", "Placing a stopping condition inside a forever loop is one way to eventually break out of it."] },
      u2_branchB: { title: "Events & Triggers", blurb: "An event block, like 'when clicked', starts a whole sequence of actions.", points: ["The green flag click is the most common event used to start an entire Scratch project.", "Different sprites can each respond independently to the very same triggering event."] },
      u2_branchC: { title: "Wait Blocks", blurb: "A wait block pauses a script for a set amount of time before continuing.", points: ["A wait block set to zero seconds effectively causes almost no noticeable pause at all.", "Wait blocks are often used to time an animation so it doesn't happen too quickly to see."] },
      u2_merge: { title: "Loops and Events Together", blurb: "Events start the action, and loops keep it going without extra blocks.", points: ["An event like a key press can trigger a loop that then keeps a sprite moving continuously.", "This combination is the backbone of almost every interactive Scratch project."] },
      u2_hub2: { title: "Timing Actions Precisely", blurb: "Wait blocks combined with loops and events control exactly when and how often something happens.", points: ["Precise timing, using waits inside loops triggered by events, is what separates a smooth project from a jerky one.", "Small timing adjustments can make a huge difference in how professional a final project feels."] },
      sideQuestA: { title: "Broadcast Messages", blurb: "A broadcast lets one sprite send a signal that tells other sprites to start doing something.", points: ["A broadcast can be received by every sprite in the project, or just the ones listening for it.", "Broadcasts let sprites communicate and coordinate without being directly connected to each other."] },
      sideQuestB: { title: "Multiple Sprites Together", blurb: "Broadcasts and events let many separate sprites act like one coordinated program.", points: ["A game with several sprites often relies entirely on broadcasts to keep their actions synchronized.", "Without broadcasts, coordinating many independent sprites would require far more complicated workarounds."] },
      u3_intro: { title: "If-Then Blocks", blurb: "An if-then block only runs its blocks when a certain condition is true.", points: ["An if-then block can check something like whether a sprite is touching another object.", "Some if-then blocks include an else option for what happens when the condition is false."] },
      u3_branchA: { title: "Variables in Scratch", blurb: "A variable block stores a changing value, like a score, that the program can track.", points: ["A variable's current value can be displayed directly on the stage as the project runs.", "Any sprite in the project can typically read or change a shared variable's value."] },
      u3_branchB: { title: "Keeping Score", blurb: "Combining variables with if-then blocks lets a game track and update a score.", points: ["A typical scoring system checks a condition, then adds to a variable when that condition is met.", "Displaying the score variable on stage gives players immediate feedback on their progress."] },
      u3_branchC: { title: "Operators in Scratch", blurb: "Operator blocks do math or comparisons, like adding numbers or checking if a score is high enough.", points: ["Operator blocks can add, subtract, or compare values, feeding directly into if-then conditions.", "Combining operators with variables is what allows a game to calculate things like a countdown timer."] },
      u3_merge: { title: "Building Simple Game Logic", blurb: "Conditions and variables together are the foundation of almost every simple game.", points: ["Nearly every playable Scratch game boils down to conditions checking and updating a handful of variables.", "Mastering this combination is the single biggest step toward building any original game."] },
      u3_hub2: { title: "Math-Driven Game Logic", blurb: "Operators are what let a variable like a score actually be calculated, not just displayed.", points: ["Operators let a game calculate a genuinely dynamic score rather than just adding a fixed number each time.", "This combination of math and conditions is what powers scoring, timers, and difficulty scaling in most simple games."] },
      u3_dead1: { title: "Cloning Sprites", blurb: "Cloning creates a temporary copy of a sprite while a project is running, without adding a whole new costume.", points: ["Clones are useful for effects like falling objects or bullets without manually creating dozens of separate sprites.", "Each clone can run its own independent scripts while the project is active."] },
      u3_dead2: { title: "Sharing a Scratch Project", blurb: "A finished Scratch project can be shared online for anyone else to play or even remix.", points: ["Shared projects can be viewed, played, and even remixed by anyone in the Scratch community.", "Seeing how other creators remixed a shared project is a great way to learn new techniques."] },
      review: { title: "From Blocks to Real Code", blurb: "Every block you've used has a direct equivalent in text-based coding languages like Python.", points: ["A repeat block in Scratch corresponds directly to a for loop in a language like Python.", "Learning block coding first builds the exact same logical thinking needed for text-based programming later."] }
    }
  },
  {
    id: "data-and-algorithms-basics",
    title: "Data & Algorithms Basics",
    type: "Programming",
    yeargroups: "12-13",
    description: "Think like a computer scientist: algorithms, searching, and sorting.",
    medalNames: { test1: "Algorithm Apprentice", test2: "Search Specialist", test3: "Sorting Savant" },
    specialTitles: { test1: "Algorithms Basics Check", test2: "Searching Check", test3: "Sorting Check" },
    projects: {
      project1: {
        title: "Race Two Search Methods",
        brief: "Describe a linear search and a binary search on the same list, and compare how many steps each takes.",
        checklist: ["Describe linear search steps", "Describe binary search steps", "Compare which is faster and why"]
      },
      project2: {
        title: "Sort It Yourself",
        brief: "Manually perform a bubble sort on a list of 8 numbers, showing every swap step.",
        checklist: ["Write the starting list", "Show each swap step", "Write the final sorted list"]
      }
    },
    finalTitle: "Data & Algorithms Basics Final Exam",
    topics: {
      u1_intro: { title: "What is an Algorithm?", blurb: "An algorithm is simply a step-by-step set of instructions for solving a problem.", points: ["A recipe is a familiar, everyday example of an algorithm most people already follow.", "An algorithm must eventually finish and produce a result — it can't run forever by design."] },
      u1_branchA: { title: "Describing Algorithms with Pseudocode", blurb: "Pseudocode describes an algorithm's steps in plain language before writing real code.", points: ["Pseudocode uses everyday language structured like code, without worrying about exact programming syntax.", "Writing pseudocode first often reveals logical gaps before any real code gets written."] },
      u1_branchB: { title: "Flowcharts", blurb: "A flowchart uses shapes and arrows to visually map out an algorithm's steps and decisions.", points: ["A diamond shape in a flowchart traditionally represents a decision point with multiple possible paths.", "Flowcharts make it easy to visually spot where a process branches or loops back."] },
      u1_branchC: { title: "Algorithm Inputs & Outputs", blurb: "Every algorithm takes some input and is expected to produce a specific, defined output.", points: ["The exact same algorithm can be tested repeatedly by trying it against several different sets of inputs.", "A well-designed algorithm's output should be predictable and consistent for a given input."] },
      u1_merge: { title: "From Idea to Algorithm", blurb: "Pseudocode and flowcharts both turn a vague idea into a precise, followable plan.", points: ["Choosing pseudocode or a flowchart often comes down to personal preference or the complexity of the problem.", "Both approaches force a programmer to think through the logic before writing actual code."] },
      u1_hub2: { title: "Designing a Complete Algorithm", blurb: "A solid algorithm design always accounts for its inputs and outputs before a single step is written.", points: ["Forgetting to consider all possible inputs is a common cause of algorithms that fail unexpectedly.", "A complete algorithm design also considers what should happen with invalid or unexpected input."] },
      bonus1: { title: "Everyday Algorithms", blurb: "Recipes, driving directions, and morning routines are all algorithms you already use.", points: ["A morning routine followed in the same order every day is functionally identical to a computer algorithm.", "Recognising algorithms in daily life makes the computer science concept feel far less abstract."] },
      bonus2: { title: "Algorithms in Apps", blurb: "Every recommendation, search result, and route you're shown is the output of an algorithm.", points: ["A recommendation algorithm typically analyzes past behaviour to predict what a user might want next.", "The exact algorithms behind major recommendation systems are often closely guarded company secrets."] },
      u2_intro: { title: "Searching Algorithms", blurb: "A searching algorithm finds a specific item within a larger collection of data.", points: ["Choosing the right search algorithm can make an enormous difference in how quickly an answer is found.", "Every search algorithm ultimately compares the target value against items already in the collection."] },
      u2_branchA: { title: "Linear Search", blurb: "A linear search checks every item one by one until it finds a match.", points: ["A linear search works correctly on both sorted and unsorted data.", "In the worst case, a linear search must check every single item before finding a match or confirming there isn't one."] },
      u2_branchB: { title: "Binary Search", blurb: "A binary search repeatedly halves a sorted list to find an item much faster.", points: ["Binary search only works correctly if the underlying data is already sorted.", "Halving the search space repeatedly lets binary search find an item incredibly quickly, even in huge datasets."] },
      u2_branchC: { title: "Data Structures Basics", blurb: "A data structure is simply an organized way of storing data so it can be used efficiently.", points: ["Choosing the right data structure can make certain operations dramatically faster or slower.", "Lists, stacks, and queues are all examples of commonly used data structures."] },
      u2_merge: { title: "Comparing Search Methods", blurb: "Binary search is far faster than linear search, but only works on already-sorted data.", points: ["Sorting data first can be worth the extra effort if many binary searches will be performed afterward.", "Choosing between linear and binary search often comes down to whether the data is already sorted."] },
      u2_hub2: { title: "Search Speed and Data Structure", blurb: "How fast a search algorithm runs often depends entirely on how the data was structured beforehand.", points: ["A poorly chosen data structure can make even a fast search algorithm perform sluggishly overall.", "Thinking about data structure and search algorithm together is essential for genuinely efficient programs."] },
      sideQuestA: { title: "Time Complexity", blurb: "Time complexity describes how much slower an algorithm gets as the amount of data grows.", points: ["An algorithm described as O(n) roughly doubles its running time when the data size doubles.", "Time complexity helps programmers predict how an algorithm will scale before ever running it on huge data."] },
      sideQuestB: { title: "Best, Worst & Average Case", blurb: "The same algorithm can perform very differently depending on how the input happens to be arranged.", points: ["A linear search's best case happens when the target is the very first item checked.", "Programmers often plan primarily around an algorithm's worst-case performance to be safe."] },
      u3_intro: { title: "Sorting Algorithms", blurb: "A sorting algorithm rearranges data into a specific order, like smallest to largest.", points: ["Sorting data first often makes many later operations, like searching, dramatically faster.", "There are dozens of different sorting algorithms, each with its own strengths and weaknesses."] },
      u3_branchA: { title: "Bubble Sort", blurb: "Bubble sort repeatedly swaps neighbouring items until the whole list is in order.", points: ["Bubble sort is simple to understand but becomes quite slow on very large lists.", "Each full pass of a bubble sort moves at least one item into its final correct position."] },
      u3_branchB: { title: "Efficiency & Big Picture Thinking", blurb: "Some algorithms handle huge amounts of data far more efficiently than others.", points: ["An inefficient algorithm might work fine on small data but fail dramatically as data grows into the millions.", "Thinking about efficiency early can save enormous computing time and cost later."] },
      u3_branchC: { title: "Recursion Basics", blurb: "A recursive algorithm solves a problem by calling a smaller version of itself.", points: ["A recursive function must include a stopping condition, or it will call itself forever.", "Recursion is often a natural fit for problems that are themselves made of smaller, similar sub-problems."] },
      u3_merge: { title: "Choosing the Right Algorithm", blurb: "The best algorithm depends on the size of the data and how it needs to be used.", points: ["A small dataset might not need a highly efficient algorithm at all, since the difference is negligible.", "Choosing an algorithm always involves weighing simplicity against raw performance."] },
      u3_hub2: { title: "Recursive Thinking in Algorithms", blurb: "Recursion is an alternative way of achieving what a loop does, often suited to naturally repeating problems.", points: ["Some problems, like navigating a tree structure, are dramatically simpler to solve recursively than with a loop.", "Recursion and loops can often solve the exact same problem, just with a different style of thinking."] },
      u3_dead1: { title: "Big O Notation", blurb: "Big O notation is a shorthand way to describe how an algorithm's speed scales as data grows.", points: ["Big O notation focuses on how performance scales, not on the exact number of seconds an algorithm takes.", "Two algorithms with the same Big O can still have very different real-world speeds due to other factors."] },
      u3_dead2: { title: "Algorithms in Everyday Software", blurb: "Every app on your phone runs on dozens of algorithms working together behind the scenes.", points: ["A single phone app might rely on dozens of different algorithms for search, sorting, and recommendations.", "Even something as simple as unlocking a phone with your face relies on complex algorithms behind the scenes."] },
      review: { title: "Thinking Like a Computer Scientist", blurb: "Breaking a problem into algorithms is a skill that goes far beyond just writing code.", points: ["Breaking a big problem into smaller, well-defined steps is useful far beyond just writing code.", "This kind of structured thinking is valuable in fields well outside computer science entirely."] }
    }
  },
  {
    id: "spanish-foundations",
    title: "Spanish Foundations",
    type: "Languages",
    yeargroups: "6-8",
    description: "Start speaking Spanish with greetings, family vocabulary, and simple conversation.",
    medalNames: { test1: "Spanish Starter", test2: "Vocabulario Victor", test3: "Conversador" },
    specialTitles: { test1: "Basics Check", test2: "Vocabulary & Verbs Check", test3: "Conversation Check" },
    projects: {
      project1: {
        title: "Describe Your Family",
        brief: "Write five sentences describing your family using the vocabulary and verbs you've learned.",
        checklist: ["Write 5 sentences", "Use 3+ family words", "Use a present tense verb"]
      },
      project2: {
        title: "Write a Mini Dialogue",
        brief: "Write a short dialogue between two people asking about likes and daily routine.",
        checklist: ["Write 6+ lines", "Include a question", "Include 'me gusta'"]
      }
    },
    finalTitle: "Spanish Foundations Final Exam",
    topics: {
      u1_intro: { title: "Greetings & Introductions", blurb: "\"Hola\" and \"Me llamo...\" are the first phrases used to greet someone and say your name.", points: ["'Buenos días' and 'Buenas noches' are used depending on the time of day.", "Adding '¿Y tú?' after answering a greeting politely asks the same question back."] },
      u1_branchA: { title: "Numbers 1-20", blurb: "Counting from uno to veinte is one of the very first building blocks of a new language.", points: ["Numbers 16 through 19 are built by combining 'diez y' with the ones digit, like dieciséis.", "Knowing numbers 1-20 is essential before learning to tell time or prices."] },
      u1_branchB: { title: "Days & Months", blurb: "Los días de la semana and los meses del año let you talk about when things happen.", points: ["In Spanish, days of the week and months are not capitalized unless they start a sentence.", "'La semana' starts on Monday in most Spanish-speaking countries, unlike the English convention."] },
      u1_branchC: { title: "Telling Time in Spanish", blurb: "Telling time in Spanish uses its own set phrases, distinct from just reciting numbers.", points: ["Spanish uses 'Es la una' for one o'clock but 'Son las...' for every other hour.", "Telling time also uses phrases like 'y media' for half past the hour."] },
      u1_merge: { title: "Talking About Dates", blurb: "Combining numbers with days and months lets you say a full date in Spanish.", points: ["A full Spanish date typically states the day number first, then the month, unlike English.", "Combining numbers with days and months lets you say things like 'el cinco de mayo'."] },
      u1_hub2: { title: "Time, Dates & Schedules", blurb: "Telling time and talking about dates together let you describe a full daily schedule.", points: ["Describing a weekly schedule in Spanish naturally combines both time phrases and day names.", "This combination is one of the most practical everyday uses of numbers in Spanish."] },
      bonus1: { title: "Spanish Tongue Twisters", blurb: "Trabalenguas are a fun, silly way to practice tricky Spanish pronunciation.", points: ["A classic trabalenguas is 'tres tristes tigres', which trains the rolled 'r' sound.", "Practicing tongue twisters helps build muscle memory for tricky Spanish sounds."] },
      bonus2: { title: "Spanish Around the World", blurb: "Spanish is an official language across more than twenty countries on multiple continents.", points: ["Spanish is the official language of most countries in South and Central America.", "Regional accents and vocabulary can vary noticeably between Spain and Latin America."] },
      u2_intro: { title: "Family Vocabulary", blurb: "Words like madre, padre, and hermano let you describe your family members.", points: ["Words like abuela and abuelo let you describe grandparents specifically.", "Family vocabulary is often among the very first topics taught in a new language."] },
      u2_branchA: { title: "Simple Present Tense Verbs", blurb: "Regular -ar verbs like hablar follow a predictable pattern in the present tense.", points: ["Regular -ar verbs like hablar change their ending based on who is doing the action.", "Once the -ar pattern is learned, it applies consistently to dozens of other verbs."] },
      u2_branchB: { title: "Describing People", blurb: "Adjectives like alto, bajo, and simpático describe what someone looks or acts like.", points: ["Spanish adjectives must match the gender and number of the noun they describe.", "An adjective describing a group of women would end differently than one describing a group of men."] },
      u2_branchC: { title: "Ser vs. Estar", blurb: "Spanish uses two different verbs for 'to be' depending on whether something is permanent or temporary.", points: ["Ser is generally used for permanent traits, like nationality, while estar is used for temporary states, like feelings.", "Confusing ser and estar is one of the most common mistakes for English speakers learning Spanish."] },
      u2_merge: { title: "Describing Your Family", blurb: "Family vocabulary, verbs, and adjectives combine to describe your whole family in Spanish.", points: ["Describing a family member well usually means combining a noun, an adjective, and the correct form of ser or estar.", "This combination is exactly the kind of sentence tested in the Describe Your Family project."] },
      u2_hub2: { title: "Describing People Correctly", blurb: "Choosing between ser and estar is one of the trickiest parts of describing people accurately in Spanish.", points: ["Choosing the wrong verb between ser and estar can genuinely change a sentence's meaning.", "Native speakers rely on this distinction constantly without even thinking about it."] },
      sideQuestA: { title: "Colours in Spanish", blurb: "Colour words like rojo and azul are some of the most useful early adjectives to learn.", points: ["Colour adjectives in Spanish also change their ending to match the noun's gender.", "Rojo becomes roja when describing a feminine noun, like 'la manzana roja'."] },
      sideQuestB: { title: "Describing Objects", blurb: "Adjectives in Spanish usually come after the noun they describe, unlike in English.", points: ["Saying 'the red car' in Spanish literally translates to 'the car red'.", "A few Spanish adjectives, like 'bueno', can actually come before the noun in certain expressions."] },
      u3_intro: { title: "Asking Questions", blurb: "Question words like qué, dónde, and cuándo let you ask for the information you need.", points: ["Spanish question words always carry a written accent mark, like qué and dónde.", "Spanish questions are also marked with an upside-down question mark at the start."] },
      u3_branchA: { title: "Talking About Likes", blurb: "\"Me gusta...\" is the key phrase for saying what you like in Spanish.", points: ["'Me gusta' literally translates closer to 'it is pleasing to me' than a direct 'I like'.", "The verb changes to 'me gustan' when talking about liking more than one thing."] },
      u3_branchB: { title: "Talking About Daily Routine", blurb: "Simple present tense verbs describe what you do every day, step by step.", points: ["Describing a routine usually strings together several present tense verbs in sequence.", "Common routine verbs include desayunar, estudiar, and dormir."] },
      u3_branchC: { title: "Reflexive Verbs", blurb: "Reflexive verbs describe actions you do to yourself, like 'me levanto' (I get myself up).", points: ["A reflexive verb needs a matching pronoun, like 'me', 'te', or 'se', before the verb.", "Many daily routine actions in Spanish, like waking up or getting dressed, are expressed reflexively."] },
      u3_merge: { title: "Having a Basic Conversation", blurb: "Questions, likes, and routines combine into a real, basic back-and-forth conversation.", points: ["A genuine conversation usually mixes questions, opinions, and routine descriptions together naturally.", "Real conversations rarely stick to just one grammar topic at a time."] },
      u3_hub2: { title: "Daily Routine with Reflexive Verbs", blurb: "Most daily routine vocabulary in Spanish actually depends on reflexive verbs.", points: ["Without reflexive verbs, describing a typical morning routine in Spanish would sound noticeably incomplete.", "This is why reflexive verbs are considered essential vocabulary for everyday conversation."] },
      u3_dead1: { title: "Spanish Greetings by Time of Day", blurb: "Spanish has different greetings depending on whether it's morning, afternoon, or evening.", points: ["'Buenas tardes' is used from roughly midday until evening.", "Getting the time-of-day greeting right is a small detail that makes speech sound more natural."] },
      u3_dead2: { title: "Common Spanish Expressions", blurb: "Fixed expressions like 'no pasa nada' don't translate word-for-word but are used constantly in conversation.", points: ["'No pasa nada' is used to casually reassure someone that everything is fine.", "Learning fixed expressions like these helps a learner sound far more natural than translating word-for-word."] },
      review: { title: "Building Real Confidence", blurb: "Every phrase you've learned combines into the confidence to have a real conversation in Spanish.", points: ["Ordering food, describing family, and asking questions all draw on the exact same vocabulary learned here.", "Real fluency comes from combining small pieces, like these, into flexible, natural conversation."] }
    }
  },
  {
    id: "french-conversation-starters",
    title: "French Conversation Starters",
    type: "Languages",
    yeargroups: "9-11",
    description: "Move beyond vocabulary into real, practical French conversations across all three tenses.",
    medalNames: { test1: "Causerie Starter", test2: "Dialogue Champion", test3: "Temps Master" },
    specialTitles: { test1: "Conversation Basics Check", test2: "Dialogue Check", test3: "Tenses Check" },
    projects: {
      project1: {
        title: "Write a Dialogue",
        brief: "Write and perform a short dialogue between two friends making weekend plans.",
        checklist: ["Write 6+ lines of dialogue", "Include a suggestion", "Include an agreement or excuse"]
      },
      project2: {
        title: "Tell Your Weekend Story",
        brief: "Write a short story about last weekend, this week, and next weekend using all three tenses.",
        checklist: ["Describe last weekend", "Describe this week", "Describe next weekend's plans"]
      }
    },
    finalTitle: "French Conversation Starters Final Exam",
    topics: {
      u1_intro: { title: "Everyday Greetings", blurb: "\"Bonjour\" and \"Ça va?\" are used constantly in everyday French conversation.", points: ["'Ça va?' can be both a question and part of the answer, like 'Ça va bien'.", "French greetings often change slightly depending on how formal or casual the situation is."] },
      u1_branchA: { title: "Ordering Food & Drink", blurb: "\"Je voudrais...\" is the polite way to order food or drink at a café.", points: ["'Je voudrais' is considered more polite than the more direct 'je veux'.", "Adding 's'il vous plaît' at the end of an order is standard French café etiquette."] },
      u1_branchB: { title: "Asking for Directions", blurb: "Phrases like \"Où est...?\" let you ask where something is located.", points: ["'Où est...?' can be used for asking about almost any specific place or object.", "Understanding basic directional words, like 'à gauche' and 'à droite', is essential for following the answer."] },
      u1_branchC: { title: "Numbers & Prices", blurb: "Understanding numbers is essential the moment you need to pay for anything in French.", points: ["French numbers between 70 and 99 famously combine addition, like 'quatre-vingt-dix' for ninety.", "Understanding prices quickly is essential the moment you're handed a café bill."] },
      u1_merge: { title: "Roleplay: At a Café", blurb: "Greetings and ordering phrases combine naturally in a real café conversation.", points: ["A realistic café roleplay usually combines a greeting, an order, and a question about price.", "Practicing this exact scenario is one of the most useful early conversation exercises."] },
      u1_hub2: { title: "Paying at a Café", blurb: "Ordering, asking questions, and understanding prices all come together the moment the bill arrives.", points: ["Understanding the numbers is what makes the final step of any café interaction actually work.", "This moment often reveals gaps in number knowledge that flashcards alone might not catch."] },
      bonus1: { title: "French Idioms", blurb: "Idioms like \"avoir le cafard\" mean something very different from their literal words.", points: ["'Avoir le cafard' literally means 'to have the cockroach' but actually means feeling down.", "Idioms like these are a fun way to sound more like a native speaker."] },
      bonus2: { title: "French Around the World", blurb: "French is spoken as an official language across dozens of countries, especially in Africa.", points: ["French is an official language in many West and Central African countries.", "Quebec, in Canada, is one of the largest French-speaking regions outside of Europe."] },
      u2_intro: { title: "Talking About Hobbies", blurb: "\"J'aime...\" and \"Je n'aime pas...\" let you share what you do and don't enjoy.", points: ["French hobby verbs are often followed directly by an infinitive, like 'j'aime lire'.", "Sharing hobbies is one of the most natural ways to start a longer conversation."] },
      u2_branchA: { title: "Making Plans with Friends", blurb: "Suggesting an activity and agreeing on a time is a key everyday conversation skill.", points: ["Suggesting a time and place together makes a plan far more concrete than a vague suggestion.", "'On y va?' is a casual, common way to suggest going somewhere together."] },
      u2_branchB: { title: "Talking About the Weather", blurb: "Weather small talk, like \"il fait beau\", is one of the most common conversation starters.", points: ["'Il fait beau' and 'il pleut' are two of the most commonly used weather expressions.", "Weather talk is often used specifically as a safe, easy conversation starter."] },
      u2_branchC: { title: "Talking About Family & Friends", blurb: "Simple possessive words like 'mon' and 'ma' let you talk naturally about your own family and friends.", points: ["Possessive words like 'mon', 'ma', and 'mes' must match the gender and number of the noun that follows.", "Talking naturally about people close to you is one of the most common everyday conversation topics."] },
      u2_merge: { title: "Casual Everyday Chat", blurb: "Hobbies, plans, and weather together make up the bulk of everyday casual French conversation.", points: ["A typical casual chat blends hobbies, weather, and small updates about friends or family.", "This blend of topics is exactly what makes small talk feel natural rather than scripted."] },
      u2_hub2: { title: "Personal Small Talk", blurb: "Family, weather, and plans together make up almost all casual small talk in French.", points: ["Being able to shift smoothly between these topics is a strong sign of growing conversational fluency.", "Native speakers rarely stick to just one small talk topic for long."] },
      sideQuestA: { title: "Polite Requests", blurb: "Adding 's'il vous plaît' turns almost any request into a polite one in French.", points: ["'S'il vous plaît' is the formal version, while 's'il te plaît' is used with people you know well.", "Adding this simple phrase noticeably softens almost any request in French."] },
      sideQuestB: { title: "Saying Goodbye", blurb: "French has several ways to say goodbye, from casual 'salut' to formal 'au revoir'.", points: ["'À bientôt' specifically implies you expect to see the person again soon.", "Choosing the right goodbye, casual or formal, matches the same etiquette as greetings."] },
      u3_intro: { title: "Past Tense Basics", blurb: "The passé composé is used to talk about things that already happened.", points: ["The passé composé is usually built from a helper verb plus a past participle.", "Most French verbs use 'avoir' as their helper verb in the passé composé, though some use 'être'."] },
      u3_branchA: { title: "Talking About Your Weekend", blurb: "The passé composé lets you describe what you did over the weekend.", points: ["Describing a weekend naturally strings together several passé composé verbs in sequence.", "This is one of the most common real-life uses of the past tense in casual conversation."] },
      u3_branchB: { title: "Future Plans", blurb: "\"Je vais...\" is a simple way to talk about what you're going to do soon.", points: ["'Je vais' followed by an infinitive is the simplest way to talk about the near future.", "This near-future structure is easier for beginners than the more complex full future tense."] },
      u3_branchC: { title: "Adverbs of Time", blurb: "Words like 'hier', 'aujourd'hui', and 'demain' anchor a sentence firmly to yesterday, today, or tomorrow.", points: ["'Hier' means yesterday, while 'demain' means tomorrow — easy to confuse for beginners.", "These adverbs are what make it immediately clear which part of a story is being told."] },
      u3_merge: { title: "Past, Present & Future Together", blurb: "Combining past, present, and future tense lets you tell a full, connected story.", points: ["A well-told short story usually moves clearly between what happened, what's happening, and what's next.", "This is exactly the structure tested in the Tell Your Weekend Story project."] },
      u3_hub2: { title: "Anchoring a Story in Time", blurb: "Adverbs of time are what make it clear which tense a story is actually happening in.", points: ["Without a time adverb, a French sentence's tense alone doesn't always make the timing crystal clear.", "Native speakers rely on these small words constantly to keep a story easy to follow."] },
      u3_dead1: { title: "French Numbers Above 20", blurb: "French numbers above 60 use an unusual counting pattern based on twenties, unlike English.", points: ["Belgium and Switzerland actually use simpler number words than France for 70, 80, and 90.", "This quirky counting system is one of the most famously tricky parts of learning French."] },
      u3_dead2: { title: "Formal vs. Informal French", blurb: "French has two completely different words for 'you' depending on how formal the situation is.", points: ["'Tu' is used with friends, family, and children, while 'vous' is used with strangers or in formal settings.", "Using 'tu' with the wrong person can come across as rude or overly familiar."] },
      review: { title: "Real Conversations", blurb: "Every skill here — greetings, chat, and tenses — combines into a genuinely real conversation.", points: ["A real French conversation blends greetings, small talk, and multiple tenses without a second thought.", "This ability to blend everything together fluidly is the actual goal behind all these individual lessons."] }
    }
  },
  {
    id: "german-essentials",
    title: "German Essentials",
    type: "Languages",
    yeargroups: "7-9",
    description: "Greetings, gendered nouns, and everyday conversation to get started in German.",
    medalNames: { test1: "German Starter", test2: "Nomen Novize", test3: "Gesprächs-Genie" },
    specialTitles: { test1: "Basics Check", test2: "Nouns & Verbs Check", test3: "Conversation Check" },
    projects: {
      project1: {
        title: "Describe Your Family in German",
        brief: "Write five sentences describing your family, using the correct gender for each noun.",
        checklist: ["Write 5 sentences", "Use correct noun genders", "Use a present tense verb"]
      },
      project2: {
        title: "Café Roleplay Dialogue",
        brief: "Write a short dialogue between a customer and a waiter at a German café.",
        checklist: ["Write 6+ lines", "Include an order", "Include a question"]
      }
    },
    finalTitle: "German Essentials Final Exam",
    topics: {
      u1_intro: { title: "Greetings & Basics", blurb: "\"Hallo\" and \"Wie heißt du?\" are the very first phrases in any German conversation.", points: ["'Wie geht's?' is a casual way to ask how someone is doing.", "Germans often use a more formal greeting, like 'Guten Tag', in professional settings."] },
      u1_branchA: { title: "Numbers 1-20", blurb: "Counting from eins to zwanzig is an essential early building block in German.", points: ["German numbers 13 through 19 combine the ones digit with 'zehn', similar to English teens.", "Numbers above twenty in German famously say the ones digit before the tens digit."] },
      u1_branchB: { title: "The German Alphabet & Pronunciation", blurb: "German pronunciation follows very consistent rules once you learn its sounds.", points: ["The German letter 'ß' represents a sharp 's' sound and doesn't exist in English.", "German vowels with umlauts, like ä, ö, and ü, change a word's pronunciation and often its meaning."] },
      u1_branchC: { title: "Days of the Week in German", blurb: "Knowing the days of the week is essential the moment you want to make plans in German.", points: ["Like every German noun, the days of the week are always capitalized.", "Montag through Sonntag follow a clear, learnable pattern once memorized."] },
      u1_merge: { title: "Introducing Yourself", blurb: "Greetings, numbers, and pronunciation combine into a confident self-introduction.", points: ["A confident self-introduction usually combines a greeting, your name, and maybe your age or origin.", "Practicing this exact combination early builds a strong foundation for further conversation."] },
      u1_hub2: { title: "Talking About When", blurb: "Numbers and days of the week together let you start describing simple schedules in German.", points: ["Being able to state numbers and days together lets you make a simple plan, like 'am Montag um drei'.", "This combination shows up constantly once conversations move beyond basic introductions."] },
      bonus1: { title: "Fun German Compound Words", blurb: "German famously combines smaller words into long, descriptive compound words.", points: ["Famous long compound words, like Donaudampfschifffahrtsgesellschaftskapitän, are built from several smaller real words.", "Understanding the smaller parts of a compound word often reveals its meaning even if you've never seen it before."] },
      bonus2: { title: "German Around the World", blurb: "German is spoken not just in Germany, but also in Austria, Switzerland, and parts of other countries.", points: ["German is one of the official languages of Switzerland, alongside French, Italian, and Romansh.", "Austrian German has some vocabulary differences from the German spoken in Germany."] },
      u2_intro: { title: "Nouns & Gender", blurb: "Every German noun has a gender — der, die, or das — that must be learned alongside it.", points: ["A noun's gender in German often has little logical connection to its meaning.", "Learning a noun's gender alongside the word itself is considered essential from the very beginning."] },
      u2_branchA: { title: "Simple Present Tense Verbs", blurb: "Regular German verbs follow a predictable pattern in the present tense.", points: ["Regular German verbs change their ending based on the subject, similar to many other European languages.", "Once the basic pattern is learned, it applies predictably to dozens of common verbs."] },
      u2_branchB: { title: "Talking About Family", blurb: "Words like Mutter, Vater, and Bruder let you describe your family members.", points: ["Words like Schwester and Bruder let you describe siblings specifically.", "Family vocabulary in German also requires knowing the correct gender for each noun."] },
      u2_branchC: { title: "Sein vs. Haben", blurb: "German's two most essential verbs, 'sein' (to be) and 'haben' (to have), appear in almost every sentence.", points: ["Sein and haben are both irregular verbs, meaning they don't follow the standard present tense pattern.", "These two verbs are also used to build several other tenses in German."] },
      u2_merge: { title: "Describing Your Family", blurb: "Noun gender, verbs, and family vocabulary combine to describe your family in German.", points: ["Describing your family accurately in German means combining correct nouns, genders, and verb forms.", "This exact combination is what the Describe Your Family in German project specifically tests."] },
      u2_hub2: { title: "Core Verbs in Family Descriptions", blurb: "Sein and haben are the two verbs you'll use constantly while describing your family.", points: ["Almost any sentence about your family will use sein or haben at some point.", "Mastering these two irregular verbs pays off across nearly every topic in German."] },
      sideQuestA: { title: "Colours in German", blurb: "Colour words like rot and blau are some of the most useful early adjectives to learn in German.", points: ["German colour adjectives can change their ending depending on the noun's gender and case.", "Rot, blau, and grün are among the very first adjectives most German learners memorize."] },
      sideQuestB: { title: "Telling Time", blurb: "Telling time in German follows its own logical pattern once you learn the key phrases.", points: ["German time can be told using either a 12-hour or a 24-hour format.", "Half-hour phrases in German, like 'halb drei', can confuse English speakers since they refer to half before the hour."] },
      u3_intro: { title: "Asking Questions", blurb: "Question words like was, wo, and wann let you ask for exactly the information you need.", points: ["German question words, like 'was' and 'wo', typically come at the very start of a question.", "Learning question words early makes it possible to ask for help in almost any situation."] },
      u3_branchA: { title: "Talking About Hobbies", blurb: "\"Ich mag...\" is a simple way to say what you like doing in German.", points: ["'Ich mag' can describe liking an activity, a person, or a thing.", "Sharing hobbies is a common and easy way to keep a beginner conversation going."] },
      u3_branchB: { title: "Ordering Food", blurb: "\"Ich hätte gern...\" is the polite way to order food or drink in German.", points: ["'Ich hätte gern' is considered more polite than a blunt 'Ich will'.", "Adding 'bitte' at the end of an order is standard, polite German café etiquette."] },
      u3_branchC: { title: "Modal Verbs Basics", blurb: "Modal verbs like 'können' (can) and 'möchten' (would like) soften requests and describe ability.", points: ["Modal verbs like können and möchten push the main verb to the end of the sentence.", "These verbs are essential for softening requests and expressing ability or desire politely."] },
      u3_merge: { title: "A Simple Conversation", blurb: "Questions, hobbies, and ordering food combine into a real, basic conversation.", points: ["A basic German conversation naturally blends questions, hobbies, and food-ordering vocabulary.", "This blend mirrors exactly the kind of dialogue tested in the Café Roleplay project."] },
      u3_hub2: { title: "Polite Requests in German", blurb: "Modal verbs are what turn a blunt statement into a polite request while ordering or making plans.", points: ["Modal verbs are often what separates a polite German request from a blunt demand.", "Native speakers use these softening verbs constantly, even in casual conversation."] },
      u3_dead1: { title: "German Word Order", blurb: "German famously sends the main verb to the very end of certain types of sentences.", points: ["In a subordinate clause, the conjugated verb is pushed all the way to the very end of the sentence.", "This word order quirk is one of the most notoriously tricky parts of German grammar for English speakers."] },
      u3_dead2: { title: "Common German Greetings by Region", blurb: "Greetings like 'Grüß Gott' and 'Moin' vary noticeably depending on which region of Germany you're in.", points: ["'Moin' is a casual greeting especially common in northern Germany.", "'Grüß Gott' is more commonly heard in southern Germany and Austria."] },
      review: { title: "Confidence in German", blurb: "Every phrase learned here builds toward real confidence having a basic conversation in German.", points: ["Introducing yourself, describing family, and having a simple conversation all draw on the exact same core vocabulary.", "This overlap is exactly what makes early German lessons feel cumulative rather than repetitive."] }
    }
  },
  {
    id: "mandarin-chinese-starters",
    title: "Mandarin Chinese Starters",
    type: "Languages",
    yeargroups: "10-12",
    description: "Tones, vocabulary, and simple sentence structure to begin learning Mandarin.",
    medalNames: { test1: "Mandarin Starter", test2: "Jiātíng Zhuānjiā", test3: "Duìhuà Dàshī" },
    specialTitles: { test1: "Tones & Basics Check", test2: "Vocabulary & Structure Check", test3: "Conversation Check" },
    projects: {
      project1: {
        title: "Describe Your Family",
        brief: "Write five simple sentences describing your family members in Mandarin (using pinyin).",
        checklist: ["Write 5 sentences", "Use 3+ family words", "Use correct sentence order"]
      },
      project2: {
        title: "Restaurant Dialogue",
        brief: "Write a short dialogue between a customer and a server ordering food in Mandarin.",
        checklist: ["Write 6+ lines", "Include an order", "Include a question with 'ma'"]
      }
    },
    finalTitle: "Mandarin Chinese Starters Final Exam",
    topics: {
      u1_intro: { title: "Greetings & Tones", blurb: "Mandarin uses tones — changes in pitch — that can completely change a word's meaning.", points: ["The same syllable 'ma' can mean mother, horse, scold, or a question marker depending on its tone.", "Mispronouncing a tone can completely change the meaning of an otherwise correct sentence."] },
      u1_branchA: { title: "The Four Tones", blurb: "Each of Mandarin's four tones gives the exact same syllable a different meaning.", points: ["The first tone is flat and high, while the fourth tone drops sharply from high to low.", "Tone marks are written directly above the vowel in pinyin to show which tone to use."] },
      u1_branchB: { title: "Numbers 1-10", blurb: "Counting from yī to shí introduces some of the very first sounds and tones in Mandarin.", points: ["Mandarin numbers 1 through 10 use entirely distinct, simple syllables.", "These ten numbers form the base for building every larger number in Mandarin."] },
      u1_branchC: { title: "Numbers 11-100", blurb: "Once you know 1-10, larger Mandarin numbers follow a simple, logical combining pattern.", points: ["Eleven through nineteen are built by simply saying 'ten' followed by the ones digit.", "Multiples of ten, like twenty or thirty, are said as the digit followed by 'ten'."] },
      u1_merge: { title: "Introducing Yourself", blurb: "Greetings, tones, and numbers combine into your first real Mandarin introduction.", points: ["A simple self-introduction usually combines a greeting, your name, and maybe your age using these numbers.", "Getting the tones right in your own introduction makes a strong first impression."] },
      u1_hub2: { title: "Counting Higher in Mandarin", blurb: "Tones and the numbers 1-10 both become essential the moment you start counting past ten.", points: ["Mandarin's logical number-building pattern makes counting into the hundreds surprisingly straightforward once the basics click.", "Tones still matter at every stage, even once the number pattern itself feels easy."] },
      bonus1: { title: "Chinese Characters vs. Pinyin", blurb: "Pinyin spells out the sounds of Mandarin using the English alphabet, as a bridge to characters.", points: ["Pinyin was specifically designed to help learners and typists represent Mandarin sounds using a familiar alphabet.", "Many learners rely heavily on pinyin before gradually transitioning to reading actual characters."] },
      bonus2: { title: "Mandarin Around the World", blurb: "Mandarin has more native speakers than any other language on Earth.", points: ["Mandarin is the most widely spoken native language on Earth by number of speakers.", "Mandarin is also an official language of Taiwan and Singapore, alongside mainland China."] },
      u2_intro: { title: "Family Vocabulary", blurb: "Words like māma, bàba, and gēge let you describe your family members.", points: ["Mandarin has different specific words for older versus younger siblings, unlike English.", "Family vocabulary in Mandarin doesn't require learning grammatical gender, unlike many European languages."] },
      u2_branchA: { title: "Simple Sentence Structure", blurb: "Mandarin sentences typically follow a subject-verb-object order, similar to English.", points: ["Following a subject-verb-object pattern makes basic Mandarin sentences feel relatively familiar to English speakers.", "This shared structure is one of the easier parts of Mandarin for English speakers to pick up quickly."] },
      u2_branchB: { title: "Describing People", blurb: "Simple adjectives describe what someone looks or acts like in Mandarin.", points: ["Mandarin adjectives don't change form based on gender or number, unlike Spanish or French.", "This lack of adjective agreement makes describing people grammatically simpler in some ways."] },
      u2_branchC: { title: "Adjective Order in Mandarin", blurb: "Descriptive words in Mandarin usually come directly before the noun, similar to English.", points: ["Placing a descriptive word directly before the noun feels intuitive for English speakers.", "This similarity to English word order is a helpful shortcut for beginners."] },
      u2_merge: { title: "Describing Your Family", blurb: "Vocabulary, sentence structure, and adjectives combine to describe your family in Mandarin.", points: ["Describing family members combines vocabulary, sentence structure, and adjective placement all at once.", "This exact skill is what the Describe Your Family project is designed to test."] },
      u2_hub2: { title: "Building Descriptive Sentences", blurb: "Sentence structure and adjective order together let you build accurate descriptions of people.", points: ["Getting the sentence structure and adjective order both correct is what makes a description sound natural.", "These two grammar rules work together in nearly every descriptive sentence in Mandarin."] },
      sideQuestA: { title: "Counting with Measure Words", blurb: "Mandarin requires a specific 'measure word' between a number and the noun it counts.", points: ["Different measure words are used for different categories of objects, like flat things versus long things.", "Forgetting the correct measure word is one of the most common mistakes beginners make."] },
      sideQuestB: { title: "Colours in Mandarin", blurb: "Colour words like hóngsè and lánsè are some of the most useful early adjectives to learn.", points: ["The character for red, hóngsè, is also strongly associated with luck and celebration in Chinese culture.", "Colour words in Mandarin also follow the standard adjective-before-noun placement."] },
      u3_intro: { title: "Asking Questions", blurb: "Adding \"ma\" to the end of a statement is one of the simplest ways to ask a yes/no question in Mandarin.", points: ["Adding 'ma' at the end works for almost any statement to turn it into a yes/no question.", "This is one of the simplest question-forming methods across any language."] },
      u3_branchA: { title: "Talking About Likes", blurb: "\"Wǒ xǐhuān...\" is the key phrase for saying what you like in Mandarin.", points: ["'Wǒ xǐhuān' can be followed directly by either a noun or another verb.", "Sharing likes and dislikes is a natural, easy way to extend a basic conversation."] },
      u3_branchB: { title: "Ordering Food", blurb: "Simple phrases let you order food and drink politely in Mandarin.", points: ["Politely ordering food in Mandarin often uses simple, direct phrases rather than elaborate requests.", "Pointing at a menu item while saying a simple phrase is a common, practical strategy for beginners."] },
      u3_branchC: { title: "Polite Particles", blurb: "Small words like 'ba' and 'ma' change a plain statement into a suggestion or a question.", points: ["Adding 'ba' at the end of a sentence softens it into a gentle suggestion rather than a command.", "These small particles carry a surprising amount of tone and meaning in spoken Mandarin."] },
      u3_merge: { title: "A Simple Conversation", blurb: "Questions, likes, and ordering food combine into a real, basic Mandarin conversation.", points: ["A basic Mandarin conversation blends questions, preferences, and food-ordering phrases naturally.", "This blend mirrors the exact skills tested in the Restaurant Dialogue project."] },
      u3_hub2: { title: "Softening a Sentence", blurb: "Polite particles are what make ordering food or making a suggestion sound natural instead of blunt.", points: ["Particles are often what separates a stiff textbook sentence from something a native speaker would actually say.", "Learning to use particles naturally takes real listening practice, not just memorization."] },
      u3_dead1: { title: "Mandarin Around the Table", blurb: "Chinese meals are traditionally shared from communal dishes rather than individual plates.", points: ["Dishes at a Chinese meal are typically placed in the center of the table for everyone to share.", "A lazy Susan is commonly used at larger tables to make sharing dishes easier."] },
      u3_dead2: { title: "Basic Mandarin Writing Strokes", blurb: "Chinese characters are built from a small set of basic strokes written in a specific order.", points: ["Characters are traditionally written in a fixed stroke order, starting from the top-left.", "Learning basic strokes first makes memorizing more complex characters far more manageable later."] },
      review: { title: "Your First Steps in Mandarin", blurb: "Tones, vocabulary, and basic sentences together form the true foundation of learning Mandarin.", points: ["Even a simple conversation in Mandarin now relies on tones, vocabulary, and sentence structure working together.", "This is exactly why Mandarin, despite its reputation, becomes more approachable once these fundamentals click."] }
    }
  },
  {
    id: "world-geography-explorer",
    title: "World Geography Explorer",
    type: "Humanities",
    yeargroups: "3-5",
    description: "Explore continents, maps, climates, landforms, and cultures around the globe.",
    medalNames: { test1: "Map Reader", test2: "Landform Explorer", test3: "Culture Cartographer" },
    specialTitles: { test1: "Map Skills Check", test2: "Landforms Check", test3: "People & Places Check" },
    projects: {
      project1: {
        title: "Build a Mini Atlas Page",
        brief: "Create an atlas page for a country of your choice showing its landforms and climate.",
        checklist: ["Choose a country", "Draw its landforms", "Describe its climate"]
      },
      project2: {
        title: "Design a Country Profile",
        brief: "Create a profile of a country including its population, capital city, and one cultural tradition.",
        checklist: ["Choose a country", "Include population and capital", "Describe one tradition"]
      }
    },
    finalTitle: "World Geography Explorer Final Exam",
    topics: {
      u1_intro: { title: "Continents & Oceans", blurb: "The world is divided into seven continents surrounded by five oceans.", points: ["Asia is by far the largest continent both in area and population.", "The Pacific Ocean is larger than all the continents combined."] },
      u1_branchA: { title: "Reading a World Map", blurb: "A map's key, compass, and grid lines help you find and describe any location.", points: ["A map's key explains exactly what each symbol or colour on the map represents.", "Grid lines let you describe a location using a simple letter-and-number reference, like a spreadsheet."] },
      u1_branchB: { title: "Climate Zones", blurb: "Different parts of the world have different climate zones, from tropical to polar.", points: ["Tropical climate zones near the equator stay warm year-round with heavy rainfall.", "Polar climate zones near the poles stay extremely cold throughout most of the year."] },
      u1_branchC: { title: "Latitude & Longitude", blurb: "Latitude and longitude lines form a grid that can pinpoint any exact location on Earth.", points: ["Latitude lines run east-west and measure distance north or south of the equator.", "Longitude lines run north-south and measure distance east or west of the Prime Meridian."] },
      u1_merge: { title: "Matching Climate to Continent", blurb: "Reading maps and understanding climate zones together helps explain why places look the way they do.", points: ["A location's climate depends heavily on its latitude and its distance from the ocean.", "Two places at similar latitudes can still have very different climates if one is coastal and one is inland."] },
      u1_hub2: { title: "Locating Climates Precisely", blurb: "Latitude is one of the biggest single factors in determining a location's climate zone.", points: ["Locations closer to the equator generally experience warmer, more consistent temperatures year-round.", "Knowing a location's exact latitude is often enough to make a rough guess about its climate."] },
      bonus1: { title: "Flags of the World", blurb: "Every country's flag uses colours and symbols to represent its own history and identity.", points: ["Many national flags include colours chosen specifically to represent historical struggles or values.", "Some flags feature symbols like stars or crescents that reflect a country's religion or history."] },
      bonus2: { title: "Time Zones", blurb: "Time zones exist because the Earth rotates, meaning it's a different time in different places at once.", points: ["The world is divided into roughly 24 primary time zones, matching the 24 hours in a day.", "Crossing the International Date Line can mean jumping forward or backward an entire calendar day."] },
      u2_intro: { title: "Landforms", blurb: "Mountains, valleys, plains, and plateaus are all different types of landforms.", points: ["A plateau is a raised, flat area of land, unlike the pointed peaks of a mountain.", "Landforms are shaped over long periods by forces like water, wind, and tectonic activity."] },
      u2_branchA: { title: "Rivers & Mountain Ranges", blurb: "Rivers and mountain ranges often shape where towns and cities are built.", points: ["Many of the world's largest cities were built along major rivers for trade and water access.", "Mountain ranges can act as natural borders between countries or regions."] },
      u2_branchB: { title: "Deserts & Rainforests", blurb: "Deserts and rainforests are opposite extremes of how much rainfall a region gets.", points: ["Some deserts are actually cold, like Antarctica, rather than hot and sandy.", "Rainforests, despite covering a small share of Earth's land, are home to a huge share of its biodiversity."] },
      u2_branchC: { title: "Volcanoes & Earthquakes", blurb: "Volcanoes and earthquakes are both caused by the shifting of giant plates beneath Earth's surface.", points: ["The Pacific 'Ring of Fire' is a region with an unusually high concentration of volcanoes and earthquakes.", "Not every earthquake is caused by a volcano, though both often occur along the same plate boundaries."] },
      u2_merge: { title: "Landforms Around the World", blurb: "Every continent contains a huge variety of landforms shaped by wind, water, and time.", points: ["Nearly every continent contains a mix of mountains, plains, and at least one major desert or rainforest.", "Comparing landforms across continents reveals how differently the same geological forces can shape land."] },
      u2_hub2: { title: "Earth's Most Dramatic Landforms", blurb: "Rivers and deserts shape land slowly, while volcanoes and earthquakes can reshape it suddenly.", points: ["Slow landforms, like river valleys, can take millions of years to fully develop.", "Sudden landform changes, like a new volcanic island, can appear in a matter of days."] },
      sideQuestA: { title: "Oceans & Sea Life", blurb: "The five oceans are home to the vast majority of all life on Earth.", points: ["The Pacific is the largest and deepest of the five oceans.", "Coral reefs, despite covering a tiny fraction of the ocean floor, support an enormous share of marine life."] },
      sideQuestB: { title: "Islands", blurb: "An island is any piece of land completely surrounded by water, from tiny to enormous.", points: ["Greenland is generally considered the world's largest island.", "Some islands are formed by volcanic activity, while others are formed by coral growth."] },
      u3_intro: { title: "Population & Cities", blurb: "Cities tend to grow largest where resources, water, and trade routes meet.", points: ["Coastal cities historically grew large due to easy access to trade by sea.", "More than half of the world's population now lives in urban areas rather than rural ones."] },
      u3_branchA: { title: "Countries & Borders", blurb: "Borders divide the world into countries, each with its own government and culture.", points: ["Some borders follow natural features like rivers or mountains, while others are simply straight lines drawn on a map.", "Border disputes between countries can sometimes last for generations."] },
      u3_branchB: { title: "Cultures Around the World", blurb: "Every country has its own unique languages, food, and traditions.", points: ["A single country can contain many distinct cultural groups, each with its own traditions.", "Food, music, and clothing are often among the most visible expressions of a region's culture."] },
      u3_branchC: { title: "Migration", blurb: "Migration is people moving from one place to live in another, often reshaping the culture of both places.", points: ["People migrate for many reasons, including economic opportunity, safety, or family reunification.", "Migration has historically introduced new foods, languages, and traditions to the places migrants settle."] },
      u3_merge: { title: "People & Places Together", blurb: "Population, borders, and culture together shape how people live in different places.", points: ["Population patterns, national borders, and cultural traditions are all deeply intertwined with each other.", "Understanding one of these three factors often requires understanding the other two as well."] },
      u3_hub2: { title: "How Places Change Over Time", blurb: "Migration constantly reshapes both the borders and the cultures we think of as fixed.", points: ["Borders that seem permanent today have often shifted dramatically over just the last century.", "Migration is one of the most powerful forces reshaping a region's culture over time."] },
      u3_dead1: { title: "National Parks", blurb: "National parks are areas of land specifically protected from development to preserve nature.", points: ["Yellowstone, established in 1872, is widely considered the world's first national park.", "National parks often protect not just landscapes but also endangered plant and animal species."] },
      u3_dead2: { title: "World Capitals", blurb: "A capital city is usually, though not always, where a country's government is officially based.", points: ["Some countries, like South Africa, actually have more than one official capital city.", "A capital isn't always a country's largest city — Canberra, not Sydney, is Australia's capital."] },
      review: { title: "Our Connected World", blurb: "Geography, climate, and culture together explain why every place on Earth is unique.", points: ["A product in a store might combine materials, labour, and design from several different countries.", "Understanding geography helps explain why certain regions became centres of trade, culture, or conflict."] }
    }
  },
  {
    id: "ancient-civilizations",
    title: "Ancient Civilizations",
    type: "Humanities",
    yeargroups: "8-10",
    description: "Journey through Egypt, Mesopotamia, Greece, and Rome to see what shaped the ancient world.",
    medalNames: { test1: "Civilization Scholar", test2: "Hellenic Historian", test3: "Roman Historian" },
    specialTitles: { test1: "Early Civilizations Check", test2: "Greece Check", test3: "Rome Check" },
    projects: {
      project1: {
        title: "Design an Ancient City",
        brief: "Sketch and label a map of an ancient city, including at least four key buildings and their purpose.",
        checklist: ["Draw the city layout", "Label 4+ buildings", "Explain each building's purpose"]
      },
      project2: {
        title: "Roman Engineering Report",
        brief: "Choose one Roman engineering achievement and explain how it worked and why it mattered.",
        checklist: ["Choose an achievement", "Explain how it worked", "Explain why it mattered"]
      }
    },
    finalTitle: "Ancient Civilizations Final Exam",
    topics: {
      u1_intro: { title: "What Makes a Civilization?", blurb: "A civilization needs organized cities, government, writing, and shared culture to be called one.", points: ["Organized government allows large groups of people to cooperate on projects no individual could manage alone.", "A shared writing system lets a civilization record laws, trade, and history for future generations."] },
      u1_branchA: { title: "Ancient Egypt", blurb: "Ancient Egypt grew up along the Nile River, relying on its yearly floods to farm the land.", points: ["The Nile's predictable annual flooding deposited fertile soil that Egyptian farmers depended on.", "Ancient Egyptians developed a complex system of hieroglyphic writing to record their history and beliefs."] },
      u1_branchB: { title: "Ancient Mesopotamia", blurb: "Ancient Mesopotamia formed between the Tigris and Euphrates rivers, home to some of the earliest cities.", points: ["Mesopotamia is often called the 'cradle of civilization' because of its early cities and writing.", "The Mesopotamians developed cuneiform, one of the very first writing systems in human history."] },
      u1_branchC: { title: "The Indus Valley Civilization", blurb: "The Indus Valley civilization built remarkably advanced cities with early plumbing thousands of years ago.", points: ["Cities like Mohenjo-daro had organized street grids and drainage systems far ahead of their time.", "Much of the Indus Valley's writing system still hasn't been fully deciphered by historians today."] },
      u1_merge: { title: "Comparing River Civilizations", blurb: "Egypt and Mesopotamia both grew around rivers, but developed very different governments and beliefs.", points: ["Egypt developed a unified kingdom under a pharaoh, while Mesopotamia was divided into competing city-states.", "Both civilizations independently developed writing, but for somewhat different early purposes."] },
      u1_hub2: { title: "River Civilizations Around the World", blurb: "Egypt, Mesopotamia, and the Indus Valley all prove rivers were the birthplace of the earliest civilizations.", points: ["All three of these civilizations relied on river flooding to keep their farmland fertile.", "Despite their similarities, each civilization developed distinct governments, religions, and achievements."] },
      bonus1: { title: "Mythology & Legends", blurb: "Ancient myths were used to explain the natural world long before science could.", points: ["Ancient myths often explained natural events, like storms or eclipses, as the actions of gods.", "Many modern words and constellations still carry names taken directly from ancient mythology."] },
      bonus2: { title: "Ancient Trade Routes", blurb: "Ancient civilizations traded goods, ideas, and even diseases along routes stretching thousands of miles.", points: ["The Silk Road connected China to the Mediterranean, carrying goods, religions, and even diseases.", "Trade routes often spread new technologies and ideas just as much as physical goods."] },
      u2_intro: { title: "Ancient Greece", blurb: "Ancient Greece introduced early democracy, philosophy, and the Olympic Games.", points: ["The ancient Olympic Games were held every four years as a religious festival honoring Zeus.", "Ancient Greece was made up of independent city-states rather than one unified nation."] },
      u2_branchA: { title: "Greek Government & Democracy", blurb: "Ancient Athens developed one of the earliest forms of democracy in the world.", points: ["In ancient Athenian democracy, only free adult male citizens were allowed to vote.", "Athenian citizens could vote directly on laws, unlike most modern representative democracies."] },
      u2_branchB: { title: "Greek Philosophy & Science", blurb: "Ancient Greek thinkers laid the foundations for modern philosophy and science.", points: ["Philosophers like Socrates, Plato, and Aristotle laid groundwork still studied in philosophy today.", "Ancient Greek thinkers made early attempts to explain the natural world through observation and logic rather than myth alone."] },
      u2_branchC: { title: "Greek Mythology & Religion", blurb: "Greek mythology explained the natural world and human behaviour through a large cast of gods and heroes.", points: ["Each Greek god was believed to control a specific part of life, like Poseidon and the sea.", "Greek myths were often used to teach moral lessons alongside explaining natural events."] },
      u2_merge: { title: "The Legacy of Greece", blurb: "Greek government, philosophy, and culture still influence the modern world today.", points: ["Modern democratic governments still draw conceptual inspiration from ancient Athenian democracy.", "Countless scientific and philosophical terms in use today trace back to ancient Greek roots."] },
      u2_hub2: { title: "Greek Thought and Belief", blurb: "Philosophy, science, and mythology together show the range of ways ancient Greeks tried to explain their world.", points: ["Philosophy and mythology represent two very different Greek approaches to explaining the same mysteries.", "Over time, philosophical explanations gradually began to compete with traditional mythological ones."] },
      sideQuestA: { title: "Ancient Writing Systems", blurb: "Hieroglyphics and cuneiform were among the very first writing systems ever developed.", points: ["Hieroglyphics combined pictures and sounds to represent both objects and abstract ideas.", "Cuneiform was originally pressed into wet clay tablets using a wedge-shaped stylus."] },
      sideQuestB: { title: "Ancient Wonders", blurb: "Structures like the pyramids were considered wonders even in ancient times for their sheer scale.", points: ["The Great Pyramid of Giza is the only Ancient Wonder of the World still standing today.", "Many ancient wonders were admired specifically for achievements that seemed nearly impossible with ancient tools."] },
      u3_intro: { title: "Ancient Rome", blurb: "Ancient Rome built a vast empire connected by roads, law, and a powerful military.", points: ["At its height, the Roman Empire stretched across three continents.", "Rome began as a republic before eventually transitioning into an empire ruled by emperors."] },
      u3_branchA: { title: "Roman Law & Government", blurb: "Roman law and government structures influenced legal systems still used today.", points: ["Roman legal concepts, like the presumption of innocence, still influence many modern legal systems.", "The Roman Senate gave wealthy citizens significant influence over government decisions."] },
      u3_branchB: { title: "Roman Engineering", blurb: "Roads, aqueducts, and buildings show just how advanced Roman engineering really was.", points: ["Roman aqueducts used precise, gradual slopes to transport water across long distances using gravity alone.", "Some Roman roads and structures have survived, largely intact, for nearly two thousand years."] },
      u3_branchC: { title: "The Roman Military", blurb: "Rome's disciplined, well-organized military was a major reason its empire grew so vast.", points: ["Roman soldiers trained constantly and followed extremely strict discipline and formation tactics.", "The Roman military also built roads and infrastructure as it expanded the empire's territory."] },
      u3_merge: { title: "The Fall of Rome", blurb: "Economic troubles, invasions, and internal conflict together led to Rome's eventual decline.", points: ["No single cause led to Rome's fall — historians point to a combination of economic, military, and political problems.", "The western half of the empire fell centuries before the eastern half, known as the Byzantine Empire, finally collapsed."] },
      u3_hub2: { title: "What Held the Roman Empire Together", blurb: "Law, engineering, and a powerful military together are what let Rome control such an enormous empire.", points: ["Roman roads allowed both trade and the military to move quickly across the empire's vast territory.", "Removing any one of law, engineering, or military strength would have made Rome's enormous empire far harder to control."] },
      u3_dead1: { title: "Gladiators & Roman Entertainment", blurb: "Gladiator games were a massive public spectacle used partly to keep ordinary Romans entertained and content.", points: ["Gladiator fights were often held in massive arenas, like the Colosseum, that could hold tens of thousands of spectators.", "Not all gladiators were slaves — some free citizens chose to fight for fame or money."] },
      u3_dead2: { title: "Roman Daily Life", blurb: "Most ordinary Romans lived very differently from the wealthy senators history often focuses on.", points: ["Most ordinary Romans lived in cramped apartment buildings rather than grand villas.", "Public baths were an important part of daily social life for Romans across social classes."] },
      review: { title: "Legacies That Last", blurb: "Ideas from ancient civilizations, like democracy and law, still shape the world today.", points: ["Modern government, law, and language all carry direct influences from these ancient civilizations.", "Studying ancient civilizations reveals how many 'modern' ideas actually have surprisingly old roots."] }
    }
  },
  {
    id: "modern-world-history",
    title: "Modern World History",
    type: "Humanities",
    yeargroups: "11-13",
    description: "From the Industrial Revolution through two world wars to the modern era.",
    medalNames: { test1: "Industry Investigator", test2: "Global Conflict Analyst", test3: "20th Century Scholar" },
    specialTitles: { test1: "Industrial Revolution Check", test2: "World War I Check", test3: "World War II Check" },
    projects: {
      project1: {
        title: "Write a Soldier's Diary Entry",
        brief: "Write a fictional diary entry from a soldier describing a single day during the war.",
        checklist: ["Describe the setting", "Include one specific event", "Reflect on how it felt"]
      },
      project2: {
        title: "Timeline of a Global Conflict",
        brief: "Create an illustrated timeline of five major events from World War II.",
        checklist: ["Choose 5 events", "Put them in order", "Briefly explain each one"]
      }
    },
    finalTitle: "Modern World History Final Exam",
    topics: {
      u1_intro: { title: "The Industrial Revolution", blurb: "New machines and factories transformed how people worked and lived, starting in the 1700s.", points: ["The Industrial Revolution began in Britain before spreading to other parts of the world.", "Steam-powered machines allowed factories to produce far more goods than hand-crafting ever could."] },
      u1_branchA: { title: "New Technologies", blurb: "Steam power and mechanized production dramatically increased how much could be manufactured.", points: ["The steam engine powered everything from factories to trains during this period.", "New manufacturing techniques allowed identical parts to be mass-produced for the first time."] },
      u1_branchB: { title: "Urbanization", blurb: "Millions of people moved from farms to rapidly growing industrial cities.", points: ["Rapid urban growth often outpaced the housing and sanitation infrastructure cities could provide.", "Many industrial cities grew from small towns into major metropolises within just a few decades."] },
      u1_branchC: { title: "Child Labour & Factory Conditions", blurb: "Early industrial factories often relied on harsh conditions and child labour before reforms banned it.", points: ["Children as young as five or six sometimes worked long hours in dangerous factory conditions.", "Public outrage over these conditions eventually led to labour laws protecting workers and children."] },
      u1_merge: { title: "Society Transformed", blurb: "New technology and urbanization together completely reshaped how ordinary people lived.", points: ["Urbanization and new technology together dramatically changed where and how most people lived and worked.", "This transformation happened faster than most societies at the time were prepared to handle."] },
      u1_hub2: { title: "The Human Cost of Industry", blurb: "New technology and rapid urbanization came with a harsh human cost that eventually forced reform.", points: ["Reform movements gradually pushed back against the harshest aspects of early industrial conditions.", "Many modern labour protections directly trace back to reforms first won during this period."] },
      bonus1: { title: "Everyday Life, Then and Now", blurb: "Many everyday conveniences we take for granted trace directly back to industrial-era inventions.", points: ["Mass production techniques pioneered during this era still underpin how most modern goods are manufactured.", "Many household conveniences taken for granted today were considered revolutionary luxuries at the time."] },
      bonus2: { title: "The Great Depression", blurb: "A global economic collapse in the 1930s left millions unemployed and reshaped government's role in the economy.", points: ["Unemployment during the Great Depression reached extremely high levels across many industrialized nations.", "Government responses to the Great Depression permanently changed how many countries approach economic policy."] },
      u2_intro: { title: "Causes of World War I", blurb: "A tangled web of alliances turned one regional conflict into a global war.", points: ["A complex system of alliances meant that a single assassination could drag multiple nations into war.", "Rising nationalism and militarism across Europe made an eventual large-scale conflict increasingly likely."] },
      u2_branchA: { title: "Life in the Trenches", blurb: "Trench warfare created brutal, unprecedented conditions for soldiers on the front lines.", points: ["Soldiers often lived in cramped, muddy trenches for extended periods between attacks.", "Trench warfare frequently produced a stalemate, with both sides gaining very little ground for years."] },
      u2_branchB: { title: "The War's Aftermath", blurb: "The war's end reshaped borders and set the stage for further conflict decades later.", points: ["Peace treaties redrew national borders across Europe and the Middle East.", "Harsh terms imposed on the losing nations contributed to lasting resentment and instability."] },
      u2_branchC: { title: "New Weapons of World War I", blurb: "Tanks, poison gas, and machine guns made World War I deadlier than any war before it.", points: ["Poison gas introduced a terrifying new form of warfare that later led to international bans.", "Tanks were first used in this war specifically to break through the stalemate of trench warfare."] },
      u2_merge: { title: "Understanding a Global Conflict", blurb: "Causes, conditions, and aftermath together explain why this war changed the world so deeply.", points: ["The war's causes, brutal conditions, and lasting aftermath together explain its massive historical impact.", "Few conflicts before this war had combined such advanced weaponry with such outdated battlefield tactics."] },
      u2_hub2: { title: "Why the War Was So Devastating", blurb: "New weapons technology combined with trench warfare is what made this war uniquely brutal.", points: ["Old-fashioned battlefield tactics combined with terrifyingly modern weapons created unprecedented casualties.", "This mismatch between tactics and technology is a key reason historians consider this war uniquely brutal."] },
      sideQuestA: { title: "The Cold War", blurb: "The Cold War was a decades-long standoff between superpowers that never became a direct war.", points: ["The Cold War was defined by tension between the United States and the Soviet Union without direct military conflict between them.", "Nuclear weapons made both superpowers extremely cautious about triggering a direct war."] },
      sideQuestB: { title: "The Space Race", blurb: "Cold War competition helped push both superpowers to achieve remarkable feats in space exploration.", points: ["The Soviet Union launched the first artificial satellite, Sputnik, in 1957.", "The United States later became the first nation to land astronauts on the Moon."] },
      u3_intro: { title: "Causes of World War II", blurb: "Unresolved tensions from the first war and the rise of new ideologies led to an even larger conflict.", points: ["Harsh economic conditions in Germany after World War I helped fuel the rise of extremist political movements.", "Aggressive territorial expansion by several nations directly triggered the outbreak of war."] },
      u3_branchA: { title: "Key Turning Points", blurb: "A handful of major battles and decisions shaped the entire outcome of the war.", points: ["A handful of major battles dramatically shifted momentum between the opposing sides.", "Strategic decisions at key moments often had consequences that shaped the rest of the war."] },
      u3_branchB: { title: "The Post-War World", blurb: "The war's end reshaped global power and led directly to new international organizations.", points: ["The war's end led directly to the founding of new international organizations aimed at preventing future conflicts.", "Global power shifted significantly toward the United States and the Soviet Union after the war."] },
      u3_branchC: { title: "The Holocaust", blurb: "The Holocaust was the systematic murder of six million Jewish people and millions of others by Nazi Germany.", points: ["The Holocaust remains one of history's most extensively documented examples of genocide.", "Studying the Holocaust remains central to understanding the dangers of unchecked hatred and prejudice."] },
      u3_merge: { title: "Lessons from a Global War", blurb: "Causes, turning points, and aftermath together reveal why this war reshaped the entire 20th century.", points: ["Understanding the war's causes and darkest events together reveals why the world was determined to prevent a repeat.", "This war reshaped international relations more dramatically than perhaps any conflict before it."] },
      u3_hub2: { title: "The Darkest Turning Points", blurb: "Understanding the war's darkest events is essential to understanding why the post-war world changed so completely.", points: ["Confronting these darkest historical events directly is essential to understanding why so much changed afterward.", "The post-war world was shaped as much by moral reckoning as by shifting political power."] },
      u3_dead1: { title: "Decolonization", blurb: "Many colonies gained independence in the decades following World War II, reshaping the map of the world.", points: ["Dozens of former colonies gained independence within just a few decades after World War II.", "Decolonization often led to new national borders that didn't always align neatly with existing ethnic or cultural groups."] },
      u3_dead2: { title: "The United Nations", blurb: "The United Nations was founded right after World War II specifically to help prevent another global war.", points: ["The United Nations was designed specifically to provide a forum for resolving international disputes peacefully.", "Its founding members hoped it would help prevent the kind of global conflict the world had just experienced twice."] },
      review: { title: "Shaping the Modern World", blurb: "Industry and two world wars together shaped nearly every aspect of the world we live in today.", points: ["Nearly every major modern institution or conflict can be traced back to forces set in motion during this era.", "Understanding this period is essential for understanding why the modern world is organized the way it is."] }
    }
  },
  {
    id: "government-and-citizenship",
    title: "Government & Citizenship",
    type: "Humanities",
    yeargroups: "9-11",
    description: "How government works, what citizenship means, and how democracy functions.",
    medalNames: { test1: "Civics Starter", test2: "Justice Junior", test3: "Democracy Defender" },
    specialTitles: { test1: "Government Basics Check", test2: "Laws & Rights Check", test3: "Democracy Check" },
    projects: {
      project1: {
        title: "Propose a New Law",
        brief: "Write a short proposal for a new law, including the problem it solves and how it would be enforced.",
        checklist: ["Describe the problem", "Write the proposed law", "Explain how it would be enforced"]
      },
      project2: {
        title: "Run a Mock Election",
        brief: "Design a mock election with two candidates and a simple platform for each.",
        checklist: ["Create 2 candidate platforms", "Explain how votes would be counted", "Declare a winner and why"]
      }
    },
    finalTitle: "Government & Citizenship Final Exam",
    topics: {
      u1_intro: { title: "What is Government?", blurb: "Government is the system that makes and enforces the rules a society lives by.", points: ["Without government, there would be no shared, enforceable rules for how a society should function.", "Different governments can make vastly different rules while all still technically qualifying as a government."] },
      u1_branchA: { title: "Types of Government", blurb: "Democracies, monarchies, and dictatorships each distribute power in very different ways.", points: ["In a monarchy, power is typically passed down through a royal family rather than through elections.", "A dictatorship concentrates power in a single leader or small group, often without meaningful public input."] },
      u1_branchB: { title: "Branches of Government", blurb: "Splitting power between different branches helps prevent any single group from having too much control.", points: ["A common structure splits power into legislative, executive, and judicial branches.", "This separation is specifically designed to prevent any single branch from becoming too powerful."] },
      u1_branchC: { title: "Checks and Balances", blurb: "Checks and balances let each branch of government limit the power of the others.", points: ["A court can strike down a law passed by the legislature if it violates the constitution.", "An executive leader can sometimes veto a law, giving that branch a check on the legislature."] },
      u1_merge: { title: "How Power is Organized", blurb: "The type of government and how its power is split together define how a country is actually run.", points: ["The specific type of government chosen shapes exactly how power gets divided among its branches.", "Even democracies can organize their branches quite differently from one country to another."] },
      u1_hub2: { title: "Preventing Too Much Power", blurb: "Separating branches only works if checks and balances actually let them limit each other.", points: ["Checks and balances are what actually give meaning to a formal separation of powers.", "Without enforceable checks, a separation of branches could exist only on paper."] },
      bonus1: { title: "Government Symbols", blurb: "Flags, seals, and anthems are all symbols designed to represent a government's authority and identity.", points: ["A national anthem is often specifically composed to evoke pride and unity among citizens.", "Government seals frequently include historically significant symbols, like an eagle or a shield."] },
      bonus2: { title: "International Organizations", blurb: "Organizations like the United Nations exist so countries can cooperate on problems no single government can solve alone.", points: ["The United Nations includes nearly every recognized country in the world as a member.", "International organizations often tackle problems, like climate change, that no single government can solve alone."] },
      u2_intro: { title: "Rights & Responsibilities", blurb: "Citizenship comes with both protected rights and expected responsibilities.", points: ["Common citizen responsibilities include obeying laws, paying taxes, and serving on a jury if called.", "Rights and responsibilities are often described as two sides of the same coin in a functioning society."] },
      u2_branchA: { title: "How Laws Are Made", blurb: "A proposed law typically must pass through several stages of debate and approval before taking effect.", points: ["A proposed law is often debated, amended, and voted on multiple times before final approval.", "Laws can also be challenged and struck down later if courts find them unconstitutional."] },
      u2_branchB: { title: "The Role of Courts", blurb: "Courts interpret laws and settle disputes about whether they've been broken or applied fairly.", points: ["Courts are meant to interpret existing laws rather than create entirely new ones themselves.", "A court's ruling in one case can set a precedent that shapes how similar future cases are decided."] },
      u2_branchC: { title: "The Constitution", blurb: "A constitution is the foundational set of rules a government and its laws must always follow.", points: ["A constitution typically outlines both citizens' rights and the government's structure and limits.", "Amending a constitution is usually intentionally difficult, requiring broad agreement across government."] },
      u2_merge: { title: "Rights, Laws & Justice", blurb: "Rights, lawmaking, and courts together form the backbone of a fair legal system.", points: ["Rights protect citizens, laws set the rules, and courts ensure both are applied fairly.", "Removing any one of these three elements would seriously weaken a country's justice system."] },
      u2_hub2: { title: "Laws Built on a Constitution", blurb: "Courts and lawmakers both ultimately answer to whatever a country's constitution says.", points: ["Any law that conflicts with the constitution can ultimately be challenged and overturned.", "This is why the constitution is often described as the highest law in a country."] },
      sideQuestA: { title: "Local Government", blurb: "Local governments handle everyday services like schools, roads, and rubbish collection.", points: ["Local governments are often the level of government citizens interact with most directly and frequently.", "Decisions like school funding or road repairs are frequently made at the local government level."] },
      sideQuestB: { title: "Civic Participation", blurb: "Volunteering, attending town halls, and contacting representatives are all forms of civic participation beyond voting.", points: ["Attending a public town hall meeting is a direct way to voice concerns to local officials.", "Civic participation beyond voting helps ensure government stays accountable between elections."] },
      u3_intro: { title: "Voting & Elections", blurb: "Voting lets citizens choose who represents them in government.", points: ["Voter turnout can vary dramatically between different types of elections.", "Elections give citizens a peaceful, structured way to change their government's leadership."] },
      u3_branchA: { title: "Political Parties", blurb: "Political parties group people with similar ideas about how government should work.", points: ["Political parties help organize candidates and voters around shared sets of policy positions.", "Some countries have just two major parties, while others have many competing parties at once."] },
      u3_branchB: { title: "Being an Active Citizen", blurb: "Voting is just one of many ways citizens can participate in and influence their government.", points: ["Contacting an elected representative directly is a common way citizens try to influence policy.", "Active citizenship can include volunteering, organizing, or simply staying informed about current issues."] },
      u3_branchC: { title: "Media & Public Opinion", blurb: "The media plays a huge role in shaping what citizens know and think about political issues.", points: ["The way a news story is framed can significantly influence public opinion on an issue.", "Access to diverse, reliable information sources is considered essential for a healthy democracy."] },
      u3_merge: { title: "Democracy in Action", blurb: "Elections, parties, and active citizenship together are what keep a democracy functioning.", points: ["Elections alone aren't enough — informed and active citizens are what actually keep a democracy healthy.", "Political parties and media coverage both shape how citizens ultimately decide to vote."] },
      u3_hub2: { title: "How Citizens Form Opinions", blurb: "Political parties and the media both compete to shape how active citizens end up voting.", points: ["Citizens exposed only to one media source or one party's messaging may form a narrower view of an issue.", "Seeking multiple perspectives is often recommended for forming a well-rounded political opinion."] },
      u3_dead1: { title: "Human Rights", blurb: "Human rights are basic protections considered to belong to every person, regardless of which country they live in.", points: ["Human rights are often considered to apply universally, regardless of a person's nationality or government.", "International agreements have attempted to establish shared standards for human rights across countries."] },
      u3_dead2: { title: "Protest & Civil Disobedience", blurb: "Peaceful protest has historically been one of the most powerful tools citizens have to demand change.", points: ["Historic protest movements have led directly to significant changes in law and government policy.", "Civil disobedience typically involves openly and peacefully breaking an unjust law to draw attention to it."] },
      review: { title: "Being an Informed Citizen", blurb: "Understanding government, rights, and elections is what allows a citizen to participate fully in their society.", points: ["Understanding how government works makes it far easier to recognise when it isn't functioning as intended.", "An informed, engaged citizenry is often considered essential to keeping any democracy healthy over time."] }
    }
  },
  {
    id: "fractions-decimals-percentages",
    title: "Fractions, Decimals & Percentages",
    type: "Maths",
    yeargroups: "6-8",
    description: "See how fractions, decimals, and percentages are really the same value in three different outfits.",
    medalNames: { test1: "Fraction Fanatic", test2: "Decimal Dynamo", test3: "Percentage Pro" },
    specialTitles: { test1: "Fractions Check", test2: "Decimals Check", test3: "Percentages Check" },
    projects: {
      project1: {
        title: "Decimal Shopping List",
        brief: "Create a shopping list with decimal prices and calculate the total cost.",
        checklist: ["List 5 items with prices", "Add the total", "Round the total sensibly"]
      },
      project2: {
        title: "Plan a Sale",
        brief: "Design a store sale with at least three discounted items, showing the original and sale prices.",
        checklist: ["Choose 3 items and prices", "Apply a percentage discount", "Show the final sale price"]
      }
    },
    finalTitle: "Fractions, Decimals & Percentages Final Exam",
    topics: {
      u1_intro: { title: "Understanding Fractions", blurb: "A fraction represents a part of a whole, split into equal-sized pieces.", points: ["The top number, the numerator, counts how many of those pieces you have.", "The bottom number, the denominator, tells you how many equal pieces the whole is split into."] },
      u1_branchA: { title: "Fractions of Amounts", blurb: "Finding a fraction of an amount means dividing by the bottom number and multiplying by the top.", points: ["Finding 1/4 of 20 means dividing 20 by 4 to get 5, then multiplying by 1.", "This method works for any fraction of any amount, no matter how unusual the numbers look."] },
      u1_branchB: { title: "Mixed Numbers & Improper Fractions", blurb: "A mixed number and an improper fraction can represent the exact same value in two different forms.", points: ["An improper fraction has a numerator bigger than its denominator, like 7/4.", "Converting between the two forms never changes the actual value, only how it's written."] },
      u1_branchC: { title: "Comparing Fraction Sizes", blurb: "Converting fractions to a common denominator is the most reliable way to compare their sizes.", points: ["Once denominators match, the fraction with the bigger numerator is simply the bigger value.", "Cross-multiplying is a quick shortcut for comparing two fractions without finding a full common denominator."] },
      u1_merge: { title: "Working Confidently with Fractions", blurb: "Amounts, mixed numbers, and comparisons together build real fluency with fractions.", points: ["Real fraction problems rarely test just one skill in isolation — they usually blend several together.", "Estimating a rough answer first helps catch mistakes before they slip through."] },
      u1_hub2: { title: "Fractions in Real Situations", blurb: "Comparing sizes and finding amounts both show up constantly in real fraction problems.", points: ["Recipes, measurements, and sharing problems are where fraction skills get used most often in daily life.", "Being able to quickly compare and calculate fractions saves real time in practical situations."] },
      bonus1: { title: "Fraction Word Problems", blurb: "Turning a word problem into a fraction calculation is often the hardest step, not the maths itself.", points: ["Identifying exactly what the 'whole' represents is usually the make-or-break step.", "Drawing a quick diagram of the fraction described often reveals the calculation needed."] },
      bonus2: { title: "Simplifying Fractions Fast", blurb: "Dividing both the top and bottom by their greatest common factor simplifies a fraction in one step.", points: ["The greatest common factor is the largest number that divides evenly into both the numerator and denominator.", "A fraction is fully simplified once its greatest common factor with the denominator is just 1."] },
      u2_intro: { title: "Understanding Decimals", blurb: "A decimal is just another way to write a fraction, based on place value instead of a numerator and denominator.", points: ["Each place after the decimal point represents tenths, hundredths, thousandths, and so on.", "A decimal and its equivalent fraction always represent exactly the same value."] },
      u2_branchA: { title: "Converting Fractions to Decimals", blurb: "Dividing a fraction's numerator by its denominator always converts it into a decimal.", points: ["This works because a fraction is really just an unfinished division problem.", "Some conversions end neatly, like 1/2 = 0.5, while others repeat forever, like 1/3."] },
      u2_branchB: { title: "Adding & Subtracting Decimals", blurb: "Lining up the decimal points is the key to adding or subtracting decimals correctly.", points: ["Adding zeros to the end of a shorter decimal doesn't change its value and makes lining up easier.", "Misaligning the decimal points is the single most common decimal-arithmetic mistake."] },
      u2_branchC: { title: "Multiplying & Dividing Decimals", blurb: "Counting decimal places carefully is what keeps multiplication and division of decimals accurate.", points: ["Multiplying two decimals means the total decimal places in the answer equals the sum of the decimal places in both numbers.", "Dividing by a decimal is often easiest after shifting both numbers' decimal points to make the divisor a whole number."] },
      u2_merge: { title: "Decimal Operations Mastery", blurb: "Conversions and the four operations together make decimals just as workable as whole numbers.", points: ["Once conversions and all four operations feel automatic, decimals become just as easy as whole numbers.", "Real financial and measurement problems almost always involve at least one decimal operation."] },
      u2_hub2: { title: "Decimals in Measurement", blurb: "Decimals show up constantly in real measurements, from money to length to weight.", points: ["Money is measured in decimals down to the cent, or hundredth of a unit.", "Scientific measurements often use many decimal places for extra precision."] },
      sideQuestA: { title: "Rounding Decimals", blurb: "Rounding a decimal to a chosen place value makes an answer easier to work with.", points: ["Rounding to two decimal places is standard for money, since that's the smallest usable unit.", "Look only at the very next digit to decide whether to round up or down."] },
      sideQuestB: { title: "Recurring Decimals", blurb: "Some fractions convert into decimals that repeat forever in a set pattern.", points: ["A recurring decimal is usually written with a dot or bar over the repeating digits.", "1/7 produces one of the longest simple repeating decimal patterns, six digits long."] },
      u3_intro: { title: "Understanding Percentages", blurb: "A percentage is simply a fraction out of 100, making it easy to compare different amounts.", points: ["The word 'percent' literally means 'per hundred'.", "50% is exactly the same value as the fraction 1/2 and the decimal 0.5."] },
      u3_branchA: { title: "Converting Between Fractions, Decimals & Percentages", blurb: "The same value can always be rewritten as a fraction, a decimal, or a percentage.", points: ["To turn a decimal into a percentage, just multiply by 100 and add the percent sign.", "Being fluent in all three forms means you can always pick whichever is quickest for a given problem."] },
      u3_branchB: { title: "Finding a Percentage of an Amount", blurb: "Finding a percentage of an amount means converting the percentage to a decimal and multiplying.", points: ["25% of an amount is the same as finding a quarter of it.", "Converting the percentage to a decimal first makes the multiplication straightforward."] },
      u3_branchC: { title: "Percentage Increase & Decrease", blurb: "Percentage increase and decrease describe how much a value has grown or shrunk relative to its start.", points: ["A 20% increase means multiplying the original amount by 1.2, not just adding 20.", "A 20% decrease means multiplying the original amount by 0.8."] },
      u3_merge: { title: "Percentages in Practice", blurb: "Converting and calculating percentages together are what make percentage problems solvable.", points: ["Most real percentage problems combine converting a value with then calculating a change.", "Reading carefully whether a question wants an increase or a decrease is essential before calculating."] },
      u3_hub2: { title: "Real-World Percentage Changes", blurb: "Discounts, tax, and interest are all everyday examples of percentage increase and decrease.", points: ["A store discount and a restaurant tip both use percentage decrease and increase in everyday life.", "Sales tax is a percentage increase applied at the register, on top of the listed price."] },
      u3_dead1: { title: "Percentage Word Problems", blurb: "Identifying what the 'whole' actually is is usually the trickiest part of a percentage word problem.", points: ["The 'whole' isn't always the biggest number mentioned — sometimes it's hidden partway through the problem.", "Rereading the question after solving helps confirm you answered what was actually asked."] },
      u3_dead2: { title: "Simple Interest Basics", blurb: "Simple interest is calculated as a fixed percentage of the original amount, every single period.", points: ["Simple interest is calculated using the formula: principal times rate times time.", "Because it's always based on the original amount, simple interest grows by the same amount every period."] },
      review: { title: "Fractions, Decimals & Percentages Together", blurb: "These three are really just different faces of the same underlying value, chosen for whatever's easiest at the time.", points: ["A store sale sign often needs fractions, decimals, and percentages all combined to work out the final price.", "Being flexible about which form to use is often faster than sticking to just one."] }
    }
  },
  {
    id: "introduction-to-trigonometry",
    title: "Introduction to Trigonometry",
    type: "Maths",
    yeargroups: "10-12",
    description: "Learn sine, cosine, and tangent, and use them to solve real triangle problems.",
    medalNames: { test1: "Trig Starter", test2: "Triangle Solver", test3: "Wave Analyst" },
    specialTitles: { test1: "Ratios Check", test2: "Solving Triangles Check", test3: "Trig Graphs Check" },
    projects: {
      project1: {
        title: "Measure a Tall Object",
        brief: "Use an angle of elevation and a measured distance to estimate the height of a tall object nearby.",
        checklist: ["Measure the distance to the object", "Estimate the angle of elevation", "Calculate the height"]
      },
      project2: {
        title: "Model a Real Wave",
        brief: "Sketch a sine wave modelling something repetitive, like tides or a Ferris wheel, labelling its amplitude and period.",
        checklist: ["Choose a real repeating scenario", "Sketch the wave", "Label amplitude and period"]
      }
    },
    finalTitle: "Introduction to Trigonometry Final Exam",
    topics: {
      u1_intro: { title: "Right-Angled Triangles Recap", blurb: "Trigonometry begins with the sides and angles of a right-angled triangle.", points: ["A right-angled triangle always has exactly one 90-degree angle.", "The two shorter sides are called the legs, while the longest side is the hypotenuse."] },
      u1_branchA: { title: "Naming the Sides", blurb: "Every right-angled triangle has a hypotenuse, an opposite side, and an adjacent side relative to a chosen angle.", points: ["The opposite side is always across from the angle you're focusing on, never touching it.", "The adjacent side touches the angle you're focusing on but isn't the hypotenuse."] },
      u1_branchB: { title: "The Sine Ratio", blurb: "Sine is the ratio of the opposite side to the hypotenuse.", points: ["Sine only ever produces a value between -1 and 1 for any angle.", "As an angle gets closer to 90 degrees, its sine value gets closer to 1."] },
      u1_branchC: { title: "The Cosine Ratio", blurb: "Cosine is the ratio of the adjacent side to the hypotenuse.", points: ["Cosine, like sine, only ever produces a value between -1 and 1.", "As an angle gets closer to 0 degrees, its cosine value gets closer to 1."] },
      u1_merge: { title: "Sine & Cosine Together", blurb: "Sine and cosine both describe a right triangle from the same angle, just using different sides.", points: ["Swapping which acute angle you focus on in a right triangle swaps which side counts as opposite versus adjacent.", "Sine and cosine of complementary angles, adding to 90 degrees, are always equal to each other."] },
      u1_hub2: { title: "Choosing Sine or Cosine", blurb: "Naming the sides correctly is what lets you decide whether to use sine or cosine in a problem.", points: ["If you know the opposite side and hypotenuse, sine is the ratio to use.", "If you know the adjacent side and hypotenuse, cosine is the ratio to use."] },
      bonus1: { title: "The Tangent Ratio", blurb: "Tangent is the ratio of the opposite side to the adjacent side.", points: ["Tangent can also be calculated by dividing sine by cosine for the same angle.", "Tangent, unlike sine and cosine, can take on any real number value, not just between -1 and 1."] },
      bonus2: { title: "SOH CAH TOA", blurb: "SOH CAH TOA is a classic memory trick for remembering all three trigonometric ratios at once.", points: ["Each three-letter block pairs a ratio with its two sides: Opposite/Hypotenuse, Adjacent/Hypotenuse, Opposite/Adjacent.", "This mnemonic is one of the most widely taught memory tricks in all of school mathematics."] },
      u2_intro: { title: "Finding a Missing Side", blurb: "Trigonometric ratios let you calculate an unknown side if you know one angle and one side.", points: ["Setting up the correct ratio equation first is the key step before solving for the unknown side.", "Always double-check your calculator is in degree mode, not radian mode, before starting."] },
      u2_branchA: { title: "Finding a Missing Angle", blurb: "Inverse trigonometric functions let you work backwards from side ratios to find an unknown angle.", points: ["The inverse functions are usually labelled sin⁻¹, cos⁻¹, and tan⁻¹ on a calculator.", "These inverse functions undo sine, cosine, or tangent to reveal the angle itself."] },
      u2_branchB: { title: "Using a Calculator for Trig", blurb: "A scientific calculator's sin, cos, and tan buttons are essential tools for solving triangle problems quickly.", points: ["Switching between degree and radian mode by accident is one of the most common trig calculation errors.", "Rounding too early in a multi-step calculation can throw off the final answer noticeably."] },
      u2_branchC: { title: "Angles of Elevation & Depression", blurb: "An angle of elevation looks up from the horizontal, while an angle of depression looks down.", points: ["An angle of elevation and the corresponding angle of depression between two points are always equal.", "These angles are always measured from a horizontal reference line, never from the ground."] },
      u2_merge: { title: "Solving Real Triangle Problems", blurb: "Missing sides and missing angles together let you solve almost any right-triangle scenario.", points: ["Real-world trig problems usually require sketching the triangle before any ratio can even be set up.", "Labelling the known angle, known side, and target unknown clearly prevents mixing up which ratio to use."] },
      u2_hub2: { title: "Trigonometry Looking Up and Down", blurb: "Elevation and depression problems are just missing-side and missing-angle problems in a real-world disguise.", points: ["Surveying tall buildings and cliffs almost always relies on elevation and depression angles.", "These problems are solved with the exact same missing-side and missing-angle methods as any other right triangle."] },
      sideQuestA: { title: "Bearings Basics", blurb: "A bearing measures direction as a clockwise angle from north.", points: ["A bearing is always written using three digits, like 045 degrees, even for small angles.", "North corresponds to a bearing of 000 degrees, and bearings increase clockwise from there."] },
      sideQuestB: { title: "Trigonometry in Surveying", blurb: "Surveyors use trigonometry constantly to measure distances and heights they can't reach directly.", points: ["Surveyors historically used simple trigonometric instruments to map entire coastlines and mountain ranges.", "GPS technology still relies on trigonometric principles to triangulate a precise location."] },
      u3_intro: { title: "The Unit Circle Basics", blurb: "The unit circle extends sine and cosine to angles beyond a right triangle's 0-90 degree range.", points: ["The unit circle has a radius of exactly 1, which is where sine and cosine values come from directly.", "Every point on the unit circle corresponds to a cosine and sine value for that angle."] },
      u3_branchA: { title: "Trig Ratios Beyond 90 Degrees", blurb: "Sine and cosine continue to have well-defined values for angles greater than 90 degrees.", points: ["Sine stays positive for angles between 0 and 180 degrees, while cosine turns negative after 90 degrees.", "This extension is what allows trigonometry to describe angles all the way around a full circle."] },
      u3_branchB: { title: "Graphs of Sine & Cosine", blurb: "The sine and cosine graphs both repeat in a smooth, wave-like pattern forever.", points: ["Both graphs repeat their exact pattern every 360 degrees.", "The cosine graph is really just the sine graph shifted sideways by 90 degrees."] },
      u3_branchC: { title: "Amplitude & Period", blurb: "Amplitude describes a wave's height, while period describes how long it takes to repeat.", points: ["A wave with a bigger amplitude simply reaches higher and lower peaks, without changing its speed.", "A shorter period means the wave repeats itself more quickly."] },
      u3_merge: { title: "Understanding Trig Graphs", blurb: "The unit circle is what explains why sine and cosine graphs look the way they do.", points: ["The unit circle's rotation directly matches the rise and fall you see traced out on a sine graph.", "Understanding the unit circle makes memorising the graph shapes almost unnecessary."] },
      u3_hub2: { title: "Describing a Wave Precisely", blurb: "Amplitude and period together fully describe the shape of any sine or cosine wave.", points: ["Two waves can look similar at a glance but have completely different amplitudes and periods.", "Being able to read both values off a graph is essential for modelling any real repeating pattern."] },
      u3_dead1: { title: "Trigonometric Identities Basics", blurb: "An identity like sin²+cos²=1 is true for every possible angle, not just a specific one.", points: ["This particular identity comes directly from the Pythagorean theorem applied to the unit circle.", "Identities let you rewrite a tricky trig expression into an equivalent, simpler form."] },
      u3_dead2: { title: "Trig Waves in Sound & Light", blurb: "Sound and light waves are both modelled mathematically using sine-like wave patterns.", points: ["A pure musical tone is essentially a single sine wave at a specific frequency.", "Combining multiple sine waves of different frequencies is how complex sounds and colours are actually built."] },
      review: { title: "Trigonometry All Around", blurb: "From construction to sound waves, trigonometry connects triangles to an enormous range of real phenomena.", points: ["Architects use trigonometry to calculate roof angles and structural supports precisely.", "Video game graphics rely constantly on trigonometry to calculate angles, rotations, and lighting."] }
    }
  },
  {
    id: "algebra-ii-quadratics",
    title: "Algebra II: Quadratics",
    type: "Maths",
    yeargroups: "10-12",
    description: "Expand, factorise, solve, and graph quadratic equations from every angle.",
    medalNames: { test1: "Quadratics Starter", test2: "Equation Solver", test3: "Parabola Master" },
    specialTitles: { test1: "Expanding & Factorising Check", test2: "Solving Quadratics Check", test3: "Graphing Check" },
    projects: {
      project1: {
        title: "Maximise an Area",
        brief: "Use a quadratic to find the dimensions that maximise the area of a rectangular garden with a fixed perimeter.",
        checklist: ["Set up the quadratic", "Solve for the maximum", "State the final dimensions"]
      },
      project2: {
        title: "Graph a Real Parabola",
        brief: "Model a real projectile scenario with a quadratic equation and sketch its graph, labelling the vertex.",
        checklist: ["Write the quadratic equation", "Sketch the graph", "Label the vertex and intercepts"]
      }
    },
    finalTitle: "Algebra II: Quadratics Final Exam",
    topics: {
      u1_intro: { title: "What is a Quadratic?", blurb: "A quadratic expression includes a squared variable term, like x², as its highest power.", points: ["The general form is ax² + bx + c, where a can't be zero.", "Quadratics graph as a curved parabola, unlike the straight line of a linear expression."] },
      u1_branchA: { title: "Expanding Brackets", blurb: "Expanding two brackets multiplied together, like (x+2)(x+3), produces a quadratic expression.", points: ["Each term in the first bracket must be multiplied by each term in the second bracket.", "This process is often remembered using the acronym FOIL: First, Outer, Inner, Last."] },
      u1_branchB: { title: "Factorising Simple Quadratics", blurb: "Factorising reverses expanding, turning a quadratic expression back into two brackets.", points: ["You need two numbers that multiply to give the constant term and add to give the middle coefficient.", "Not every quadratic factorises neatly into whole numbers — some require the quadratic formula instead."] },
      u1_branchC: { title: "The Difference of Two Squares", blurb: "An expression like x²-9 factorises instantly into (x+3)(x-3).", points: ["This pattern only works when there's a subtraction between two perfect squares, never an addition.", "Spotting this pattern instantly can save several steps compared to factorising it the long way."] },
      u1_merge: { title: "Expanding & Factorising Together", blurb: "Expanding and factorising are inverse skills that check each other's answers.", points: ["Expanding a factorised answer back out is the fastest way to check if the factorising was correct.", "Being fluent in both directions makes solving quadratic equations dramatically faster."] },
      u1_hub2: { title: "Special Factorising Patterns", blurb: "Recognising the difference of two squares makes some quadratics factorise almost instantly.", points: ["Perfect square trinomials, like x²+6x+9, factorise into a single repeated bracket.", "Recognising these patterns by sight is a skill that comes from repeated practice."] },
      bonus1: { title: "Quadratic Vocabulary", blurb: "Terms like coefficient, root, and vertex all describe specific parts of a quadratic.", points: ["A root is simply another word for a solution — a value of x where the quadratic equals zero.", "The vertex is the single highest or lowest point on the parabola's curve."] },
      bonus2: { title: "Quadratics in Nature", blurb: "The path of a thrown ball naturally follows a quadratic curve, shaped by gravity.", points: ["The exact curve is caused by gravity pulling the object down at a constant rate.", "Suspension bridge cables and satellite dish shapes are also often designed using this same curve."] },
      u2_intro: { title: "Solving Quadratics by Factorising", blurb: "Once a quadratic is factorised, setting each bracket to zero reveals its solutions.", points: ["This works because if two things multiply to zero, at least one of them must itself be zero.", "This method only works once the quadratic is fully factorised into two brackets."] },
      u2_branchA: { title: "The Quadratic Formula", blurb: "The quadratic formula solves any quadratic equation, even ones that won't factorise neatly.", points: ["The formula is x = (-b ± √(b²-4ac)) / 2a, built directly from the coefficients a, b, and c.", "The ± symbol means the formula usually produces two separate solutions at once."] },
      u2_branchB: { title: "Completing the Square", blurb: "Completing the square rewrites a quadratic in a form that reveals its vertex directly.", points: ["This method rewrites the quadratic as a squared bracket plus or minus a constant.", "The vertex form that results makes graphing the parabola immediately straightforward."] },
      u2_branchC: { title: "The Discriminant", blurb: "A quadratic's discriminant reveals how many real solutions it has before you even solve it.", points: ["The discriminant is the b²-4ac part hiding inside the quadratic formula.", "A positive discriminant means two real solutions; zero means one; negative means none."] },
      u2_merge: { title: "Three Ways to Solve a Quadratic", blurb: "Factorising, the quadratic formula, and completing the square all solve the exact same equations.", points: ["Factorising is fastest when it works, but the quadratic formula always works no matter what.", "Choosing the right method for a given quadratic is itself a valuable problem-solving skill."] },
      u2_hub2: { title: "Predicting Solutions First", blurb: "The discriminant, paired with completing the square, tells you what kind of solutions to expect.", points: ["Checking the discriminant before solving tells you in advance how many solutions to expect.", "This prediction step can save time by warning you if factorising won't work cleanly."] },
      sideQuestA: { title: "Quadratic Word Problems", blurb: "Turning a real scenario, like maximising an area, into a quadratic equation is a key modelling skill.", points: ["Area and projectile-motion problems are two of the most common real-world sources of quadratic equations.", "Setting up the equation correctly from the words is usually harder than solving it once it's set up."] },
      sideQuestB: { title: "Simultaneous Quadratic & Linear Equations", blurb: "A line and a curve can intersect at zero, one, or two points, found by solving them together.", points: ["Substituting the linear equation into the quadratic is the standard way to solve the pair together.", "Two intersection points mean the line cuts through the parabola in two separate places."] },
      u3_intro: { title: "Graphing Quadratics", blurb: "Every quadratic graphs as a smooth, symmetric curve called a parabola.", points: ["Every parabola is perfectly symmetric around a single vertical line through its vertex.", "A positive leading coefficient makes the parabola open upward; a negative one makes it open downward."] },
      u3_branchA: { title: "The Vertex & Axis of Symmetry", blurb: "A parabola's vertex is its turning point, and the axis of symmetry runs straight through it.", points: ["The vertex is either the maximum or minimum point of the entire curve.", "The axis of symmetry always passes exactly through the x-coordinate of the vertex."] },
      u3_branchB: { title: "x-Intercepts & the Graph", blurb: "A quadratic's solutions are exactly where its graph crosses the x-axis.", points: ["A parabola can cross the x-axis twice, once, or not at all, matching the discriminant.", "The x-intercepts are exactly the same values you'd get from solving the quadratic equation."] },
      u3_branchC: { title: "Transformations of Quadratic Graphs", blurb: "Shifting or stretching a quadratic's equation moves or reshapes its parabola predictably.", points: ["Adding a constant outside the squared term shifts the whole parabola up or down.", "A larger leading coefficient makes the parabola narrower; a smaller one makes it wider."] },
      u3_merge: { title: "Reading a Quadratic Graph", blurb: "The vertex and x-intercepts together reveal almost everything about a parabola's shape and position.", points: ["Spotting the vertex and intercepts at a glance lets you sketch a rough graph without plotting every point.", "A graph's shape instantly tells you whether the quadratic has a maximum or minimum value."] },
      u3_hub2: { title: "Transforming a Parabola", blurb: "Understanding a graph's key features is what makes predicting its transformations possible.", points: ["Recognising a graph's key features first makes predicting how it shifts or stretches far more intuitive.", "Small changes to the equation's constants can dramatically change how the parabola looks."] },
      u3_dead1: { title: "Quadratic Inequalities", blurb: "A quadratic inequality asks where a parabola lies above or below the x-axis, not just where it crosses.", points: ["The solution is often a range of x-values, not just isolated points.", "Sketching the parabola first makes it easy to see exactly where it sits above or below the x-axis."] },
      u3_dead2: { title: "Quadratics in Physics", blurb: "Projectile motion, like a ball's height over time, is modelled almost perfectly by a quadratic equation.", points: ["The height equation typically includes gravity's constant downward pull as the squared term's coefficient.", "The vertex of this kind of equation represents the exact peak height reached by the object."] },
      review: { title: "Quadratics Everywhere", blurb: "From graphs to physics to design, quadratics are one of the most useful equation types you'll ever learn.", points: ["Engineers use quadratic equations to design arches, bridges, and satellite dishes.", "Economists even use quadratic models to describe cost and profit curves that rise then fall."] }
    }
  },
  {
    id: "money-and-financial-maths",
    title: "Money & Financial Maths",
    type: "Maths",
    yeargroups: "7-9",
    description: "Budgeting, interest, and tax — the practical maths behind everyday financial decisions.",
    medalNames: { test1: "Budget Beginner", test2: "Interest Investigator", test3: "Finance Finisher" },
    specialTitles: { test1: "Budgeting Check", test2: "Interest Check", test3: "Tax & Pricing Check" },
    projects: {
      project1: {
        title: "Compare Two Savings Accounts",
        brief: "Compare a simple interest account and a compound interest account over 5 years for the same deposit.",
        checklist: ["Calculate simple interest over 5 years", "Calculate compound interest over 5 years", "Compare the two totals"]
      },
      project2: {
        title: "Plan a Restaurant Bill",
        brief: "Calculate a full restaurant bill including tax and a tip for a sample order.",
        checklist: ["List sample menu items and prices", "Add tax", "Add an appropriate tip"]
      }
    },
    finalTitle: "Money & Financial Maths Final Exam",
    topics: {
      u1_intro: { title: "Understanding Income & Expenses", blurb: "Income is money coming in, while expenses are money going out — the foundation of every budget.", points: ["A positive difference between income and expenses means money is being saved, not spent.", "Irregular expenses, like an annual subscription, are easy to forget when building a budget."] },
      u1_branchA: { title: "Building a Simple Budget", blurb: "A budget simply plans how income will be divided across expected expenses.", points: ["A common budgeting guideline splits income roughly into needs, wants, and savings.", "Reviewing a budget regularly catches problems before they turn into real financial trouble."] },
      u1_branchB: { title: "Needs vs. Wants", blurb: "Distinguishing a genuine need from a want is the first real decision in any budget.", points: ["Housing, food, and basic transportation are almost always classified as genuine needs.", "The same item, like a phone, can be a need for one person and a want for another depending on their situation."] },
      u1_branchC: { title: "Saving a Portion of Income", blurb: "Setting aside a fixed portion of income before spending is one of the most reliable saving habits.", points: ["This is often called 'paying yourself first', before any other spending happens.", "Even a small percentage saved consistently adds up significantly over time."] },
      u1_merge: { title: "Budgeting with Priorities", blurb: "Needs, wants, and savings together decide how a budget should actually be divided.", points: ["A realistic budget usually covers needs first, then allocates what's left between wants and savings.", "Being honest about what's truly a need versus a want is what makes a budget actually work."] },
      u1_hub2: { title: "Building Smart Saving Habits", blurb: "Saving first, before spending on wants, is what makes a budget genuinely sustainable.", points: ["Automating a transfer to savings removes the temptation to spend that money first.", "Small, consistent saving habits tend to outperform occasional large deposits over the long run."] },
      bonus1: { title: "Tracking Spending", blurb: "Tracking every expense, even small ones, often reveals surprising spending patterns.", points: ["Small purchases, like daily coffees, often add up to a surprisingly large total over a month.", "Categorising expenses makes it much easier to see exactly where money is actually going."] },
      bonus2: { title: "Setting a Savings Goal", blurb: "A clear savings goal, with an amount and a deadline, makes saving far more motivating.", points: ["Breaking a big goal into smaller monthly targets makes it feel far more achievable.", "A specific goal, like saving $500 by June, is far more motivating than a vague one."] },
      u2_intro: { title: "Simple Interest", blurb: "Simple interest is calculated only on the original amount, every single period.", points: ["Simple interest is calculated using principal times rate times time.", "Because it's always based on the original amount, it grows by the exact same amount every period."] },
      u2_branchA: { title: "Compound Interest Basics", blurb: "Compound interest is calculated on the original amount plus any interest already earned.", points: ["Each period's interest gets added to the balance before the next period's interest is calculated.", "This is why compound interest is often described as 'earning interest on interest'."] },
      u2_branchB: { title: "Comparing Simple & Compound Interest", blurb: "Compound interest grows faster over time because it earns interest on interest.", points: ["Over short periods the difference between the two is small, but it grows dramatically over many years.", "Compound interest is why starting to save early can make such a big long-term difference."] },
      u2_branchC: { title: "Interest Rates & Time", blurb: "A higher interest rate or a longer time period both increase how much interest accumulates.", points: ["Doubling the interest rate roughly doubles the interest earned in simple interest calculations.", "Extending the time period has an even bigger effect under compound interest than under simple interest."] },
      u2_merge: { title: "How Interest Really Works", blurb: "Simple and compound interest both depend on rate and time, just calculated differently.", points: ["Both types of interest depend on the same three ingredients: principal, rate, and time.", "Understanding both is essential before comparing loan offers or savings accounts."] },
      u2_hub2: { title: "Interest Growing Over Time", blurb: "The longer money sits earning compound interest, the more dramatic the difference from simple interest becomes.", points: ["A savings account left untouched for decades benefits enormously from compound growth.", "Even a small difference in interest rate can lead to a large difference after many years."] },
      sideQuestA: { title: "Loans & Borrowing Basics", blurb: "Borrowed money almost always needs to be repaid with interest added on top.", points: ["A lower interest rate on a loan means less total money repaid over its lifetime.", "Missing loan payments often adds extra fees and interest, making the debt grow faster."] },
      sideQuestB: { title: "Credit vs. Debit", blurb: "A debit card spends money you already have, while a credit card borrows money you'll need to repay.", points: ["Using a credit card responsibly can help build a good credit history over time.", "Carrying a credit card balance month to month usually means paying significant extra interest."] },
      u3_intro: { title: "Understanding Tax", blurb: "Tax is a portion of money collected by the government to fund public services.", points: ["Sales tax, income tax, and property tax are all common types most people encounter.", "Tax rates and rules can vary significantly between different countries and regions."] },
      u3_branchA: { title: "Sales Tax & Discounts", blurb: "Sales tax adds a percentage on top of a price, while a discount subtracts one.", points: ["Sales tax is calculated as a percentage added on top of the listed price.", "A discount is calculated as a percentage subtracted from the listed price."] },
      u3_branchB: { title: "Calculating a Final Price", blurb: "Applying a discount and then adding tax (or vice versa) can give different final prices depending on the order.", points: ["Applying the discount before the tax usually results in a slightly lower final price than the reverse order.", "Reading whether a store applies tax before or after a discount avoids surprises at checkout."] },
      u3_branchC: { title: "Tips & Gratuities", blurb: "A tip is usually calculated as a percentage of a bill, similar to calculating tax.", points: ["A common tipping guideline in many places ranges from 15 to 20 percent of the bill.", "Some people calculate a tip on the pre-tax subtotal rather than the total including tax."] },
      u3_merge: { title: "Real-World Price Calculations", blurb: "Tax, discounts, and tips all rely on the exact same percentage skills applied differently.", points: ["A restaurant bill can require calculating tax and a tip in the very same transaction.", "Being quick with percentage calculations makes everyday shopping and dining noticeably easier."] },
      u3_hub2: { title: "Getting the Final Total Right", blurb: "Knowing the correct order to apply a discount and tax is essential for an accurate final price.", points: ["Small differences in calculation order can add up over many purchases or a large bill.", "Double-checking a receipt's math is a practical way to practice these skills in daily life."] },
      u3_dead1: { title: "Currency Exchange Basics", blurb: "An exchange rate tells you how much of one currency you'd receive for a set amount of another.", points: ["Exchange rates change constantly based on global financial markets.", "Multiplying an amount by the exchange rate converts it directly into the other currency."] },
      u3_dead2: { title: "Reading a Receipt", blurb: "A receipt itemizes exactly how a subtotal became a final total, through tax, discounts, or tips.", points: ["A receipt's subtotal is the price before tax, while the total includes tax added on.", "Comparing a receipt's listed prices against a budget helps catch unexpected charges."] },
      review: { title: "Everyday Financial Maths", blurb: "Budgeting, interest, and taxes together are the maths behind nearly every financial decision you'll make.", points: ["Comparing loan offers, planning a budget, and calculating a tip all draw on the exact same core percentage skills.", "Financial literacy built now pays off in avoiding costly money mistakes later in life."] }
    }
  },
  {
    id: "human-body-systems",
    title: "Human Body Systems",
    type: "Science",
    yeargroups: "6-8",
    description: "Tour the digestive, respiratory, circulatory, skeletal, muscular, and nervous systems.",
    medalNames: { test1: "Body Systems Starter", test2: "Circulation Specialist", test3: "Anatomy Ace" },
    specialTitles: { test1: "Digestion & Breathing Check", test2: "Circulation & Skeleton Check", test3: "Muscles & Nerves Check" },
    projects: {
      project1: {
        title: "Map the Body's Systems",
        brief: "Draw a simple body outline and label where the digestive, respiratory, circulatory, and skeletal systems are located.",
        checklist: ["Draw a body outline", "Label 4 systems", "Add one fact per system"]
      },
      project2: {
        title: "Design a Healthy Routine",
        brief: "Design a daily routine that supports at least three different body systems.",
        checklist: ["List 3 systems", "Add one habit per system", "Explain why each habit helps"]
      }
    },
    finalTitle: "Human Body Systems Final Exam",
    topics: {
      u1_intro: { title: "The Digestive System", blurb: "The digestive system breaks food down into nutrients your body can actually use.", points: ["Digestion actually begins in the mouth, where saliva starts breaking down food.", "The stomach's acid helps break food down further before it moves to the intestines."] },
      u1_branchA: { title: "The Journey of Food", blurb: "Food travels through a long tube, from mouth to stomach to intestines, being broken down the whole way.", points: ["The small intestine is where most nutrient absorption actually happens.", "The whole journey from mouth to the end of digestion can take a full day or more."] },
      u1_branchB: { title: "Nutrients & Absorption", blurb: "Nutrients are absorbed into the bloodstream mainly through the walls of the small intestine.", points: ["Tiny finger-like structures called villi line the small intestine to maximise absorption area.", "Absorbed nutrients travel through the bloodstream to reach every cell in the body."] },
      u1_branchC: { title: "The Respiratory System", blurb: "The respiratory system brings oxygen into the body and removes carbon dioxide.", points: ["Oxygen breathed in passes into the bloodstream through tiny air sacs called alveoli.", "Carbon dioxide, a waste product, is removed from the body every time you exhale."] },
      u1_merge: { title: "Digestion in Action", blurb: "Food's journey and nutrient absorption together explain how your body actually gets its fuel.", points: ["Broken-down nutrients from digestion need the bloodstream to actually reach the rest of the body.", "Skipping meals disrupts this entire fuel-supply process, not just the stomach."] },
      u1_hub2: { title: "Fuel and Oxygen Together", blurb: "Digestion and respiration both supply what your cells need to produce energy.", points: ["Cells combine digested nutrients with breathed-in oxygen to release usable energy.", "This energy-releasing process inside cells is called respiration, distinct from breathing itself."] },
      bonus1: { title: "Common Digestive Issues", blurb: "Problems like indigestion often occur when part of the digestive process is disrupted.", points: ["Eating too quickly can worsen indigestion by not giving the stomach time to work properly.", "Certain foods commonly trigger digestive discomfort in some people but not others."] },
      bonus2: { title: "Lung Capacity", blurb: "Lung capacity describes how much air your lungs can hold, and it can be trained over time.", points: ["Regular aerobic exercise, like running, can measurably increase lung capacity over time.", "Lung capacity naturally tends to decline gradually as people age."] },
      u2_intro: { title: "The Circulatory System", blurb: "The circulatory system pumps blood around the body, delivering oxygen and nutrients.", points: ["An adult heart beats roughly 100,000 times every single day.", "Blood completes a full loop through the entire body in less than a minute."] },
      u2_branchA: { title: "The Heart as a Pump", blurb: "The heart's four chambers work together to keep blood flowing in one continuous direction.", points: ["The heart's left side pumps oxygen-rich blood to the body, while the right pumps oxygen-poor blood to the lungs.", "Valves inside the heart prevent blood from flowing backward between beats."] },
      u2_branchB: { title: "Blood Vessels", blurb: "Arteries, veins, and capillaries each carry blood in a slightly different way.", points: ["Arteries carry blood away from the heart, usually under higher pressure than veins.", "Capillaries are so thin that oxygen and nutrients can pass directly through their walls."] },
      u2_branchC: { title: "The Skeletal System", blurb: "The skeleton provides structure, protection, and support for the entire body.", points: ["The adult human skeleton is made up of 206 bones.", "Bones also work with muscles as a system of levers to enable movement."] },
      u2_merge: { title: "Circulation & Structure", blurb: "The heart and blood vessels together form a complete transport network for the body.", points: ["Bone marrow, found inside certain bones, is actually where new blood cells are produced.", "Both systems depend on each other — bones protect vital organs that keep blood flowing."] },
      u2_hub2: { title: "Support and Transport Together", blurb: "Bones and blood vessels both provide essential support, just for very different purposes.", points: ["Broken bones can be more serious than they seem if they damage nearby blood vessels.", "Both systems must work correctly for the body to move and stay nourished at the same time."] },
      sideQuestA: { title: "Bones & Joints", blurb: "A joint is where two bones meet, allowing the skeleton to move.", points: ["Ball-and-socket joints, like the hip, allow movement in almost every direction.", "Cartilage cushions many joints, reducing friction between bones as they move."] },
      sideQuestB: { title: "Blood Types", blurb: "Blood types differ based on markers on the surface of red blood cells.", points: ["The main blood types are A, B, AB, and O, based on markers on red blood cells.", "Receiving the wrong blood type in a transfusion can cause a dangerous immune reaction."] },
      u3_intro: { title: "The Muscular System", blurb: "Muscles contract and relax to move the bones they're attached to.", points: ["Muscles can only pull, never push, which is why they usually work in opposing pairs.", "The human body contains over 600 distinct muscles."] },
      u3_branchA: { title: "Types of Muscles", blurb: "Skeletal, smooth, and cardiac muscles each work in a different way inside the body.", points: ["Cardiac muscle is found only in the heart and never gets tired the way other muscles do.", "Smooth muscle works automatically, controlling organs like the stomach without any conscious effort."] },
      u3_branchB: { title: "The Nervous System", blurb: "The nervous system carries electrical signals between the brain and the rest of the body.", points: ["Nerve signals can travel at speeds of over 100 meters per second in some cases.", "The nervous system is divided into the central nervous system and the peripheral nervous system."] },
      u3_branchC: { title: "The Brain's Main Jobs", blurb: "The brain controls thought, movement, and nearly every automatic body process.", points: ["Different regions of the brain specialize in different tasks, like vision, movement, or memory.", "The brain uses a significant portion of the body's total energy despite its relatively small size."] },
      u3_merge: { title: "Muscles & Movement", blurb: "Muscle types explain how such a wide range of body movements is actually possible.", points: ["Skeletal muscles are the only type under voluntary, conscious control.", "Even simple movements, like picking up a cup, require many different muscles working together."] },
      u3_hub2: { title: "Signals That Create Movement", blurb: "The nervous system is what actually tells muscles exactly when to contract.", points: ["A nerve signal travels from the brain to a muscle in a tiny fraction of a second.", "This is why reaction speed depends heavily on how quickly nerve signals can travel."] },
      u3_dead1: { title: "Reflexes", blurb: "A reflex is an automatic response that happens before the brain even fully processes what occurred.", points: ["Reflexes are processed at the level of the spinal cord, without waiting for the brain.", "This is why pulling your hand away from something hot happens almost instantly."] },
      u3_dead2: { title: "Keeping Body Systems Healthy", blurb: "Exercise, sleep, and nutrition all support multiple body systems at the same time.", points: ["Regular exercise benefits the circulatory, muscular, and respiratory systems all at the same time.", "Consistent sleep is essential for the nervous system to properly rest and recover."] },
      review: { title: "The Body as One System", blurb: "Every body system depends on the others, working together every second of every day.", points: ["A single action, like running, simultaneously engages the muscular, circulatory, respiratory, and nervous systems.", "No single body system could function for long without support from all the others."] }
    }
  },
  {
    id: "ecosystems-and-environment",
    title: "Ecosystems & Environment",
    type: "Science",
    yeargroups: "5-7",
    description: "Explore food webs, habitats, and how human activity reshapes the natural world.",
    medalNames: { test1: "Ecosystem Explorer", test2: "Community Curator", test3: "Conservation Champion" },
    specialTitles: { test1: "Food Webs Check", test2: "Communities Check", test3: "Human Impact Check" },
    projects: {
      project1: {
        title: "Design a Balanced Ecosystem",
        brief: "Design a fictional ecosystem including producers, consumers, decomposers, and their relationships.",
        checklist: ["Include 3+ producers/consumers", "Include a decomposer", "Describe one relationship"]
      },
      project2: {
        title: "Propose a Conservation Plan",
        brief: "Choose a damaged ecosystem and propose three realistic steps to help it recover.",
        checklist: ["Choose an ecosystem", "Identify the damage", "Propose 3 recovery steps"]
      }
    },
    finalTitle: "Ecosystems & Environment Final Exam",
    topics: {
      u1_intro: { title: "What is an Ecosystem?", blurb: "An ecosystem is a community of living things interacting with each other and their environment.", points: ["An ecosystem includes both living organisms and non-living elements like water, soil, and sunlight.", "Ecosystems can range enormously in size, from a small pond to an entire rainforest."] },
      u1_branchA: { title: "Producers, Consumers & Decomposers", blurb: "Producers make their own food, consumers eat other organisms, and decomposers break down the dead.", points: ["Producers, mostly plants, are the ultimate energy source for almost every other organism in an ecosystem.", "Decomposers, like fungi, recycle nutrients back into the soil for producers to use again."] },
      u1_branchB: { title: "Food Chains", blurb: "A food chain shows the one-way flow of energy from one organism to the next.", points: ["Energy is lost at each step of a food chain, which is why chains rarely have more than four or five links.", "Every food chain begins with a producer capturing energy from the sun."] },
      u1_branchC: { title: "Food Webs", blurb: "A food web connects many overlapping food chains into one complex network.", points: ["A food web better represents reality, since most organisms eat more than just one type of food.", "Removing a single species can ripple through an entire food web in unexpected ways."] },
      u1_merge: { title: "Energy Flowing Through an Ecosystem", blurb: "Producers, consumers, and decomposers together move energy through every food chain.", points: ["Every calorie of energy in an ecosystem can ultimately be traced back to producers and sunlight.", "Decomposers ensure that nutrients trapped in dead organisms get released back into the ecosystem."] },
      u1_hub2: { title: "From Chains to Webs", blurb: "Food chains combine into food webs once you account for every organism's real diet.", points: ["An organism's real diet is rarely limited to just one food chain.", "Mapping every chain an organism belongs to is what turns a simple chain into a full web."] },
      bonus1: { title: "Habitats", blurb: "A habitat is the specific place where an organism naturally lives.", points: ["A single ecosystem can contain many different habitats side by side.", "An organism's specific adaptations are usually closely matched to its particular habitat."] },
      bonus2: { title: "Predators & Prey", blurb: "A predator hunts other animals, called prey, in order to survive.", points: ["Predator and prey populations often rise and fall in a connected, cyclical pattern over time.", "Prey species often evolve defenses, like speed or camouflage, in direct response to predators."] },
      u2_intro: { title: "Populations & Communities", blurb: "A population is one species in an area, while a community is every population living together.", points: ["A single ecosystem is typically made up of many different populations living together.", "A community includes every interacting population, but not the non-living parts of the environment."] },
      u2_branchA: { title: "Competition for Resources", blurb: "Organisms constantly compete with each other for food, space, and water.", points: ["Competition can occur between members of the same species or between entirely different species.", "Limited resources are usually what set the maximum population size an environment can support."] },
      u2_branchB: { title: "Adaptations for Survival", blurb: "An adaptation is a trait that helps an organism survive in its particular environment.", points: ["Adaptations can be physical, like camouflage, or behavioral, like migration.", "An adaptation typically develops over many generations, not within a single organism's lifetime."] },
      u2_branchC: { title: "Symbiotic Relationships", blurb: "In a symbiotic relationship, two different species interact closely, sometimes helping and sometimes harming each other.", points: ["In mutualism, both species benefit, like bees pollinating flowers while collecting nectar.", "In parasitism, one species benefits while the other is harmed."] },
      u2_merge: { title: "Living Together in a Community", blurb: "Competition and adaptation together shape how a whole community of species survives.", points: ["Competition often pushes species toward different adaptations to avoid needing the exact same resources.", "A stable community usually reflects a long history of these competitive and cooperative pressures."] },
      u2_hub2: { title: "Relationships That Shape Survival", blurb: "Adaptations and symbiotic relationships both determine which species thrive side by side.", points: ["Symbiotic relationships are themselves a powerful driver of which adaptations evolve over time.", "Removing one species from a symbiotic pair can seriously harm or even eliminate the other."] },
      sideQuestA: { title: "Invasive Species", blurb: "An invasive species can seriously disrupt an ecosystem it wasn't originally part of.", points: ["Invasive species often thrive because the ecosystem they invade lacks their natural predators.", "Preventing new invasive species from arriving is usually far easier than removing them later."] },
      sideQuestB: { title: "Keystone Species", blurb: "A keystone species has an outsized effect on its ecosystem compared to its actual numbers.", points: ["Removing a keystone species can cause a dramatic, rapid collapse in an ecosystem's balance.", "Sea otters are a classic keystone species example, since they control sea urchin populations that would otherwise destroy kelp forests."] },
      u3_intro: { title: "Human Impact on Ecosystems", blurb: "Human activity, like farming and building cities, constantly reshapes natural ecosystems.", points: ["Urban development often fragments habitats into smaller, disconnected pieces.", "Agriculture can both support human populations and significantly disrupt local ecosystems."] },
      u3_branchA: { title: "Pollution & Its Effects", blurb: "Pollution introduces harmful substances into an ecosystem, often with effects lasting decades.", points: ["Water pollution can travel far from its original source, affecting ecosystems downstream.", "Some pollutants accumulate in animals' bodies over time, becoming more concentrated up the food chain."] },
      u3_branchB: { title: "Deforestation", blurb: "Deforestation removes entire forest ecosystems, displacing countless species at once.", points: ["Tropical rainforests, despite covering a small fraction of Earth's surface, hold an enormous share of its biodiversity.", "Deforestation can also disrupt local and even global weather patterns."] },
      u3_branchC: { title: "Conservation Efforts", blurb: "Conservation efforts try to protect or restore ecosystems damaged by human activity.", points: ["Protected nature reserves are one of the most direct tools used in conservation.", "Successful conservation often requires cooperation between scientists, governments, and local communities."] },
      u3_merge: { title: "Human Impact in Focus", blurb: "Pollution and deforestation are two of the clearest examples of human impact on ecosystems.", points: ["Both pollution and deforestation can push vulnerable species toward extinction.", "Reversing this kind of damage is often far slower and more expensive than preventing it in the first place."] },
      u3_hub2: { title: "Protecting What's Left", blurb: "Conservation efforts are a direct response to the damage caused by pollution and deforestation.", points: ["Conservation efforts are most successful when they address the root causes of pollution or habitat loss.", "International cooperation is often necessary since ecosystem damage rarely respects national borders."] },
      u3_dead1: { title: "Climate Change Basics", blurb: "Climate change is a long-term shift in global temperature and weather patterns, largely driven by human activity.", points: ["Rising global temperatures can shift habitats faster than some species are able to adapt.", "Melting ice and rising sea levels are among the most visible effects of climate change."] },
      u3_dead2: { title: "Recycling & Sustainability", blurb: "Sustainable habits, like recycling, aim to reduce the ongoing human impact on ecosystems.", points: ["Recycling reduces the demand for newly extracted raw materials from ecosystems.", "Small individual sustainable habits add up significantly when adopted across large populations."] },
      review: { title: "Our Role in Nature's Balance", blurb: "Ecosystems are naturally balanced, but human choices now play a huge role in keeping that balance intact.", points: ["Understanding food webs helps predict how a single human action might ripple through an entire ecosystem.", "Conservation success stories show that human-caused damage to ecosystems can sometimes be reversed."] }
    }
  },
  {
    id: "electricity-and-magnetism",
    title: "Electricity & Magnetism",
    type: "Science",
    yeargroups: "8-10",
    description: "From static charge to circuits to electromagnets — see how electricity and magnetism connect.",
    medalNames: { test1: "Charge Champion", test2: "Circuit Builder", test3: "Magnetism Master" },
    specialTitles: { test1: "Electric Charge Check", test2: "Circuits Check", test3: "Magnetism Check" },
    projects: {
      project1: {
        title: "Design a Circuit Diagram",
        brief: "Design a simple circuit with at least one switch and one bulb, drawn using standard symbols.",
        checklist: ["Include a power source", "Include a switch", "Include a bulb or component"]
      },
      project2: {
        title: "Build an Electromagnet Plan",
        brief: "Design an experiment using a coiled wire and battery to create an electromagnet, predicting what would make it stronger.",
        checklist: ["Describe the setup", "Predict what increases strength", "Explain your reasoning"]
      }
    },
    finalTitle: "Electricity & Magnetism Final Exam",
    topics: {
      u1_intro: { title: "What is Electric Charge?", blurb: "Electric charge is a basic property of matter that can be positive or negative.", points: ["Like charges repel each other, while opposite charges attract.", "Electrons carry negative charge, while protons carry positive charge."] },
      u1_branchA: { title: "Static Electricity", blurb: "Static electricity builds up when charge collects on a surface without flowing anywhere.", points: ["Rubbing two materials together can transfer electrons, building up static charge on one of them.", "A static shock is simply that built-up charge suddenly discharging all at once."] },
      u1_branchB: { title: "Electric Current", blurb: "Electric current is the steady flow of electric charge through a conductor.", points: ["Current is measured in amperes, often shortened to amps.", "A steady electric current requires a complete, unbroken loop called a circuit."] },
      u1_branchC: { title: "Conductors & Insulators", blurb: "A conductor allows charge to flow freely, while an insulator blocks it almost entirely.", points: ["Metals like copper are excellent conductors because their electrons move freely.", "Rubber and plastic are common insulators, which is why they're used to coat electrical wires."] },
      u1_merge: { title: "From Static to Flowing Charge", blurb: "Static electricity and electric current are really the same charge, just still versus moving.", points: ["Static charge only becomes useful current once it's given a path along which to flow continuously.", "Lightning is essentially an enormous, sudden static discharge turned briefly into current."] },
      u1_hub2: { title: "Controlling Where Charge Flows", blurb: "Conductors and insulators together determine exactly where an electric current can and can't go.", points: ["Wrapping a conductor in an insulator is exactly how electrical cables safely carry current.", "Without insulators, stray current could flow unpredictably and dangerously."] },
      bonus1: { title: "Lightning", blurb: "Lightning is a dramatic, natural discharge of built-up static electricity between clouds and the ground.", points: ["A single lightning bolt can heat the surrounding air to temperatures hotter than the surface of the Sun.", "Lightning typically strikes the tallest nearby object, which is why lightning rods are placed on buildings."] },
      bonus2: { title: "Static Shocks", blurb: "A static shock happens when built-up charge suddenly discharges through your body.", points: ["Dry air makes static shocks more common because moisture normally helps charge dissipate gradually.", "Touching a metal object, like a doorknob, is a common trigger for noticing a static shock."] },
      u2_intro: { title: "Simple Circuits", blurb: "A simple circuit is a complete loop that allows electric current to flow continuously.", points: ["Breaking the loop at any single point stops current from flowing anywhere in a simple circuit.", "A basic circuit needs a power source, a conducting path, and typically a component like a bulb."] },
      u2_branchA: { title: "Series Circuits", blurb: "In a series circuit, every component shares the exact same single path for current.", points: ["If one bulb burns out in a series circuit, every other bulb on that same path also goes out.", "Adding more components to a series circuit increases the total resistance in the loop."] },
      u2_branchB: { title: "Parallel Circuits", blurb: "In a parallel circuit, current can take multiple separate paths at once.", points: ["If one bulb burns out in a parallel circuit, the others can keep working through their own separate path.", "Most household wiring uses parallel circuits so one broken appliance doesn't disable everything else."] },
      u2_branchC: { title: "Voltage, Current & Resistance", blurb: "Voltage pushes current through a circuit, while resistance pushes back against it.", points: ["Higher resistance in a circuit reduces the current for a given voltage.", "Voltage is often compared to water pressure pushing current through a pipe-like circuit."] },
      u2_merge: { title: "Building Working Circuits", blurb: "Series and parallel circuits are the two basic ways any working circuit can be built.", points: ["Real circuits, like household wiring, often combine both series and parallel sections.", "Choosing series or parallel depends entirely on whether components should depend on each other."] },
      u2_hub2: { title: "What Controls the Flow", blurb: "Voltage, current, and resistance together determine exactly how a circuit behaves.", points: ["Changing any one of voltage, current, or resistance changes how the whole circuit behaves.", "Engineers rely on this relationship constantly when designing safe, working electrical devices."] },
      sideQuestA: { title: "Ohm's Law Basics", blurb: "Ohm's law links voltage, current, and resistance together in one simple equation.", points: ["Ohm's law is written as voltage equals current times resistance.", "Knowing any two of the three values in Ohm's law lets you calculate the third."] },
      sideQuestB: { title: "Circuit Symbols", blurb: "Circuit diagrams use standard symbols so any component can be recognised instantly.", points: ["A zigzag line is the standard symbol for a resistor in a circuit diagram.", "Standard symbols let engineers anywhere in the world read the same circuit diagram correctly."] },
      u3_intro: { title: "What is Magnetism?", blurb: "Magnetism is a force that attracts certain materials, like iron, without any physical contact.", points: ["Only a few materials, like iron, nickel, and cobalt, are strongly attracted to magnets.", "Every magnet has both a north pole and a south pole, no matter how small it's broken."] },
      u3_branchA: { title: "Magnetic Fields", blurb: "A magnetic field is the invisible region around a magnet where its force can be felt.", points: ["Magnetic field lines always run from a magnet's north pole to its south pole.", "A magnetic field's strength decreases the further you move away from the magnet."] },
      u3_branchB: { title: "Electromagnets", blurb: "An electromagnet is a magnet created by running an electric current through a coiled wire.", points: ["Increasing the number of coils in the wire generally makes an electromagnet stronger.", "Unlike a permanent magnet, an electromagnet can be switched on and off by controlling the current."] },
      u3_branchC: { title: "Permanent vs. Temporary Magnets", blurb: "A permanent magnet keeps its magnetism, while a temporary one, like an electromagnet, loses it once the current stops.", points: ["A temporary magnet, like an electromagnet, loses its magnetism the instant the current is switched off.", "Some materials can become permanently magnetized after being exposed to a strong magnetic field."] },
      u3_merge: { title: "Electricity Creating Magnetism", blurb: "Magnetic fields and electromagnets together reveal the deep link between electricity and magnetism.", points: ["Moving electric charge always creates a magnetic field around it, even in a simple wire.", "This exact link is what makes electromagnets possible in the first place."] },
      u3_hub2: { title: "Magnets That Can Switch On and Off", blurb: "Comparing permanent and temporary magnets shows exactly what electric current adds to magnetism.", points: ["Being able to switch a magnet on and off makes electromagnets far more useful in machinery than permanent magnets.", "Cranes that lift scrap metal rely on powerful electromagnets that can release their load on command."] },
      u3_dead1: { title: "Electric Motors Basics", blurb: "An electric motor uses a spinning electromagnet to convert electrical energy into motion.", points: ["A spinning electromagnet inside a motor interacts with surrounding magnets to produce continuous rotation.", "Electric motors power everything from electric cars to simple kitchen appliances."] },
      u3_dead2: { title: "Generators", blurb: "A generator does the reverse of a motor, using motion to produce electricity.", points: ["Moving a wire through a magnetic field is enough to generate an electric current.", "Power plants use spinning generators, often driven by steam, water, or wind, to produce electricity."] },
      review: { title: "Electricity & Magnetism United", blurb: "Electricity and magnetism are so closely linked that generators and motors are essentially mirror images of each other.", points: ["This deep connection between electricity and magnetism is called electromagnetism.", "Nearly all modern electricity generation and countless devices rely on this single unified principle."] }
    }
  },
  {
    id: "earth-science-and-weather",
    title: "Earth Science & Weather",
    type: "Science",
    yeargroups: "4-6",
    description: "Explore Earth's layers, the water cycle, and how everyday weather actually works.",
    medalNames: { test1: "Earth Structure Star", test2: "Water Cycle Whiz", test3: "Weather Watcher" },
    specialTitles: { test1: "Earth's Layers Check", test2: "Water Cycle Check", test3: "Weather Check" },
    projects: {
      project1: {
        title: "Illustrate the Water Cycle",
        brief: "Draw and label a complete diagram of the water cycle, including all major stages.",
        checklist: ["Draw evaporation", "Draw condensation and clouds", "Draw precipitation"]
      },
      project2: {
        title: "Create a Weather Forecast",
        brief: "Create a 3-day weather forecast for a fictional location, explaining your reasoning.",
        checklist: ["Describe 3 days of weather", "Include temperature and precipitation", "Explain your reasoning"]
      }
    },
    finalTitle: "Earth Science & Weather Final Exam",
    topics: {
      u1_intro: { title: "Layers of the Earth", blurb: "The Earth is built from several distinct layers, from the crust down to the core.", points: ["The crust is the thinnest of Earth's layers, yet it's the one we actually live on.", "The core is the hottest layer, reaching temperatures similar to the surface of the Sun."] },
      u1_branchA: { title: "The Crust & Plates", blurb: "The Earth's crust is broken into huge moving pieces called tectonic plates.", points: ["There are seven major tectonic plates, along with several smaller ones.", "Continents slowly drift as the tectonic plates beneath them shift over millions of years."] },
      u1_branchB: { title: "The Mantle & Core", blurb: "Beneath the crust, the mantle and core are far hotter and denser than the surface.", points: ["The mantle is made of slow-moving, semi-solid rock, unlike the crust's rigid surface.", "The core is divided into a solid inner part and a liquid outer part."] },
      u1_branchC: { title: "Plate Movement", blurb: "Tectonic plates drift slowly over time, powered by heat from deep within the Earth.", points: ["Tectonic plates typically move only a few centimeters per year, about as fast as fingernails grow.", "Where two plates meet is often where earthquakes and volcanoes are most common."] },
      u1_merge: { title: "Earth's Structure in Motion", blurb: "The crust, mantle, and core together explain why the Earth's surface is always slowly shifting.", points: ["Heat rising from the core drives slow currents in the mantle that push the crust's plates.", "This constant, slow motion is what reshapes Earth's continents over immense spans of time."] },
      u1_hub2: { title: "What Drives Plate Movement", blurb: "The mantle's heat is the hidden engine behind the crust's constant plate movement.", points: ["Without the mantle's internal heat, tectonic plates would eventually stop moving entirely.", "This heat ultimately comes from the Earth's formation and the decay of radioactive elements deep inside."] },
      bonus1: { title: "Volcanoes", blurb: "A volcano forms where molten rock escapes from beneath the Earth's crust.", points: ["Most volcanoes form along the boundaries between tectonic plates.", "Not every volcano is currently active — some lie dormant for centuries between eruptions."] },
      bonus2: { title: "Earthquakes", blurb: "An earthquake happens when built-up stress along a fault suddenly releases.", points: ["Earthquakes are measured using a scale that reflects how much energy is released.", "Aftershocks, smaller earthquakes following a larger one, can continue for days or weeks afterward."] },
      u2_intro: { title: "The Water Cycle", blurb: "The water cycle describes how water constantly moves between the ground, oceans, and sky.", points: ["The water cycle has no true beginning or end — it's a continuous, repeating loop.", "The same water molecules have effectively been cycling through this process for billions of years."] },
      u2_branchA: { title: "Evaporation & Condensation", blurb: "Evaporation turns liquid water into vapour, while condensation turns it back into liquid.", points: ["The Sun's heat is the main energy source driving evaporation across oceans and lakes.", "Condensation is exactly what forms the tiny water droplets that make up clouds."] },
      u2_branchB: { title: "Precipitation", blurb: "Precipitation is any water, like rain or snow, that falls back down from the clouds.", points: ["Whether precipitation falls as rain, snow, sleet, or hail depends mostly on the temperature of the air it passes through.", "Precipitation is what eventually returns evaporated water back to the Earth's surface."] },
      u2_branchC: { title: "Clouds & Cloud Types", blurb: "Different cloud types form at different heights and often signal different coming weather.", points: ["Tall, dark clouds called cumulonimbus often signal an approaching thunderstorm.", "Wispy, high-altitude cirrus clouds are usually associated with fair weather."] },
      u2_merge: { title: "The Water Cycle in Motion", blurb: "Evaporation, condensation, and precipitation together keep the water cycle constantly running.", points: ["Interrupting any single stage, like evaporation, would eventually stop rain from falling anywhere.", "This is why the water cycle is often described as a closed, self-sustaining system."] },
      u2_hub2: { title: "Clouds and What They Bring", blurb: "Cloud types are a visible clue to where a location sits in the ongoing water cycle.", points: ["Recognising cloud types is one of the simplest ways to predict short-term weather changes.", "Meteorologists rely heavily on cloud patterns when building accurate forecasts."] },
      sideQuestA: { title: "Humidity", blurb: "Humidity measures how much water vapour is currently in the air.", points: ["High humidity makes hot weather feel even hotter, since sweat evaporates more slowly.", "Humidity levels can vary enormously between a dry desert and a tropical rainforest."] },
      sideQuestB: { title: "Fog & Dew", blurb: "Fog and dew both form when air cools enough for water vapour to condense near the ground.", points: ["Fog is essentially a cloud that has formed at ground level rather than high in the sky.", "Dew typically forms overnight as surfaces cool faster than the surrounding air."] },
      u3_intro: { title: "Weather vs. Climate", blurb: "Weather is the short-term condition of the atmosphere, while climate is the long-term pattern over years.", points: ["A single unusually cold day doesn't disprove a long-term warming climate trend, since weather and climate operate on different timescales.", "Climate is typically measured using weather data averaged over at least thirty years."] },
      u3_branchA: { title: "Reading a Weather Map", blurb: "A weather map uses symbols and lines to show temperature, pressure, and expected conditions.", points: ["Lines connecting points of equal pressure on a weather map are called isobars.", "Closely spaced lines on a weather map usually indicate strong, fast-changing winds."] },
      u3_branchB: { title: "Air Pressure & Wind", blurb: "Wind is caused by air moving from areas of high pressure toward areas of low pressure.", points: ["Warm air generally rises, creating areas of lower pressure near the ground.", "The greater the pressure difference between two areas, the stronger the resulting wind."] },
      u3_branchC: { title: "Storms & Extreme Weather", blurb: "Storms form when warm, moist air and pressure differences combine in just the right way.", points: ["Hurricanes form specifically over warm ocean waters that provide huge amounts of energy.", "Extreme weather events often form where two very different air masses collide."] },
      u3_merge: { title: "Predicting the Weather", blurb: "Weather maps and pressure systems together are the foundation of everyday weather forecasting.", points: ["Modern forecasting combines weather maps, satellite images, and computer models together.", "Even with modern tools, weather forecasts become significantly less reliable more than about ten days ahead."] },
      u3_hub2: { title: "When Weather Turns Extreme", blurb: "Pressure differences that are usually mild can intensify into genuinely extreme storms.", points: ["A relatively small shift in typical pressure patterns can sometimes trigger an unusually severe storm.", "Meteorologists closely track these shifts to issue early warnings for extreme weather."] },
      u3_dead1: { title: "Seasons Recap", blurb: "Seasons occur because of Earth's tilt, not because of its distance from the Sun.", points: ["The hemisphere tilted toward the Sun always experiences summer at that time of year.", "Earth's tilt remains remarkably constant throughout its entire yearly orbit."] },
      u3_dead2: { title: "Climate Zones Recap", blurb: "Different climate zones experience very different long-term weather patterns.", points: ["Regions near the equator tend to have warm climates year-round due to more direct sunlight.", "Mountainous regions can have dramatically different climates than nearby lowland areas at similar latitudes."] },
      review: { title: "Earth's Constantly Changing Systems", blurb: "From shifting plates to swirling storms, Earth's systems are in constant, connected motion.", points: ["A single major earthquake or storm can noticeably reshape both landscapes and weather patterns.", "Studying Earth's systems together helps scientists better predict natural disasters before they strike."] }
    }
  },
  {
    id: "sculpture-and-3d-art",
    title: "Sculpture & 3D Art",
    type: "Music and Art",
    yeargroups: "6-8",
    description: "Build, carve, and design in three dimensions, from clay to full installations.",
    medalNames: { test1: "Sculpture Starter", test2: "Form Finder", test3: "3D Art Visionary" },
    specialTitles: { test1: "Materials & Methods Check", test2: "Form & Space Check", test3: "History & Concepts Check" },
    projects: {
      project1: {
        title: "Design a Clay Sculpture",
        brief: "Design a small sculpture using additive clay techniques, planning its form and balance.",
        checklist: ["Sketch the planned form", "Explain the balance point", "Describe the texture"]
      },
      project2: {
        title: "Design an Installation Concept",
        brief: "Sketch a concept for a small installation artwork that transforms a room or space.",
        checklist: ["Choose a space", "Sketch the concept", "Explain the intended experience"]
      }
    },
    finalTitle: "Sculpture & 3D Art Final Exam",
    topics: {
      u1_intro: { title: "What is Sculpture?", blurb: "Sculpture is art created in three dimensions, meant to be viewed from many angles.", points: ["A sculpture can be experienced differently depending on which angle a viewer walks around to.", "Unlike a painting, sculpture exists physically in the same space as its viewer."] },
      u1_branchA: { title: "Additive Sculpture", blurb: "Additive sculpture builds a form up by adding material piece by piece, like clay.", points: ["Clay and wax are common materials for additive sculpture since they can be shaped and reshaped easily.", "Additive sculpture allows an artist to change their mind and simply add more material as they go."] },
      u1_branchB: { title: "Subtractive Sculpture", blurb: "Subtractive sculpture removes material from a larger block, like carving stone or wood.", points: ["Subtractive sculpture is far less forgiving of mistakes, since removed material can't be put back.", "Stone carving is one of the oldest subtractive sculpture techniques in human history."] },
      u1_branchC: { title: "Sculpture Materials", blurb: "Clay, stone, wood, and metal each shape how a sculpture can be made and how long it lasts.", points: ["Bronze casting allows a soft clay original to be turned into a durable, weatherproof final piece.", "Wood is lighter than stone but more vulnerable to rot and insect damage over time."] },
      u1_merge: { title: "Building vs. Carving", blurb: "Additive and subtractive sculpture are two opposite approaches to reaching the same finished form.", points: ["An artist choosing additive methods can experiment freely, while one carving must plan carefully in advance.", "Some sculptors combine both approaches within a single finished piece."] },
      u1_hub2: { title: "Choosing the Right Material", blurb: "The material chosen often decides whether a sculpture should be built additively or carved subtractively.", points: ["A material's weight, durability, and cost often decide whether additive or subtractive methods make more sense.", "Outdoor public sculptures usually favour durable materials like bronze or stone over more fragile ones like clay."] },
      bonus1: { title: "Famous Sculptures", blurb: "Famous sculptures, from ancient statues to modern installations, show sculpture's huge range of styles.", points: ["Michelangelo's David is one of the most famous examples of subtractive marble carving in history.", "Modern sculptors have used everything from scrap metal to inflatable materials to create iconic works."] },
      bonus2: { title: "Sculpture in Public Spaces", blurb: "Public sculptures are designed to be experienced by an entire community, not just in a gallery.", points: ["Public sculptures must withstand years of weather exposure and public interaction.", "A well-placed public sculpture can become a defining symbol of an entire city or park."] },
      u2_intro: { title: "Form & Volume", blurb: "Form describes a sculpture's overall 3D shape, while volume describes the space it occupies.", points: ["Form focuses on the outer shape of a piece, while volume focuses on the space it fills or displaces.", "A sculptor must consider a form from every possible viewing angle, not just the front."] },
      u2_branchA: { title: "Positive & Negative Space", blurb: "Positive space is the solid form itself, while negative space is the empty area around or within it.", points: ["A sculpture with a hole through its middle uses negative space as a deliberate design feature.", "Negative space can be just as expressive and important as the solid material itself."] },
      u2_branchB: { title: "Texture in Sculpture", blurb: "Texture in sculpture can be felt as well as seen, unlike texture in a painting.", points: ["A rough, unfinished texture can convey raw energy, while a smooth polish can convey elegance.", "Many museums specifically prohibit touching sculptures despite their inviting tactile texture."] },
      u2_branchC: { title: "Balance & Stability", blurb: "A sculpture must be physically balanced, not just visually, or it simply won't stand up.", points: ["A sculpture with a wide, heavy base is far more physically stable than one balanced on a narrow point.", "Sculptors sometimes use hidden internal supports to achieve a balance that looks impossible."] },
      u2_merge: { title: "Shaping Form with Space", blurb: "Form, volume, and negative space together define how a sculpture actually reads from any angle.", points: ["A sculpture's negative space can dramatically change how its overall volume is perceived by a viewer.", "Walking around a well-designed sculpture reveals entirely new relationships between form and space."] },
      u2_hub2: { title: "Texture and Physical Balance", blurb: "Texture invites touch, but balance is what makes a sculpture safe to touch in the first place.", points: ["An inviting texture means little if the sculpture itself isn't stable enough to survive being touched.", "Both texture and balance must be considered together for a sculpture to succeed as physical, interactive art."] },
      sideQuestA: { title: "Relief Sculpture", blurb: "A relief sculpture is carved so it stays attached to a flat background, partway between 2D and 3D.", points: ["A relief sculpture can range from barely raised, called low relief, to almost fully three-dimensional, called high relief.", "Ancient civilizations frequently used relief sculpture to carve historical scenes directly into temple walls."] },
      sideQuestB: { title: "Kinetic Sculpture", blurb: "A kinetic sculpture is designed to move, often powered by wind, motors, or touch.", points: ["Some kinetic sculptures respond directly to wind, creating an ever-changing, unrepeatable pattern of motion.", "Kinetic sculpture challenges the traditional idea that sculpture must be a fixed, unmoving object."] },
      u3_intro: { title: "Sculpture Through History", blurb: "Sculpture has existed since ancient times, evolving constantly alongside human culture.", points: ["Some of the earliest known sculptures date back tens of thousands of years.", "Sculpture has served religious, political, and purely artistic purposes across different eras."] },
      u3_branchA: { title: "Classical Sculpture", blurb: "Classical sculpture, from Greece and Rome, prized realistic human proportion and idealized beauty.", points: ["Classical Greek and Roman sculptors often idealized the human body rather than depicting it exactly as observed.", "Many surviving classical sculptures were originally painted in bright colours, though the paint has faded over time."] },
      u3_branchB: { title: "Modern & Abstract Sculpture", blurb: "Modern sculpture often abandons realism entirely in favour of abstract shapes and ideas.", points: ["Modern sculptors were often more interested in an idea or emotion than in creating a realistic likeness.", "Abstract sculpture asks viewers to interpret meaning rather than simply recognise a familiar subject."] },
      u3_branchC: { title: "Installation Art", blurb: "Installation art often transforms an entire space into a single, immersive 3D artwork.", points: ["An installation artwork often can't be fully experienced through a photograph — it requires being physically present.", "Installation art frequently invites the viewer to walk through or interact with the piece directly."] },
      u3_merge: { title: "From Classical to Modern", blurb: "Classical and modern sculpture show just how dramatically ideas about 3D art have changed.", points: ["The journey from idealized realism to pure abstraction represents one of art history's biggest philosophical shifts.", "Modern sculptors were often reacting directly against the classical traditions they'd been trained in."] },
      u3_hub2: { title: "Sculpture Becoming an Experience", blurb: "Modern and installation art both push sculpture beyond a single object into a full experience.", points: ["Installation art takes the modern rejection of realism even further by rejecting the idea of a single, fixed object.", "Both modern sculpture and installation art prioritize the viewer's experience over strict technical realism."] },
      u3_dead1: { title: "Sculpture Techniques Today", blurb: "Modern tools, like 3D printing, are adding entirely new techniques to sculpture's long history.", points: ["3D printing allows sculptors to prototype complex forms digitally before ever touching physical material.", "Some contemporary sculptors blend traditional carving with entirely new digital fabrication techniques."] },
      u3_dead2: { title: "Caring for Sculptures", blurb: "Sculptures displayed outdoors need special care to survive weather and time.", points: ["Bronze sculptures develop a greenish patina over time from natural weathering, which some artists deliberately encourage.", "Museums carefully control humidity and temperature to prevent delicate sculptures from cracking or warping."] },
      review: { title: "Thinking in Three Dimensions", blurb: "Every sculpture, from ancient statues to modern installations, asks an artist to think fully in three dimensions.", points: ["A sculptor must consider material, form, balance, and viewing angle all at the very same time.", "Studying sculpture's history reveals how three-dimensional art has continuously redefined what counts as art itself."] }
    }
  },
  {
    id: "introduction-to-songwriting",
    title: "Introduction to Songwriting",
    type: "Music and Art",
    yeargroups: "11-13",
    description: "Write lyrics, melodies, and chord progressions, and combine them into a complete original song.",
    medalNames: { test1: "Songwriting Starter", test2: "Lyricist", test3: "Songsmith" },
    specialTitles: { test1: "Song Structure Check", test2: "Lyrics Check", test3: "Melody & Chords Check" },
    projects: {
      project1: {
        title: "Write a Verse and Chorus",
        brief: "Write one verse and one chorus for an original song, built around a single theme.",
        checklist: ["Choose a theme", "Write a verse", "Write a chorus with a hook"]
      },
      project2: {
        title: "Finish a Full Song Sketch",
        brief: "Combine your verse, chorus, and a chord progression into a complete rough song sketch.",
        checklist: ["Add a chord progression", "Fit a melody to it", "Combine with your lyrics"]
      }
    },
    finalTitle: "Introduction to Songwriting Final Exam",
    topics: {
      u1_intro: { title: "What Makes a Song?", blurb: "A song typically combines a melody, lyrics, and a chord progression into one complete piece.", points: ["Even a song with no lyrics, like an instrumental, still relies on melody and structure to feel complete.", "Changing just one of the three core elements, melody, lyrics, or chords, can transform a song entirely."] },
      u1_branchA: { title: "Song Structure Basics", blurb: "Verse, chorus, and bridge are the basic building blocks most songs are built from.", points: ["A bridge typically appears once, providing contrast before the song returns to a familiar section.", "Most pop songs repeat the chorus multiple times to make it feel memorable and singable."] },
      u1_branchB: { title: "Writing a Hook", blurb: "A hook is the single most memorable, catchy moment in an entire song.", points: ["A hook often relies on a short, repeated melodic or lyrical phrase that's easy to remember.", "Many hit songs are built entirely around discovering one strong hook first."] },
      u1_branchC: { title: "Song Themes", blurb: "A strong song usually centres on one clear theme or feeling, explored throughout.", points: ["A theme doesn't need to be original — countless songs are written about love, loss, or hope.", "Specific personal details within a universal theme often make a song feel more genuine."] },
      u1_merge: { title: "Structure & Hooks Together", blurb: "A song's structure gives a hook the perfect moment to land and stick with a listener.", points: ["Placing the hook at the very end of the chorus is a common trick to make it stick in a listener's memory.", "A weak structure can bury even a genuinely great hook."] },
      u1_hub2: { title: "A Clear Theme, Clearly Delivered", blurb: "Choosing one theme and building toward a strong hook keeps a song focused.", points: ["A song that tries to cover too many themes at once often ends up feeling unfocused.", "The clearest songs usually state their theme early, often right within the hook itself."] },
      bonus1: { title: "Song Titles", blurb: "A song's title is often just a phrase pulled straight from its own hook or chorus.", points: ["A memorable title often doubles as the exact phrase repeated in the chorus.", "Some famous song titles are deliberately unexpected, designed to spark curiosity before the song even starts."] },
      bonus2: { title: "Studying Your Favourite Songs", blurb: "Breaking down a favourite song's structure is one of the fastest ways to learn songwriting.", points: ["Mapping out a favourite song's verse-chorus-bridge structure on paper reveals patterns you can reuse.", "Studying lyrics closely often reveals a simpler, more universal theme hiding underneath specific details."] },
      u2_intro: { title: "Writing Lyrics", blurb: "Lyrics turn a song's theme into specific, concrete images and words.", points: ["Concrete, sensory details tend to connect with listeners more than vague, abstract statements.", "Lyrics often work best when they show a feeling through a scene rather than simply stating it directly."] },
      u2_branchA: { title: "Rhyme Schemes", blurb: "A rhyme scheme is the pattern of rhyming lines that gives lyrics their sense of rhythm and closure.", points: ["An ABAB rhyme scheme alternates rhymes every other line, while AABB rhymes in immediate pairs.", "Forcing an awkward rhyme can weaken a lyric more than simply not rhyming at all."] },
      u2_branchB: { title: "Imagery in Lyrics", blurb: "Specific, concrete imagery in lyrics makes a song's feeling far more vivid than vague language.", points: ["Naming a specific object, like a certain kind of car or a particular street, often feels more vivid than a general description.", "Strong imagery lets a listener picture the scene in their own mind rather than being told exactly what to feel."] },
      u2_branchC: { title: "Point of View in Songwriting", blurb: "A song can be written from the first person, second person, or as an outside observer's story.", points: ["First person point of view tends to feel more personal and confessional to a listener.", "Writing from an observer's point of view, like a story, can let a songwriter explore a theme with more distance."] },
      u2_merge: { title: "Crafting Meaningful Lyrics", blurb: "Rhyme and imagery together are what turn plain lyrics into something memorable.", points: ["A well-chosen rhyme paired with vivid imagery makes lyrics feel both satisfying and memorable.", "The best lyrics usually serve the song's theme rather than showing off cleverness for its own sake."] },
      u2_hub2: { title: "Whose Story Is It?", blurb: "Point of view shapes exactly how a listener experiences the imagery and rhymes in a lyric.", points: ["Switching point of view partway through a song can feel jarring unless it's done very deliberately.", "The chosen point of view directly shapes which imagery and rhymes will feel natural to use."] },
      sideQuestA: { title: "Lyric Editing", blurb: "Editing lyrics down to their strongest words is often more important than the first draft itself.", points: ["Cutting an unnecessary word or line often makes the remaining lyrics hit far harder.", "Reading lyrics aloud, not just singing them, often reveals awkward phrasing that's easy to miss otherwise."] },
      sideQuestB: { title: "Co-Writing Songs", blurb: "Co-writing brings multiple perspectives together, often producing ideas one writer wouldn't reach alone.", points: ["Co-writers often specialise, with one focusing on lyrics while another focuses on melody or chords.", "Disagreements during co-writing can sometimes lead to a stronger song than either writer would have made alone."] },
      u3_intro: { title: "Chord Progressions for Songwriting", blurb: "A chord progression is the repeating sequence of chords that supports a song's melody.", points: ["A chord progression repeating underneath different lyrics is what gives many songs their sense of familiarity.", "The same progression can support completely different melodies and moods depending on tempo and instrumentation."] },
      u3_branchA: { title: "Common Progressions", blurb: "A handful of chord progressions show up, in different keys, across huge numbers of popular songs.", points: ["The so-called '1-5-6-4' progression appears, in different keys, across countless well-known pop songs.", "Recognising common progressions by ear is a skill that speeds up both songwriting and learning cover songs."] },
      u3_branchB: { title: "Melody Writing Basics", blurb: "A strong melody usually rises and falls in a shape that feels natural to sing.", points: ["A melody that stays within a comfortable vocal range is usually easier for a listener to sing along with.", "Repeating a short melodic idea with small variations is a classic way to make a tune memorable."] },
      u3_branchC: { title: "Matching Melody to Chords", blurb: "A melody's notes need to fit naturally within whatever chord is playing underneath it.", points: ["Notes that clash badly against the underlying chord can make a melody feel wrong even if it's rhythmically fine.", "Songwriters often hum a melody over a chord progression to test whether the two genuinely fit together."] },
      u3_merge: { title: "Chords Supporting Melody", blurb: "Chord progressions and melody together are the musical backbone underneath every lyric.", points: ["A chord progression provides the emotional foundation that a melody then rides on top of.", "Changing the underlying chords beneath the exact same melody can shift a song's entire mood."] },
      u3_hub2: { title: "Making Melody and Harmony Fit", blurb: "Matching a melody to its chords is what keeps a song sounding intentional instead of clashing.", points: ["A melody note that clashes with its chord can be resolved by either adjusting the melody or changing the chord.", "This careful matching is exactly what makes a song sound intentional rather than accidentally dissonant."] },
      u3_dead1: { title: "Song Arrangement Basics", blurb: "Arrangement decides which instruments play when, shaping a song's energy from start to finish.", points: ["Stripping an arrangement down to just one instrument can make a chorus feel more powerful when the full band returns.", "Arrangement decisions, like when drums enter, can dramatically shape a song's emotional build."] },
      u3_dead2: { title: "Recording a Demo", blurb: "A simple demo recording is often enough to capture and share a new song idea.", points: ["A rough phone recording is often enough to capture a songwriting idea before it's forgotten.", "Many hit songs started as simple voice-memo demos long before ever reaching a professional studio."] },
      review: { title: "From Idea to Finished Song", blurb: "Every finished song combines theme, lyrics, melody, and chords into one single, complete experience.", points: ["A finished song reflects dozens of small decisions about theme, structure, lyrics, and music working together.", "Studying how all these elements interact is what separates a collection of ideas from one complete song."] }
    }
  },
  {
    id: "art-history-highlights",
    title: "Art History Highlights",
    type: "Music and Art",
    yeargroups: "9-11",
    description: "Trace Western art from ancient civilizations through the Renaissance to modern movements.",
    medalNames: { test1: "Art History Starter", test2: "Movement Maven", test3: "Art Historian" },
    specialTitles: { test1: "Classical to Renaissance Check", test2: "Baroque to Post-Impressionism Check", test3: "Modern Art Check" },
    projects: {
      project1: {
        title: "Compare Two Art Movements",
        brief: "Choose two art movements and compare one painting from each in terms of style, colour, and subject.",
        checklist: ["Choose 2 movements", "Describe one painting from each", "Compare their styles"]
      },
      project2: {
        title: "Curate a Mini Exhibition",
        brief: "Choose four artworks from different movements and explain why you'd display them together.",
        checklist: ["Choose 4 artworks", "Explain your theme", "Describe the intended experience"]
      }
    },
    finalTitle: "Art History Highlights Final Exam",
    topics: {
      u1_intro: { title: "Why Study Art History?", blurb: "Art history reveals how artists' choices reflect the beliefs and events of their own time.", points: ["A painting's colours, subject, and style can reveal exactly what a society valued at the time it was made.", "Art history helps explain why certain styles suddenly rose or fell out of favour."] },
      u1_branchA: { title: "Ancient & Classical Art", blurb: "Ancient and classical art often served religious or civic purposes, not just personal expression.", points: ["Ancient Egyptian art followed strict, unchanging conventions for how figures were meant to be shown.", "Classical Greek art gradually moved toward more naturalistic, lifelike representations of the human body."] },
      u1_branchB: { title: "Medieval Art", blurb: "Medieval art was dominated by religious themes and symbolic, rather than realistic, imagery.", points: ["Medieval artists often used gold leaf backgrounds to represent a divine, otherworldly space.", "Figures in medieval art were often sized according to their spiritual importance rather than realistic proportion."] },
      u1_branchC: { title: "The Renaissance Breakthrough", blurb: "The Renaissance reintroduced realistic perspective and human anatomy into Western art.", points: ["Renaissance artists studied human anatomy directly, sometimes even dissecting bodies to understand it better.", "Linear perspective, developed during the Renaissance, let painters convincingly depict deep, realistic space for the first time."] },
      u1_merge: { title: "From Symbol to Realism", blurb: "Classical, medieval, and Renaissance art trace a huge shift from symbolic to increasingly realistic imagery.", points: ["Each period built on and reacted against the artistic conventions established before it.", "This shift wasn't gradual and steady — the Renaissance represented a genuinely sudden leap in technique."] },
      u1_hub2: { title: "What Changed and Why", blurb: "The Renaissance's realism only stands out once compared against what medieval art was doing before it.", points: ["Medieval art prioritized symbolic meaning over visual accuracy, which is precisely what the Renaissance overturned.", "Comparing a medieval painting directly against a Renaissance one makes this shift immediately obvious."] },
      bonus1: { title: "Famous Renaissance Artists", blurb: "Artists like Leonardo da Vinci pushed both scientific observation and artistic technique forward together.", points: ["Leonardo da Vinci's notebooks show detailed anatomical studies alongside his famous paintings.", "Michelangelo worked as both a painter and a sculptor, mastering both three-dimensional and flat art forms."] },
      bonus2: { title: "Art as Historical Evidence", blurb: "Old paintings often reveal genuine historical details about clothing, technology, and daily life.", points: ["Paintings of historical banquets can reveal exactly what foods and utensils were common in that era.", "Clothing depicted in old portraits often helps historians date a painting even without written records."] },
      u2_intro: { title: "Baroque Art", blurb: "Baroque art favoured dramatic lighting, movement, and intense emotion.", points: ["Baroque painters used dramatic contrasts between light and dark, a technique known as chiaroscuro.", "Baroque art often aimed to evoke strong, immediate emotional reactions from its viewers."] },
      u2_branchA: { title: "Impressionism", blurb: "Impressionist painters captured a fleeting moment and feeling rather than exact realistic detail.", points: ["Impressionist painters often worked outdoors to directly capture changing natural light.", "Visible, loose brushstrokes were a defining, once-controversial feature of Impressionist paintings."] },
      u2_branchB: { title: "Post-Impressionism", blurb: "Post-Impressionists took Impressionism's loose style even further into personal expression and bold colour.", points: ["Post-Impressionist painters, unlike Impressionists, often prioritized emotional or symbolic colour over realistic colour.", "Vincent van Gogh's thick, expressive brushstrokes are a hallmark of Post-Impressionist style."] },
      u2_branchC: { title: "Comparing Movements", blurb: "Each art movement was often a reaction against the ideas and style of the one before it.", points: ["Baroque's drama, Impressionism's fleeting light, and Post-Impressionism's personal expression each rejected the movement before it.", "Recognising what a movement is reacting against often reveals as much as recognising its own style."] },
      u2_merge: { title: "Movements Building on Movements", blurb: "Baroque, Impressionism, and Post-Impressionism each pushed against the art style that came right before.", points: ["Impressionism itself was partly a reaction against the formal, polished style that came before it.", "Each new movement typically pushed further away from strict realism than the one before."] },
      u2_hub2: { title: "A Chain Reaction of Styles", blurb: "Comparing movements directly reveals just how much each one reacted to its predecessor.", points: ["Tracing this chain reaction backward reveals how one small stylistic change often triggered a whole new movement.", "This same reactive chain continues throughout the entire history of Western art."] },
      sideQuestA: { title: "Famous Impressionist Paintings", blurb: "Paintings like water lilies and sunlit fields became icons specifically because of the Impressionist style.", points: ["Monet's repeated depictions of the same water lily pond captured its changing light across different times of day.", "These paintings were initially mocked by critics before becoming some of art history's most beloved works."] },
      sideQuestB: { title: "Art Movements and Technology", blurb: "New inventions, like portable paint tubes, directly enabled entirely new art movements to emerge.", points: ["Portable paint tubes allowed Impressionist painters to easily work outdoors for the first time.", "Photography's invention pushed painters to explore styles a camera couldn't easily replicate."] },
      u3_intro: { title: "Modern Art Origins", blurb: "Modern art began by deliberately breaking away from realistic, traditional representation.", points: ["Modern artists often deliberately challenged the very definition of what a painting should look like.", "This deliberate break from tradition opened the door to dozens of new, experimental movements."] },
      u3_branchA: { title: "Cubism", blurb: "Cubism broke subjects apart into geometric fragments shown from multiple angles at once.", points: ["Cubist paintings often show a single subject from several different angles simultaneously.", "Pablo Picasso and Georges Braque are the two artists most closely associated with founding Cubism."] },
      u3_branchB: { title: "Surrealism", blurb: "Surrealism explored dreamlike, irrational imagery pulled straight from the unconscious mind.", points: ["Surrealist artists were heavily influenced by new theories about dreams and the unconscious mind.", "Unexpected, illogical combinations of ordinary objects are a signature feature of Surrealist paintings."] },
      u3_branchC: { title: "Abstract Expressionism", blurb: "Abstract Expressionism abandoned recognisable subjects entirely in favour of pure colour, shape, and gesture.", points: ["Some Abstract Expressionists, like Jackson Pollock, focused heavily on the physical act of painting itself.", "This movement treated colour and gesture as expressive enough on their own, without any recognisable subject."] },
      u3_merge: { title: "Breaking Every Old Rule", blurb: "Cubism and Surrealism both rejected traditional representation, just in completely different directions.", points: ["Cubism fractured form while Surrealism embraced irrational imagery — two very different rejections of realism.", "Both movements expanded what viewers could accept as a legitimate way to represent the world."] },
      u3_hub2: { title: "Abstraction Taken to Its Limit", blurb: "Abstract Expressionism pushed the rule-breaking of Cubism and Surrealism to its most extreme point yet.", points: ["Abstract Expressionism abandoned recognisable subjects entirely, going further than either Cubism or Surrealism had.", "This movement represents one of the furthest points modern art travelled from traditional realism."] },
      u3_dead1: { title: "Pop Art", blurb: "Pop Art borrowed imagery directly from advertising and popular culture.", points: ["Pop Art often depicted everyday consumer products, like soup cans, as legitimate artistic subjects.", "Andy Warhol's repeated, brightly coloured imagery is one of Pop Art's most recognisable styles."] },
      u3_dead2: { title: "Contemporary Art Today", blurb: "Contemporary art continues to expand what counts as art, often blending mediums freely.", points: ["Contemporary art often blends painting, sculpture, video, and performance within a single piece.", "Digital and even AI-generated art are increasingly part of the ongoing contemporary art conversation."] },
      review: { title: "Art as a Mirror of Its Time", blurb: "Every art movement studied here reflects the ideas, technology, and events of the era that created it.", points: ["Comparing artworks side by side across centuries reveals a continuous conversation between artists and their eras.", "Understanding this history helps explain why contemporary art looks the way it does today."] }
    }
  },
  {
    id: "photography-basics",
    title: "Photography Basics",
    type: "Music and Art",
    yeargroups: "8-10",
    description: "Master exposure, composition, and light to move from snapshots to intentional photographs.",
    medalNames: { test1: "Camera Basics Starter", test2: "Composition Captor", test3: "Light Master" },
    specialTitles: { test1: "Exposure Triangle Check", test2: "Composition Check", test3: "Lighting Check" },
    projects: {
      project1: {
        title: "Composition Photo Challenge",
        brief: "Take or describe three photos, each demonstrating a different composition technique.",
        checklist: ["Use the rule of thirds", "Use leading lines", "Use natural framing"]
      },
      project2: {
        title: "Golden Hour Photo Plan",
        brief: "Plan a golden hour photoshoot, choosing a subject and explaining how the lighting will be used.",
        checklist: ["Choose a subject", "Plan the time and location", "Explain the lighting effect"]
      }
    },
    finalTitle: "Photography Basics Final Exam",
    topics: {
      u1_intro: { title: "How a Camera Works", blurb: "A camera captures light through a lens and records it as an image.", points: ["Light passes through the lens and lands on a sensor, or film, that records the image.", "Every camera setting ultimately controls just one thing: how much light reaches that sensor."] },
      u1_branchA: { title: "Aperture Basics", blurb: "Aperture controls how much light enters the camera through the lens opening.", points: ["A lower f-number actually means a wider aperture opening, letting in more light.", "Aperture also directly controls how much of a photo stays in sharp focus."] },
      u1_branchB: { title: "Shutter Speed Basics", blurb: "Shutter speed controls how long the camera's sensor is exposed to light.", points: ["A faster shutter speed freezes fast motion, while a slower one can blur it.", "Shutter speed is typically measured in fractions of a second, like 1/500th."] },
      u1_branchC: { title: "ISO Basics", blurb: "ISO controls how sensitive the camera's sensor is to the light it receives.", points: ["Raising the ISO brightens a photo in low light but can introduce visible grain or noise.", "A low ISO is generally preferred whenever there's enough available light."] },
      u1_merge: { title: "The Exposure Triangle", blurb: "Aperture and shutter speed together form two-thirds of the exposure triangle that controls a photo's brightness.", points: ["Adjusting either aperture or shutter speed to let in more light means the other can be reduced to compensate.", "Balancing these two settings is the foundation of achieving a correctly exposed photo."] },
      u1_hub2: { title: "Sensitivity Completes the Triangle", blurb: "ISO is the third setting that, combined with aperture and shutter speed, fully controls exposure.", points: ["All three settings work together, so changing one usually means adjusting at least one of the others.", "Mastering the full exposure triangle is what lets a photographer shoot confidently in any lighting condition."] },
      bonus1: { title: "Depth of Field", blurb: "A wide aperture creates a shallow depth of field, blurring everything except the main subject.", points: ["Portrait photographers often use a wide aperture specifically to blur a distracting background.", "A narrow aperture keeps both close and distant objects in focus at the same time."] },
      bonus2: { title: "Motion Blur", blurb: "A slow shutter speed can intentionally blur fast motion for a dramatic effect.", points: ["Photographing a waterfall with a slow shutter speed can turn rushing water into a soft, silky blur.", "A tripod is usually essential when using a slow shutter speed to avoid unwanted camera shake."] },
      u2_intro: { title: "Composition in Photography", blurb: "Composition decides how the elements within a photo's frame are arranged.", points: ["The same subject can look completely different depending on how it's framed within the shot.", "Composition is often what separates a memorable photograph from a merely accurate one."] },
      u2_branchA: { title: "Rule of Thirds in Photos", blurb: "Placing a subject along the rule-of-thirds gridlines often creates a more balanced photo.", points: ["Many cameras and phones offer a grid overlay specifically to help apply the rule of thirds.", "Placing a horizon along the upper or lower third line often looks more natural than placing it dead center."] },
      u2_branchB: { title: "Leading Lines in Photos", blurb: "Leading lines in a scene naturally draw a viewer's eye toward the main subject.", points: ["A path, fence, or shoreline in a photo can act as a natural leading line.", "Leading lines work especially well when they start near a corner of the frame and lead inward."] },
      u2_branchC: { title: "Framing a Subject", blurb: "Natural elements, like a doorway or branches, can frame a subject and add depth.", points: ["A natural frame can add a subtle sense of depth by separating the foreground from the subject.", "Framing also helps eliminate distracting elements from the edges of a photo."] },
      u2_merge: { title: "Composing a Strong Photo", blurb: "The rule of thirds and leading lines are two of the most reliable composition tools in photography.", points: ["Combining the rule of thirds with a leading line often produces an especially dynamic composition.", "These techniques work across nearly every genre of photography, from portraits to landscapes."] },
      u2_hub2: { title: "Adding Depth Through Framing", blurb: "Natural framing adds another layer of depth on top of thirds and leading lines.", points: ["A frame within the shot adds a layer that thirds and leading lines alone don't provide.", "Using all three techniques together is common in professional composition."] },
      sideQuestA: { title: "Photographing People", blurb: "Portraits often benefit from a shallower depth of field to keep attention on the subject's face.", points: ["Focusing precisely on a subject's eyes is one of the most important rules in portrait photography.", "A blurred background helps a portrait's subject stand out clearly from their surroundings."] },
      sideQuestB: { title: "Photographing Landscapes", blurb: "Landscape photography often uses a deep depth of field to keep the whole scene sharply in focus.", points: ["A narrow aperture, like f/16, is common in landscape photography to keep the entire scene sharp.", "A tripod helps landscape photographers use slower shutter speeds without introducing blur."] },
      u3_intro: { title: "Lighting in Photography", blurb: "Lighting dramatically affects the mood, colour, and clarity of every photograph.", points: ["The same subject can look dramatically different depending only on how it's lit.", "Photographers often plan their shoot around the available light before considering anything else."] },
      u3_branchA: { title: "Natural vs. Artificial Light", blurb: "Natural light shifts constantly through the day, while artificial light can be controlled precisely.", points: ["Artificial light, like a studio flash, can be precisely controlled in ways that sunlight cannot.", "Natural light changes constantly throughout the day, requiring a photographer to adapt quickly."] },
      u3_branchB: { title: "Golden Hour", blurb: "Golden hour, shortly after sunrise or before sunset, produces soft, warm, flattering natural light.", points: ["Golden hour light is softer and warmer because sunlight travels through more atmosphere at a low angle.", "Photographers often plan entire outdoor shoots specifically around this narrow golden hour window."] },
      u3_branchC: { title: "Using Shadows Creatively", blurb: "Strong shadows can be used deliberately to add drama and shape to a photograph.", points: ["Strong, hard shadows can add a sense of mystery or drama that flat, even lighting can't achieve.", "Shadows can be used deliberately to hide or reveal specific parts of a subject."] },
      u3_merge: { title: "Mastering Available Light", blurb: "Understanding natural and artificial light together is essential to controlling a photo's final mood.", points: ["A skilled photographer can adapt to whatever light is available, natural or artificial.", "Understanding both types of light means never being stuck without a usable lighting option."] },
      u3_hub2: { title: "Shaping Mood with Light and Shadow", blurb: "Golden hour and creative shadows are two of the most powerful mood tools in photography.", points: ["Golden hour's soft warmth and deliberate shadow both shape a photo's emotional tone.", "Combining the two deliberately gives a photographer precise control over a photo's final mood."] },
      u3_dead1: { title: "Editing Photos Basics", blurb: "Basic editing adjusts brightness, contrast, and colour after a photo has already been taken.", points: ["Basic edits like adjusting brightness and contrast can rescue a photo that was slightly under or overexposed.", "Editing works best as a way to refine a good photo, not as a fix for a fundamentally flawed one."] },
      u3_dead2: { title: "Photography Genres", blurb: "Portrait, landscape, street, and macro are just a few of photography's many distinct genres.", points: ["Macro photography reveals tiny details, like a flower's texture, invisible to the naked eye.", "Street photography often captures candid, unplanned moments of everyday life."] },
      review: { title: "Seeing Like a Photographer", blurb: "Exposure, composition, and light together are what separate a snapshot from a genuinely intentional photograph.", points: ["A photographer trained in exposure, composition, and lighting can adapt to nearly any scene they encounter.", "Learning to truly 'see' this way is what separates casual snapshots from deliberate, intentional photography."] }
    }
  },
  {
    id: "intro-to-javascript",
    title: "Intro to JavaScript",
    type: "Programming",
    yeargroups: "10-12",
    description: "Learn the language that powers interactive web pages, from variables to objects.",
    medalNames: { test1: "JavaScript Starter", test2: "Function Fanatic", test3: "Data Structure Ace" },
    specialTitles: { test1: "Variables & Types Check", test2: "Functions Check", test3: "Arrays & Objects Check" },
    projects: {
      project1: {
        title: "Build a Calculator Function",
        brief: "Write a JavaScript function that takes two numbers and an operation, then returns the result.",
        checklist: ["Accept two numbers as parameters", "Support at least 2 operations", "Return the correct result"]
      },
      project2: {
        title: "Build a Task List Script",
        brief: "Write a script that stores tasks as objects in an array and loops through to print them.",
        checklist: ["Store 3+ tasks as objects", "Loop through the array", "Print each task's details"]
      }
    },
    finalTitle: "Intro to JavaScript Final Exam",
    topics: {
      u1_intro: { title: "What is JavaScript?", blurb: "JavaScript is the programming language that makes web pages interactive.", points: ["JavaScript runs directly inside a web browser without needing any separate installation.", "Alongside HTML and CSS, JavaScript is one of the three core technologies of the web."] },
      u1_branchA: { title: "Variables in JavaScript", blurb: "A JavaScript variable stores a value under a name using let or const.", points: ["Using const is preferred when a variable's value should never change after it's set.", "let allows a variable's value to be reassigned later in the program."] },
      u1_branchB: { title: "Console Output", blurb: "console.log() prints values out so you can see what your code is actually doing.", points: ["console.log() is one of the most commonly used debugging tools in JavaScript.", "Developer tools in every modern browser include a console where these logged values appear."] },
      u1_branchC: { title: "Data Types in JavaScript", blurb: "Numbers, strings, and booleans are among JavaScript's most basic data types.", points: ["JavaScript also has an 'undefined' type, representing a variable that hasn't been given a value yet.", "Checking a value's type with typeof can help catch bugs caused by unexpected data."] },
      u1_merge: { title: "Storing and Displaying Data", blurb: "Variables and console output together let you store and immediately check any value.", points: ["Logging a variable right after creating it is a simple way to confirm it holds the expected value.", "This immediate feedback loop is especially useful while first learning to code."] },
      u1_hub2: { title: "Working with Different Types", blurb: "Recognising each data type is essential before combining or comparing values correctly.", points: ["Adding a number and a string together in JavaScript can produce surprising, unintended results.", "Explicitly converting types before combining them avoids most of these common bugs."] },
      bonus1: { title: "Template Literals", blurb: "Template literals let you build strings by embedding variables directly using backticks.", points: ["Template literals use backticks instead of regular quotation marks.", "Embedding a variable directly with ${} is far cleaner than manually joining strings together."] },
      bonus2: { title: "JavaScript in the Browser", blurb: "Every modern web browser has a built-in JavaScript engine ready to run code instantly.", points: ["This built-in engine is what allows JavaScript to run instantly without a separate compiler.", "Different browsers historically implemented JavaScript slightly differently, though modern standards have reduced this."] },
      u2_intro: { title: "Functions in JavaScript", blurb: "A function packages up reusable code so it can be run again just by calling its name.", points: ["A function is only executed when it's actually called, not simply when it's defined.", "Functions can be called as many times as needed once they're written."] },
      u2_branchA: { title: "Function Parameters", blurb: "Parameters let a function accept different input values each time it's called.", points: ["A function can accept multiple parameters, separated by commas.", "Parameters act like local variables that only exist while the function is running."] },
      u2_branchB: { title: "Return Values", blurb: "A function's return statement sends a result back to wherever the function was called.", points: ["A function without an explicit return statement automatically returns undefined.", "The returned value can be stored in a variable or used immediately in another expression."] },
      u2_branchC: { title: "Arrow Functions", blurb: "Arrow functions are a shorter, modern way to write simple JavaScript functions.", points: ["Arrow functions are especially popular for short, single-purpose functions.", "The syntax replaces the function keyword with a simple arrow symbol."] },
      u2_merge: { title: "Functions That Do Real Work", blurb: "Parameters and return values together are what make a function genuinely reusable.", points: ["A function that both accepts parameters and returns a value can be plugged directly into other code.", "This reusability is exactly what makes functions such a powerful programming tool."] },
      u2_hub2: { title: "Writing Functions Efficiently", blurb: "Arrow functions let you write the same parameter-and-return logic with far less code.", points: ["Arrow functions can often replace several lines of traditional function syntax with just one.", "Despite the shorter syntax, arrow functions still accept parameters and return values normally."] },
      sideQuestA: { title: "Scope Basics", blurb: "Scope determines exactly where in your code a variable can actually be accessed.", points: ["A variable declared inside a function generally cannot be accessed from outside it.", "Understanding scope helps prevent variables from accidentally overwriting each other."] },
      sideQuestB: { title: "Default Parameters", blurb: "A default parameter value is used automatically whenever no argument is provided.", points: ["A default parameter is set directly in the function's definition using an equals sign.", "Default parameters help prevent errors when a function is called with missing arguments."] },
      u3_intro: { title: "Arrays in JavaScript", blurb: "An array stores an ordered list of values, accessed by their numbered position.", points: ["The first item in a JavaScript array is always found at index 0.", "Arrays can grow or shrink dynamically as a program runs."] },
      u3_branchA: { title: "Array Methods", blurb: "Built-in array methods, like push and map, make working with lists far easier.", points: ["The push method adds a new item to the end of an array.", "The map method creates an entirely new array by transforming every item in the original."] },
      u3_branchB: { title: "Objects in JavaScript", blurb: "A JavaScript object stores data as labeled key-value pairs.", points: ["An object's properties are accessed using either dot notation or square brackets.", "Objects can store other objects or arrays as values, creating deeply nested data."] },
      u3_branchC: { title: "Looping Through Arrays", blurb: "A for loop or array method can process every item in an array automatically.", points: ["A for loop gives full control over exactly how an array is processed.", "Array methods like forEach often provide a cleaner alternative to a traditional for loop."] },
      u3_merge: { title: "Arrays and Their Tools", blurb: "Array methods and loops together let you process a whole list of data efficiently.", points: ["Choosing between a loop and a built-in array method often comes down to which is clearer for the task.", "Both approaches ultimately visit every item in the array."] },
      u3_hub2: { title: "Structuring Data with Objects", blurb: "Objects let you structure related data far more clearly than a plain array alone.", points: ["A list of objects, like an array of user profiles, is one of the most common real-world data patterns.", "Objects inside an array let each item hold multiple labeled pieces of information at once."] },
      u3_dead1: { title: "JSON Basics", blurb: "JSON is a text format for structuring data that closely mirrors JavaScript objects and arrays.", points: ["JSON is widely used to send data between a web browser and a server.", "Despite looking almost identical to JavaScript objects, JSON has slightly stricter formatting rules."] },
      u3_dead2: { title: "DOM Manipulation Basics", blurb: "JavaScript can directly change a web page's content and style after it's already loaded.", points: ["The DOM represents a web page's structure as a tree of objects JavaScript can access.", "Changing the DOM after a page loads is exactly how JavaScript creates dynamic, interactive pages."] },
      review: { title: "Thinking in JavaScript", blurb: "Variables, functions, arrays, and objects together are the foundation of virtually every JavaScript program.", points: ["A single interactive feature on a website, like a shopping cart, usually combines all four of these concepts.", "Mastering these fundamentals is what makes learning any JavaScript framework afterward much easier."] }
    }
  },
  {
    id: "game-design-basics",
    title: "Game Design Basics",
    type: "Programming",
    yeargroups: "7-9",
    description: "Learn what makes games fun: goals, balance, feedback, and level design.",
    medalNames: { test1: "Game Design Starter", test2: "Balance Builder", test3: "Level Designer" },
    specialTitles: { test1: "Core Design Check", test2: "Balance & Engagement Check", test3: "Level Design Check" },
    projects: {
      project1: {
        title: "Design a Simple Game Concept",
        brief: "Design a concept for a simple game, describing its goal, rules, and one core player choice.",
        checklist: ["Describe the goal", "Describe 3 rules", "Describe one meaningful choice"]
      },
      project2: {
        title: "Design a Mini Level",
        brief: "Sketch a simple level layout, including its pacing and at least one environmental storytelling detail.",
        checklist: ["Sketch the layout", "Describe the pacing", "Add one storytelling detail"]
      }
    },
    finalTitle: "Game Design Basics Final Exam",
    topics: {
      u1_intro: { title: "What Makes a Game Fun?", blurb: "Fun in a game usually comes from clear goals, meaningful choices, and satisfying feedback.", points: ["A game with a fantastic goal but no real choices can still feel flat and mechanical.", "Fun is often less about graphics and more about how satisfying the underlying decisions feel."] },
      u1_branchA: { title: "Game Goals", blurb: "A clear goal gives a player something specific to work toward.", points: ["A goal can be short-term, like beating a single level, or long-term, like completing an entire story.", "Without a clear goal, players often feel aimless and quickly lose interest."] },
      u1_branchB: { title: "Game Rules", blurb: "Rules define exactly what a player can and can't do within a game.", points: ["Simple rules can still produce surprisingly deep and complex gameplay.", "Rules that are too complicated can overwhelm new players before they even start having fun."] },
      u1_branchC: { title: "Player Choices", blurb: "Meaningful choices give a player real control over how they approach a goal.", points: ["A meaningful choice usually involves a genuine trade-off, not just a fake decision with one obviously best option.", "Removing a choice's consequences almost always makes it feel less meaningful."] },
      u1_merge: { title: "Goals, Rules & Choices", blurb: "Goals, rules, and choices together are the basic skeleton of any playable game.", points: ["Rules exist specifically to create interesting choices in pursuit of a clear goal.", "Changing just one of these three elements can dramatically shift how an entire game feels to play."] },
      u1_hub2: { title: "Designing Meaningful Decisions", blurb: "Rules exist specifically to make a player's choices meaningful rather than arbitrary.", points: ["A rule limiting resources, for example, is often what forces a player's choices to actually matter.", "Well-designed constraints are frequently what makes a decision interesting rather than obvious."] },
      bonus1: { title: "Game Genres", blurb: "Puzzle, action, and strategy are just a few of the many established game genres.", points: ["A single game can often blend elements from more than one genre at once.", "Genres tend to share common expectations, like a puzzle game usually rewarding careful thinking over speed."] },
      bonus2: { title: "Studying Games You Love", blurb: "Breaking down why a favourite game feels fun is one of the best ways to learn game design.", points: ["Identifying exactly which mechanic keeps you coming back reveals a lot about strong game design.", "Comparing a favourite game against a less enjoyable one often highlights subtle but crucial design differences."] },
      u2_intro: { title: "Difficulty & Balance", blurb: "A well-balanced game challenges a player without ever feeling unfair.", points: ["A game that's too easy quickly becomes boring, while one that's too hard becomes frustrating.", "Balance often needs constant adjustment based on how real players actually perform."] },
      u2_branchA: { title: "Difficulty Curves", blurb: "A difficulty curve gradually increases challenge so players can keep learning as they go.", points: ["A well-designed difficulty curve introduces new challenges only once earlier ones are mastered.", "A sudden, unexpected spike in difficulty is a common design mistake that frustrates players."] },
      u2_branchB: { title: "Feedback & Rewards", blurb: "Immediate feedback tells a player clearly whether their last action succeeded or failed.", points: ["A satisfying sound or animation on success is a simple, powerful form of feedback.", "Without clear feedback, players often can't tell if their strategy is actually working."] },
      u2_branchC: { title: "Player Progression", blurb: "Progression systems, like levels or upgrades, give players a visible sense of growth over time.", points: ["Progression systems give players a reason to keep playing even after initial curiosity fades.", "Unlocking new abilities gradually can also serve as a natural way to teach a game's mechanics over time."] },
      u2_merge: { title: "Keeping Players Engaged", blurb: "Difficulty curves and feedback together are what keep a player engaged instead of frustrated or bored.", points: ["A well-tuned difficulty curve paired with satisfying feedback is often what defines a genuinely 'addictive' game.", "Removing either element usually causes engagement to drop noticeably."] },
      u2_hub2: { title: "Growth That Feels Earned", blurb: "Progression systems work best when paired with a well-tuned difficulty curve.", points: ["Progression that's handed out too easily often feels hollow rather than rewarding.", "The best progression systems feel earned precisely because the difficulty curve made them challenging to reach."] },
      sideQuestA: { title: "Playtesting Basics", blurb: "Playtesting means watching real players try your game to see what actually works.", points: ["Watching someone struggle with a supposedly clear mechanic often reveals confusing design choices.", "Playtesters frequently discover strategies or problems the original designers never anticipated."] },
      sideQuestB: { title: "Game Balance Problems", blurb: "An overpowered strategy can quietly ruin a game's balance if it isn't caught during testing.", points: ["An overpowered strategy can make every other approach in a game feel pointless by comparison.", "Balance patches are often released specifically to fix strategies discovered after a game's release."] },
      u3_intro: { title: "Level Design Basics", blurb: "Level design shapes the specific space a player moves through and interacts with.", points: ["A level's layout can guide a player's path without a single explicit instruction.", "Good level design often teaches new mechanics safely before testing them in a harder section."] },
      u3_branchA: { title: "Pacing in Level Design", blurb: "Good pacing alternates tension and relief so a level doesn't feel exhausting or boring.", points: ["A long stretch of nonstop intensity without any breaks tends to exhaust players rather than excite them.", "Quiet moments in a level make the intense moments that follow feel more impactful."] },
      u3_branchB: { title: "Guiding the Player", blurb: "Subtle visual cues can guide a player's attention without ever using explicit instructions.", points: ["A brightly lit path in an otherwise dark area is a classic subtle way to guide attention.", "Overusing explicit on-screen instructions can make a game feel like it doesn't trust its own design."] },
      u3_branchC: { title: "Environmental Storytelling", blurb: "A level's environment can hint at a story without a single word of dialogue.", points: ["A destroyed room can imply an entire backstory without a single line of dialogue.", "This technique lets players piece together a story at their own pace, rather than being told directly."] },
      u3_merge: { title: "Designing a Complete Level", blurb: "Pacing and player guidance together shape how a level actually feels to play through.", points: ["A great level balances pacing and guidance so players always know roughly where to go without feeling babied.", "Skipping either element tends to make a level feel confusing or exhausting."] },
      u3_hub2: { title: "A Level That Tells a Story", blurb: "Environmental storytelling adds meaning on top of a level's pacing and guidance.", points: ["Storytelling details layered on top of good pacing and guidance make a level memorable long after it's finished.", "Some of the most acclaimed levels in game history rely heavily on this combination."] },
      u3_dead1: { title: "Game Prototyping", blurb: "A rough prototype tests whether a game idea is fun before investing in polished art or code.", points: ["A prototype often uses simple shapes instead of finished art specifically to test if the core idea is fun first.", "Many prototypes are discarded entirely once testing reveals the core idea isn't working."] },
      u3_dead2: { title: "Game Design Documents", blurb: "A game design document records a game's ideas clearly enough for a whole team to build from.", points: ["A design document helps an entire team stay aligned on a game's vision as it's being built.", "These documents often evolve significantly as a project moves from concept to actual development."] },
      review: { title: "Designing Games That Matter", blurb: "Every mechanic, level, and reward in a game should serve the same goal: keeping play meaningful and fun.", points: ["A truly great game usually gets goals, choices, balance, and level design all working together seamlessly.", "Studying game design reveals that 'fun' is actually the result of many deliberate, carefully tested decisions."] }
    }
  },
  {
    id: "databases-and-sql-basics",
    title: "Databases & SQL Basics",
    type: "Programming",
    yeargroups: "12-13",
    description: "Learn how real applications store, query, and relate data using databases and SQL.",
    medalNames: { test1: "Database Starter", test2: "Query Crafter", test3: "Relational Thinker" },
    specialTitles: { test1: "Tables & Structure Check", test2: "Queries Check", test3: "Relationships Check" },
    projects: {
      project1: {
        title: "Write Sample Queries",
        brief: "Write three SQL queries against a sample table: one filtered, one sorted, and one counted.",
        checklist: ["Write a WHERE query", "Write an ORDER BY query", "Write a COUNT query"]
      },
      project2: {
        title: "Design a Mini Database",
        brief: "Design two related tables (like customers and orders) with appropriate keys linking them.",
        checklist: ["Design table 1 with a primary key", "Design table 2 with a foreign key", "Explain the relationship"]
      }
    },
    finalTitle: "Databases & SQL Basics Final Exam",
    topics: {
      u1_intro: { title: "What is a Database?", blurb: "A database is an organized collection of data designed to be stored, searched, and updated easily.", points: ["Databases are designed to handle far larger amounts of data than a typical spreadsheet.", "Most modern applications rely on a database running behind the scenes to function at all."] },
      u1_branchA: { title: "Tables & Rows", blurb: "A database table organizes data into rows, much like a spreadsheet.", points: ["Each row in a table typically represents one single record, like one customer or one order.", "A table can contain anywhere from a handful of rows to many millions."] },
      u1_branchB: { title: "Columns & Data Types", blurb: "Every column in a table holds a specific type of data, like text or numbers, consistently.", points: ["Enforcing a consistent data type per column prevents accidentally storing text where a number is expected.", "Common column data types include integers, text, dates, and booleans."] },
      u1_branchC: { title: "Primary Keys", blurb: "A primary key uniquely identifies every single row in a table.", points: ["A primary key's value must be unique across every row in the table.", "Databases often use an automatically incrementing number as a simple, reliable primary key."] },
      u1_merge: { title: "Structuring a Table", blurb: "Rows, columns, and primary keys together define exactly how a table is structured.", points: ["A well-structured table makes future queries far faster and far less error-prone.", "Poor table structure early on can cause serious problems as an application grows."] },
      u1_hub2: { title: "Making Every Row Unique", blurb: "A primary key is what makes structured rows and columns actually reliable to search.", points: ["Without a primary key, a database could accidentally treat two different records as identical.", "Primary keys are also what other tables use to reliably reference a specific row."] },
      bonus1: { title: "Spreadsheets vs. Databases", blurb: "A database scales to handle far more data, far more reliably, than a spreadsheet ever could.", points: ["A spreadsheet can quickly become slow or error-prone once it holds tens of thousands of rows.", "Databases also allow multiple people to safely update the same data at the same time."] },
      bonus2: { title: "Real-World Databases", blurb: "Almost every app you use, from social media to banking, relies on a database behind the scenes.", points: ["A single popular app can handle millions of database queries every single minute.", "Even something as simple as a to-do list app is usually backed by a small database."] },
      u2_intro: { title: "Basic SELECT Queries", blurb: "A SELECT query retrieves specific data from a database table.", points: ["A basic SELECT query can retrieve every column or just a specific few from a table.", "SELECT is almost always the very first SQL keyword a newcomer learns."] },
      u2_branchA: { title: "Filtering with WHERE", blurb: "A WHERE clause filters a query down to only the rows that match a specific condition.", points: ["A WHERE clause can filter using comparisons like equals, greater than, or contains.", "Multiple conditions can be combined in a single WHERE clause using AND or OR."] },
      u2_branchB: { title: "Sorting with ORDER BY", blurb: "ORDER BY arranges query results in a chosen order, ascending or descending.", points: ["ORDER BY defaults to ascending order unless DESC is explicitly added.", "Sorting can be applied to any column, not just numbers."] },
      u2_branchC: { title: "Limiting Results", blurb: "A LIMIT clause caps how many rows a query actually returns.", points: ["LIMIT is especially useful when only the top few results, like the 10 most recent orders, are needed.", "Combining LIMIT with ORDER BY is a common way to find the highest or lowest values quickly."] },
      u2_merge: { title: "Querying Data Precisely", blurb: "SELECT and WHERE together let you retrieve exactly the data you actually need.", points: ["Combining SELECT, WHERE, and ORDER BY lets a single query answer a genuinely specific question.", "Precise queries reduce the amount of unnecessary data an application has to process afterward."] },
      u2_hub2: { title: "Controlling the Result Set", blurb: "Sorting and limiting refine a query's results even further, beyond just filtering.", points: ["Sorting and limiting together are often used to build features like leaderboards or recent activity feeds.", "Fine-tuning a query's result set this way avoids overwhelming an application with unnecessary data."] },
      sideQuestA: { title: "Counting & Aggregating", blurb: "Functions like COUNT and SUM summarize data across many rows at once.", points: ["COUNT can quickly reveal how many rows match a certain condition without listing them all.", "SUM and AVG are commonly used to calculate totals and averages across many rows."] },
      sideQuestB: { title: "Grouping Results", blurb: "GROUP BY organizes rows into sets before an aggregate function summarizes each one.", points: ["GROUP BY is often paired directly with an aggregate function like COUNT or SUM.", "A query might use GROUP BY to count how many orders each individual customer has placed."] },
      u3_intro: { title: "Relationships Between Tables", blurb: "Real databases usually split data across multiple related tables instead of one giant one.", points: ["Splitting data across related tables avoids repeating the same information over and over.", "This approach is one of the defining features of what's called a relational database."] },
      u3_branchA: { title: "Foreign Keys", blurb: "A foreign key links a row in one table to the matching row in another.", points: ["A foreign key in one table typically points to a primary key in another table.", "Foreign keys are what allow a database to enforce that a reference actually points to something real."] },
      u3_branchB: { title: "JOIN Basics", blurb: "A JOIN combines matching rows from two related tables into a single result.", points: ["A JOIN lets a single query pull related information from two separate tables at once.", "Without JOINs, working with data split across multiple tables would require far more manual effort."] },
      u3_branchC: { title: "One-to-Many Relationships", blurb: "A one-to-many relationship, like one customer with many orders, is one of the most common database patterns.", points: ["In this pattern, the 'one' side usually holds the primary key, while the 'many' side holds the foreign key.", "Customers and their orders are a textbook example of this common relationship pattern."] },
      u3_merge: { title: "Connecting Related Tables", blurb: "Foreign keys and JOINs together are what let separate tables work as one connected database.", points: ["A foreign key defines the relationship, while a JOIN is what actually retrieves the connected data.", "Together, these tools let a database stay both organized and fully connected."] },
      u3_hub2: { title: "Modeling Real-World Relationships", blurb: "One-to-many relationships are exactly what foreign keys and JOINs are designed to represent.", points: ["Most real-world data naturally fits a one-to-many pattern, like one author with many books.", "Recognising this pattern early makes designing a new database much more straightforward."] },
      u3_dead1: { title: "Database Normalization Basics", blurb: "Normalization organizes data to reduce repetition and keep a database consistent.", points: ["Normalization typically involves splitting a large, repetitive table into several smaller, related ones.", "A well-normalized database avoids the same piece of information being stored, and potentially updated incorrectly, in multiple places."] },
      u3_dead2: { title: "Database Security Basics", blurb: "Restricting who can read or change specific data is a core part of designing any real database.", points: ["Different users are often given different levels of access, like read-only versus full editing rights.", "Poor database security is a common cause of major data breaches in real applications."] },
      review: { title: "Thinking in Structured Data", blurb: "Tables, queries, and relationships together are the foundation of how almost all real-world data is stored.", points: ["Nearly every app that remembers information between visits relies on this exact table-query-relationship structure.", "Understanding these fundamentals makes it far easier to reason about how any data-driven application actually works."] }
    }
  },
  {
    id: "robotics-fundamentals",
    title: "Robotics Fundamentals",
    type: "Programming",
    yeargroups: "6-9",
    description: "Explore how robots sense, think, and act, from simple movement to real-world applications.",
    medalNames: { test1: "Robotics Starter", test2: "Navigation Novice", test3: "Robotics Visionary" },
    specialTitles: { test1: "Sensors & Actuators Check", test2: "Movement & Reaction Check", test3: "Real-World Robotics Check" },
    projects: {
      project1: {
        title: "Plan an Obstacle Course Robot",
        brief: "Plan the sensors, movements, and logic a robot would need to navigate a simple obstacle course.",
        checklist: ["List the sensors needed", "Describe the movement logic", "Explain the obstacle response"]
      },
      project2: {
        title: "Propose a Helpful Robot",
        brief: "Design a concept for a robot that would solve a real problem in your daily life.",
        checklist: ["Describe the problem", "Describe the robot's sensors and actions", "Explain how it helps"]
      }
    },
    finalTitle: "Robotics Fundamentals Final Exam",
    topics: {
      u1_intro: { title: "What is a Robot?", blurb: "A robot is a programmable machine that senses its environment and acts on it.", points: ["Not every machine that moves is a robot — a robot specifically senses and responds to its environment.", "Robots can range from simple toy machines to highly sophisticated industrial systems."] },
      u1_branchA: { title: "Sensors Basics", blurb: "A sensor lets a robot gather information about its surroundings, like light or distance.", points: ["Common robot sensors include light sensors, distance sensors, and touch sensors.", "A sensor only provides raw information — a robot still needs logic to decide what to do with it."] },
      u1_branchB: { title: "Actuators & Motors", blurb: "An actuator, like a motor, is what lets a robot actually move or act.", points: ["Motors are the most common actuator, but actuators can also include things like grippers or speakers.", "Without actuators, a robot could sense its surroundings but never actually respond to them."] },
      u1_branchC: { title: "The Sense-Think-Act Cycle", blurb: "Almost every robot repeats a cycle of sensing, thinking, then acting.", points: ["This cycle usually repeats many times per second in a functioning robot.", "Skipping any one of the three steps would mean the robot either can't perceive, decide, or respond."] },
      u1_merge: { title: "Sensing and Acting Together", blurb: "Sensors and actuators together are what let a robot respond to its environment at all.", points: ["A robot with only sensors, and no actuators, could observe the world but never interact with it.", "Combining both is the minimum requirement for a machine to genuinely qualify as a robot."] },
      u1_hub2: { title: "The Loop Behind Every Robot", blurb: "The sense-think-act cycle is really just sensors and actuators running in a continuous loop.", points: ["Even highly advanced robots are ultimately running a more sophisticated version of this same basic loop.", "Understanding this simple cycle makes even complex robotic systems easier to reason about."] },
      bonus1: { title: "Robots in Everyday Life", blurb: "Robots already vacuum floors, build cars, and explore space on our behalf.", points: ["Robotic vacuum cleaners use simple sensors to detect walls and furniture as they navigate.", "Modern car factories rely heavily on robotic arms for precise, repetitive assembly tasks."] },
      bonus2: { title: "Types of Robots", blurb: "Robots range from tiny household helpers to massive industrial arms.", points: ["Industrial robots are usually fixed in place, while mobile robots can move freely through a space.", "Humanoid robots are specifically designed to resemble and move somewhat like a human body."] },
      u2_intro: { title: "Programming Basic Movement", blurb: "Simple robot movement is usually programmed as a sequence of timed motor commands.", points: ["A simple movement sequence might be: move forward, wait, then turn right.", "Even basic timed movement requires precise calibration to behave predictably."] },
      u2_branchA: { title: "Turning & Steering", blurb: "Turning a robot usually means running its motors at different speeds or directions.", points: ["Running one wheel faster than the other is a common way to make a simple robot turn.", "Precise turning often requires careful calibration of motor speed and timing."] },
      u2_branchB: { title: "Using Sensors to React", blurb: "Reading a sensor's value lets a robot change its behaviour automatically.", points: ["A light sensor's reading can trigger a robot to stop, turn, or speed up automatically.", "Reactive behaviour like this doesn't require the robot to plan ahead, just respond to the current reading."] },
      u2_branchC: { title: "Obstacle Avoidance", blurb: "Obstacle avoidance combines a distance sensor with a rule to stop or turn before a collision.", points: ["A distance sensor reading below a certain threshold typically triggers the robot to stop or turn away.", "Reliable obstacle avoidance often requires combining several sensor readings, not just one."] },
      u2_merge: { title: "Moving with Purpose", blurb: "Basic movement and turning together let a robot navigate in more than just a straight line.", points: ["Combining basic movement with turning lets a robot follow paths far more complex than a straight line.", "This combination is the foundation for almost every more advanced navigation behaviour."] },
      u2_hub2: { title: "Reacting to the World", blurb: "Sensor-based reactions, like obstacle avoidance, turn simple movement into real navigation.", points: ["Obstacle avoidance is really just the sense-think-act cycle applied specifically to navigation.", "A robot that can both move purposefully and react to obstacles can handle much more realistic environments."] },
      sideQuestA: { title: "Line-Following Basics", blurb: "A line-following robot uses light sensors to detect and stay on a marked path.", points: ["A line-following robot typically compares readings from two sensors, one on each side of the line.", "This simple technique is a common first robotics project for beginners."] },
      sideQuestB: { title: "Robot Programming Loops", blurb: "A repeat loop lets a robot's sense-think-act cycle run continuously without new commands each time.", points: ["A repeat loop is what lets a robot continue sensing and reacting indefinitely without new commands.", "Without a loop, a robot's program would run once and then simply stop."] },
      u3_intro: { title: "Robotics in Industry", blurb: "Industrial robots perform repetitive, precise tasks like welding and assembly.", points: ["Industrial robots often perform the exact same precise motion thousands of times per day.", "Automation through robotics has dramatically changed how modern manufacturing operates."] },
      u3_branchA: { title: "Robotics in Exploration", blurb: "Exploration robots venture into places too dangerous or distant for humans, like deep space or the ocean floor.", points: ["Mars rovers are a well-known example of exploration robots operating far beyond human reach.", "Deep-sea robots can withstand pressures that would be instantly fatal to a human diver."] },
      u3_branchB: { title: "Robotics in Medicine", blurb: "Medical robots can assist surgeons with extremely precise, controlled movements.", points: ["Surgical robots can filter out a human hand's natural tremor for extremely precise movements.", "These robots are typically controlled directly by a surgeon rather than operating fully autonomously."] },
      u3_branchC: { title: "Ethics of Robotics", blurb: "As robots take on more real-world tasks, questions about safety and job impact become increasingly important.", points: ["Automation replacing certain jobs is one of the most widely discussed ethical concerns around robotics.", "Questions about safety become especially important as robots operate more closely alongside people."] },
      u3_merge: { title: "Robots Doing Real Work", blurb: "Industry and exploration both push robotics to operate reliably in demanding real-world conditions.", points: ["Both industrial and exploration robotics demand extremely high reliability, since failure can be costly or dangerous.", "These demanding environments have driven major advances in robotics engineering."] },
      u3_hub2: { title: "Robots Working Closely with People", blurb: "Medical robotics and the ethics of robotics both centre on how closely robots now work alongside people.", points: ["Medical robots must be exceptionally safe and precise since mistakes can directly affect a patient.", "As robots work more closely with people, ethical and safety considerations become inseparable from the engineering itself."] },
      u3_dead1: { title: "Artificial Intelligence & Robots", blurb: "AI increasingly lets robots make more complex decisions, not just follow fixed instructions.", points: ["AI can allow a robot to recognise objects or plan a route rather than just follow a fixed script.", "This shift lets robots handle situations their original programmers never explicitly anticipated."] },
      u3_dead2: { title: "The Future of Robotics", blurb: "Robots are expected to take on increasingly complex, human-like tasks in the coming decades.", points: ["Researchers continue working toward robots that can adapt to completely unfamiliar environments.", "Combining better sensors, AI, and mechanical design continues to push robotics capabilities forward."] },
      review: { title: "Robots Sensing, Thinking & Acting", blurb: "Every robot, from simple to advanced, still comes back to the same core loop of sensing, thinking, and acting.", points: ["Whether it's a toy or a Mars rover, every robot ultimately relies on this same sense-think-act foundation.", "Understanding this core loop makes it much easier to imagine how future robots might be designed."] }
    }
  },
  {
    id: "italian-foundations",
    title: "Italian Foundations",
    type: "Languages",
    yeargroups: "8-10",
    description: "Start speaking Italian with greetings, family vocabulary, and everyday conversation.",
    medalNames: { test1: "Italian Starter", test2: "Famiglia Esperto", test3: "Conversatore" },
    specialTitles: { test1: "Basics Check", test2: "Family & Verbs Check", test3: "Conversation Check" },
    projects: {
      project1: {
        title: "Describe Your Family",
        brief: "Write five sentences describing your family using the vocabulary and verbs you've learned.",
        checklist: ["Write 5 sentences", "Use 3+ family words", "Get noun gender right"]
      },
      project2: {
        title: "Write a Mini Dialogue",
        brief: "Write a short dialogue between two friends making plans for the weekend in Italian.",
        checklist: ["Write 6+ lines", "Include a suggestion", "Include an agreement"]
      }
    },
    finalTitle: "Italian Foundations Final Exam",
    topics: {
      u1_intro: { title: "Greetings & Introductions", blurb: "\"Ciao\" and \"Mi chiamo...\" are the very first phrases in any Italian conversation.", points: ["'Buongiorno' is used in the morning, while 'buonasera' is used in the evening.", "Adding 'E tu?' after answering a greeting politely asks the same question back."] },
      u1_branchA: { title: "Numbers 1-20", blurb: "Counting from uno to venti is one of the first essential building blocks in Italian.", points: ["Italian numbers sixteen through nineteen combine 'dici' with the ones digit, like sedici.", "Knowing numbers 1-20 is essential before learning to tell time or discuss prices."] },
      u1_branchB: { title: "Italian Pronunciation Basics", blurb: "Italian is pronounced very consistently once you learn how its vowels and letter combinations sound.", points: ["Italian vowels are pronounced consistently, unlike English vowels which can vary widely.", "Double consonants in Italian are actually held slightly longer when spoken."] },
      u1_branchC: { title: "Days & Months", blurb: "I giorni della settimana and i mesi dell'anno let you talk about when things happen.", points: ["In Italian, days of the week and months are not capitalized unless they start a sentence.", "'La settimana' starts on Monday in Italy, unlike the English convention."] },
      u1_merge: { title: "Introducing Yourself Confidently", blurb: "Greetings, numbers, and pronunciation combine into a confident first Italian introduction.", points: ["A confident self-introduction usually combines a greeting, your name, and maybe your age.", "Practicing this exact combination early builds a strong foundation for further conversation."] },
      u1_hub2: { title: "Talking About Time", blurb: "Numbers and the days and months together let you begin describing schedules in Italian.", points: ["Being able to state numbers and days together lets you start describing a simple weekly schedule.", "This combination shows up constantly once conversations move beyond basic introductions."] },
      bonus1: { title: "Italian Hand Gestures", blurb: "Italian is famous for expressive hand gestures that add extra meaning to spoken conversation.", points: ["The famous 'pinched fingers' gesture is used to express confusion or a question.", "Hand gestures in Italian can sometimes replace an entire spoken phrase."] },
      bonus2: { title: "Common Italian Expressions", blurb: "Phrases like \"Che bello!\" are used constantly in everyday Italian conversation.", points: ["'Che bello!' is used constantly to express excitement about almost anything.", "Learning fixed expressions like these helps a learner sound far more natural than translating word-for-word."] },
      u2_intro: { title: "Family Vocabulary", blurb: "Words like madre, padre, and fratello let you describe your family members.", points: ["Words like nonna and nonno let you describe grandparents specifically.", "Family vocabulary is often among the very first topics taught in a new language."] },
      u2_branchA: { title: "Simple Present Tense Verbs", blurb: "Regular -are verbs like parlare follow a predictable pattern in the present tense.", points: ["Regular -are verbs like parlare change their ending based on who is doing the action.", "Once the -are pattern is learned, it applies consistently to dozens of other verbs."] },
      u2_branchB: { title: "Describing People", blurb: "Adjectives like alto, basso, and simpatico describe what someone looks or acts like.", points: ["Italian adjectives must match the gender and number of the noun they describe.", "An adjective describing a group of women would end differently than one describing a group of men."] },
      u2_branchC: { title: "Noun Gender in Italian", blurb: "Every Italian noun is either masculine or feminine, which changes the article used with it.", points: ["Nouns ending in -o are usually masculine, while nouns ending in -a are usually feminine.", "The article used before a noun, like 'il' or 'la', always matches that noun's gender."] },
      u2_merge: { title: "Describing Your Family", blurb: "Family vocabulary, verbs, and adjectives combine to describe your whole family in Italian.", points: ["Describing a family member well usually means combining a noun, an adjective, and matching gender correctly.", "This combination is exactly the kind of sentence tested in the Describe Your Family project."] },
      u2_hub2: { title: "Getting Gender Right", blurb: "Noun gender must agree correctly across every adjective used to describe your family.", points: ["Every adjective describing a family member must agree with that person's grammatical gender.", "Getting gender agreement wrong is one of the most common mistakes for English speakers learning Italian."] },
      sideQuestA: { title: "Italian Food Vocabulary", blurb: "Food vocabulary is essential in Italian culture, where meals are a major part of daily life.", points: ["Meals in Italy are traditionally structured around several distinct courses.", "Food vocabulary is often the very first vocabulary tourists pick up when visiting Italy."] },
      sideQuestB: { title: "Ordering at a Café", blurb: "\"Vorrei...\" is the polite way to order food or drink in Italian.", points: ["'Vorrei' is considered more polite than the more direct 'voglio'.", "Adding 'per favore' at the end of an order is standard Italian café etiquette."] },
      u3_intro: { title: "Asking Questions", blurb: "Question words like cosa, dove, and quando let you ask for the information you need.", points: ["Italian question words always come at the very start of a question.", "Learning question words early makes it possible to ask for help in almost any situation."] },
      u3_branchA: { title: "Talking About Likes", blurb: "\"Mi piace...\" is the key phrase for saying what you like in Italian.", points: ["'Mi piace' literally translates closer to 'it is pleasing to me' than a direct 'I like'.", "The verb changes to 'mi piacciono' when talking about liking more than one thing."] },
      u3_branchB: { title: "Talking About Daily Routine", blurb: "Reflexive verbs like svegliarsi describe many everyday routine actions in Italian.", points: ["A reflexive verb needs a matching pronoun, like 'mi', 'ti', or 'si', before the verb.", "Many daily routine actions in Italian, like waking up or getting dressed, are expressed reflexively."] },
      u3_branchC: { title: "Making Plans", blurb: "Suggesting an activity and agreeing on a time is essential for making plans in Italian.", points: ["Suggesting a specific time and place together makes a plan far more concrete than a vague suggestion.", "Agreeing enthusiastically to a plan is just as important a skill as suggesting one."] },
      u3_merge: { title: "Having a Basic Conversation", blurb: "Questions, likes, and routines combine into a real, basic Italian conversation.", points: ["A genuine conversation usually mixes questions, opinions, and routine descriptions together naturally.", "Real conversations rarely stick to just one grammar topic at a time."] },
      u3_hub2: { title: "Chatting About Your Day", blurb: "Routine and plans together let you describe both what you did and what's coming next.", points: ["Describing your routine and then making plans together covers most of a typical daily conversation.", "This combination mirrors exactly what's tested in the Mini Dialogue project."] },
      u3_dead1: { title: "Italian Regions & Dialects", blurb: "Italy's regions each have their own distinct dialects and culinary traditions.", points: ["Standard Italian is based historically on the Florentine dialect from Tuscany.", "Regional dialects can differ enough from standard Italian to sound like a different language entirely."] },
      u3_dead2: { title: "Numbers Above 20", blurb: "Italian numbers above twenty follow a consistent, combinable pattern.", points: ["Italian numbers above twenty combine the tens word with the ones digit, similar to English.", "A small spelling change happens when combining certain tens words with 'uno' or 'otto'."] },
      review: { title: "Building Real Confidence in Italian", blurb: "Every phrase learned here combines into the confidence to have a genuine conversation in Italian.", points: ["Ordering food, describing family, and asking questions all draw on the exact same vocabulary learned here.", "Real fluency comes from combining small pieces, like these, into flexible, natural conversation."] }
    }
  },
  {
    id: "japanese-starters",
    title: "Japanese Starters",
    type: "Languages",
    yeargroups: "11-13",
    description: "Learn hiragana, katakana, sentence structure, and your first real Japanese conversations.",
    medalNames: { test1: "Japanese Starter", test2: "Sentence Builder", test3: "Kaiwa Champion" },
    specialTitles: { test1: "Scripts Check", test2: "Sentence Structure Check", test3: "Conversation Check" },
    projects: {
      project1: {
        title: "Write a Self-Introduction",
        brief: "Write a short self-introduction in Japanese including your name, where you're from, and one hobby.",
        checklist: ["Introduce your name", "State where you're from", "Mention one hobby"]
      },
      project2: {
        title: "Restaurant Dialogue",
        brief: "Write a short dialogue between a customer and a server ordering food in Japanese.",
        checklist: ["Write 6+ lines", "Include an order", "Include a question with 'ka'"]
      }
    },
    finalTitle: "Japanese Starters Final Exam",
    topics: {
      u1_intro: { title: "Greetings & Basics", blurb: "\"Konnichiwa\" and bowing are two of the very first things learned in Japanese.", points: ["'Konnichiwa' is typically used during the daytime, with different greetings for morning and evening.", "The depth of a bow can subtly change its meaning, from casual to deeply respectful."] },
      u1_branchA: { title: "Hiragana Basics", blurb: "Hiragana is one of Japanese's core phonetic scripts, used for native Japanese words and grammar.", points: ["Hiragana has 46 basic characters, each representing a single syllable sound.", "Every native Japanese grammatical ending can be written using hiragana."] },
      u1_branchB: { title: "Katakana Basics", blurb: "Katakana is Japanese's other phonetic script, mainly used for foreign loanwords.", points: ["Katakana characters look visually sharper and more angular than hiragana.", "A word like 'コーヒー' (kōhī, coffee) shows how katakana adapts foreign words into Japanese sounds."] },
      u1_branchC: { title: "Numbers 1-10", blurb: "Counting from ichi to juu is an essential early step in learning Japanese.", points: ["Japanese numbers 1 through 10 use entirely distinct syllables, similar to how Mandarin numbers work.", "These ten numbers form the base for building every larger number in Japanese."] },
      u1_merge: { title: "Reading Japanese Scripts", blurb: "Hiragana and katakana together cover the two core phonetic scripts used throughout Japanese.", points: ["Native Japanese words are usually written in hiragana, while foreign loanwords use katakana.", "Learning both scripts is necessary before tackling kanji, the third writing system."] },
      u1_hub2: { title: "Scripts and Numbers Together", blurb: "Numbers in Japanese are written using the same phonetic scripts you're already learning to read.", points: ["Seeing numbers written in hiragana is good early practice for reading the script fluently.", "This combination reinforces both scripts and numbers at the same time."] },
      bonus1: { title: "Kanji: A First Look", blurb: "Kanji are characters borrowed from Chinese that represent whole words or ideas, not just sounds.", points: ["A single kanji character can carry an entire word's meaning, unlike a single hiragana character.", "Japanese uses thousands of kanji, though a few hundred cover most everyday writing."] },
      bonus2: { title: "Bowing Etiquette", blurb: "The depth and duration of a bow in Japan often signals the level of respect being shown.", points: ["A quick, shallow bow is common for casual greetings among friends.", "A deep, held bow is reserved for formal situations, like meeting someone very senior."] },
      u2_intro: { title: "Self-Introductions", blurb: "\"Watashi wa... desu\" is the standard structure for introducing yourself in Japanese.", points: ["This structure literally translates to 'As for me, I am...'.", "Self-introductions in Japan often also include your hometown and occupation."] },
      u2_branchA: { title: "Simple Sentence Structure", blurb: "Japanese sentences typically follow a subject-object-verb order, unlike English.", points: ["Placing the verb at the end of the sentence is one of the biggest differences from English word order.", "This structure means listeners often don't know the full meaning until the very last word."] },
      u2_branchB: { title: "Particles Basics", blurb: "Small words called particles, like wa and o, mark the role each word plays in a Japanese sentence.", points: ["The particle 'wa' typically marks the topic of a sentence.", "The particle 'o' typically marks the direct object of a verb."] },
      u2_branchC: { title: "Describing People", blurb: "Simple adjectives describe what someone looks or acts like in Japanese.", points: ["Japanese adjectives change their ending depending on whether they're in present or past tense.", "Describing people accurately in Japanese often depends on getting the adjective form exactly right."] },
      u2_merge: { title: "Building Basic Sentences", blurb: "Sentence structure and particles together are what make a Japanese sentence actually grammatical.", points: ["A grammatical Japanese sentence needs both correct word order and correct particles.", "Skipping either particles or proper word order usually makes a sentence sound noticeably wrong."] },
      u2_hub2: { title: "Describing People Correctly", blurb: "Correct particle use is essential the moment you start describing people in full sentences.", points: ["Choosing the wrong particle can change who or what a description is actually about.", "Native speakers rely on particles constantly to keep meaning clear despite flexible word order."] },
      sideQuestA: { title: "Family Vocabulary", blurb: "Japanese uses different words for family members depending on whether you're referring to your own or someone else's.", points: ["You'd use a more humble word for your own mother than the word used for someone else's mother.", "This distinction reflects a broader pattern of humility and respect built into Japanese vocabulary."] },
      sideQuestB: { title: "Polite vs. Casual Speech", blurb: "Japanese has distinct polite and casual speech forms used in different social situations.", points: ["Polite speech, called 'desu/masu' form, is standard when speaking with strangers or in formal settings.", "Using overly casual speech with the wrong person can come across as rude in Japanese culture."] },
      u3_intro: { title: "Asking Questions", blurb: "Adding \"ka\" to the end of a sentence is the simplest way to turn it into a question in Japanese.", points: ["Adding 'ka' works for almost any statement to turn it into a yes/no question.", "This is one of the simplest question-forming methods across any language."] },
      u3_branchA: { title: "Talking About Likes", blurb: "\"Watashi wa... ga suki desu\" is a key phrase for saying what you like in Japanese.", points: ["This phrase uses 'ga' instead of 'wa' to mark specifically what is being liked.", "Sharing likes and dislikes is a natural, easy way to extend a basic conversation."] },
      u3_branchB: { title: "Ordering Food", blurb: "Simple set phrases let you order food and drink politely in a Japanese restaurant.", points: ["Pointing at a menu item while saying a simple phrase is a common, practical strategy for beginners.", "Japanese restaurants often have plastic food displays, making ordering easier for learners."] },
      u3_branchC: { title: "Counting Objects", blurb: "Japanese uses different counting words depending on the shape or type of object being counted.", points: ["Flat objects, long objects, and small animals each use a different Japanese counting word.", "Forgetting the correct counter is one of the most common mistakes beginners make."] },
      u3_merge: { title: "A Simple Conversation", blurb: "Questions, likes, and ordering food combine into a real, basic Japanese conversation.", points: ["A basic Japanese conversation blends questions, preferences, and food-ordering phrases naturally.", "This blend mirrors the exact skills tested in the Restaurant Dialogue project."] },
      u3_hub2: { title: "Counting in Conversation", blurb: "Counting words often come up naturally the moment you're ordering food or describing objects.", points: ["Ordering more than one of something in a restaurant naturally requires the right counting word.", "This is exactly why counters and food-ordering vocabulary are taught so closely together."] },
      u3_dead1: { title: "Japanese Writing Direction", blurb: "Japanese can traditionally be written top-to-bottom and right-to-left, unlike English.", points: ["Modern Japanese also commonly uses left-to-right horizontal writing, especially in digital text.", "Traditional vertical writing is still common in novels and some newspapers."] },
      u3_dead2: { title: "Anime & Manga Japanese", blurb: "Anime and manga often use casual speech patterns that differ from textbook-polite Japanese.", points: ["Anime characters often use exaggerated or region-specific speech patterns for personality effect.", "Relying only on anime Japanese can lead to sounding overly dramatic in real conversation."] },
      review: { title: "Your First Steps in Japanese", blurb: "Scripts, sentence structure, and basic conversation together form the true foundation of learning Japanese.", points: ["Even a simple conversation in Japanese now relies on scripts, particles, and sentence structure working together.", "This is exactly why Japanese, despite its reputation, becomes more approachable once these fundamentals click."] }
    }
  },
  {
    id: "latin-roots-and-basics",
    title: "Latin Roots & Basics",
    type: "Languages",
    yeargroups: "9-11",
    description: "Read basic Latin and discover the Latin roots hiding inside thousands of English words.",
    medalNames: { test1: "Latin Starter", test2: "Grammaticus", test3: "Root Researcher" },
    specialTitles: { test1: "Cases & Basics Check", test2: "Verbs & Sentences Check", test3: "Roots Check" },
    projects: {
      project1: {
        title: "Translate Simple Sentences",
        brief: "Translate five simple English sentences into Latin using the vocabulary and cases you've learned.",
        checklist: ["Translate 5 sentences", "Use correct noun cases", "Use correct verb endings"]
      },
      project2: {
        title: "Break Down English Words",
        brief: "Choose five complex English words and break each into its Latin roots, prefixes, and suffixes.",
        checklist: ["Choose 5 words", "Identify each word's parts", "Explain each part's Latin meaning"]
      }
    },
    finalTitle: "Latin Roots & Basics Final Exam",
    topics: {
      u1_intro: { title: "Why Learn Latin?", blurb: "Latin is the ancestor of many modern languages and the root of huge amounts of English vocabulary.", points: ["Roughly 60 percent of English vocabulary has Latin or Greek origins.", "Studying Latin often makes learning other Romance languages, like Spanish or French, noticeably easier."] },
      u1_branchA: { title: "The Latin Alphabet & Pronunciation", blurb: "Classical Latin pronunciation follows consistent rules, distinct from how Latin words often sound in English.", points: ["Classical Latin pronounces every letter clearly, without silent letters common in English.", "The letter 'v' in classical Latin was pronounced more like an English 'w'."] },
      u1_branchB: { title: "Latin Nouns & Cases", blurb: "A Latin noun changes its ending, called its case, depending on its role in a sentence.", points: ["Latin has up to six different cases, each signaling a different grammatical role.", "A single Latin noun can look quite different depending on which case it's in."] },
      u1_branchC: { title: "The Nominative & Accusative Cases", blurb: "The nominative case marks a sentence's subject, while the accusative marks its direct object.", points: ["The nominative case answers the question 'who or what is doing the action?'", "The accusative case answers the question 'who or what is receiving the action?'"] },
      u1_merge: { title: "Reading Basic Latin Sentences", blurb: "Pronunciation and noun cases together are the first real steps toward reading Latin sentences.", points: ["Recognising a word's case is often more important than recognising its position in the sentence.", "This is a major shift for English speakers used to relying heavily on word order."] },
      u1_hub2: { title: "Subjects and Objects in Latin", blurb: "The nominative and accusative cases are what actually reveal a Latin sentence's basic structure.", points: ["Correctly identifying the nominative and accusative words is the key first step to translating any Latin sentence.", "Latin word endings do the grammatical work that English mostly does through word order."] },
      bonus1: { title: "Latin Phrases in English", blurb: "Phrases like \"et cetera\" and \"status quo\" are Latin, used constantly in everyday English.", points: ["'Et cetera' literally means 'and the rest' in Latin.", "Legal and academic English still borrows many Latin phrases directly, like 'de facto'."] },
      bonus2: { title: "Latin Mottos", blurb: "Many schools, cities, and organizations still use Latin mottos today.", points: ["Many university mottos are written in Latin to convey a sense of tradition and prestige.", "A short Latin motto can often summarise an entire institution's values in just a few words."] },
      u2_intro: { title: "Latin Verb Basics", blurb: "Latin verbs change their ending to show who is doing the action, without needing a separate pronoun.", points: ["A Latin verb ending alone can tell you who is performing the action without any separate pronoun.", "This is very different from English, which almost always requires a subject pronoun."] },
      u2_branchA: { title: "Present Tense Verbs", blurb: "Regular Latin verbs follow a predictable pattern of endings in the present tense.", points: ["Regular Latin verbs are grouped into conjugations, each following its own consistent ending pattern.", "Once a conjugation pattern is learned, it applies predictably to dozens of related verbs."] },
      u2_branchB: { title: "Latin Word Order", blurb: "Latin word order is flexible because its case endings, not position, show each word's role.", points: ["Latin poetry often took advantage of flexible word order for artistic and rhythmic effect.", "Despite the flexibility, certain word orders were still more common in everyday Latin prose."] },
      u2_branchC: { title: "Common Latin Verbs", blurb: "Verbs like amare (to love) and videre (to see) appear constantly across Latin texts.", points: ["'Amare' is the direct ancestor of English words like 'amiable' and 'amateur'.", "'Videre' is the direct ancestor of English words like 'video' and 'vision'."] },
      u2_merge: { title: "Building Simple Latin Sentences", blurb: "Verb endings and flexible word order together are what make Latin sentences work so differently from English.", points: ["A grammatical Latin sentence relies on verb endings and noun cases working together, not fixed word order.", "This is one of the most fundamental differences between Latin grammar and English grammar."] },
      u2_hub2: { title: "Verbs in Every Position", blurb: "Common verbs show up in Latin sentences no matter where the flexible word order places them.", points: ["A Latin verb's ending stays consistent and recognisable no matter where it's placed in the sentence.", "This reliability is exactly what makes Latin's flexible word order actually workable."] },
      sideQuestA: { title: "English Words from Latin Verbs", blurb: "Words like 'video' and 'amateur' both trace directly back to Latin verbs.", points: ["'Amateur' originally meant someone who does something purely out of love rather than for pay.", "Recognising the Latin verb hiding inside an English word often reveals its deeper meaning."] },
      sideQuestB: { title: "Latin Numbers", blurb: "Latin numbers, like Roman numerals, are still recognisable in many modern contexts.", points: ["Roman numerals are still commonly seen on clock faces and in movie copyright dates.", "Latin numbers directly influenced number words in many modern Romance languages."] },
      u3_intro: { title: "Latin Roots in English", blurb: "Huge numbers of English words are built directly from Latin roots, prefixes, and suffixes.", points: ["A single Latin root can appear inside dozens of seemingly unrelated English words.", "Recognising roots is one of the fastest ways to expand English vocabulary quickly."] },
      u3_branchA: { title: "Common Latin Prefixes", blurb: "Prefixes like 're-' (again) and 'trans-' (across) shape the meaning of countless English words.", points: ["The prefix 'ex-' means 'out of', as seen in words like 'exit' and 'export'.", "Stacking multiple prefixes and roots together builds many longer, more technical English words."] },
      u3_branchB: { title: "Common Latin Suffixes", blurb: "Suffixes like '-tion' and '-able' are Latin in origin and appear throughout English.", points: ["The suffix '-tion' typically turns a verb into a noun describing an action or result.", "Recognising common suffixes helps predict how an unfamiliar word likely functions grammatically."] },
      u3_branchC: { title: "Building Vocabulary from Roots", blurb: "Recognising a Latin root often lets you guess the meaning of an entirely unfamiliar English word.", points: ["Breaking 'transportation' into 'trans-' (across), 'port' (carry), and '-tion' reveals its meaning directly.", "This root-breaking technique works for a surprising number of unfamiliar academic words."] },
      u3_merge: { title: "Decoding English Through Latin", blurb: "Latin prefixes and suffixes together explain the structure behind thousands of English words.", points: ["Combining knowledge of prefixes and suffixes lets you decode entirely unfamiliar words on sight.", "This skill is especially useful for tackling advanced academic or scientific vocabulary."] },
      u3_hub2: { title: "Guessing Meaning from Roots", blurb: "Recognising prefixes and roots together is a powerful shortcut for building new vocabulary.", points: ["Even without a dictionary, root knowledge alone can often get you close to a word's actual meaning.", "This shortcut is one of the most practical real-world benefits of studying Latin roots."] },
      u3_dead1: { title: "Latin in Science & Medicine", blurb: "Scientific and medical terms rely heavily on Latin roots for precise, universal naming.", points: ["Every biological species has a Latin, or Latinized, scientific name.", "Medical terms often combine Latin roots to precisely describe a body part or condition."] },
      u3_dead2: { title: "Latin in Law", blurb: "Legal terms like \"habeas corpus\" remain in active use directly from Latin.", points: ["'Habeas corpus' literally means 'you shall have the body' in Latin.", "Legal Latin phrases persist because they carry precise, universally understood meanings."] },
      review: { title: "Latin's Living Legacy", blurb: "Though no longer commonly spoken, Latin still quietly shapes an enormous amount of the English language.", points: ["Nearly every advanced English word you encounter can be at least partly traced back to Latin roots.", "Studying Latin, even briefly, permanently changes how you notice patterns in English vocabulary."] }
    }
  },
  {
    id: "british-sign-language-basics",
    title: "British Sign Language Basics",
    type: "Languages",
    yeargroups: "5-8",
    description: "Learn fingerspelling, everyday signs, and the grammar of British Sign Language.",
    medalNames: { test1: "BSL Starter", test2: "BSL Communicator", test3: "BSL Conversationalist" },
    specialTitles: { test1: "Fingerspelling & Greetings Check", test2: "Family & Description Check", test3: "Conversation Check" },
    projects: {
      project1: {
        title: "Describe Your Family in BSL",
        brief: "Describe your family in BSL (written as a plan of signs and facial expressions) using the vocabulary you've learned.",
        checklist: ["Plan 5 family descriptions", "Include a colour sign", "Include a number sign"]
      },
      project2: {
        title: "Plan a Simple BSL Dialogue",
        brief: "Plan a short dialogue between two people in BSL, describing the signs and expressions used.",
        checklist: ["Plan 6+ exchanges", "Include a question", "Include a time sign"]
      }
    },
    finalTitle: "British Sign Language Basics Final Exam",
    topics: {
      u1_intro: { title: "What is BSL?", blurb: "British Sign Language is a complete, visual language used by the Deaf community in the UK.", points: ["BSL has its own grammar and sentence structure, completely separate from English.", "BSL is recognised as an official language in the UK."] },
      u1_branchA: { title: "The BSL Fingerspelling Alphabet", blurb: "BSL fingerspelling uses both hands to spell out words letter by letter.", points: ["Fingerspelling is typically used for names, places, or words without an established sign.", "The two-handed BSL alphabet is different from the one-handed fingerspelling alphabet used in American Sign Language."] },
      u1_branchB: { title: "Basic Greetings in BSL", blurb: "Simple signs for hello, please, and thank you are among the very first signs learned in BSL.", points: ["A simple wave is often part of a friendly greeting in BSL, just as in spoken cultures.", "Learning basic polite signs early makes any first BSL conversation feel much more natural."] },
      u1_branchC: { title: "Facial Expression in BSL", blurb: "Facial expression in BSL isn't just emotional — it carries real grammatical meaning.", points: ["Raised eyebrows in BSL can signal a yes/no question, functioning like grammar rather than just emotion.", "Without the correct facial expression, a sign's grammatical meaning can be genuinely unclear."] },
      u1_merge: { title: "Signing Your First Words", blurb: "Fingerspelling and basic greetings together are the very first steps into signing BSL.", points: ["Combining fingerspelling with a few basic signs is usually enough for a very first simple exchange.", "This combination mirrors how a beginner in any language starts with small, functional phrases."] },
      u1_hub2: { title: "Signs That Rely on Expression", blurb: "Greetings in BSL often rely on facial expression just as much as hand shape.", points: ["A greeting sign paired with the wrong facial expression can come across as insincere or confusing.", "This is exactly why facial expression is taught alongside greetings from the very start."] },
      bonus1: { title: "Deaf Culture Basics", blurb: "Deaf culture has its own rich traditions, humour, and history distinct from spoken-language cultures.", points: ["Deaf culture includes its own storytelling traditions, often performed visually rather than spoken.", "Capital-D 'Deaf' is often used specifically to describe cultural identity, not just hearing status."] },
      bonus2: { title: "BSL Around the UK", blurb: "BSL can vary slightly by region, similar to regional accents in spoken English.", points: ["Regional BSL variation means the same concept can be signed differently in different cities.", "This regional variation is directly comparable to different accents in spoken English."] },
      u2_intro: { title: "Family Signs", blurb: "Signs for mother, father, and sibling let you describe your family members in BSL.", points: ["Family signs are often among the very first vocabulary taught to new BSL learners.", "Some family signs are based on placement near specific parts of the body or face."] },
      u2_branchA: { title: "Describing People in BSL", blurb: "Simple descriptive signs let you describe what someone looks or acts like.", points: ["Descriptive signs in BSL are often paired with an appropriate facial expression to add nuance.", "Signing a description accurately can rely just as much on expression as on hand shape."] },
      u2_branchB: { title: "Numbers 1-20 in BSL", blurb: "Counting from one to twenty in BSL uses a consistent, learnable hand-shape pattern.", points: ["The number signs in BSL involve very specific handshapes that must be precise to be understood correctly.", "Learning numbers early is essential before tackling more advanced topics like time or age."] },
      u2_branchC: { title: "Colours in BSL", blurb: "Colour signs are some of the most useful early descriptive signs to learn.", points: ["Some colour signs are based on a related object, like the sign for orange referencing the fruit.", "Colour signs are among the most practically useful early descriptive vocabulary in BSL."] },
      u2_merge: { title: "Describing Your Family in BSL", blurb: "Family signs, descriptions, and colours combine to describe your family in BSL.", points: ["Describing family members combines specific signs, descriptive expressions, and colour or number details.", "This exact combination is what the Describe Your Family in BSL project is designed to test."] },
      u2_hub2: { title: "Numbers and Description Together", blurb: "Numbers and colours are both essential once you start giving fuller descriptions in BSL.", points: ["Giving someone's age or the number of siblings they have naturally combines numbers with description.", "This combination shows up constantly once conversations move beyond simple greetings."] },
      sideQuestA: { title: "Signing Space", blurb: "BSL uses the space around the signer to represent people, places, and ideas.", points: ["A signer can assign a specific person or place to a location in space and refer back to it later.", "This spatial technique lets BSL communicate relationships and location without extra words."] },
      sideQuestB: { title: "BSL Grammar Basics", blurb: "BSL has its own grammar, entirely different from spoken English word order.", points: ["BSL typically places the topic of a sentence first, followed by a comment about it.", "This topic-comment structure is fundamentally different from typical English sentence order."] },
      u3_intro: { title: "Asking Questions in BSL", blurb: "Questions in BSL are shown through specific facial expressions and eyebrow movement, not just word signs.", points: ["A yes/no question in BSL is often signaled with raised eyebrows and a forward head tilt.", "A wh-question, like 'what' or 'where', typically uses furrowed eyebrows instead."] },
      u3_branchA: { title: "Talking About Likes", blurb: "Simple signs let you express what you like or don't like in BSL.", points: ["Signing what you like or dislike often uses a small set of core signs paired with facial expression.", "Facial expression alone can indicate enthusiasm or reluctance about a liked activity."] },
      u3_branchB: { title: "Everyday Conversation Signs", blurb: "A small set of signs covers most everyday small talk in BSL.", points: ["A relatively small vocabulary of signs can cover the vast majority of everyday small talk.", "Practicing these common signs first builds confidence quickly for a new BSL learner."] },
      u3_branchC: { title: "Time Signs in BSL", blurb: "Signs for today, tomorrow, and yesterday let you talk about when something happens.", points: ["Time signs in BSL are often positioned relative to the body, like signing 'tomorrow' slightly forward.", "Understanding time signs is essential before describing plans or past events."] },
      u3_merge: { title: "Having a Simple Conversation in BSL", blurb: "Questions, likes, and everyday signs combine into a real, basic conversation in BSL.", points: ["A basic BSL conversation blends questions, preferences, and everyday signs naturally.", "This blend mirrors the exact skills tested in the Plan a Simple BSL Dialogue project."] },
      u3_hub2: { title: "Talking About Time in Conversation", blurb: "Time signs naturally come up the moment a BSL conversation moves beyond the present moment.", points: ["Time signs naturally combine with everyday conversation signs once a discussion moves beyond the present moment.", "This combination is exactly why time vocabulary is introduced alongside conversational signs."] },
      u3_dead1: { title: "BSL Interpreters", blurb: "A BSL interpreter translates between spoken English and BSL in real time.", points: ["A qualified BSL interpreter often trains for several years before working professionally.", "Interpreters are essential for ensuring Deaf people have equal access to spoken-language settings."] },
      u3_dead2: { title: "Learning BSL Online", blurb: "Many communities and resources now make learning BSL more accessible than ever before.", points: ["Video-based resources are especially valuable for learning BSL, since the language is entirely visual.", "Many online BSL courses are taught directly by Deaf instructors."] },
      review: { title: "BSL as a Complete Language", blurb: "British Sign Language has its own full grammar and culture, just as rich and complete as any spoken language.", points: ["BSL combines its own vocabulary, grammar, and cultural context into a genuinely complete language.", "Recognising BSL as equally complex and rich as any spoken language is an important part of understanding Deaf culture."] }
    }
  },
  {
    id: "economics-basics",
    title: "Economics Basics",
    type: "Humanities",
    yeargroups: "11-13",
    description: "Scarcity, supply and demand, and economic systems — the ideas behind every economic decision.",
    medalNames: { test1: "Economics Starter", test2: "Market Analyst", test3: "Systems Scholar" },
    specialTitles: { test1: "Scarcity & Choice Check", test2: "Supply & Demand Check", test3: "Economic Systems Check" },
    projects: {
      project1: {
        title: "Analyse a Market Scenario",
        brief: "Choose a product and explain how a change in supply or demand would affect its price.",
        checklist: ["Choose a product", "Describe a supply or demand change", "Explain the price effect"]
      },
      project2: {
        title: "Compare Two Economic Systems",
        brief: "Compare a market economy and a command economy in terms of who decides what gets produced.",
        checklist: ["Describe a market economy", "Describe a command economy", "Compare who decides production"]
      }
    },
    finalTitle: "Economics Basics Final Exam",
    topics: {
      u1_intro: { title: "What is Economics?", blurb: "Economics studies how people and societies choose to use limited resources.", points: ["Economics applies to decisions made by individuals, businesses, and entire governments.", "Every economic decision ultimately comes down to how to use limited resources."] },
      u1_branchA: { title: "Scarcity & Choice", blurb: "Scarcity means resources are limited, forcing every choice to involve a trade-off.", points: ["Even wealthy individuals and nations still face scarcity, since no resource is truly unlimited.", "Every choice made under scarcity means giving up some other possible option."] },
      u1_branchB: { title: "Needs vs. Wants", blurb: "Distinguishing a genuine need from a want shapes nearly every economic decision.", points: ["Food, shelter, and basic healthcare are typically classified as needs.", "The same item can be a need for one person and a want for another depending on circumstances."] },
      u1_branchC: { title: "Opportunity Cost", blurb: "Opportunity cost is the value of the next-best option given up when making a choice.", points: ["Choosing to spend an hour studying means giving up whatever else you could have done with that hour.", "Opportunity cost applies to money, time, and virtually every other limited resource."] },
      u1_merge: { title: "The Basic Economic Problem", blurb: "Scarcity, choice, and opportunity cost together define the basic problem economics tries to solve.", points: ["Every economic system, no matter how different, is ultimately trying to solve this same basic problem of scarcity.", "Recognising trade-offs clearly is the first step toward making a genuinely informed economic choice."] },
      u1_hub2: { title: "What Every Choice Costs", blurb: "Opportunity cost is what makes every single economic choice, even small ones, genuinely meaningful.", points: ["Ignoring opportunity cost often leads to choices that look free but actually carry a hidden cost.", "Economists use opportunity cost specifically to compare the true value of different choices."] },
      bonus1: { title: "Economics in Daily Life", blurb: "Deciding how to spend your own allowance is already a basic economic decision.", points: ["Choosing between two job offers is itself a real-world economic decision involving trade-offs.", "Budgeting a weekly allowance teaches the exact same scarcity principles used in national economics."] },
      bonus2: { title: "History of Trade", blurb: "Trade has connected distant societies and economies since ancient times.", points: ["Ancient trade routes, like the Silk Road, connected economies thousands of miles apart.", "Trade has historically allowed regions to specialize in producing what they're best suited for."] },
      u2_intro: { title: "Supply & Demand Basics", blurb: "Supply and demand together determine the price of nearly everything bought and sold.", points: ["Prices act as a signal, communicating information between buyers and sellers.", "A sudden shift in either supply or demand can quickly change a product's market price."] },
      u2_branchA: { title: "How Demand Works", blurb: "Demand usually falls as a price rises, and rises as a price falls.", points: ["A price drop on a popular item often causes a noticeable spike in demand.", "Demand can also shift due to factors like changing tastes or a new competing product."] },
      u2_branchB: { title: "How Supply Works", blurb: "Supply usually rises as a price rises, since producers are motivated to sell more.", points: ["Higher prices give producers an incentive to increase how much they're willing to sell.", "Supply can also shift due to factors like production costs or new technology."] },
      u2_branchC: { title: "Market Equilibrium", blurb: "Market equilibrium is the price where supply and demand exactly balance.", points: ["At equilibrium, the quantity buyers want to purchase exactly matches the quantity sellers want to sell.", "Prices above or below equilibrium tend to naturally correct back toward that balance point over time."] },
      u2_merge: { title: "Supply Meeting Demand", blurb: "Demand and supply together are what actually determine a market's final price.", points: ["Graphing supply and demand together shows exactly where their lines cross at the equilibrium price.", "Real-world prices constantly shift as either supply or demand changes."] },
      u2_hub2: { title: "Finding the Balance Point", blurb: "Equilibrium is simply the point where supply and demand curves genuinely meet.", points: ["A shift in either supply or demand moves where this balance point actually sits.", "Understanding equilibrium helps predict how a market will respond to a real-world change."] },
      sideQuestA: { title: "Price Changes & Shortages", blurb: "A shortage occurs when demand outpaces supply at the current price.", points: ["A shortage typically pushes prices upward until supply and demand rebalance.", "Price controls that keep prices artificially low can sometimes cause persistent shortages."] },
      sideQuestB: { title: "Competition in Markets", blurb: "Competition between sellers tends to push prices down and quality up.", points: ["Businesses competing for the same customers often lower prices or improve quality to win them over.", "A market with very little competition can allow a single seller to charge unusually high prices."] },
      u3_intro: { title: "Types of Economic Systems", blurb: "Market, command, and mixed economies each organize production and resources differently.", points: ["No real-world economy is a completely pure example of just one system.", "The core economic questions every system must answer are what to produce, how, and for whom."] },
      u3_branchA: { title: "Market Economies", blurb: "A market economy lets supply, demand, and competition largely determine what gets produced.", points: ["In a pure market economy, prices alone signal what should be produced and in what quantity.", "Market economies tend to reward efficiency and innovation, but can create significant inequality."] },
      u3_branchB: { title: "Command Economies", blurb: "A command economy has a central government making most major economic decisions.", points: ["A command economy can direct resources quickly toward a national priority, like wartime production.", "Command economies often struggle to respond as quickly to changing consumer preferences."] },
      u3_branchC: { title: "Mixed Economies", blurb: "A mixed economy combines market forces with significant government involvement.", points: ["Most modern economies combine private markets with government regulation and public services.", "Finding the right balance between market freedom and government involvement is a constant political debate."] },
      u3_merge: { title: "Comparing Economic Systems", blurb: "Market, command, and mixed systems each answer the same economic questions in very different ways.", points: ["Each system trades off differently between efficiency, equality, and government control.", "Comparing systems side by side reveals there's no single 'correct' answer that works for every society."] },
      u3_hub2: { title: "Where Most Economies Actually Sit", blurb: "Most real-world economies are mixed economies, blending elements of the other two.", points: ["Even famously 'free market' economies still have significant government regulation and public spending.", "Nearly every country today operates somewhere along this spectrum rather than at either extreme."] },
      u3_dead1: { title: "GDP Basics", blurb: "GDP measures the total value of everything a country produces in a given period.", points: ["GDP is one of the most commonly used indicators for comparing the size of national economies.", "A rising GDP generally suggests economic growth, though it doesn't capture everything about a country's wellbeing."] },
      u3_dead2: { title: "Inflation Basics", blurb: "Inflation describes prices rising over time, reducing how much the same amount of money can buy.", points: ["Moderate inflation is generally considered normal and even healthy for a growing economy.", "Very high inflation can rapidly erode the value of savings and wages."] },
      review: { title: "Economics Shaping Everyday Life", blurb: "From your own choices to entire nations, the same basic economic ideas apply at every scale.", points: ["The same core principles, scarcity, supply, demand, and trade-offs, apply from a household budget to a national economy.", "Understanding basic economics helps make sense of news about prices, jobs, and government policy."] }
    }
  },
  {
    id: "renaissance-and-enlightenment",
    title: "The Renaissance & Enlightenment",
    type: "Humanities",
    yeargroups: "10-12",
    description: "See how a rebirth of art and a revolution of reason together reshaped the modern world.",
    medalNames: { test1: "Renaissance Starter", test2: "Enlightenment Thinker", test3: "Legacy Historian" },
    specialTitles: { test1: "Renaissance Check", test2: "Enlightenment Check", test3: "Legacy Check" },
    projects: {
      project1: {
        title: "Debate an Enlightenment Idea",
        brief: "Choose an Enlightenment idea, like natural rights, and write arguments for and against it as it was seen at the time.",
        checklist: ["Choose an idea", "Write a supporting argument", "Write an opposing argument"]
      },
      project2: {
        title: "Trace an Idea's Legacy",
        brief: "Choose one Renaissance or Enlightenment idea and trace its influence to something in the modern world.",
        checklist: ["Choose an idea", "Describe its origin", "Explain its modern influence"]
      }
    },
    finalTitle: "The Renaissance & Enlightenment Final Exam",
    topics: {
      u1_intro: { title: "What Was the Renaissance?", blurb: "The Renaissance was a period of renewed interest in art, science, and classical learning in Europe.", points: ["The word 'Renaissance' literally means 'rebirth' in French.", "The Renaissance is generally considered to have begun in Italy in the 14th century."] },
      u1_branchA: { title: "Renaissance Italy", blurb: "The Renaissance began in Italian city-states like Florence, fueled by wealth and patronage.", points: ["Wealthy merchant families, like the Medici, funded much of the era's greatest art.", "City-states competing for prestige helped drive an explosion of artistic and architectural achievement."] },
      u1_branchB: { title: "Renaissance Art & Science", blurb: "Renaissance thinkers often blended artistic skill with genuine scientific curiosity.", points: ["Leonardo da Vinci's notebooks blend detailed anatomical drawings with artistic studies.", "Renaissance artists pioneered techniques like linear perspective to create realistic depth."] },
      u1_branchC: { title: "Humanism", blurb: "Humanism placed new emphasis on human potential, reason, and classical texts.", points: ["Humanist scholars actively sought out and studied ancient Greek and Roman texts.", "Humanism encouraged people to value individual achievement and human reasoning more than before."] },
      u1_merge: { title: "A Rebirth of Ideas", blurb: "Renaissance Italy and humanist thinking together sparked a genuine rebirth of art and learning.", points: ["Wealthy patronage and humanist ideas together created the conditions for an explosion of new art and thought.", "Without both wealthy support and new ways of thinking, this rebirth likely wouldn't have happened as dramatically."] },
      u1_hub2: { title: "Art Meeting Science", blurb: "Humanism's focus on observation is exactly what let Renaissance art and science advance together.", points: ["Humanism's emphasis on close observation directly influenced both artistic technique and early scientific method.", "Renaissance figures often didn't separate art from science the way we typically do today."] },
      bonus1: { title: "Famous Renaissance Figures", blurb: "Figures like Michelangelo and da Vinci embodied the Renaissance ideal of skill across many fields.", points: ["Michelangelo famously worked as a painter, sculptor, and architect all within a single lifetime.", "Leonardo da Vinci is often cited as the ultimate example of a 'Renaissance man'."] },
      bonus2: { title: "The Printing Press", blurb: "The printing press dramatically sped up the spread of Renaissance ideas across Europe.", points: ["Before the printing press, books had to be copied entirely by hand, making them extremely rare and expensive.", "The printing press made written ideas dramatically cheaper and faster to spread across Europe."] },
      u2_intro: { title: "What Was the Enlightenment?", blurb: "The Enlightenment was a later movement that emphasized reason, science, and individual rights.", points: ["The Enlightenment is generally considered to have taken place mainly during the 17th and 18th centuries.", "Enlightenment thinkers increasingly believed that reason could improve society, not just explain nature."] },
      u2_branchA: { title: "Enlightenment Philosophers", blurb: "Thinkers like Locke and Voltaire questioned traditional authority using reason and evidence.", points: ["John Locke argued that government should exist to protect citizens' natural rights.", "Voltaire was known for using sharp wit to criticize religious and political authority."] },
      u2_branchB: { title: "Reason Over Tradition", blurb: "The Enlightenment increasingly favoured reasoned argument over inherited tradition or authority.", points: ["Enlightenment thinkers often argued that laws and institutions should be justified by reason, not just tradition.", "This shift challenged long-standing assumptions about the authority of kings and the church."] },
      u2_branchC: { title: "Natural Rights", blurb: "Natural rights are rights considered to belong to every person simply by being human.", points: ["Natural rights were often described as including life, liberty, and property.", "The idea of natural rights directly influenced later political documents, like national constitutions."] },
      u2_merge: { title: "Questioning the Old Order", blurb: "Enlightenment philosophers and their embrace of reason directly challenged traditional authority.", points: ["Applying reason to government meant questioning why kings or religious leaders should hold unchecked authority.", "This questioning laid intellectual groundwork for major political change."] },
      u2_hub2: { title: "Rights Built on Reason", blurb: "Natural rights were argued for using the same reasoned approach the Enlightenment prized everywhere else.", points: ["Arguing for natural rights through logical reasoning, rather than tradition, was itself a distinctly Enlightenment approach.", "This reasoned argument for rights became a powerful tool for political reformers."] },
      sideQuestA: { title: "The Scientific Revolution", blurb: "The Scientific Revolution, just before the Enlightenment, established observation and experiment as the path to knowledge.", points: ["Figures like Galileo and Newton helped establish careful observation and experiment as the path to true knowledge.", "The Scientific Revolution's methods directly inspired Enlightenment thinkers to apply similar reasoning to society."] },
      sideQuestB: { title: "Enlightenment Salons", blurb: "Salons were informal gatherings where Enlightenment ideas were freely discussed and debated.", points: ["Salons were often hosted by women who played a central role in shaping intellectual discussion.", "These gatherings allowed new and controversial ideas to circulate outside of official institutions."] },
      u3_intro: { title: "Legacy of the Renaissance", blurb: "Renaissance ideas about art and human potential still shape culture centuries later.", points: ["Renaissance ideas about individual human potential still influence modern education and art.", "Techniques developed during the Renaissance, like realistic perspective, remain foundational in art today."] },
      u3_branchA: { title: "Legacy of the Enlightenment", blurb: "Enlightenment ideas about rights and reason directly influenced modern democratic government.", points: ["Many modern constitutions directly echo Enlightenment ideas about natural rights and limited government.", "The concept of separating government powers traces back to Enlightenment political theory."] },
      u3_branchB: { title: "Revolutions Inspired by These Ideas", blurb: "Enlightenment ideas directly inspired major political revolutions in the centuries that followed.", points: ["Enlightenment ideas about natural rights directly influenced revolutionary documents of the era.", "Revolutionary leaders often cited specific Enlightenment philosophers to justify their actions."] },
      u3_branchC: { title: "Comparing the Two Movements", blurb: "The Renaissance focused on reviving the past, while the Enlightenment focused on reasoning toward the future.", points: ["The Renaissance looked backward to classical antiquity, while the Enlightenment looked forward to a reasoned future.", "Both movements, despite their different focus, challenged the authority of tradition in their own way."] },
      u3_merge: { title: "Two Movements, Lasting Change", blurb: "The Renaissance and Enlightenment's legacies together reshaped Western art, thought, and government.", points: ["Together, these movements reshaped how Europeans thought about art, knowledge, and government.", "Modern Western culture still carries deep, direct influences from both movements."] },
      u3_hub2: { title: "From Ideas to Revolution", blurb: "Comparing the two movements shows how directly Enlightenment ideas fed into real political revolutions.", points: ["Recognising how these two movements differ helps explain why the Enlightenment, specifically, fueled political revolution.", "The Renaissance's cultural rebirth set the stage for the Enlightenment's more radical political questioning."] },
      u3_dead1: { title: "Renaissance Architecture", blurb: "Renaissance architecture revived classical columns, domes, and symmetry.", points: ["Renaissance architects deliberately revived classical Greek and Roman design elements, like columns and domes.", "Symmetry and proportion were central design values in Renaissance architecture."] },
      u3_dead2: { title: "Enlightenment Encyclopedias", blurb: "Enlightenment thinkers compiled encyclopedias attempting to organize all human knowledge in one place.", points: ["The Encyclopédie was a massive, collaborative attempt to compile all known human knowledge.", "Producing these encyclopedias reflected the Enlightenment's core belief that knowledge should be widely accessible."] },
      review: { title: "Ideas That Reshaped the World", blurb: "The Renaissance and Enlightenment together laid much of the intellectual groundwork for the modern world.", points: ["Modern art, science, and government all carry direct fingerprints from these two intellectual movements.", "Studying this era reveals how ideas alone can eventually reshape entire societies."] }
    }
  },
  {
    id: "human-migration-and-settlement",
    title: "Human Migration & Settlement",
    type: "Humanities",
    yeargroups: "6-8",
    description: "Explore why people migrate, how settlements grow, and how movement shapes culture.",
    medalNames: { test1: "Migration Starter", test2: "Settlement Specialist", test3: "Global Movement Expert" },
    specialTitles: { test1: "Push & Pull Factors Check", test2: "Settlements Check", test3: "Modern Migration Check" },
    projects: {
      project1: {
        title: "Design a New Settlement",
        brief: "Design a new settlement, choosing its site and explaining why that location makes sense.",
        checklist: ["Choose a site", "Explain the resources available", "Sketch the settlement layout"]
      },
      project2: {
        title: "Investigate a Modern Migration",
        brief: "Research and describe a real modern migration, including its push factors, pull factors, and effects.",
        checklist: ["Choose a real migration", "Describe push and pull factors", "Describe one effect"]
      }
    },
    finalTitle: "Human Migration & Settlement Final Exam",
    topics: {
      u1_intro: { title: "Why Do People Migrate?", blurb: "People migrate for many reasons, often grouped into push factors and pull factors.", points: ["Most migration decisions involve weighing both what's pushing someone away and what's pulling them toward a new place.", "Migration has been a constant feature of human history across every continent."] },
      u1_branchA: { title: "Push Factors", blurb: "A push factor is a reason that drives people to leave a place, like conflict or hardship.", points: ["War, natural disasters, and lack of jobs are all common push factors.", "A severe push factor can sometimes force people to migrate with very little advance planning."] },
      u1_branchB: { title: "Pull Factors", blurb: "A pull factor is a reason that draws people toward a new place, like jobs or safety.", points: ["Better job opportunities and family already living somewhere are classic pull factors.", "A strong pull factor can draw migrants even from relatively stable home situations."] },
      u1_branchC: { title: "Types of Migration", blurb: "Migration can be permanent, temporary, voluntary, or forced, depending on the situation.", points: ["Forced migration happens when people have little or no choice but to leave, unlike voluntary migration.", "Temporary migration, like seasonal farm work, differs from a permanent, lasting relocation."] },
      u1_merge: { title: "Why People Move", blurb: "Push and pull factors together explain most of the reasons people choose, or are forced, to migrate.", points: ["Most real migrations involve both a push away from one place and a pull toward another.", "Understanding both factors together gives a fuller picture than looking at either alone."] },
      u1_hub2: { title: "Different Kinds of Moving", blurb: "The different types of migration each combine push and pull factors in their own way.", points: ["Voluntary economic migration and forced refugee migration can look very different despite both being migration.", "Recognising the type of migration involved helps explain the urgency and permanence behind the move."] },
      bonus1: { title: "Famous Historical Migrations", blurb: "History is shaped by huge migrations, from ancient movements to modern ones.", points: ["Large-scale historical migrations have repeatedly reshaped the ethnic and cultural makeup of entire regions.", "Some of history's largest migrations were driven by war, famine, or the search for new farmland."] },
      bonus2: { title: "Refugees & Asylum", blurb: "A refugee is someone forced to flee their home country, often due to conflict or persecution.", points: ["Refugees are specifically protected under international law due to the danger they face at home.", "Seeking asylum means formally requesting protection in another country due to persecution."] },
      u2_intro: { title: "How Settlements Begin", blurb: "Early settlements typically formed near reliable resources like water, fertile land, or trade routes.", points: ["Access to fresh water was historically one of the very first requirements for any new settlement.", "Early settlements often formed at natural crossroads where trade routes met."] },
      u2_branchA: { title: "Choosing a Settlement Site", blurb: "A good settlement site usually offers water, food, shelter, and some natural defence.", points: ["A site with natural defences, like a hill or river bend, was historically highly valued.", "Fertile soil nearby made a settlement site attractive for reliable food production."] },
      u2_branchB: { title: "From Village to City", blurb: "A settlement can grow from a small village into a large city as its population and resources increase.", points: ["A growing settlement typically develops specialized roles, like traders, craftspeople, and leaders.", "Not every village grows into a city — many remain small for centuries."] },
      u2_branchC: { title: "Settlement Patterns", blurb: "Settlements can be scattered, clustered, or arranged in a line depending on the landscape.", points: ["A linear settlement pattern often forms alongside a road, river, or coastline.", "A clustered pattern often forms around a shared resource, like a well or marketplace."] },
      u2_merge: { title: "Growing a Settlement", blurb: "Choosing a good site and growing over time together explain how villages become cities.", points: ["A well-chosen site combined with steady population growth is what typically transforms a village into a city.", "Not every well-sited settlement grows large — other historical factors matter too."] },
      u2_hub2: { title: "The Shape of a Settlement", blurb: "Settlement patterns often reflect exactly why and where a settlement's site was first chosen.", points: ["A settlement's layout often reveals clues about the landscape and resources that shaped its founding.", "Studying old settlement patterns can reveal exactly why a location was originally chosen."] },
      sideQuestA: { title: "Urban vs. Rural", blurb: "Urban areas are densely populated cities, while rural areas are more sparsely populated countryside.", points: ["Urban areas typically offer more job diversity, while rural areas are more centred on agriculture.", "The line between urban and rural has become increasingly blurred in some growing suburban regions."] },
      sideQuestB: { title: "Urbanization Trends", blurb: "More of the world's population now lives in cities than at any other point in history.", points: ["This shift toward urban living has occurred rapidly, especially over just the last century.", "Rapid urbanization can put significant strain on housing, infrastructure, and public services."] },
      u3_intro: { title: "Migration Today", blurb: "Modern migration is often driven by economic opportunity, conflict, or climate change.", points: ["Modern migration is influenced by a combination of economic, political, and environmental factors.", "Global communication and transportation have made long-distance migration far more feasible than in the past."] },
      u3_branchA: { title: "Economic Migration", blurb: "Economic migration is driven mainly by the search for better jobs or living standards.", points: ["Economic migrants often send money back home to support family members who remain behind.", "Economic migration tends to increase when there's a significant income gap between two regions."] },
      u3_branchB: { title: "Climate Migration", blurb: "Climate migration is a growing category, driven by rising seas, drought, or extreme weather.", points: ["Rising sea levels are already forcing some coastal and island communities to relocate.", "Climate migration is expected to become an increasingly significant driver of movement in coming decades."] },
      u3_branchC: { title: "Migration & Culture", blurb: "Migration constantly reshapes the culture of both the places people leave and the places they arrive.", points: ["Migrants often introduce new foods, languages, and traditions to their new communities.", "Cultural exchange through migration has shaped cuisines and traditions in nearly every major city."] },
      u3_merge: { title: "Why People Move Today", blurb: "Economic and climate migration are two of the biggest drivers of movement in the modern world.", points: ["Economic opportunity and climate pressure are increasingly overlapping as reasons people choose to migrate.", "Both factors are likely to keep shaping global migration patterns well into the future."] },
      u3_hub2: { title: "Movement Reshaping Culture", blurb: "Both economic and climate migration constantly reshape culture in the places migrants settle.", points: ["Both economic and climate-driven migration bring new cultural influences into the places people settle.", "This ongoing cultural blending is one of the most visible long-term effects of modern migration."] },
      u3_dead1: { title: "Migration Policy", blurb: "Governments create migration policies to manage who can enter and settle within their borders.", points: ["Migration policies can range from very open to highly restrictive depending on a country's priorities.", "Debates over migration policy are often among the most politically contested issues in many countries."] },
      u3_dead2: { title: "Diaspora Communities", blurb: "A diaspora is a population that has spread from an original homeland while keeping strong cultural ties.", points: ["Diaspora communities often maintain strong cultural and even financial ties to their original homeland.", "Major cities around the world often host distinct diaspora neighborhoods reflecting specific home regions."] },
      review: { title: "People Have Always Moved", blurb: "From ancient migrations to modern cities, human settlement has always been shaped by movement.", points: ["From ancient migrations across continents to modern urban growth, movement has continuously shaped human settlement.", "Understanding migration helps explain why so many modern cities and cultures are so richly diverse."] }
    }
  },
  {
    id: "media-literacy-and-critical-thinking",
    title: "Media Literacy & Critical Thinking",
    type: "Humanities",
    yeargroups: "9-11",
    description: "Learn to evaluate sources, spot bias, and think critically about the media you encounter daily.",
    medalNames: { test1: "Media Literacy Starter", test2: "Source Scrutinizer", test3: "Critical Thinker" },
    specialTitles: { test1: "Reading Media Check", test2: "Fact vs. Opinion Check", test3: "Algorithms & Spread Check" },
    projects: {
      project1: {
        title: "Fact-Check a Claim",
        brief: "Choose a claim you've seen online and investigate whether it's supported by reliable sources.",
        checklist: ["State the claim", "Check 2+ sources", "State your conclusion"]
      },
      project2: {
        title: "Design a Media Literacy Poster",
        brief: "Design a poster teaching three key media literacy skills to younger students.",
        checklist: ["Choose 3 skills", "Explain each simply", "Design the poster layout"]
      }
    },
    finalTitle: "Media Literacy & Critical Thinking Final Exam",
    topics: {
      u1_intro: { title: "What is Media Literacy?", blurb: "Media literacy is the skill of critically evaluating the media messages you encounter every day.", points: ["Media literacy applies to news articles, advertisements, social media posts, and even memes.", "Developing this skill helps you make more informed decisions about what to trust and share."] },
      u1_branchA: { title: "Who Made This Message?", blurb: "Every media message was created by someone with their own purpose, background, and perspective.", points: ["A message's creator's background or funding can reveal a lot about its likely perspective.", "Checking who created a piece of media is often the very first step in evaluating it critically."] },
      u1_branchB: { title: "Why Was This Made?", blurb: "Media is created for many purposes: to inform, persuade, entertain, or sell.", points: ["An advertisement's primary purpose is almost always to persuade you to buy something.", "Understanding a message's purpose helps explain why certain information was included or left out."] },
      u1_branchC: { title: "Who Is the Audience?", blurb: "Media is often shaped deliberately to appeal to a specific intended audience.", points: ["A message aimed at teenagers might use very different language and imagery than one aimed at adults.", "Recognising the intended audience can reveal assumptions built into a media message."] },
      u1_merge: { title: "Reading Media Critically", blurb: "Asking who made a message and why is the foundation of thinking critically about any media.", points: ["Asking who made something and why together forms the foundation of any deeper media analysis.", "These two questions alone can reveal a surprising amount about a message's reliability."] },
      u1_hub2: { title: "Messages Built for an Audience", blurb: "Understanding the intended audience reveals even more about a message's real purpose.", points: ["A message crafted for a specific audience often uses persuasive techniques tailored to that group.", "Recognising the intended audience adds an important layer to understanding a message's true purpose."] },
      bonus1: { title: "Media in Everyday Life", blurb: "The average person now encounters an enormous number of media messages every single day.", points: ["Modern estimates suggest people encounter thousands of media messages, including ads, in a single day.", "Most media messages are processed quickly and without much conscious critical thought."] },
      bonus2: { title: "Advertising Techniques", blurb: "Advertisements often use specific persuasive techniques designed to influence a viewer quickly.", points: ["Techniques like appealing to emotion or using a celebrity endorsement are common persuasive tools.", "Recognising a persuasive technique in action makes it much easier to evaluate an ad objectively."] },
      u2_intro: { title: "Fact vs. Opinion", blurb: "A fact can be proven true or false, while an opinion expresses a belief or judgment.", points: ["A factual statement can, in principle, be checked against evidence and proven true or false.", "An opinion can be reasonable and well-argued while still not being a provable fact."] },
      u2_branchA: { title: "Identifying Bias", blurb: "Bias is a leaning toward one particular perspective, often shaping which facts get included or left out.", points: ["Bias doesn't necessarily mean a source is lying — it can simply mean selective emphasis.", "Recognising a source's likely bias helps you weigh its claims more critically."] },
      u2_branchB: { title: "Evaluating Sources", blurb: "A reliable source is typically transparent, evidence-based, and open about any potential bias.", points: ["A reliable source typically cites where its information actually comes from.", "Checking an author's credentials and expertise is a key step in evaluating a source's reliability."] },
      u2_branchC: { title: "Checking Multiple Sources", blurb: "Comparing multiple sources on the same topic often reveals bias or missing context.", points: ["If several independent, reliable sources agree, a claim is more likely to be accurate.", "Comparing sources with different perspectives can help reveal what a single source might be leaving out."] },
      u2_merge: { title: "Separating Fact from Spin", blurb: "Recognising bias and evaluating sources together are essential for separating fact from opinion or spin.", points: ["Combining bias-awareness with careful source evaluation makes it much harder to be misled by spin.", "This combination is essential for navigating today's flood of competing information."] },
      u2_hub2: { title: "Confirming Information Reliably", blurb: "Checking multiple sources is one of the most reliable ways to confirm a source's evaluation was fair.", points: ["Cross-checking a claim across multiple credible sources is one of the most reliable fact-checking habits.", "This habit becomes especially important for surprising or emotionally charged claims."] },
      sideQuestA: { title: "Misinformation Basics", blurb: "Misinformation is false information shared without necessarily intending to deceive.", points: ["Misinformation can spread quickly even when the person sharing it genuinely believes it's true.", "Correcting misinformation after it has spread widely can be surprisingly difficult."] },
      sideQuestB: { title: "Disinformation Basics", blurb: "Disinformation is false information deliberately created and spread to mislead people.", points: ["Disinformation campaigns are sometimes deliberately designed to sow confusion or distrust.", "Distinguishing disinformation from honest misinformation can require investigating the original source's intent."] },
      u3_intro: { title: "Social Media & Algorithms", blurb: "Social media algorithms decide what content you see based on your past behaviour.", points: ["Social media algorithms are typically designed to maximize how long you stay engaged with the platform.", "Content that provokes a strong emotional reaction is often prioritized by these algorithms."] },
      u3_branchA: { title: "Filter Bubbles", blurb: "A filter bubble forms when algorithms keep showing you content that matches what you already believe.", points: ["A filter bubble can form gradually, without a user ever realizing their feed has narrowed over time.", "Breaking out of a filter bubble often requires deliberately seeking out different perspectives."] },
      u3_branchB: { title: "Echo Chambers", blurb: "An echo chamber reinforces existing beliefs by mostly surrounding you with people who already agree.", points: ["Echo chambers can make an opinion feel far more universally shared than it actually is.", "Both online communities and offline social groups can function as echo chambers."] },
      u3_branchC: { title: "Viral Content", blurb: "Content often goes viral because it triggers a strong emotional reaction, not necessarily because it's accurate.", points: ["Content that sparks outrage or surprise tends to spread faster than calm, measured reporting.", "A piece of viral content being widely shared is not, by itself, evidence that it's accurate."] },
      u3_merge: { title: "How Algorithms Shape Belief", blurb: "Filter bubbles and echo chambers together show how algorithms can quietly narrow what you see and believe.", points: ["Filter bubbles and echo chambers can reinforce each other, narrowing both what you see and who you talk to.", "Recognising both effects is an important step toward deliberately seeking a broader range of views."] },
      u3_hub2: { title: "Why False Things Spread Fast", blurb: "Viral content often exploits the same emotional reactions that filter bubbles and echo chambers reinforce.", points: ["The same emotional triggers that make content go viral are what filter bubbles and echo chambers tend to amplify.", "Understanding this connection helps explain why misinformation can spread faster than accurate corrections."] },
      u3_dead1: { title: "Deepfakes & Manipulated Media", blurb: "A deepfake uses technology to convincingly fabricate video or audio that never actually happened.", points: ["Deepfake technology has become increasingly difficult to distinguish from genuine video or audio.", "Media literacy skills are becoming more important specifically because manipulated media is getting harder to detect."] },
      u3_dead2: { title: "Being a Responsible Sharer", blurb: "Pausing to verify information before sharing it helps slow the spread of misinformation.", points: ["Pausing before sharing surprising content gives you time to verify it first.", "Responsible sharing habits, multiplied across many people, can meaningfully slow the spread of false information."] },
      review: { title: "Thinking Critically About Every Message", blurb: "Every media message deserves the same critical questions: who made it, why, and is it reliable.", points: ["Applying these same critical questions consistently is what separates a passive media consumer from a critical thinker.", "These skills matter more than ever given how much media the average person now encounters daily."] }
    }
  }
];

export const WEBS = RAW_WEBS.map((config, i) => buildWeb(config, i));

export function getWebById(webId) {
  return WEBS.find((w) => w.id === webId);
}

export function getWebsByType(type) {
  return WEBS.filter((w) => w.type === type);
}

export function getNodeById(nodeId) {
  for (const web of WEBS) {
    const node = web.nodes.find((n) => n.id === nodeId);
    if (node) return { web, node };
  }
  return null;
}

export const MEDALS = WEBS.flatMap((web) =>
  web.nodes
    .filter((n) => n.kind === "test")
    .map((n) => ({
      id: n.medalId,
      name: n.medalName,
      webId: web.id,
      webTitle: web.title,
      webType: web.type,
      requirement: `Complete the "${n.title}" test in ${web.title} (${web.type}).`
    }))
);

export const STARS = WEBS.map((web) => ({
  id: web.starId,
  name: web.starName,
  webId: web.id,
  webTitle: web.title,
  webType: web.type,
  requirement: `Complete every lesson and the final exam in ${web.title}.`
}));
