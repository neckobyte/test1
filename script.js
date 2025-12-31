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

  // Fade starts early and finishes smoothly by 2nd image
  const fadeProgress = Math.min(
    Math.abs(percentage) / snapStep,
    1
  );
  const opacity = 1 - fadeProgress;

  // Optional wipe feel (slight scale)
  const scale = 1 - progress * 0.05;


  title.animate(
    {
      transform: `translateY(-${titleOffset}px) scale(${scale})`,
      opacity: opacity
    },
    { duration, fill: "forwards", easing: "ease-out" }
  );

  // Subtitle sync
  updateSubtitle(percentage);
  
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


/* --------------------
   UPDATE SUBTITLE
---------------------*/
const subtitle = document.querySelector(".subtitle");
function updateSubtitle(percentage) {
  // Fade fully by second image
  const fadeProgress = Math.min(
    Math.abs(percentage) / snapStep,
    1
  );

  // Gentle ease-out curve
  const easedFade = Math.pow(fadeProgress, 0.85);

  // Subtle downward drift
  const offsetY = easedFade * 24;

  subtitle.animate(
    {
      transform: `translateY(${offsetY}px)`,
      opacity: 1 - easedFade
    },
    {
      duration: 400,
      fill: "forwards",
      easing: "ease-out"
    }
  );
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
