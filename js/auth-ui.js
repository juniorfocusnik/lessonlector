// Controls the header on every page: Sign Up / Log In when logged out,
// full navigation + a live gems/medals/stars counter + Log Out when
// logged in.
import { auth } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { ensureUserProfile, getUserProfile } from "./progress.js";
import { fallbackUsername } from "./util.js";

const actions = document.getElementById("auth-actions");
const welcomeBanner = document.getElementById("welcome-banner");
const mainNav = document.querySelector(".main-nav");

// Every page except the homepage now lives at /foldername/index.html,
// so the filename alone ("index.html") can no longer tell pages apart —
// the folder name is what identifies which page this is. Falls back to
// "index.html" itself only at the true site root (no folder segment).
const pathSegments = window.location.pathname.split("/").filter(Boolean);
const lastSegment = pathSegments[pathSegments.length - 1];
const currentPage =
  !lastSegment || lastSegment === "index.html"
    ? (pathSegments.length >= 2 ? pathSegments[pathSegments.length - 2] : "index.html")
    : lastSegment;

// The site may be hosted at a domain root OR under a subpath (e.g. GitHub
// Pages project sites live at username.github.io/reponame/). This script's
// own URL is always at <siteRoot>/js/auth-ui.js, so resolving "../" from it
// gives the true site root regardless of subpath — no need to guess depth
// from the current page's URL.
const siteRoot = new URL("../", import.meta.url);
const siteUrl = (path) => new URL(path, siteRoot).pathname;

const NAV_ITEMS = [
  { label: "Dashboard", href: siteUrl("dashboard/index.html"), pages: ["dashboard"] },
  { label: "Lessons", href: siteUrl("lessons/index.html"), pages: ["lessons", "web", "lesson"] },
  { label: "Game", href: siteUrl("game/index.html"), pages: ["game"] },
  { label: "Medals", href: siteUrl("medals/index.html"), pages: ["medals"] },
  { label: "Stars", href: siteUrl("stars/index.html"), pages: ["stars"] },
  { label: "Leaderboard", href: siteUrl("leaderboard/index.html"), pages: ["leaderboard", "profile"] },
  { label: "Friends", href: siteUrl("friends/index.html"), pages: ["friends", "chat"] }
];

function renderLoggedOut() {
  actions.innerHTML = `
    <a href="${siteUrl("signup/index.html")}" class="btn btn-primary header-cta">Sign Up</a>
    <a href="${siteUrl("login/index.html")}" class="btn btn-ghost header-cta">Log In</a>
  `;
  if (welcomeBanner) {
    welcomeBanner.hidden = true;
    welcomeBanner.textContent = "";
  }
  document.querySelectorAll(".app-nav-link").forEach((el) => el.remove());
}

function renderNavLinks() {
  if (!mainNav) return;
  document.querySelectorAll(".app-nav-link").forEach((el) => el.remove());
  NAV_ITEMS.forEach((item) => {
    const link = document.createElement("a");
    link.href = item.href;
    link.className = "nav-link app-nav-link" + (item.pages.includes(currentPage) ? " active" : "");
    link.textContent = item.label;
    mainNav.appendChild(link);
  });
}

function renderStats(profile) {
  const gems = profile?.gems || 0;
  const medals = profile?.medalsCount || 0;
  const stars = profile?.starsCount || 0;
  return `
    <div class="header-stats">
      <span class="header-stat" title="Gems">💎<span>${gems}</span></span>
      <span class="header-stat" title="Medals">🎖️<span>${medals}</span></span>
      <span class="header-stat" title="Stars">⭐<span>${stars}</span></span>
    </div>
  `;
}

async function renderLoggedIn(user) {
  renderNavLinks();

  if (welcomeBanner) {
    welcomeBanner.textContent = `Welcome, ${user.displayName || "there"}!`;
    welcomeBanner.hidden = false;
  }

  // Nav + Log Out must appear even if the stats fetch below fails, so
  // render them first and patch in the stats widget once (if) it loads.
  actions.innerHTML = `<button type="button" class="btn btn-ghost header-cta" id="logout-btn">Log Out</button>`;
  document.getElementById("logout-btn").addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = siteRoot.pathname;
  });

  try {
    // Guarantees a profile doc exists even if this is the only script on
    // the page (e.g. the homepage), so header stats are never stuck at 0
    // just because a users/{uid} doc hadn't been created yet.
    await ensureUserProfile(user.uid, fallbackUsername(user));
    const profile = await getUserProfile(user.uid);
    actions.insertAdjacentHTML("afterbegin", renderStats(profile));
  } catch (err) {
    console.error(
      "Couldn't load profile stats for the header. If this says " +
        "'Missing or insufficient permissions', your Firestore security " +
        "rules haven't been published yet — see firestore.rules.",
      err
    );
  }
}

if (actions) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      renderLoggedIn(user);
    } else {
      renderLoggedOut();
    }
  });
}
