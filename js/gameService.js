// Firestore operations for the live multiplayer Game feature. A game
// lives at games/{code} (code doubles as the document ID) with players
// in a games/{code}/players/{uid} subcollection. No friendship is ever
// checked — anyone signed in can join with just the code.
import { db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  increment
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const CODE_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

function randomCode() {
  let code = "";
  for (let i = 0; i < 10; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export function normalizeCode(raw) {
  return String(raw ?? "").trim().toLowerCase();
}

async function generateUniqueCode() {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = randomCode();
    const snap = await getDoc(doc(db, "games", code));
    if (!snap.exists()) return code;
  }
  throw new Error("Couldn't generate a unique game code — please try again.");
}

// options: { hostUid, hostUsername, endType: "time"|"points", endValue: number, subjects: string[], randomNames: boolean }
export async function createGame(options) {
  const code = await generateUniqueCode();
  await setDoc(doc(db, "games", code), {
    code,
    hostUid: options.hostUid,
    hostUsername: options.hostUsername,
    status: "lobby",
    endType: options.endType,
    endValue: options.endValue,
    subjects: options.subjects,
    randomNames: options.randomNames,
    createdAt: serverTimestamp(),
    startedAt: null,
    endsAt: null,
    endedAt: null
  });
  return code;
}

export async function getGame(code) {
  const snap = await getDoc(doc(db, "games", code));
  return snap.exists() ? snap.data() : null;
}

export function listenToGame(code, callback) {
  return onSnapshot(doc(db, "games", code), (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}

export function listenToPlayers(code, callback) {
  return onSnapshot(collection(db, "games", code, "players"), (snap) => {
    const players = [];
    snap.forEach((d) => players.push({ uid: d.id, ...d.data() }));
    callback(players);
  });
}

export async function joinGame(code, uid, username, nickname) {
  await setDoc(doc(db, "games", code, "players", uid), {
    uid,
    username,
    nickname,
    score: 0,
    correct: 0,
    incorrect: 0,
    gemsAwarded: false,
    joinedAt: serverTimestamp()
  });
}

export async function startGame(code, endType, endValue) {
  const endsAt = endType === "time" ? Date.now() + endValue * 60000 : null;
  await updateDoc(doc(db, "games", code), {
    status: "active",
    startedAt: serverTimestamp(),
    endsAt
  });
}

export async function endGame(code) {
  await updateDoc(doc(db, "games", code), {
    status: "ended",
    endedAt: serverTimestamp()
  });
}

export async function recordAnswer(code, uid, wasCorrect) {
  const ref = doc(db, "games", code, "players", uid);
  await updateDoc(ref, wasCorrect
    ? { score: increment(1), correct: increment(1) }
    : { incorrect: increment(1) }
  );
}

// Awards double the player's correct-answer count in gems, exactly once
// per game (guarded by gemsAwarded on their own player doc, which only
// they can write). Also bumps their real users/{uid} profile — gems
// there can only ever increase, which this satisfies. Reads the correct
// count from the player's own Firestore doc (the authoritative source,
// updated on every answer) rather than trusting a locally-tracked
// counter, so a dropped network write can never desync awarded gems
// from the count shown on the final leaderboard.
export async function awardGemsOnce(code, uid) {
  const playerRef = doc(db, "games", code, "players", uid);
  const snap = await getDoc(playerRef);
  if (!snap.exists() || snap.data().gemsAwarded) return 0;
  const gems = (snap.data().correct || 0) * 2;
  await updateDoc(doc(db, "users", uid), { gems: increment(gems) });
  await updateDoc(playerRef, { gemsAwarded: true });
  return gems;
}
