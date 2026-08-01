import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getUserProfile } from "./progress.js";
import { STARS } from "./data/webs.js";
import { requireLogin } from "./util.js";
import { initBadgeCarousel } from "./carousel.js";

requireLogin(auth, onAuthStateChanged, async (user) => {
  const profile = await getUserProfile(user.uid);
  initBadgeCarousel({
    containerId: "stars-carousel",
    items: STARS,
    earnedIds: new Set(profile.stars || []),
    icon: "⭐",
    emptyMessage: "No stars exist yet."
  });
});
