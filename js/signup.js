import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { ensureUserProfile } from "./progress.js";

// Firebase Auth only understands email/password, not usernames — so a
// synthetic, never-emailed address is derived from the username instead.
// Firebase Auth enforces unique emails for us, which means it also
// enforces unique usernames with no extra work.
const EMAIL_DOMAIN = "lessonlector-users.app";
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

function usernameToEmail(usernameLower) {
  return `${usernameLower}@${EMAIL_DOMAIN}`;
}

const form = document.getElementById("signup-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirm-password");
const agreeTerms = document.getElementById("agree-terms");
const usernameStatus = document.getElementById("username-status");
const confirmStatus = document.getElementById("confirm-status");
const formAlert = document.getElementById("form-alert");
const submitBtn = document.getElementById("signup-submit");

function showAlert(message) {
  formAlert.textContent = message;
  formAlert.hidden = !message;
}

let checkTimer;
usernameInput.addEventListener("input", () => {
  clearTimeout(checkTimer);
  const value = usernameInput.value.trim();

  if (!value) {
    usernameStatus.textContent = "";
    usernameStatus.className = "field-status";
    return;
  }

  if (!USERNAME_RE.test(value)) {
    usernameStatus.textContent = "3-20 characters: letters, numbers, underscores only.";
    usernameStatus.className = "field-status status-error";
    return;
  }

  usernameStatus.textContent = "Checking availability...";
  usernameStatus.className = "field-status";

  checkTimer = setTimeout(async () => {
    try {
      const snap = await getDoc(doc(db, "usernames", value.toLowerCase()));
      if (snap.exists()) {
        usernameStatus.textContent = "Username is already taken.";
        usernameStatus.className = "field-status status-error";
      } else {
        usernameStatus.textContent = "Username is available.";
        usernameStatus.className = "field-status status-success";
      }
    } catch (err) {
      usernameStatus.textContent = "";
    }
  }, 450);
});

confirmInput.addEventListener("input", () => {
  if (!confirmInput.value) {
    confirmStatus.textContent = "";
    confirmStatus.className = "field-status";
    return;
  }
  if (confirmInput.value === passwordInput.value) {
    confirmStatus.textContent = "Passwords match.";
    confirmStatus.className = "field-status status-success";
  } else {
    confirmStatus.textContent = "Passwords do not match.";
    confirmStatus.className = "field-status status-error";
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  showAlert("");

  const username = usernameInput.value.trim();
  const usernameLower = username.toLowerCase();
  const password = passwordInput.value;
  const confirmPassword = confirmInput.value;

  if (!USERNAME_RE.test(username)) {
    showAlert("Username must be 3-20 characters: letters, numbers, underscores only.");
    return;
  }
  if (password.length < 6) {
    showAlert("Password must be at least 6 characters.");
    return;
  }
  if (password !== confirmPassword) {
    showAlert("Passwords do not match.");
    return;
  }
  if (!agreeTerms.checked) {
    showAlert("You must agree to the Terms of Service to create an account.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Creating account...";

  const email = usernameToEmail(usernameLower);

  try {
    // If this succeeds, Firebase Auth has just confirmed the (synthetic)
    // email — and therefore the username — was unique. No separate
    // reservation step is needed to prevent a race condition.
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: username });
    await setDoc(doc(db, "usernames", usernameLower), {
      uid: credential.user.uid,
      email,
      displayName: username,
      createdAt: serverTimestamp()
    });
    await ensureUserProfile(credential.user.uid, username);
    window.location.href = "../dashboard/index.html";
  } catch (err) {
    if (err.code === "auth/email-already-in-use") {
      showAlert("That username is already taken. Please choose another.");
    } else if (err.code === "auth/weak-password") {
      showAlert("Password is too weak. Use at least 6 characters.");
    } else {
      showAlert("Something went wrong: " + err.message);
    }
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Account";
  }
});
