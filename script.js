/* =======================
   1. CONFIGURATION
======================= */
const particleContainer = document.getElementById("particles");
const frame = document.querySelector(".sticky-frame");
const frameImage = document.getElementById("frameImage");
const steps = document.querySelectorAll(".step");
const storySection = document.getElementById("story");

// List your images here exactly as they appear in your folder
const imageUrls = [
  "images/frame-1.jpg", 
  "images/frame-2.jpg", 
  "images/frame-3.jpg", 
  "images/frame-4.jpg"
];

/* =======================
   2. IMAGE PRELOADER (The Fix)
======================= */
// This forces the browser to download all images immediately
function preloadImages() {
  imageUrls.forEach((url) => {
    const img = new Image();
    img.src = url;
    // We don't need to do anything with 'img', just creating it 
    // forces the browser to download and cache the file.
  });
}

// Run preloader as soon as script loads
preloadImages();


/* =======================
   3. PARTICLES LOGIC
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


/* =======================
   4. SCROLL STORYTELLING
======================= */
let currentImage = "";

function onScroll() {
  const storyRect = storySection.getBoundingClientRect();

  // Show/Hide the sticky frame based on scroll position
  if (storyRect.top < window.innerHeight && storyRect.bottom > 0) {
    frame.classList.remove("hidden");
  } else {
    frame.classList.add("hidden");
  }

  // Find which step is currently active
  steps.forEach((step) => {
    const rect = step.getBoundingClientRect();
    
    // If the step is roughly in the middle of the screen
    if (rect.top >= 0 && rect.top < window.innerHeight * 0.6) {
      
      // Update Active Class
      steps.forEach(s => s.classList.remove("active"));
      step.classList.add("active");

      // Swap Image (Only if it's different)
      const newSrc = step.dataset.image;
      if (newSrc && newSrc !== currentImage) {
        currentImage = newSrc;
        
        // Instant swap (relies on preloader for smoothness)
        frameImage.src = newSrc;
      }
    }
  });
}

// Performance optimization: run onScroll only when needed
window.addEventListener("scroll", () => {
  window.requestAnimationFrame(onScroll);
});