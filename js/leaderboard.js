import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { fetchLeaderboard, searchUsersByUsername } from "./progress.js";
import { escapeHtml, requireLogin } from "./util.js";

const PAGE_SIZE = 50;
let currentFilter = "gems";
let currentPage = 1;
let leaderboardData = [];

const filterButtons = document.querySelectorAll(".leaderboard-filter");
const tableBody = document.getElementById("leaderboard-body");
const paginationEl = document.getElementById("leaderboard-pagination");
const searchInput = document.getElementById("leaderboard-search");
const searchResultsEl = document.getElementById("search-results");

requireLogin(auth, onAuthStateChanged, async () => {
  await loadLeaderboard();
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    currentPage = 1;
    await loadLeaderboard();
  });
});

async function loadLeaderboard() {
  tableBody.innerHTML = `<tr><td colspan="5" class="empty-state">Loading...</td></tr>`;
  leaderboardData = await fetchLeaderboard(currentFilter);
  renderPage();
}

function renderPage() {
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = leaderboardData.slice(start, start + PAGE_SIZE);
  tableBody.innerHTML =
    pageItems.map((u, i) => rowHtml(u, start + i + 1)).join("") ||
    `<tr><td colspan="5" class="empty-state">No players yet — be the first!</td></tr>`;
  attachRowHandlers();
  renderPagination();
}

function rowHtml(u, rank) {
  return `
    <tr class="leaderboard-row" data-uid="${u.uid}">
      <td class="rank-cell">#${rank}</td>
      <td class="user-cell">${escapeHtml(u.displayName || u.username)}</td>
      <td>${u.gems || 0}</td>
      <td>${u.medalsCount || 0}</td>
      <td>${u.starsCount || 0}</td>
    </tr>
  `;
}

function attachRowHandlers() {
  tableBody.querySelectorAll(".leaderboard-row").forEach((row) => {
    row.addEventListener("click", () => {
      window.location.href = `../profile/index.html?uid=${encodeURIComponent(row.dataset.uid)}`;
    });
  });
}

function renderPagination() {
  const totalPages = Math.max(1, Math.ceil(leaderboardData.length / PAGE_SIZE));
  let html = "";
  for (let p = 1; p <= totalPages; p++) {
    html += `<button type="button" class="page-btn ${p === currentPage ? "active" : ""}" data-page="${p}">${p}</button>`;
  }
  paginationEl.innerHTML = html;
  paginationEl.querySelectorAll(".page-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentPage = Number(btn.dataset.page);
      renderPage();
    });
  });
}

let searchTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  const term = searchInput.value.trim();
  if (!term) {
    searchResultsEl.hidden = true;
    searchResultsEl.innerHTML = "";
    return;
  }
  searchTimer = setTimeout(async () => {
    const results = await searchUsersByUsername(term);
    renderSearchResults(results);
  }, 350);
});

function renderSearchResults(results) {
  searchResultsEl.hidden = false;
  if (!results.length) {
    searchResultsEl.innerHTML = `<p class="empty-state">No users found.</p>`;
    return;
  }
  searchResultsEl.innerHTML = results
    .map(
      (u) => `
        <a class="search-result-row" href="../profile/index.html?uid=${encodeURIComponent(u.uid)}">
          <span>${escapeHtml(u.displayName || u.username)}</span>
          <span class="search-result-stats">${u.gems || 0} gems · ${u.medalsCount || 0} medals · ${u.starsCount || 0} stars</span>
        </a>
      `
    )
    .join("");
}
