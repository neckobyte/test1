/* =======================
   1. CONFIGURATION
======================= */
const particleContainer = document.getElementById("particles");
const isMobile = window.matchMedia("(max-width: 768px)").matches;
let carouselReady = false;


/* =======================
   2. PARTICLES LOGIC (unchanged)
======================= */

const MAX_PARTICLES = isMobile ? 40 : 120;
const SPAWN_INTERVAL = isMobile ? 200 : 120;

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
let images = [];  // For dyanamic loading on images 
const title = document.querySelector(".title");

let currentPercentage = 0;
let snapTimeout = null;

// Tweakables
const SCROLL_SPEED = 0.05;
const SNAP_DELAY = 120;
const ANIMATION_TIME = 700;

// Title motion limits (px)
const TITLE_MOVE_MAX = 150;

// Snap math
let imageCount = 0;
let snapStep = 0;
const maxScroll = 100;

/* -----------------------------
   UPDATE TRACK + TITLE
------------------------------*/
function updateScene(percentage, duration = 400) {
  if (!carouselReady) return; // 🔥 STOP NaN propagation
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

  // Only update subtitle and active image if not touching
  if (!isTouching){
    // Subtitle sync
    updateSubtitle(percentage);

    //  NEW: update active image
    updateActiveImageByIndex();
  }
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
const TOUCH_SPEED = 0.14;

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

  updateScene(currentPercentage, isMobile ? 90 : 120);
}, { passive: false });

window.addEventListener("touchend", () => {
  if (!isTouching) return;

  isTouching = false;

  // Re-apply all effects cleanly after touch
  updateSubtitle(currentPercentage);
  updateActiveImageByIndex();

  snapTimeout = setTimeout(snapToNearest, SNAP_DELAY);
});

/* =======================
   Image Count & Snap Recalculation
======================= */
function recalcCarouselMetrics() {
  images = track.getElementsByClassName("image");
  imageCount = images.length;

  if (imageCount <= 1) {
    snapStep = 0;
    return;
  }

  snapStep = maxScroll / (imageCount - 1);
}


/* =======================
   SECURE IMAGE LOADER
======================= */

const params = new URLSearchParams(window.location.search);
const token = params.get("t");

if (!token) {
  document.body.innerHTML = "Invalid or missing link.";
  throw new Error("Missing token");
}

fetch(
  "https://fdqfbpoqxc.execute-api.ap-south-1.amazonaws.com/default/images?token=" + token
)
  .then(res => {
    if (!res.ok) throw new Error("Access denied");
    return res.json();
  })
  .then(urls => {
    let loaded = 0;

    urls.forEach(url => {
      const img = document.createElement("img");
      img.src = url;
      img.className = "image";
      img.draggable = false;

      img.onload = () => {
        loaded++;

        if (loaded === urls.length) {
          // 🔥 ALL IMAGES READY — ENABLE CAROUSEL
          carouselReady = true;

          // Recalculate ONCE
          images = track.getElementsByClassName("image");
          imageCount = images.length;
          snapStep = maxScroll / (imageCount - 1);

          // Lock start position
          currentPercentage = 0;
          updateScene(0, 0);
        }
      };

      track.appendChild(img);
    });
  })
  .catch(() => {
    document.body.innerHTML = "This link is invalid or expired.";
  });


/* =======================
   AUDIO PERMISSION FLOW
======================= */

document.addEventListener("DOMContentLoaded", () => {
  const music = document.getElementById("bg-music");
  const overlay = document.getElementById("audio-permission");
  const button = document.getElementById("enable-audio");

  if (!music || !overlay || !button) return;

  button.addEventListener("click", () => {
    music.volume = 0;

    music.play().then(() => {
      // Fade in
      let v = 0;
      const fade = setInterval(() => {
        v += 0.02;
        music.volume = Math.min(v, 0.6);
        if (v >= 0.6) clearInterval(fade);
      }, 50);

      // Hide overlay
      overlay.style.opacity = "0";
      overlay.style.pointerEvents = "none";
      setTimeout(() => overlay.remove(), 300);
    });
  });
});

/* =======================
   GLOWING FROST TRAIL
======================= */

const trailLayer = document.getElementById("trail-layer");

let lastSpawn = 0;
const MIST_SPAWN_INTERVAL = 40;

function spawnMist(x, y) {
  if (!trailLayer) return;

  const now = performance.now();
  if (now - lastSpawn < MIST_SPAWN_INTERVAL) return;
  lastSpawn = now;

  const p = document.createElement("div");
  p.className = "trail-particle";

  // Random frost shape
  const variants = ["frost-a", "frost-b", "frost-c"];
  const variant = variants[Math.floor(Math.random() * variants.length)];
  p.classList.add(variant);

  // Position with slight offset
  const offsetX = (Math.random() - 0.5) * 14;
  const offsetY = (Math.random() - 0.5) * 14;
  p.style.left = `${x + offsetX}px`;
  p.style.top = `${y + offsetY}px`;

  // Rotation
  p.style.setProperty("--rot", `${Math.random() * 360}deg`);

  // Drift (mist motion)
  const driftX = (Math.random() - 0.5) * 14;
  const driftY = (Math.random() - 0.5) * 14;
  p.style.setProperty("--dx", `${driftX}px`);
  p.style.setProperty("--dy", `${driftY}px`);

  trailLayer.appendChild(p);

  setTimeout(() => p.remove(), 1400);
}

/* Mouse */
window.addEventListener("mousemove", (e) => {
  spawnMist(e.clientX, e.clientY);
});

/* Touch */
window.addEventListener(
  "touchmove",
  (e) => {
    if (!e.touches[0]) return;
    spawnMist(e.touches[0].clientX, e.touches[0].clientY);
  },
  { passive: true }
);
