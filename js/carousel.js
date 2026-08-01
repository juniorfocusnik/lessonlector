// A single-focus, shop-style badge carousel shared by medals/index.html
// and stars/index.html: one badge shown large at a time, arrows on both sides,
// keyboard nav (ArrowLeft/ArrowRight and a/d), with the focused badge's
// details rendered underneath.
import { escapeHtml } from "./util.js";

export function initBadgeCarousel({ containerId, items, earnedIds, icon, emptyMessage }) {
  const container = document.getElementById(containerId);

  if (!items.length) {
    container.innerHTML = `<p class="empty-state">${escapeHtml(emptyMessage)}</p>`;
    return;
  }

  container.innerHTML = `
    <div class="carousel">
      <button type="button" class="carousel-arrow" id="${containerId}-prev" aria-label="Previous">‹</button>
      <div class="carousel-stage">
        <div class="carousel-badge" id="${containerId}-badge">
          <div class="carousel-badge-icon">${icon}</div>
        </div>
      </div>
      <button type="button" class="carousel-arrow" id="${containerId}-next" aria-label="Next">›</button>
    </div>
    <p class="carousel-position" id="${containerId}-position"></p>
    <div class="carousel-details" id="${containerId}-details"></div>
    <p class="carousel-hint">Use ← → , A / D, or the arrows above to browse.</p>
  `;

  const badgeEl = document.getElementById(`${containerId}-badge`);
  const positionEl = document.getElementById(`${containerId}-position`);
  const detailsEl = document.getElementById(`${containerId}-details`);
  const prevBtn = document.getElementById(`${containerId}-prev`);
  const nextBtn = document.getElementById(`${containerId}-next`);

  let index = 0;

  function render() {
    const item = items[index];
    const has = earnedIds.has(item.id);
    badgeEl.className = "carousel-badge" + (has ? " badge-earned" : " badge-locked");
    positionEl.textContent = `${index + 1} / ${items.length}`;
    detailsEl.innerHTML = `
      <h2>${escapeHtml(item.name)}</h2>
      <p class="carousel-subject">${escapeHtml(item.webTitle)} · ${escapeHtml(item.webType)}</p>
      <p class="carousel-status ${has ? "status-success" : "status-error"}">${has ? "✓ Earned" : "🔒 Locked"}</p>
      <p class="carousel-requirement">${escapeHtml(item.requirement)}</p>
    `;
  }

  function go(delta) {
    index = (index + delta + items.length) % items.length;
    render();
  }

  prevBtn.addEventListener("click", () => go(-1));
  nextBtn.addEventListener("click", () => go(1));

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") go(-1);
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") go(1);
  });

  render();
}
