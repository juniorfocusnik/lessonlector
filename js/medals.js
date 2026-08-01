import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getUserProfile } from "./progress.js";
import { MEDALS } from "./data/webs.js";
import { requireLogin } from "./util.js";
import { initBadgeCarousel } from "./carousel.js";

requireLogin(auth, onAuthStateChanged, async (user) => {
  const profile = await getUserProfile(user.uid);
  initBadgeCarousel({
    containerId: "medals-carousel",
    items: MEDALS,
    earnedIds: new Set(profile.medals || []),
    icon: "🎖️",
    emptyMessage: "No medals exist yet."
  });
});
