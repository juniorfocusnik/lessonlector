// Subtle parallax glow that follows the cursor across the hero section
const orbs = document.querySelectorAll(".glow-orb");

window.addEventListener("mousemove", (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 2;
  const y = (e.clientY / window.innerHeight - 0.5) * 2;

  orbs.forEach((orb, i) => {
    const strength = (i + 1) * 12;
    orb.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  });
});
