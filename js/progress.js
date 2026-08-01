// All Firestore reads/writes for user profiles, lesson progress, gems,
// medals, stars, friends, blocking, and chat live here so every page can
// share the same logic instead of re-implementing it.
import { db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  query,
  orderBy,
  where,
  limit,
  startAt,
  endAt,
  arrayUnion,
  increment,
  serverTimestamp,
  onSnapshot,
  writeBatch
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { getWebById } from "./data/webs.js";

// ---------- User profile ----------

// usernames/{usernameLower} is the source of truth for "what is this
// uid's real username" — it's written once at signup with the correct,
// original-case name and never touched again. Returns null (not a
// guess) if it can't be found yet — e.g. the brief window mid-signup
// before that doc has been written.
async function resolveTrueUsername(uid) {
  try {
    const q = query(collection(db, "usernames"), where("uid", "==", uid), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const data = snap.docs[0].data();
      return data.displayName || snap.docs[0].id;
    }
  } catch (err) {
    // Treated the same as "not found yet" below.
  }
  return null;
}

export async function ensureUserProfile(uid, fallbackUsername) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  const trueUsername = await resolveTrueUsername(uid);

  if (!snap.exists()) {
    const username = trueUsername || fallbackUsername;
    await setDoc(ref, {
      uid,
      username,
      usernameLower: username.toLowerCase(),
      displayName: username,
      gems: 0,
      medals: [],
      medalsCount: 0,
      stars: [],
      starsCount: 0,
      createdAt: serverTimestamp()
    });
    return;
  }

  // Self-heal any time the verified true username differs from what's
  // stored — covers a profile created from a guessed fallback (a raw
  // uid, or a lowercase email-derived name) before signup's own,
  // authoritative usernames/ doc had been written yet. If the lookup
  // above returned null, the signup flow just hasn't finished yet —
  // leave the doc alone and it'll self-correct on the very next load.
  const existing = snap.data();
  if (trueUsername && existing.username !== trueUsername) {
    await updateDoc(ref, {
      username: trueUsername,
      usernameLower: trueUsername.toLowerCase(),
      displayName: trueUsername
    });
  }
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { uid, ...snap.data() } : null;
}

export async function searchUsersByUsername(term) {
  const lower = term.trim().toLowerCase();
  if (!lower) return [];
  const q = query(
    collection(db, "users"),
    orderBy("usernameLower"),
    startAt(lower),
    endAt(lower + ""),
    limit(10)
  );
  const snap = await getDocs(q);
  const results = [];
  snap.forEach((d) => results.push({ uid: d.id, ...d.data() }));
  return results;
}

// Every registered user, ranked by the chosen stat — no cap. The
// leaderboard page slices this into pages of 50 itself, however many
// pages that ends up being.
export async function fetchLeaderboard(filter = "gems") {
  const field = filter === "medals" ? "medalsCount" : filter === "stars" ? "starsCount" : "gems";
  const q = query(collection(db, "users"), orderBy(field, "desc"));
  const snap = await getDocs(q);
  const results = [];
  snap.forEach((d) => results.push({ uid: d.id, ...d.data() }));
  return results;
}

// ---------- Lesson progress ----------

export async function getAllProgress(uid) {
  const snap = await getDocs(collection(db, "users", uid, "nodeProgress"));
  const completed = new Set();
  snap.forEach((d) => {
    if (d.data().completed) completed.add(d.id);
  });
  return completed;
}

export async function getRecentCompletions(uid, count = 5) {
  const q = query(
    collection(db, "users", uid, "nodeProgress"),
    orderBy("completedAt", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  const list = [];
  snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
  return list;
}

export function isNodeUnlocked(node, completedSet) {
  return node.requires.every((r) => completedSet.has(r));
}

async function maybeAwardStar(uid, webId) {
  const web = getWebById(webId);
  const completed = await getAllProgress(uid);
  const finalNode = web.nodes.find((n) => n.kind === "finalExam");
  const allDone = web.nodes.every((n) => !n.requiredForStar || completed.has(n.id));

  if (!allDone || !completed.has(finalNode.id)) return false;

  const profile = await getUserProfile(uid);
  if (profile.stars && profile.stars.includes(web.starId)) return false;

  await updateDoc(doc(db, "users", uid), {
    stars: arrayUnion(web.starId),
    starsCount: increment(1)
  });
  return true;
}

// Records that `node` was completed by `uid`. Awards gems the first time,
// a medal the first time a test is completed, and checks for a star the
// moment a final exam is completed. Safe to call again on an already
// completed node — gems/medals are only ever granted once per node.
export async function recordNodeCompletion(uid, node) {
  const progressRef = doc(db, "users", uid, "nodeProgress", node.id);
  const progressSnap = await getDoc(progressRef);
  const alreadyCompleted = progressSnap.exists() && progressSnap.data().completed;

  let awardedMedal = null;

  if (!alreadyCompleted) {
    await setDoc(progressRef, {
      completed: true,
      webId: node.webId,
      title: node.title,
      kind: node.kind,
      completedAt: serverTimestamp()
    });

    const updates = { gems: increment(node.gems) };
    if (node.kind === "test") {
      updates.medals = arrayUnion(node.medalId);
      updates.medalsCount = increment(1);
      awardedMedal = node.medalId;
    }
    await updateDoc(doc(db, "users", uid), updates);
  }

  let awardedStar = null;
  if (node.kind === "finalExam") {
    const didAward = await maybeAwardStar(uid, node.webId);
    if (didAward) awardedStar = getWebById(node.webId).starId;
  }

  return { alreadyCompleted, awardedMedal, awardedStar };
}

// ---------- Friends / requests / blocking ----------
// Convention: inside a user's `friends`, `friendRequestsIncoming`,
// `friendRequestsOutgoing`, and `blocked` subcollections, the document ID
// is always the *other* user's uid. See the Firestore rules explanation
// for how this makes the security rules straightforward.

export async function getFriendsList(uid) {
  const snap = await getDocs(collection(db, "users", uid, "friends"));
  const list = [];
  snap.forEach((d) => list.push({ uid: d.id, ...d.data() }));
  return list;
}

export async function getIncomingRequests(uid) {
  const snap = await getDocs(collection(db, "users", uid, "friendRequestsIncoming"));
  const list = [];
  snap.forEach((d) => list.push({ uid: d.id, ...d.data() }));
  return list;
}

export async function getOutgoingRequests(uid) {
  const snap = await getDocs(collection(db, "users", uid, "friendRequestsOutgoing"));
  const list = [];
  snap.forEach((d) => list.push({ uid: d.id, ...d.data() }));
  return list;
}

export async function getBlockedList(uid) {
  const snap = await getDocs(collection(db, "users", uid, "blocked"));
  const list = [];
  snap.forEach((d) => list.push({ uid: d.id, ...d.data() }));
  return list;
}

// Returns one of: "self" | "friends" | "outgoingPending" | "incomingPending"
// | "blockedByMe" | "none". (A block placed on you by someone else isn't
// exposed here — the write will simply fail via security rules.)
export async function getRelationshipStatus(myUid, otherUid) {
  if (myUid === otherUid) return "self";
  const [friendSnap, outSnap, inSnap, blockedSnap] = await Promise.all([
    getDoc(doc(db, "users", myUid, "friends", otherUid)),
    getDoc(doc(db, "users", myUid, "friendRequestsOutgoing", otherUid)),
    getDoc(doc(db, "users", myUid, "friendRequestsIncoming", otherUid)),
    getDoc(doc(db, "users", myUid, "blocked", otherUid))
  ]);
  if (blockedSnap.exists()) return "blockedByMe";
  if (friendSnap.exists()) return "friends";
  if (outSnap.exists()) return "outgoingPending";
  if (inSnap.exists()) return "incomingPending";
  return "none";
}

export async function sendFriendRequest(fromUid, fromProfile, toUid, toProfile) {
  const batch = writeBatch(db);
  batch.set(doc(db, "users", toUid, "friendRequestsIncoming", fromUid), {
    username: fromProfile.username,
    displayName: fromProfile.displayName,
    sentAt: serverTimestamp()
  });
  batch.set(doc(db, "users", fromUid, "friendRequestsOutgoing", toUid), {
    username: toProfile.username,
    displayName: toProfile.displayName,
    sentAt: serverTimestamp()
  });
  await batch.commit();
}

export async function cancelFriendRequest(fromUid, toUid) {
  const batch = writeBatch(db);
  batch.delete(doc(db, "users", toUid, "friendRequestsIncoming", fromUid));
  batch.delete(doc(db, "users", fromUid, "friendRequestsOutgoing", toUid));
  await batch.commit();
}

export async function declineFriendRequest(myUid, fromUid) {
  const batch = writeBatch(db);
  batch.delete(doc(db, "users", myUid, "friendRequestsIncoming", fromUid));
  batch.delete(doc(db, "users", fromUid, "friendRequestsOutgoing", myUid));
  await batch.commit();
}

export async function acceptFriendRequest(myUid, myProfile, otherUid, otherProfile) {
  const batch = writeBatch(db);
  batch.delete(doc(db, "users", myUid, "friendRequestsIncoming", otherUid));
  batch.delete(doc(db, "users", otherUid, "friendRequestsOutgoing", myUid));
  batch.set(doc(db, "users", myUid, "friends", otherUid), {
    username: otherProfile.username,
    displayName: otherProfile.displayName,
    since: serverTimestamp()
  });
  batch.set(doc(db, "users", otherUid, "friends", myUid), {
    username: myProfile.username,
    displayName: myProfile.displayName,
    since: serverTimestamp()
  });
  await batch.commit();
}

export async function removeFriend(myUid, otherUid) {
  const batch = writeBatch(db);
  batch.delete(doc(db, "users", myUid, "friends", otherUid));
  batch.delete(doc(db, "users", otherUid, "friends", myUid));
  await batch.commit();
}

export async function blockUser(myUid, otherUid, otherProfile) {
  const batch = writeBatch(db);
  batch.set(doc(db, "users", myUid, "blocked", otherUid), {
    username: otherProfile.username,
    displayName: otherProfile.displayName,
    blockedAt: serverTimestamp()
  });
  batch.delete(doc(db, "users", myUid, "friends", otherUid));
  batch.delete(doc(db, "users", otherUid, "friends", myUid));
  await batch.commit();
}

export async function unblockUser(myUid, otherUid) {
  await deleteDoc(doc(db, "users", myUid, "blocked", otherUid));
}

// ---------- Chat ----------

export function chatIdFor(uidA, uidB) {
  return [uidA, uidB].sort().join("_");
}

export async function ensureChatDoc(uidA, uidB) {
  const chatId = chatIdFor(uidA, uidB);
  const ref = doc(db, "chats", chatId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      participants: [uidA, uidB].sort(),
      createdAt: serverTimestamp()
    });
  }
  return chatId;
}

export function listenToMessages(chatId, callback) {
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("sentAt", "asc"),
    limit(200)
  );
  return onSnapshot(q, (snap) => {
    const messages = [];
    snap.forEach((d) => messages.push({ id: d.id, ...d.data() }));
    callback(messages);
  });
}

export async function sendMessage(chatId, fromUid, text) {
  await addDoc(collection(db, "chats", chatId, "messages"), {
    from: fromUid,
    text,
    sentAt: serverTimestamp()
  });
}
