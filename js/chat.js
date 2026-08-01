import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  getUserProfile,
  getRelationshipStatus,
  ensureChatDoc,
  listenToMessages,
  sendMessage,
  removeFriend,
  blockUser
} from "./progress.js";
import { escapeHtml, requireLogin } from "./util.js";

const container = document.getElementById("chat-container");
const params = new URLSearchParams(window.location.search);
const otherUid = params.get("with");

let myUid;
let unsubscribe;

function formatTimestamp(sentAt) {
  if (!sentAt || typeof sentAt.toDate !== "function") return "Sending...";
  const d = sentAt.toDate();
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

requireLogin(auth, onAuthStateChanged, async (user) => {
  myUid = user.uid;
  if (!otherUid || otherUid === myUid) {
    container.innerHTML = `<p class="empty-state">No conversation specified.</p>`;
    return;
  }
  const status = await getRelationshipStatus(myUid, otherUid);
  if (status !== "friends") {
    container.innerHTML = `<p class="empty-state">You can only chat with friends. <a class="inline-link" href="../friends/index.html">Back to friends</a></p>`;
    return;
  }
  const otherProfile = await getUserProfile(otherUid);
  await initChat(otherProfile);
});

async function initChat(otherProfile) {
  const otherName = otherProfile.displayName || otherProfile.username;

  container.innerHTML = `
    <a href="../friends/index.html" class="back-link">← Back to Friends</a>
    <div class="chat-card">
      <div class="chat-header">
        <a class="chat-header-name" href="../profile/index.html?uid=${encodeURIComponent(otherUid)}">${escapeHtml(otherName)}</a>
        <div class="chat-header-actions">
          <button type="button" class="btn btn-ghost btn-sm" id="chat-unfriend">Unfriend</button>
          <button type="button" class="btn btn-ghost btn-sm" id="chat-block">Block</button>
        </div>
      </div>
      <div class="chat-messages" id="chat-messages"></div>
      <form id="chat-form" class="chat-form">
        <input type="text" id="chat-input" class="chat-input" placeholder="Type a message..." autocomplete="off" maxlength="1000">
        <button type="submit" class="btn btn-primary">Send</button>
      </form>
    </div>
  `;

  document.getElementById("chat-unfriend").addEventListener("click", async () => {
    if (confirm(`Remove ${otherName} as a friend? This will end your chat.`)) {
      await removeFriend(myUid, otherUid);
      window.location.href = "../friends/index.html";
    }
  });

  document.getElementById("chat-block").addEventListener("click", async () => {
    if (confirm(`Block ${otherName}? This also removes them as a friend and ends your chat.`)) {
      await blockUser(myUid, otherUid, otherProfile);
      window.location.href = "../friends/index.html";
    }
  });

  const chatId = await ensureChatDoc(myUid, otherUid);
  const messagesEl = document.getElementById("chat-messages");

  unsubscribe = listenToMessages(chatId, (messages) => {
    messagesEl.innerHTML = messages
      .map(
        (m) => `
          <div class="chat-message ${m.from === myUid ? "chat-message-mine" : "chat-message-theirs"}">
            <div class="chat-message-column">
              <span class="chat-bubble">${escapeHtml(m.text)}</span>
              <span class="chat-timestamp">${formatTimestamp(m.sentAt)}</span>
            </div>
          </div>
        `
      )
      .join("");
    messagesEl.scrollTop = messagesEl.scrollHeight;
  });

  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    await sendMessage(chatId, myUid, text);
  });
}

window.addEventListener("beforeunload", () => {
  if (unsubscribe) unsubscribe();
});
