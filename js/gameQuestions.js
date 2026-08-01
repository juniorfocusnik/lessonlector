// Builds the live-game question pool for the Game page. Reuses the
// already-generated parts baked into every web's nodes — no separate
// question authoring needed. Every mechanic that has a single clear
// correct answer gets folded into one shared multiple-choice shape;
// writing and shape parts are excluded since neither has a single
// gradeable answer that fits a fast, binary right/wrong live round.
import { WEBS } from "./data/webs.js";

function fromQuiz(part, web) {
  return [{ mode: "mc", text: part.question, options: part.options, correctIndex: part.correctIndex, subject: web.title }];
}

function fromTrueFalse(part, web) {
  return [{ mode: "mc", text: part.prompt, options: ["True", "False"], correctIndex: part.answer ? 0 : 1, subject: web.title }];
}

// A table part matches several rows to a shared pool of descriptions —
// each row becomes its own multiple-choice question against that same
// pool, so table content adds real questions instead of being skipped.
function fromTable(part, web) {
  return part.rows.map((row, i) => ({
    mode: "mc",
    text: `Which description matches "${row.title}"?`,
    options: part.options,
    correctIndex: part.correct[i],
    subject: web.title
  }));
}

// A drag part matches items to zones by a shared id — each item becomes
// its own multiple-choice question against the zone descriptions.
function fromDrag(part, web) {
  return part.items.map((item) => ({
    mode: "mc",
    text: `Which description matches "${item.title}"?`,
    options: part.zones.map((z) => z.blurb),
    correctIndex: part.zones.findIndex((z) => z.id === item.id),
    subject: web.title
  }));
}

// An order part's full drag-to-sequence puzzle doesn't fit a single
// fast click, so it's reduced to one quick multiple-choice moment:
// spotting which of the shown terms comes first alphabetically.
function fromOrder(part, web) {
  return [
    {
      mode: "mc",
      text: "Which of these comes first alphabetically?",
      options: part.items,
      correctIndex: part.correctOrder[0],
      subject: web.title
    }
  ];
}

// Numerical parts keep their native typed-answer format in the live
// game too — a real number can still be entered and graded instantly,
// unlike the slider/shape manipulatives which need slower dragging.
function fromNumerical(part, web) {
  return [
    {
      mode: "numerical",
      text: part.question,
      answer: part.answer,
      tolerance: part.tolerance || 0,
      subject: web.title
    }
  ];
}

const BUILDERS = {
  quiz: fromQuiz,
  truefalse: fromTrueFalse,
  table: fromTable,
  drag: fromDrag,
  order: fromOrder,
  numerical: fromNumerical
};

// webIds: array of specific web IDs to draw from (the "subjects" a host
// picks when creating a game — one per individual web, not per broad type).
export function buildQuestionPool(webIds) {
  const pool = [];
  for (const web of WEBS) {
    if (!webIds.includes(web.id)) continue;
    for (const node of web.nodes) {
      for (const part of node.parts) {
        const builder = BUILDERS[part.type];
        if (builder) pool.push(...builder(part, web));
      }
    }
  }
  return pool;
}

// Draws a random question, avoiding repeats until the pool has been
// exhausted once (tracked by the caller via `usedIndexes`).
export function drawQuestion(pool, usedIndexes) {
  if (usedIndexes.size >= pool.length) usedIndexes.clear();
  let index;
  do {
    index = Math.floor(Math.random() * pool.length);
  } while (usedIndexes.has(index) && usedIndexes.size < pool.length);
  usedIndexes.add(index);
  return pool[index];
}
