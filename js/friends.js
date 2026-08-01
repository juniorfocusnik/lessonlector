import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  getFriendsList,
  getIncomingRequests,
  getOutgoingRequests,
  getUserProfile,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest
} from "./progress.js";
import { escapeHtml, requireLogin } from "./util.js";

const incomingEl = document.getElementById("incoming-requests");
const outgoingEl = document.getElementById("outgoing-requests");
const friendsEl = document.getElementById("friends-list");

let myUid;
let myProfile;

requireLogin(auth, onAuthStateChanged, async (user) => {
  myUid = user.uid;
  myProfile = await getUserProfile(myUid);
  await loadAll();
});

async function loadAll() {
  const [incoming, outgoing, friends] = await Promise.all([
    getIncomingRequests(myUid),
    getOutgoingRequests(myUid),
    getFriendsList(myUid)
  ]);
  renderIncoming(incoming);
  renderOutgoing(outgoing);
  renderFriends(friends);
}

function renderIncoming(list) {
  if (!list.length) {
    incomingEl.innerHTML = `<p class="empty-state">No incoming requests.</p>`;
    return;
  }
  incomingEl.innerHTML = list
    .map(
      (r) => `
        <div class="friend-row">
          <a class="friend-row-name" href="../profile/index.html?uid=${encodeURIComponent(r.uid)}">${escapeHtml(r.displayName || r.username)}</a>
          <div class="friend-row-actions">
            <button type="button" class="btn btn-primary btn-sm" data-accept="${r.uid}">Accept</button>
            <button type="button" class="btn btn-outline btn-sm" data-decline="${r.uid}">Decline</button>
          </div>
        </div>
      `
    )
    .join("");

  incomingEl.querySelectorAll("[data-accept]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const otherUid = btn.dataset.accept;
      const otherProfile = await getUserProfile(otherUid);
      await acceptFriendRequest(myUid, myProfile, otherUid, otherProfile);
      await loadAll();
    });
  });
  incomingEl.querySelectorAll("[data-decline]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await declineFriendRequest(myUid, btn.dataset.decline);
      await loadAll();
    });
  });
}

function renderOutgoing(list) {
  if (!list.length) {
    outgoingEl.innerHTML = `<p class="empty-state">No pending sent requests.</p>`;
    return;
  }
  outgoingEl.innerHTML = list
    .map(
      (r) => `
        <div class="friend-row">
          <a class="friend-row-name" href="../profile/index.html?uid=${encodeURIComponent(r.uid)}">${escapeHtml(r.displayName || r.username)}</a>
          <div class="friend-row-actions">
            <button type="button" class="btn btn-outline btn-sm" data-cancel="${r.uid}">Cancel</button>
          </div>
        </div>
      `
    )
    .join("");

  outgoingEl.querySelectorAll("[data-cancel]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await cancelFriendRequest(myUid, btn.dataset.cancel);
      await loadAll();
    });
  });
}

function renderFriends(list) {
  if (!list.length) {
    friendsEl.innerHTML = `<p class="empty-state">No friends yet — find someone on the leaderboard or search!</p>`;
    return;
  }
  friendsEl.innerHTML = list
    .map(
      (f) => `
        <a class="friend-row friend-row-link" href="../profile/index.html?uid=${encodeURIComponent(f.uid)}">
          <span class="friend-row-name">${escapeHtml(f.displayName || f.username)}</span>
          <span class="friend-row-hint">View profile →</span>
        </a>
      `
    )
    .join("");
}
