import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getAllProgress } from "./progress.js";
import { TYPES, getWebsByType } from "./data/webs.js";
import { escapeHtml, requireLogin, webCardHtml } from "./util.js";

const filtersEl = document.getElementById("lessons-filters");
const listEl = document.getElementById("lessons-list");

let currentFilter = "All";
let completedSet = new Set();

requireLogin(auth, onAuthStateChanged, async (user) => {
  completedSet = await getAllProgress(user.uid);
  renderFilters();
  renderList();
});

function renderFilters() {
  const types = ["All", ...TYPES];
  filtersEl.innerHTML = types
    .map(
      (t) =>
        `<button type="button" class="type-filter${t === currentFilter ? " active" : ""}" data-type="${escapeHtml(t)}">${escapeHtml(t)}</button>`
    )
    .join("");
  filtersEl.querySelectorAll(".type-filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.type;
      renderFilters();
      renderList();
    });
  });
}

function renderList() {
  const typesToShow = currentFilter === "All" ? TYPES : [currentFilter];
  listEl.innerHTML = typesToShow
    .map((type) => {
      const webs = getWebsByType(type);
      const cards = webs
        .map((web) => {
          const total = web.nodes.length;
          const done = web.nodes.filter((n) => completedSet.has(n.id)).length;
          return webCardHtml(web, done, total);
        })
        .join("");
      return `<h2>${escapeHtml(type)}</h2><div class="web-grid">${cards}</div>`;
    })
    .join("");
}
