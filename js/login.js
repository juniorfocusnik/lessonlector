import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { ensureUserProfile } from "./progress.js";

const form = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const formAlert = document.getElementById("form-alert");
const submitBtn = document.getElementById("login-submit");

function showAlert(message) {
  formAlert.textContent = message;
  formAlert.hidden = !message;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  showAlert("");

  const usernameLower = usernameInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  if (!usernameLower || !password) {
    showAlert("Please enter both your username and password.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Logging in...";

  try {
    // Firebase Auth signs in with an email, but this form only collects a
    // username — so the matching synthetic email is looked up in Firestore
    // (written at signup time) before calling signInWithEmailAndPassword.
    const snap = await getDoc(doc(db, "usernames", usernameLower));
    if (!snap.exists()) {
      showAlert("No account found with that username.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Log In";
      return;
    }

    const { email, displayName } = snap.data();
    const credential = await signInWithEmailAndPassword(auth, email, password);
    // Backfills a public profile doc for accounts created before this
    // feature existed (e.g. accounts made during earlier testing).
    await ensureUserProfile(credential.user.uid, displayName || usernameLower);
    window.location.href = "../dashboard/index.html";
  } catch (err) {
    if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
      showAlert("Incorrect password. Please try again.");
    } else if (err.code === "auth/too-many-requests") {
      showAlert("Too many attempts. Please wait a moment and try again.");
    } else {
      showAlert("Something went wrong: " + err.message);
    }
    submitBtn.disabled = false;
    submitBtn.textContent = "Log In";
  }
});
