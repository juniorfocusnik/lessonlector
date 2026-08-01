import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getNodeById, MEDALS, STARS } from "./data/webs.js";
import { getAllProgress, isNodeUnlocked, recordNodeCompletion } from "./progress.js";
import { escapeHtml, kindLabel, requireLogin } from "./util.js";

const params = new URLSearchParams(window.location.search);
const nodeId = params.get("node");
const found = getNodeById(nodeId);

function finishLabel(kind) {
  return { lesson: "Complete Lesson", test: "Submit Test", project: "Finish Project", finalExam: "Submit Final Exam" }[kind] || "Complete";
}

export function initPlayer(uid, web, node) {
  const containerEl = document.getElementById("lesson-container");
  containerEl.innerHTML = `
    <a href="../web/index.html?web=${encodeURIComponent(web.id)}" class="back-link">← Back to ${escapeHtml(web.title)}</a>
    <div class="lesson-card">
      <div class="lesson-meta">
        <span class="lesson-kind-badge lesson-kind-${node.kind}">${kindLabel(node.kind)}</span>
        <span class="lesson-gems-badge">${node.gems} gems</span>
      </div>
      <h1 class="lesson-title">${escapeHtml(node.title)}</h1>
      <div class="lesson-part-body" id="lesson-part-body"></div>
      <div class="lesson-dots" id="lesson-dots"></div>
      <div class="lesson-nav">
        <button type="button" class="btn btn-outline" id="lesson-prev">Previous</button>
        <button type="button" class="btn btn-primary" id="lesson-next">Next</button>
      </div>
    </div>
  `;

  const partContentEl = document.getElementById("lesson-part-body");
  const dotsEl = document.getElementById("lesson-dots");
  const prevBtn = document.getElementById("lesson-prev");
  const nextBtn = document.getElementById("lesson-next");

  let currentPart = 0;
  const partState = node.parts.map(() => ({ done: false }));

  function canProceed(i) {
    return node.parts[i].type === "content" || partState[i].done;
  }

  function firstIncompleteIndex() {
    const idx = partState.findIndex((p) => !p.done);
    return idx === -1 ? node.parts.length - 1 : idx;
  }

  function markDone() {
    partState[currentPart].done = true;
    renderDots();
    renderNav();
  }

  function attachPartHandlers(part) {
    if (part.type === "quiz") {
      const buttons = Array.from(partContentEl.querySelectorAll(".quiz-option"));
      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          if (partState[currentPart].done) return;
          const i = Number(btn.dataset.i);
          const correct = i === part.correctIndex;
          buttons.forEach((b, bi) => {
            b.disabled = true;
            if (bi === part.correctIndex) b.classList.add("quiz-correct");
          });
          if (!correct) btn.classList.add("quiz-incorrect");
          const feedback = document.getElementById("quiz-feedback");
          feedback.hidden = false;
          feedback.textContent = correct ? "Correct!" : "Not quite — the highlighted option was correct.";
          feedback.className = "quiz-feedback " + (correct ? "status-success" : "status-error");
          markDone();
        });
      });
    } else if (part.type === "truefalse") {
      const buttons = Array.from(partContentEl.querySelectorAll(".truefalse-option"));
      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          if (partState[currentPart].done) return;
          const chosen = btn.dataset.answer === "true";
          const correct = chosen === part.answer;
          buttons.forEach((b) => {
            b.disabled = true;
            if ((b.dataset.answer === "true") === part.answer) b.classList.add("quiz-correct");
          });
          if (!correct) btn.classList.add("quiz-incorrect");
          const feedback = document.getElementById("quiz-feedback");
          feedback.hidden = false;
          feedback.textContent = correct ? "Correct!" : "Not quite — the highlighted option was correct.";
          feedback.className = "quiz-feedback " + (correct ? "status-success" : "status-error");
          markDone();
        });
      });
    } else if (part.type === "writing") {
      const textarea = document.getElementById("writing-input");
      const submitBtn = document.getElementById("writing-submit");
      const sampleEl = document.getElementById("writing-sample");
      if (partState[currentPart].draft) textarea.value = partState[currentPart].draft;
      textarea.addEventListener("input", () => {
        partState[currentPart].draft = textarea.value;
      });
      submitBtn.addEventListener("click", () => {
        if (partState[currentPart].done) return;
        if (textarea.value.trim().length < 10) {
          textarea.classList.add("input-error");
          return;
        }
        textarea.classList.remove("input-error");
        textarea.disabled = true;
        submitBtn.disabled = true;
        sampleEl.hidden = false;
        markDone();
      });
    } else if (part.type === "table") {
      if (!partState[currentPart].selected) {
        partState[currentPart].selected = part.rows.map(() => null);
      }
      const selects = Array.from(partContentEl.querySelectorAll(".match-select"));
      selects.forEach((sel) => {
        sel.addEventListener("change", () => {
          const rowIdx = Number(sel.dataset.row);
          partState[currentPart].selected[rowIdx] = sel.value === "" ? null : Number(sel.value);
        });
      });
      const checkBtn = document.getElementById("table-check");
      checkBtn.addEventListener("click", () => {
        if (partState[currentPart].done) return;
        const selected = partState[currentPart].selected;
        if (selected.some((v) => v === null)) {
          const feedback = document.getElementById("table-feedback");
          feedback.hidden = false;
          feedback.textContent = "Choose a match for every row first.";
          feedback.className = "quiz-feedback status-error";
          return;
        }
        const allCorrect = part.correct.every((c, i) => c === selected[i]);
        const feedback = document.getElementById("table-feedback");
        feedback.hidden = false;
        feedback.textContent = allCorrect ? "All matched correctly!" : "Not every row matched — that's alright, keep going.";
        feedback.className = "quiz-feedback " + (allCorrect ? "status-success" : "status-error");
        selects.forEach((s) => (s.disabled = true));
        checkBtn.disabled = true;
        markDone();
      });
    } else if (part.type === "drag") {
      if (!partState[currentPart].placed) partState[currentPart].placed = {};
      const placed = partState[currentPart].placed;
      let selectedChipId = null;

      function tryPlace(itemId, zoneId) {
        if (String(itemId) === String(zoneId)) {
          placed[zoneId] = Number(itemId);
          renderPart();
          if (Object.keys(placed).length === part.zones.length) {
            markDone();
          }
        } else {
          const zoneEl = partContentEl.querySelector(`.drag-zone[data-zone="${zoneId}"]`);
          if (zoneEl) {
            zoneEl.classList.add("drag-zone-shake");
            setTimeout(() => zoneEl.classList.remove("drag-zone-shake"), 400);
          }
        }
      }

      const chips = Array.from(partContentEl.querySelectorAll(".drag-chip"));
      const zones = Array.from(partContentEl.querySelectorAll(".drag-zone"));

      chips.forEach((chip) => {
        chip.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("text/plain", chip.dataset.id);
        });
        chip.addEventListener("click", () => {
          chips.forEach((c) => c.classList.remove("drag-chip-selected"));
          if (selectedChipId === chip.dataset.id) {
            selectedChipId = null;
          } else {
            selectedChipId = chip.dataset.id;
            chip.classList.add("drag-chip-selected");
          }
        });
      });

      zones.forEach((zone) => {
        zone.addEventListener("dragover", (e) => e.preventDefault());
        zone.addEventListener("drop", (e) => {
          e.preventDefault();
          const itemId = e.dataTransfer.getData("text/plain");
          if (itemId) tryPlace(itemId, zone.dataset.zone);
        });
        zone.addEventListener("click", () => {
          if (selectedChipId !== null) {
            tryPlace(selectedChipId, zone.dataset.zone);
            selectedChipId = null;
          }
        });
      });
    } else if (part.type === "order") {
      if (!partState[currentPart].order) {
        partState[currentPart].order = part.items.map(() => null);
      }
      const orderArr = partState[currentPart].order;
      let selectedChipIndex = null;

      function placeChip(chipIndex, slotIndex) {
        const existingSlot = orderArr.indexOf(chipIndex);
        if (existingSlot !== -1) orderArr[existingSlot] = null;
        orderArr[slotIndex] = chipIndex;
        renderPart();
      }

      const orderChips = Array.from(partContentEl.querySelectorAll(".order-chip"));
      const orderSlots = Array.from(partContentEl.querySelectorAll(".order-slot"));

      orderChips.forEach((chip) => {
        chip.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("text/plain", chip.dataset.i);
        });
        chip.addEventListener("click", () => {
          orderChips.forEach((c) => c.classList.remove("drag-chip-selected"));
          const idx = Number(chip.dataset.i);
          if (selectedChipIndex === idx) {
            selectedChipIndex = null;
          } else {
            selectedChipIndex = idx;
            chip.classList.add("drag-chip-selected");
          }
        });
      });

      orderSlots.forEach((slot) => {
        slot.addEventListener("dragover", (e) => e.preventDefault());
        slot.addEventListener("drop", (e) => {
          e.preventDefault();
          const chipIndex = e.dataTransfer.getData("text/plain");
          if (chipIndex !== "") placeChip(Number(chipIndex), Number(slot.dataset.slot));
        });
        slot.addEventListener("click", () => {
          if (partState[currentPart].done) return;
          if (selectedChipIndex !== null) {
            placeChip(selectedChipIndex, Number(slot.dataset.slot));
            selectedChipIndex = null;
          } else {
            const slotIdx = Number(slot.dataset.slot);
            if (orderArr[slotIdx] !== null) {
              orderArr[slotIdx] = null;
              renderPart();
            }
          }
        });
      });

      const orderCheckBtn = document.getElementById("order-check");
      if (orderCheckBtn) {
        orderCheckBtn.addEventListener("click", () => {
          if (partState[currentPart].done || orderArr.some((v) => v === null)) return;
          const correct = orderArr.every((chipIdx, slotIdx) => chipIdx === part.correctOrder[slotIdx]);
          const feedback = document.getElementById("order-feedback");
          feedback.hidden = false;
          feedback.textContent = correct ? "Correct order!" : "Not quite the right order — that's alright, keep going.";
          feedback.className = "quiz-feedback " + (correct ? "status-success" : "status-error");
          orderSlots.forEach((s) => s.classList.add("order-locked"));
          orderCheckBtn.disabled = true;
          markDone();
        });
      }
    } else if (part.type === "numerical") {
      const numInput = document.getElementById("numerical-input");
      const numCheckBtn = document.getElementById("numerical-check");
      numInput.addEventListener("input", () => {
        partState[currentPart].draft = numInput.value;
      });
      numCheckBtn.addEventListener("click", () => {
        if (partState[currentPart].done) return;
        const feedback = document.getElementById("numerical-feedback");
        const value = Number(numInput.value);
        if (numInput.value.trim() === "" || Number.isNaN(value)) {
          feedback.hidden = false;
          feedback.textContent = "Type a number first.";
          feedback.className = "quiz-feedback status-error";
          return;
        }
        const correct = Math.abs(value - part.answer) <= (part.tolerance || 0);
        feedback.hidden = false;
        feedback.textContent = correct ? "Correct!" : `Not quite — the correct answer was ${part.answer}.`;
        feedback.className = "quiz-feedback " + (correct ? "status-success" : "status-error");
        numInput.disabled = true;
        numCheckBtn.disabled = true;
        markDone();
      });
    } else if (part.type === "scale") {
      if (partState[currentPart].value === undefined) {
        partState[currentPart].value = Math.round((part.min + part.max) / 2);
      }
      const slider = document.getElementById("scale-slider");
      const readout = document.getElementById("scale-readout");
      slider.addEventListener("input", () => {
        partState[currentPart].value = Number(slider.value);
        readout.textContent = `Current value: ${slider.value}`;
      });
      document.getElementById("scale-check").addEventListener("click", () => {
        if (partState[currentPart].done) return;
        const value = partState[currentPart].value;
        const correct = Math.abs(value - part.target) <= part.tolerance;
        const feedback = document.getElementById("scale-feedback");
        feedback.hidden = false;
        feedback.textContent = correct
          ? `Correct! You landed on ${value}.`
          : `Close, but not quite — you were at ${value}, and the target was ${part.target}.`;
        feedback.className = "quiz-feedback " + (correct ? "status-success" : "status-error");
        slider.disabled = true;
        document.getElementById("scale-check").disabled = true;
        markDone();
      });
    } else if (part.type === "shape") {
      if (!partState[currentPart].dims) {
        partState[currentPart].dims = { w: part.initialWidth, h: part.initialHeight };
      }
      const state = partState[currentPart].dims;
      const svg = document.getElementById("shape-svg");
      const rect = document.getElementById("shape-rect");
      const handle = document.getElementById("shape-handle");
      const readout = document.getElementById("shape-readout");
      let dragging = false;

      function updateFromPointer(clientX, clientY) {
        const box = svg.getBoundingClientRect();
        const scale = 220 / box.width;
        const x = (clientX - box.left) * scale;
        const y = (clientY - box.top) * scale;
        const w = Math.max(part.minSize, Math.min(part.maxSize, (x - 20) / 12));
        const h = Math.max(part.minSize, Math.min(part.maxSize, (y - 20) / 12));
        state.w = w;
        state.h = h;
        rect.setAttribute("width", w * 12);
        rect.setAttribute("height", h * 12);
        handle.setAttribute("cx", 20 + w * 12);
        handle.setAttribute("cy", 20 + h * 12);
        readout.textContent = `Width: ${w.toFixed(1)}u · Height: ${h.toFixed(1)}u · Area: ${(w * h).toFixed(1)}u²`;
      }

      handle.addEventListener("pointerdown", (e) => {
        if (partState[currentPart].done) return;
        dragging = true;
        handle.setPointerCapture(e.pointerId);
      });
      handle.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        updateFromPointer(e.clientX, e.clientY);
      });
      handle.addEventListener("pointerup", () => {
        dragging = false;
      });

      document.getElementById("shape-check").addEventListener("click", () => {
        if (partState[currentPart].done) return;
        const area = state.w * state.h;
        const correct = Math.abs(area - part.targetArea) / part.targetArea <= part.tolerance;
        const feedback = document.getElementById("shape-feedback");
        feedback.hidden = false;
        feedback.textContent = correct
          ? `Correct! The area is approximately ${area.toFixed(1)} square units.`
          : `Close, but not quite — your area was ${area.toFixed(1)}, and the target was ${part.targetArea}.`;
        feedback.className = "quiz-feedback " + (correct ? "status-success" : "status-error");
        document.getElementById("shape-check").disabled = true;
        markDone();
      });
    } else if (part.type === "project") {
      if (!partState[currentPart].checked) {
        partState[currentPart].checked = part.checklist.map(() => false);
      }
      const checkboxes = Array.from(partContentEl.querySelectorAll('input[type="checkbox"]'));
      checkboxes.forEach((cb) => {
        cb.addEventListener("change", () => {
          const i = Number(cb.dataset.i);
          partState[currentPart].checked[i] = cb.checked;
          partState[currentPart].done = partState[currentPart].checked.every(Boolean);
          renderDots();
          renderNav();
        });
      });
    }
  }

  function renderPart() {
    const part = node.parts[currentPart];
    let html = "";

    if (part.type === "content") {
      partState[currentPart].done = true;
      const points = part.points || [];
      html = `
        <h2>${escapeHtml(part.heading)}</h2>
        <p class="lesson-body">${escapeHtml(part.body)}</p>
        ${points.length ? `<ul class="lesson-points">${points.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>` : ""}
      `;
    } else if (part.type === "quiz") {
      html = `
        <h2>Quick Check</h2>
        <p class="lesson-question">${escapeHtml(part.question)}</p>
        <div class="quiz-options">
          ${part.options
            .map(
              (opt, i) =>
                `<button type="button" class="quiz-option" data-i="${i}">${escapeHtml(opt)}</button>`
            )
            .join("")}
        </div>
        <p class="quiz-feedback" id="quiz-feedback" hidden></p>
      `;
    } else if (part.type === "truefalse") {
      html = `
        <h2>True or False?</h2>
        <p class="lesson-question">${escapeHtml(part.prompt)}</p>
        <div class="truefalse-options">
          <button type="button" class="quiz-option truefalse-option" data-answer="true">True</button>
          <button type="button" class="quiz-option truefalse-option" data-answer="false">False</button>
        </div>
        <p class="quiz-feedback" id="quiz-feedback" hidden></p>
      `;
    } else if (part.type === "writing") {
      const done = partState[currentPart].done;
      html = `
        <h2>Your Turn</h2>
        <p class="lesson-question">${escapeHtml(part.prompt)}</p>
        <textarea class="writing-input" id="writing-input" rows="5" placeholder="Type your answer here..." ${done ? "disabled" : ""}></textarea>
        <button type="button" class="btn btn-outline" id="writing-submit" ${done ? "disabled" : ""}>Submit</button>
        <div class="writing-sample" id="writing-sample" ${done ? "" : "hidden"}>
          <p class="writing-sample-label">Model answer to compare against:</p>
          <p>${escapeHtml(part.sampleAnswer)}</p>
        </div>
      `;
    } else if (part.type === "table") {
      const selected = partState[currentPart].selected || part.rows.map(() => null);
      const done = partState[currentPart].done;
      html = `
        <h2>Match the Table</h2>
        <p class="lesson-question">${escapeHtml(part.instruction)}</p>
        <table class="match-table">
          <thead><tr><th>Concept</th><th>Description</th></tr></thead>
          <tbody>
            ${part.rows
              .map(
                (row, i) => `
                  <tr>
                    <td>${escapeHtml(row.title)}</td>
                    <td>
                      <select class="match-select" data-row="${i}" ${done ? "disabled" : ""}>
                        <option value="">Choose...</option>
                        ${part.options
                          .map(
                            (opt, oi) =>
                              `<option value="${oi}" ${selected[i] === oi ? "selected" : ""}>${escapeHtml(opt)}</option>`
                          )
                          .join("")}
                      </select>
                    </td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
        <button type="button" class="btn btn-outline" id="table-check" ${done ? "disabled" : ""}>Check Table</button>
        <p class="quiz-feedback" id="table-feedback" hidden></p>
      `;
    } else if (part.type === "drag") {
      const placed = partState[currentPart].placed || {};
      html = `
        <h2>Drag to Match</h2>
        <p class="lesson-question">${escapeHtml(part.instruction)}</p>
        <div class="drag-tray" id="drag-tray">
          ${part.items
            .filter((item) => !Object.values(placed).includes(item.id))
            .map((item) => `<div class="drag-chip" draggable="true" data-id="${item.id}">${escapeHtml(item.title)}</div>`)
            .join("") || `<p class="drag-tray-empty">All terms placed!</p>`}
        </div>
        <div class="drag-zones">
          ${part.zones
            .map((zone) => {
              const filledId = placed[zone.id];
              const filledItem = filledId !== undefined ? part.items.find((i) => i.id === filledId) : null;
              return `
                <div class="drag-zone ${filledItem ? "drag-zone-filled" : ""}" data-zone="${zone.id}">
                  <p class="drag-zone-blurb">${escapeHtml(zone.blurb)}</p>
                  <div class="drag-zone-slot">${filledItem ? escapeHtml(filledItem.title) : "Drop here"}</div>
                </div>
              `;
            })
            .join("")}
        </div>
      `;
    } else if (part.type === "order") {
      const done = partState[currentPart].done;
      const placedOrder = partState[currentPart].order || part.items.map(() => null);
      const placedIndexes = new Set(placedOrder.filter((v) => v !== null));
      html = `
        <h2>Put Them in Order</h2>
        <p class="lesson-question">${escapeHtml(part.instruction)}</p>
        <div class="drag-tray order-tray" id="order-tray">
          ${part.items
            .map((item, i) => ({ item, i }))
            .filter(({ i }) => !placedIndexes.has(i))
            .map(({ item, i }) => `<div class="drag-chip order-chip" draggable="true" data-i="${i}">${escapeHtml(item)}</div>`)
            .join("") || `<p class="drag-tray-empty">All placed!</p>`}
        </div>
        <div class="order-slots">
          ${placedOrder
            .map(
              (originalIdx, slotIdx) => `
                <div class="order-slot ${originalIdx !== null ? "order-slot-filled" : ""}" data-slot="${slotIdx}">
                  <span class="order-slot-number">${slotIdx + 1}</span>
                  <div class="order-slot-content">${originalIdx !== null ? escapeHtml(part.items[originalIdx]) : "Drop here"}</div>
                </div>
              `
            )
            .join("")}
        </div>
        <button type="button" class="btn btn-outline" id="order-check" ${done || placedOrder.some((v) => v === null) ? "disabled" : ""}>Check Order</button>
        <p class="quiz-feedback" id="order-feedback" hidden></p>
      `;
    } else if (part.type === "numerical") {
      const done = partState[currentPart].done;
      const draft = partState[currentPart].draft || "";
      html = `
        <h2>Quick Calculation</h2>
        <p class="lesson-question">${escapeHtml(part.question)}</p>
        <input type="number" class="numerical-input" id="numerical-input" placeholder="Type your answer" value="${escapeHtml(draft)}" ${done ? "disabled" : ""}>
        <button type="button" class="btn btn-outline" id="numerical-check" ${done ? "disabled" : ""}>Check</button>
        <p class="quiz-feedback" id="numerical-feedback" hidden></p>
      `;
    } else if (part.type === "scale") {
      const value = partState[currentPart].value ?? Math.round((part.min + part.max) / 2);
      const done = partState[currentPart].done;
      html = `
        <h2>Set the Scale</h2>
        <p class="lesson-question">${escapeHtml(part.instruction)}</p>
        <div class="scale-widget">
          <input type="range" id="scale-slider" min="${part.min}" max="${part.max}" value="${value}" ${done ? "disabled" : ""}>
          <p class="scale-readout" id="scale-readout">Current value: ${value}</p>
        </div>
        <button type="button" class="btn btn-outline" id="scale-check" ${done ? "disabled" : ""}>Check</button>
        <p class="quiz-feedback" id="scale-feedback" hidden></p>
      `;
    } else if (part.type === "shape") {
      const state = partState[currentPart].dims || { w: part.initialWidth, h: part.initialHeight };
      const done = partState[currentPart].done;
      html = `
        <h2>Resize the Shape</h2>
        <p class="lesson-question">${escapeHtml(part.instruction)}</p>
        <div class="shape-widget">
          <svg viewBox="0 0 220 220" class="shape-svg" id="shape-svg">
            <rect id="shape-rect" x="20" y="20" width="${state.w * 12}" height="${state.h * 12}" class="shape-rect"></rect>
            <circle id="shape-handle" cx="${20 + state.w * 12}" cy="${20 + state.h * 12}" r="9" class="shape-handle"></circle>
          </svg>
          <p class="shape-readout" id="shape-readout">Width: ${state.w.toFixed(1)}u · Height: ${state.h.toFixed(1)}u · Area: ${(state.w * state.h).toFixed(1)}u²</p>
        </div>
        <button type="button" class="btn btn-outline" id="shape-check" ${done ? "disabled" : ""}>Check</button>
        <p class="quiz-feedback" id="shape-feedback" hidden></p>
      `;
    } else if (part.type === "project") {
      const checked = partState[currentPart].checked || part.checklist.map(() => false);
      html = `
        <h2>${escapeHtml(part.heading)}</h2>
        <ul class="project-checklist">
          ${part.checklist
            .map(
              (item, i) => `
                <li>
                  <label>
                    <input type="checkbox" data-i="${i}" ${checked[i] ? "checked" : ""}>
                    ${escapeHtml(item)}
                  </label>
                </li>
              `
            )
            .join("")}
        </ul>
      `;
    }

    partContentEl.innerHTML = html;
    attachPartHandlers(part);
    renderDots();
    renderNav();
  }

  function renderDots() {
    const limit = firstIncompleteIndex();
    dotsEl.innerHTML = node.parts
      .map((_, i) => {
        const classes = ["lesson-dot"];
        if (i === currentPart) classes.push("active");
        if (partState[i].done) classes.push("done");
        return `<button type="button" class="${classes.join(" ")}" data-i="${i}" ${i > limit ? "disabled" : ""} aria-label="Part ${i + 1}"></button>`;
      })
      .join("");
    dotsEl.querySelectorAll(".lesson-dot").forEach((dot) => {
      dot.addEventListener("click", () => {
        const i = Number(dot.dataset.i);
        if (i <= firstIncompleteIndex()) {
          currentPart = i;
          renderPart();
        }
      });
    });
  }

  function renderNav() {
    prevBtn.disabled = currentPart === 0;
    const isLast = currentPart === node.parts.length - 1;
    nextBtn.textContent = isLast ? finishLabel(node.kind) : "Next";
    nextBtn.disabled = !canProceed(currentPart);
  }

  async function finishNode() {
    nextBtn.disabled = true;
    nextBtn.textContent = "Saving...";
    const result = await recordNodeCompletion(uid, node);
    showCompletionScreen(result);
  }

  function showCompletionScreen(result) {
    let extra = "";
    if (result.awardedMedal) {
      const medal = MEDALS.find((m) => m.id === result.awardedMedal);
      if (medal) extra += `<p class="completion-award">🎖️ Medal earned: <strong>${escapeHtml(medal.name)}</strong></p>`;
    }
    if (result.awardedStar) {
      const star = STARS.find((s) => s.id === result.awardedStar);
      if (star) extra += `<p class="completion-award">⭐ Star earned: <strong>${escapeHtml(star.name)}</strong></p>`;
    }
    containerEl.innerHTML = `
      <div class="completion-screen">
        <h2>${result.alreadyCompleted ? "Already completed" : "Nice work!"}</h2>
        ${result.alreadyCompleted ? "" : `<p class="completion-gems">+${node.gems} gems</p>`}
        ${extra}
        <a class="btn btn-primary" href="../web/index.html?web=${encodeURIComponent(node.webId)}">Back to Web</a>
      </div>
    `;
  }

  prevBtn.addEventListener("click", () => {
    if (currentPart > 0) {
      currentPart--;
      renderPart();
    }
  });

  nextBtn.addEventListener("click", () => {
    const isLast = currentPart === node.parts.length - 1;
    if (!isLast) {
      currentPart++;
      renderPart();
    } else {
      finishNode();
    }
  });

  renderPart();
}

const pageContainerEl = document.getElementById("lesson-container");

if (pageContainerEl) {
  requireLogin(auth, onAuthStateChanged, async (user) => {
    if (!found) {
      pageContainerEl.innerHTML = `<p class="empty-state">Lesson not found. <a class="inline-link" href="../dashboard/index.html">Back to dashboard</a></p>`;
      return;
    }
    const { web, node } = found;
    const completed = await getAllProgress(user.uid);
    if (!completed.has(node.id) && !isNodeUnlocked(node, completed)) {
      pageContainerEl.innerHTML = `
        <p class="empty-state">This is locked — complete its prerequisites first.
        <a class="inline-link" href="../web/index.html?web=${encodeURIComponent(web.id)}">Back to web</a></p>
      `;
      return;
    }
    initPlayer(user.uid, web, node);
  });
}
