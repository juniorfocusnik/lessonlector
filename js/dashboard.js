import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getUserProfile, getRecentCompletions, getAllProgress } from "./progress.js";
import { WEBS } from "./data/webs.js";
import { escapeHtml, kindLabel, requireLogin, webCardHtml } from "./util.js";

const statsEl = document.getElementById("dashboard-stats");
const recentEl = document.getElementById("recent-lessons");
const subjectsEl = document.getElementById("subjects-list");

requireLogin(auth, onAuthStateChanged, async (user) => {
  const [profile, recent, completed] = await Promise.all([
    getUserProfile(user.uid),
    getRecentCompletions(user.uid, 5),
    getAllProgress(user.uid)
  ]);
  renderStats(profile);
  renderRecent(recent);
  renderSubjects(completed);
});

function renderStats(profile) {
  statsEl.innerHTML = `
    <div class="stat-pill"><span class="stat-value">${profile.gems}</span><span class="stat-label">Gems</span></div>
    <div class="stat-pill"><span class="stat-value">${profile.medalsCount || 0}</span><span class="stat-label">Medals</span></div>
    <div class="stat-pill"><span class="stat-value">${profile.starsCount || 0}</span><span class="stat-label">Stars</span></div>
  `;
}

function renderRecent(recent) {
  if (!recent.length) {
    recentEl.innerHTML = `<p class="empty-state">You haven't completed any lessons yet — pick a web below to get started!</p>`;
    return;
  }
  recentEl.innerHTML = recent
    .map(
      (r) => `
        <a class="recent-card" href="../web/index.html?web=${encodeURIComponent(r.webId)}">
          <span class="recent-kind">${kindLabel(r.kind)}</span>
          <span class="recent-title">${escapeHtml(r.title)}</span>
        </a>
      `
    )
    .join("");
}

// The dashboard only ever shows a small, relevant slice: webs you're
// partway through, plus one not-yet-started recommendation per subject
// type. The full catalog lives on lessons/index.html.
function renderSubjects(completed) {
  const inProgress = [];
  const recommendedByType = new Map();

  WEBS.forEach((web) => {
    const total = web.nodes.length;
    const done = web.nodes.filter((n) => completed.has(n.id)).length;
    if (done > 0 && done < total) {
      inProgress.push({ web, done, total });
    } else if (done === 0 && !recommendedByType.has(web.type)) {
      recommendedByType.set(web.type, { web, done, total });
    }
  });

  const recommended = Array.from(recommendedByType.values());

  const inProgressHtml = inProgress.length
    ? `
      <h2>Continue Learning</h2>
      <div class="web-grid">${inProgress.map((i) => webCardHtml(i.web, i.done, i.total)).join("")}</div>
    `
    : "";

  const recommendedHtml = `
    <h2>Recommended For You</h2>
    <div class="web-grid">
      ${
        recommended.length
          ? recommended.map((i) => webCardHtml(i.web, i.done, i.total)).join("")
          : `<p class="empty-state">You've started every subject — nice! <a href="../lessons/index.html" class="inline-link">Browse all lessons</a>.</p>`
      }
    </div>
  `;

  subjectsEl.innerHTML = `
    ${inProgressHtml}
    ${recommendedHtml}
    <p class="dashboard-see-all"><a href="../lessons/index.html" class="inline-link">See all ${WEBS.length} webs across every subject →</a></p>
  `;
}
