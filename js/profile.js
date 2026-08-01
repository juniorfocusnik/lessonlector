import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  getUserProfile,
  getRelationshipStatus,
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  blockUser,
  unblockUser
} from "./progress.js";
import { MEDALS, STARS } from "./data/webs.js";
import { escapeHtml, requireLogin } from "./util.js";

const container = document.getElementById("profile-container");
const params = new URLSearchParams(window.location.search);
const targetUid = params.get("uid");
let myUid;

requireLogin(auth, onAuthStateChanged, async (user) => {
  if (!targetUid) {
    container.innerHTML = `<p class="empty-state">No user specified.</p>`;
    return;
  }
  myUid = user.uid;
  await loadProfile();
});

function badgeTooltip(item) {
  return `${item.name}\nSubject: ${item.webTitle} (${item.webType})\nTo earn: ${item.requirement}`;
}

async function loadProfile() {
  const [myProfile, otherProfile] = await Promise.all([
    getUserProfile(myUid),
    getUserProfile(targetUid)
  ]);
  if (!otherProfile) {
    container.innerHTML = `<p class="empty-state">User not found. <a class="inline-link" href="../leaderboard/index.html">Back to leaderboard</a></p>`;
    return;
  }
  const status = myUid === targetUid ? "self" : await getRelationshipStatus(myUid, targetUid);
  render(myProfile, otherProfile, status);
}

function render(myProfile, otherProfile, status) {
  const earnedMedals = new Set(otherProfile.medals || []);
  const earnedStars = new Set(otherProfile.stars || []);
  const medals = MEDALS.filter((m) => earnedMedals.has(m.id));
  const stars = STARS.filter((s) => earnedStars.has(s.id));

  container.innerHTML = `
    <a href="../leaderboard/index.html" class="back-link">← Back to Leaderboard</a>
    <div class="profile-card">
      <h1>${escapeHtml(otherProfile.displayName || otherProfile.username)}</h1>
      <div class="profile-stats">
        <div class="stat-pill"><span class="stat-value">${otherProfile.gems || 0}</span><span class="stat-label">Gems</span></div>
        <div class="stat-pill"><span class="stat-value">${otherProfile.medalsCount || 0}</span><span class="stat-label">Medals</span></div>
        <div class="stat-pill"><span class="stat-value">${otherProfile.starsCount || 0}</span><span class="stat-label">Stars</span></div>
      </div>
      <div class="profile-actions" id="profile-actions"></div>

      <h2>Medals</h2>
      <div class="badge-grid">
        ${
          medals.length
            ? medals
                .map(
                  (m) => `
                  <div class="badge-card badge-earned" title="${escapeHtml(badgeTooltip(m))}">
                    <div class="badge-icon">🎖️</div>
                    <div class="badge-name">${escapeHtml(m.name)}</div>
                    <div class="badge-subject">${escapeHtml(m.webTitle)}</div>
                  </div>
                `
                )
                .join("")
            : `<p class="empty-state">No medals yet.</p>`
        }
      </div>

      <h2>Stars</h2>
      <div class="badge-grid">
        ${
          stars.length
            ? stars
                .map(
                  (s) => `
                  <div class="badge-card badge-earned" title="${escapeHtml(badgeTooltip(s))}">
                    <div class="badge-icon">⭐</div>
                    <div class="badge-name">${escapeHtml(s.name)}</div>
                    <div class="badge-subject">${escapeHtml(s.webTitle)}</div>
                  </div>
                `
                )
                .join("")
            : `<p class="empty-state">No stars yet.</p>`
        }
      </div>
    </div>
  `;

  renderActions(myProfile, otherProfile, status);
}

function renderActions(myProfile, otherProfile, status) {
  const actionsEl = document.getElementById("profile-actions");

  if (status === "self") {
    actionsEl.innerHTML = `<p class="profile-self-note">This is your profile.</p>`;
    return;
  }

  if (status === "none") {
    actionsEl.innerHTML = `<button type="button" class="btn btn-primary" id="action-add-friend">Add Friend</button>`;
    document.getElementById("action-add-friend").addEventListener("click", async (e) => {
      e.target.disabled = true;
      await sendFriendRequest(myUid, myProfile, targetUid, otherProfile);
      await loadProfile();
    });
  } else if (status === "outgoingPending") {
    actionsEl.innerHTML = `<button type="button" class="btn btn-outline" id="action-cancel">Cancel Request</button>`;
    document.getElementById("action-cancel").addEventListener("click", async () => {
      await cancelFriendRequest(myUid, targetUid);
      await loadProfile();
    });
  } else if (status === "incomingPending") {
    actionsEl.innerHTML = `
      <button type="button" class="btn btn-primary" id="action-accept">Accept Request</button>
      <button type="button" class="btn btn-outline" id="action-decline">Decline</button>
    `;
    document.getElementById("action-accept").addEventListener("click", async () => {
      await acceptFriendRequest(myUid, myProfile, targetUid, otherProfile);
      await loadProfile();
    });
    document.getElementById("action-decline").addEventListener("click", async () => {
      await declineFriendRequest(myUid, targetUid);
      await loadProfile();
    });
  } else if (status === "friends") {
    actionsEl.innerHTML = `
      <a class="btn btn-primary" href="../chat/index.html?with=${encodeURIComponent(targetUid)}">Message</a>
      <button type="button" class="btn btn-outline" id="action-unfriend">Unfriend</button>
      <button type="button" class="btn btn-ghost" id="action-block">Block</button>
    `;
    document.getElementById("action-unfriend").addEventListener("click", async () => {
      if (confirm(`Remove ${otherProfile.displayName || otherProfile.username} as a friend?`)) {
        await removeFriend(myUid, targetUid);
        await loadProfile();
      }
    });
    document.getElementById("action-block").addEventListener("click", async () => {
      if (confirm(`Block ${otherProfile.displayName || otherProfile.username}? This also removes them as a friend.`)) {
        await blockUser(myUid, targetUid, otherProfile);
        await loadProfile();
      }
    });
  } else if (status === "blockedByMe") {
    actionsEl.innerHTML = `<button type="button" class="btn btn-outline" id="action-unblock">Unblock</button>`;
    document.getElementById("action-unblock").addEventListener("click", async () => {
      await unblockUser(myUid, targetUid);
      await loadProfile();
    });
  }
}
