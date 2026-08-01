// Shared helpers used across the app's pages.
import { ensureUserProfile } from "./progress.js";

const ESCAPE_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

// Every page injects Firestore data (usernames, chat text, etc.) via
// innerHTML for convenience — this keeps that safe from HTML/script
// injection since none of that data can be trusted to be plain text.
export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ESCAPE_MAP[c]);
}

export function kindLabel(kind) {
  return { lesson: "Lesson", test: "Test", project: "Project", finalExam: "Final Exam" }[kind] || "Lesson";
}

// Shared web-card markup used on both the dashboard and the Lessons
// catalog page, so the two never drift apart visually.
export function webCardHtml(web, done, total) {
  const pct = Math.round((done / total) * 100);
  return `
    <a class="web-card" href="../web/index.html?web=${encodeURIComponent(web.id)}" style="--web-color:${web.color}">
      <div class="web-card-head">
        <span class="web-card-type">${escapeHtml(web.type)}</span>
        <span class="web-card-years">Years ${escapeHtml(web.yeargroups)}</span>
      </div>
      <h3>${escapeHtml(web.title)}</h3>
      <p>${escapeHtml(web.description)}</p>
      <div class="web-card-progress">
        <div class="web-card-bar"><div class="web-card-fill" style="width:${pct}%"></div></div>
        <span>${done}/${total} complete</span>
      </div>
    </a>
  `;
}

// Firebase Auth's displayName can be missing (e.g. an account created
// before signup.js set it). The synthetic email's local part always
// holds the real claimed username, so that's a far safer fallback than
// the raw uid — which would otherwise leak straight onto the public
// leaderboard as someone's "name".
export function fallbackUsername(user) {
  if (user.displayName) return user.displayName;
  if (user.email) return user.email.split("@")[0];
  return user.uid;
}

// Guards a page behind login, AND guarantees a users/{uid} profile doc
// exists before running page logic — covering accounts that were signed
// in before profile docs existed, or whose session simply persisted
// across a reload without ever calling login.js again.
export function requireLogin(auth, onAuthStateChanged, onUser) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "../login/index.html";
      return;
    }
    await ensureUserProfile(user.uid, fallbackUsername(user));
    onUser(user);
  });
}
