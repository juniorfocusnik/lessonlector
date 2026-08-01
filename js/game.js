import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { TYPES, WEBS } from "./data/webs.js";
import { getUserProfile } from "./progress.js";
import { escapeHtml, requireLogin } from "./util.js";
import { buildQuestionPool, drawQuestion } from "./gameQuestions.js";
import {
  normalizeCode,
  createGame,
  getGame,
  listenToGame,
  listenToPlayers,
  joinGame,
  startGame,
  endGame,
  recordAnswer,
  awardGemsOnce
} from "./gameService.js";

const VIEWS = ["landing", "create", "join", "host-lobby", "host-active", "player-waiting", "player-active", "end"];
const ADJECTIVES = ["Swift", "Clever", "Brave", "Sneaky", "Mighty", "Jolly", "Silent", "Fuzzy", "Cosmic", "Turbo", "Wild", "Chill", "Zesty", "Rapid", "Lucky"];
const NOUNS = ["Falcon", "Panda", "Tiger", "Comet", "Wizard", "Ninja", "Otter", "Rocket", "Phoenix", "Yeti", "Shark", "Dragon", "Fox", "Penguin", "Wolf"];

let currentUser = null;
let myProfile = null;
let role = null; // "host" | "player"
let gameCode = null;
let gameData = null;
let playersData = [];
let phase = null; // "lobby" | "active" | "waiting" | "ended"
let hostMonitorInterval = null;
let pendingJoinCode = null;

let questionPool = [];
let usedIndexes = new Set();
let currentQuestion = null;
let myNickname = "";
let myScore = 0;
let myCorrect = 0;

function showView(name) {
  VIEWS.forEach((v) => {
    const el = document.getElementById("view-" + v);
    if (el) el.hidden = v !== name;
  });
}

function randomNickname() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${adj}${noun}${num}`;
}

function renderSubjectGrid() {
  const grid = document.getElementById("subject-grid");
  grid.innerHTML = TYPES.map((type) => {
    const webs = WEBS.filter((w) => w.type === type);
    return `
      <div class="subject-group">
        <h3 class="subject-group-title">${escapeHtml(type)}</h3>
        <div class="subject-group-grid">
          ${webs
            .map(
              (w) => `
                <label class="subject-check">
                  <input type="checkbox" name="subject" value="${escapeHtml(w.id)}">
                  <span>${escapeHtml(w.title)}</span>
                </label>
              `
            )
            .join("")}
        </div>
      </div>
    `;
  }).join("");
}

// ---------- Create game ----------

function wireCreateForm() {
  document.querySelectorAll('input[name="end-type"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const isTime = document.querySelector('input[name="end-type"]:checked').value === "time";
      document.getElementById("end-value-label").textContent = isTime ? "Minutes" : "Points to Win";
    });
  });

  document.getElementById("subjects-select-all").addEventListener("click", () => {
    document.querySelectorAll('input[name="subject"]').forEach((c) => (c.checked = true));
  });
  document.getElementById("subjects-clear-all").addEventListener("click", () => {
    document.querySelectorAll('input[name="subject"]').forEach((c) => (c.checked = false));
  });

  document.getElementById("create-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const alertEl = document.getElementById("create-alert");
    alertEl.hidden = true;

    const endType = document.querySelector('input[name="end-type"]:checked').value;
    const endValue = Number(document.getElementById("end-value").value);
    const subjects = Array.from(document.querySelectorAll('input[name="subject"]:checked')).map((c) => c.value);
    const randomNames = document.getElementById("random-names").checked;

    if (!Number.isInteger(endValue) || endValue < 1) {
      alertEl.textContent = "Please enter a value of at least 1.";
      alertEl.hidden = false;
      return;
    }
    if (subjects.length === 0) {
      alertEl.textContent = "Please select at least one subject.";
      alertEl.hidden = false;
      return;
    }

    const submitBtn = document.getElementById("create-submit");
    submitBtn.disabled = true;
    try {
      gameCode = await createGame({
        hostUid: currentUser.uid,
        hostUsername: myProfile.username,
        endType,
        endValue,
        subjects,
        randomNames
      });
      role = "host";
      enterHostLobby();
    } catch (err) {
      console.error(err);
      alertEl.textContent = "Couldn't create the game — please try again.";
      alertEl.hidden = false;
      submitBtn.disabled = false;
    }
  });
}

// ---------- Host lobby ----------

function enterHostLobby() {
  phase = "lobby";
  document.getElementById("lobby-code").textContent = gameCode;
  showView("host-lobby");

  listenToPlayers(gameCode, (players) => {
    playersData = players;
    if (phase === "lobby") renderLobbyPlayers(players);
    else if (phase === "active") renderHostLeaderboardRows();
  });

  listenToGame(gameCode, (game) => {
    gameData = game;
    if (!game) return;
    if (game.status === "active" && phase !== "active" && phase !== "ended") enterHostActivePhase();
    if (game.status === "ended" && phase !== "ended") enterEndScreen();
  });
}

function renderLobbyPlayers(players) {
  document.getElementById("lobby-player-count").textContent = `${players.length} player${players.length === 1 ? "" : "s"} joined`;
  document.getElementById("lobby-players").innerHTML =
    players.map((p) => `<div class="player-box">${escapeHtml(p.nickname)}</div>`).join("") ||
    `<p class="empty-state">Waiting for players to join…</p>`;
  const startBtn = document.getElementById("start-game-btn");
  startBtn.disabled = players.length < 2;
  startBtn.textContent = players.length < 2 ? "Need at least 2 players" : "Start Game";
}

function wireHostLobby() {
  document.getElementById("start-game-btn").addEventListener("click", async () => {
    if (playersData.length < 2 || !gameData) return;
    await startGame(gameCode, gameData.endType, gameData.endValue);
  });

  document.getElementById("copy-code-btn").addEventListener("click", async () => {
    const btn = document.getElementById("copy-code-btn");
    try {
      await navigator.clipboard.writeText(gameCode);
      const original = btn.textContent;
      btn.textContent = "Copied!";
      setTimeout(() => (btn.textContent = original), 1500);
    } catch (err) {
      // Clipboard unavailable — the code is already visible on screen.
    }
  });
}

// ---------- Host active ----------

function enterHostActivePhase() {
  phase = "active";
  showView("host-active");
  hostMonitorTick();
  hostMonitorInterval = setInterval(hostMonitorTick, 1000);
}

function shouldHideLeaderboard() {
  if (!gameData) return false;
  if (gameData.endType === "time") {
    return (gameData.endsAt || 0) - Date.now() <= 60000;
  }
  return playersData.some((p) => (p.score || 0) >= gameData.endValue - 8);
}

function updateHostTimer() {
  const timerEl = document.getElementById("host-timer");
  if (gameData.endType === "time") {
    const remaining = Math.max(0, (gameData.endsAt || 0) - Date.now());
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    timerEl.textContent = `Time remaining: ${mins}:${String(secs).padStart(2, "0")}`;
  } else {
    timerEl.textContent = `First to ${gameData.endValue} points wins`;
  }
}

function renderHostLeaderboardRows() {
  const sorted = [...playersData].sort((a, b) => (b.score || 0) - (a.score || 0));
  document.getElementById("host-leaderboard-body").innerHTML = sorted
    .map((p, i) => `<tr><td>${i + 1}</td><td>${escapeHtml(p.nickname)}</td><td>${p.score || 0}</td></tr>`)
    .join("");
}

function hostMonitorTick() {
  if (!gameData || gameData.status !== "active") return;
  updateHostTimer();

  const hide = shouldHideLeaderboard();
  document.getElementById("host-leaderboard-table").hidden = hide;
  document.getElementById("host-leaderboard-hidden").hidden = !hide;
  if (!hide) renderHostLeaderboardRows();

  let shouldEnd = false;
  if (gameData.endType === "time") {
    shouldEnd = (gameData.endsAt || 0) - Date.now() <= 0;
  } else {
    shouldEnd = playersData.some((p) => (p.score || 0) >= gameData.endValue);
  }
  if (shouldEnd) {
    clearInterval(hostMonitorInterval);
    endGame(gameCode).catch(console.error);
  }
}

function wireHostActive() {
  document.getElementById("end-game-btn").addEventListener("click", async () => {
    if (role !== "host") return;
    clearInterval(hostMonitorInterval);
    await endGame(gameCode);
  });
}

// ---------- Join game ----------

function wireJoinForms() {
  document.getElementById("join-code-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const alertEl = document.getElementById("join-alert");
    alertEl.hidden = true;

    const code = normalizeCode(document.getElementById("join-code").value);
    if (code.length !== 10) {
      alertEl.textContent = "Game codes are exactly 10 characters.";
      alertEl.hidden = false;
      return;
    }

    let game;
    try {
      game = await getGame(code);
    } catch (err) {
      console.error(err);
      alertEl.textContent = "Something went wrong looking up that code.";
      alertEl.hidden = false;
      return;
    }
    if (!game) {
      alertEl.textContent = "No game found with that code.";
      alertEl.hidden = false;
      return;
    }
    if (game.status !== "lobby") {
      alertEl.textContent = "That game has already started or ended.";
      alertEl.hidden = false;
      return;
    }

    pendingJoinCode = code;
    if (game.randomNames) {
      await completeJoin(code, randomNickname());
    } else {
      document.getElementById("join-code-form").hidden = true;
      document.getElementById("join-nickname-form").hidden = false;
    }
  });

  document.getElementById("join-nickname-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const nickname = document.getElementById("join-nickname").value.trim().slice(0, 20);
    if (!nickname) return;
    await completeJoin(pendingJoinCode, nickname);
  });
}

async function completeJoin(code, nickname) {
  role = "player";
  gameCode = code;
  myNickname = nickname;
  await joinGame(code, currentUser.uid, myProfile.username, nickname);
  enterPlayerWaiting();
}

function enterPlayerWaiting() {
  phase = "waiting";
  document.getElementById("player-waiting-msg").textContent = `You have joined in as ${myNickname}! Can you see your name?`;
  showView("player-waiting");

  listenToGame(gameCode, (game) => {
    gameData = game;
    if (!game) return;
    if (game.status === "active" && phase !== "active" && phase !== "ended") enterPlayerActivePhase();
    if (game.status === "ended" && phase !== "ended") enterEndScreen();
  });
}

// ---------- Player active ----------

function enterPlayerActivePhase() {
  phase = "active";
  showView("player-active");
  questionPool = buildQuestionPool(gameData.subjects);
  usedIndexes = new Set();
  myScore = 0;
  myCorrect = 0;
  updatePlayerScoreDisplay();
  showNextQuestion();

  listenToPlayers(gameCode, (players) => {
    playersData = players;
    if (phase === "active") updatePlayerScoreDisplay();
  });
}

// Ranked against every joined player, not just displayed in isolation —
// this is what was missing before: a lone player had no way to tell
// anyone else was even in the game. The current player's own entry in
// the synced list can lag one round-trip behind local `myScore`, so it's
// substituted in before ranking to keep the shown rank consistent with
// the shown score.
function updatePlayerScoreDisplay() {
  const merged = playersData.map((p) => (p.uid === currentUser.uid ? { ...p, score: myScore } : p));
  const sorted = merged.sort((a, b) => (b.score || 0) - (a.score || 0));
  const myRank = sorted.findIndex((p) => p.uid === currentUser.uid) + 1;
  const rankText = myRank > 0 && sorted.length > 1 ? ` · Rank #${myRank} of ${sorted.length} players` : "";
  document.getElementById("player-score-display").textContent = `Score: ${myScore}${rankText}`;
}

function showNextQuestion() {
  if (phase !== "active") return;
  currentQuestion = drawQuestion(questionPool, usedIndexes);
  document.getElementById("question-subject-tag").textContent = currentQuestion.subject;
  document.getElementById("question-text").textContent = currentQuestion.text;

  const feedback = document.getElementById("question-feedback");
  feedback.hidden = true;
  feedback.className = "quiz-feedback";

  const optsEl = document.getElementById("question-options");
  if (currentQuestion.mode === "numerical") {
    optsEl.innerHTML = `
      <input type="number" class="numerical-input" id="game-numerical-input" placeholder="Type your answer">
      <button type="button" class="btn btn-primary" id="game-numerical-submit">Submit</button>
    `;
    const submit = () => {
      const raw = document.getElementById("game-numerical-input").value;
      const value = Number(raw);
      if (raw.trim() === "" || Number.isNaN(value)) return;
      handleNumericalAnswer(value);
    };
    document.getElementById("game-numerical-submit").addEventListener("click", submit);
    document.getElementById("game-numerical-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") submit();
    });
  } else {
    optsEl.innerHTML = currentQuestion.options
      .map((opt, i) => `<button type="button" class="quiz-option" data-i="${i}">${escapeHtml(opt)}</button>`)
      .join("");
    optsEl.querySelectorAll(".quiz-option").forEach((btn) => {
      btn.addEventListener("click", () => handleAnswer(Number(btn.dataset.i)));
    });
  }
}

function handleAnswer(selectedIndex) {
  if (phase !== "active") return;
  const optsEl = document.getElementById("question-options");
  const buttons = Array.from(optsEl.querySelectorAll(".quiz-option"));
  buttons.forEach((b) => (b.disabled = true));

  const correct = selectedIndex === currentQuestion.correctIndex;
  const feedback = document.getElementById("question-feedback");
  buttons[currentQuestion.correctIndex].classList.add("quiz-correct");

  if (correct) {
    myScore++;
    myCorrect++;
    updatePlayerScoreDisplay();
    recordAnswer(gameCode, currentUser.uid, true).catch(console.error);
    setTimeout(showNextQuestion, 500);
  } else {
    buttons[selectedIndex].classList.add("quiz-incorrect");
    feedback.hidden = false;
    feedback.textContent = `Correct answer: ${currentQuestion.options[currentQuestion.correctIndex]}`;
    feedback.className = "quiz-feedback status-error";
    recordAnswer(gameCode, currentUser.uid, false).catch(console.error);
    setTimeout(showNextQuestion, 3000);
  }
}

function handleNumericalAnswer(value) {
  if (phase !== "active") return;
  document.getElementById("game-numerical-input").disabled = true;
  document.getElementById("game-numerical-submit").disabled = true;

  const correct = Math.abs(value - currentQuestion.answer) <= (currentQuestion.tolerance || 0);
  const feedback = document.getElementById("question-feedback");

  if (correct) {
    myScore++;
    myCorrect++;
    updatePlayerScoreDisplay();
    recordAnswer(gameCode, currentUser.uid, true).catch(console.error);
    setTimeout(showNextQuestion, 500);
  } else {
    feedback.hidden = false;
    feedback.textContent = `Correct answer: ${currentQuestion.answer}`;
    feedback.className = "quiz-feedback status-error";
    recordAnswer(gameCode, currentUser.uid, false).catch(console.error);
    setTimeout(showNextQuestion, 3000);
  }
}

// ---------- End screen ----------

async function enterEndScreen() {
  if (phase === "ended") return;
  phase = "ended";
  if (hostMonitorInterval) clearInterval(hostMonitorInterval);
  showView("end");

  if (role === "player") {
    try {
      await awardGemsOnce(gameCode, currentUser.uid);
    } catch (err) {
      console.error(err);
    }
  }

  const finalPlayers = await new Promise((resolve) => {
    const unsub = listenToPlayers(gameCode, (players) => {
      unsub();
      resolve(players);
    });
  });
  const sorted = [...finalPlayers].sort((a, b) => (b.score || 0) - (a.score || 0));
  runEndSequence(sorted);
}

function podiumSlot(place, player) {
  if (!player) return "";
  const medal = place === 1 ? "🥇" : place === 2 ? "🥈" : "🥉";
  return `
    <div class="podium-slot podium-${place}">
      <div class="podium-place">${medal}</div>
      <div class="podium-name">${escapeHtml(player.nickname)}</div>
      <div class="podium-score">${player.score || 0} pts</div>
      <div class="podium-bar"></div>
    </div>
  `;
}

function runEndSequence(sorted) {
  const podium = document.getElementById("podium");
  podium.innerHTML = "";
  const [first, second, third] = sorted;

  setTimeout(() => {
    if (third) podium.insertAdjacentHTML("beforeend", podiumSlot(3, third));
  }, 600);
  setTimeout(() => {
    if (second) podium.insertAdjacentHTML("afterbegin", podiumSlot(2, second));
  }, 2000);
  setTimeout(() => {
    if (first) podium.insertAdjacentHTML("beforeend", podiumSlot(1, first));
    launchConfetti();
  }, 3400);
  setTimeout(() => {
    document.getElementById("final-leaderboard").hidden = false;
    document.getElementById("final-leaderboard-body").innerHTML = sorted
      .map(
        (p, i) =>
          `<tr><td>${i + 1}</td><td>${escapeHtml(p.nickname)}</td><td>${p.score || 0}</td><td>💎 ${(p.correct || 0) * 2}</td></tr>`
      )
      .join("");
  }, 6000);
}

function launchConfetti() {
  const layer = document.getElementById("confetti-layer");
  layer.innerHTML = "";
  const colors = ["#3ec5ff", "#9b5cff", "#ff5cd8", "#ffd166"];
  for (let i = 0; i < 80; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 0.6 + "s";
    piece.style.animationDuration = 2 + Math.random() * 1.5 + "s";
    layer.appendChild(piece);
  }
  setTimeout(() => {
    layer.innerHTML = "";
  }, 4000);
}

// ---------- Landing / navigation ----------

function wireLanding() {
  document.getElementById("btn-show-create").addEventListener("click", () => showView("create"));
  document.getElementById("btn-show-join").addEventListener("click", () => showView("join"));
  document.getElementById("create-back").addEventListener("click", (e) => {
    e.preventDefault();
    showView("landing");
  });
  document.getElementById("join-back").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("join-code-form").hidden = false;
    document.getElementById("join-nickname-form").hidden = true;
    showView("landing");
  });
}

requireLogin(auth, onAuthStateChanged, async (user) => {
  currentUser = user;
  myProfile = await getUserProfile(user.uid);
  renderSubjectGrid();
  wireLanding();
  wireCreateForm();
  wireJoinForms();
  wireHostLobby();
  wireHostActive();
  showView("landing");
});
