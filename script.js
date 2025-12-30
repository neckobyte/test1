/* =======================
   1. CONFIGURATION
======================= */
const particleContainer = document.getElementById("particles");


/* =======================
   2. PARTICLES LOGIC (unchanged)
======================= */
const MAX_PARTICLES = 120;
const SPAWN_INTERVAL = 120;

function createParticle() {
  const particle = document.createElement("span");
  particle.style.left = `${Math.random() * 100}vw`;
  particle.style.top = `${50 + Math.random() * 50}vh`;
  
  const size = 1 + Math.random() * 7;
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  
  const duration = 8 + Math.random() * 16;
  particle.style.animationDuration = `${duration}s`;
  
  particleContainer.appendChild(particle);
  
  setTimeout(() => {
    particle.remove();
  }, duration * 1000);
}

setInterval(() => {
  if (particleContainer.children.length < MAX_PARTICLES) {
    createParticle();
  }
}, SPAWN_INTERVAL);


/* -----------------------------
   DELAY IMAGE REEL ON LOAD
------------------------------*/
window.addEventListener("load", () => {
  setTimeout(() => {
    track.classList.add("reveal");
  }, 3200); // 3.2s delay (tweak if needed)
});


/* =======================
   IMAGE TRACK + TITLE SYNC
======================= */

const track = document.getElementById("image-track");
const images = track.getElementsByClassName("image");
const title = document.querySelector(".title");

let currentPercentage = 0;
let snapTimeout = null;

// Tweakables
const SCROLL_SPEED = 0.12;
const SNAP_DELAY = 120;
const ANIMATION_TIME = 700;

// Title motion limits (px)
const TITLE_MOVE_MAX = 150;

// Snap math
const imageCount = images.length;
const maxScroll = 100;
const snapStep = maxScroll / (imageCount - 1);

/* -----------------------------
   UPDATE TRACK + TITLE
------------------------------*/
function updateScene(percentage, duration = 400) {
  // Image track
  track.animate(
    { transform: `translate(${percentage}%, -50%)` },
    { duration, fill: "forwards", easing: "ease-out" }
  );

  for (const image of images) {
    image.animate(
      { objectPosition: `${100 + percentage}% center` },
      { duration, fill: "forwards", easing: "ease-out" }
    );
  }

  // Title sync
  const progress = Math.abs(percentage) / maxScroll;
  const titleOffset = progress * TITLE_MOVE_MAX;

  title.animate(
    { transform: `translateY(-${titleOffset}px)` },
    { duration, fill: "forwards", easing: "ease-out" }
  );

  //  NEW: update active image
  updateActiveImageByIndex();
}



function updateActiveImageByIndex() {
  const index = Math.round(
    Math.abs(currentPercentage) / snapStep
  );

  for (let i = 0; i < images.length; i++) {
    images[i].style.transform =
      i === index ? "scale(1.56)" : "scale(0.96)";

  }
}




/* -----------------------------
   SNAP TO NEAREST IMAGE
------------------------------*/
function snapToNearest() {
  const snapped =
    Math.round(Math.abs(currentPercentage) / snapStep) * snapStep;

  currentPercentage = -snapped;
  updateScene(currentPercentage, ANIMATION_TIME);

  setTimeout(updateActiveImageByIndex, ANIMATION_TIME);

}


/* -----------------------------
   HORIZONTAL SCROLL HANDLER
------------------------------*/
window.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();

    // Prefer horizontal scroll (trackpad / shift+wheel)
    const delta =
      Math.abs(e.deltaX) > Math.abs(e.deltaY)
        ? e.deltaX
        : e.deltaY;

    currentPercentage -= delta * SCROLL_SPEED;

    // Clamp
    currentPercentage = Math.max(
      Math.min(currentPercentage, 0),
      -maxScroll
    );

    updateScene(currentPercentage);

    clearTimeout(snapTimeout);
    snapTimeout = setTimeout(snapToNearest, SNAP_DELAY);
  },
  { passive: false }
);



/* =======================
   TOUCH SUPPORT (MOBILE)
======================= */

let touchStartX = 0;
let touchCurrentX = 0;
let isTouching = false;

// Sensitivity (higher = faster swipe)
const TOUCH_SPEED = 0.25;

window.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  isTouching = true;
  clearTimeout(snapTimeout);
}, { passive: true });

window.addEventListener("touchmove", (e) => {
  if (!isTouching) return;

  // 🔴 Stop native horizontal page movement
  e.preventDefault();

  touchCurrentX = e.touches[0].clientX;
  const deltaX = touchCurrentX - touchStartX;
  touchStartX = touchCurrentX;

  currentPercentage += deltaX * TOUCH_SPEED;

  currentPercentage = Math.max(
    Math.min(currentPercentage, 0),
    -maxScroll
  );

  updateScene(currentPercentage, 120);
}, { passive: false });

window.addEventListener("touchend", () => {
  if (!isTouching) return;

  isTouching = false;
  snapTimeout = setTimeout(snapToNearest, SNAP_DELAY);
});
