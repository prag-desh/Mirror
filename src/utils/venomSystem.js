// Living Organism UI System - Venom-style animated background

let canvas = null;
let ctx = null;
let animationId = null;
let blobs = [];
let isWaving = false;
let waveProgress = 0;
let waveOriginX = 0;
let waveOriginY = 0;
let maxRadius = 0;
let prefersReducedMotion = false;

// Emotional color states
const emotionalStates = {
  rejection: {
    bg: '#04050f',
    blobColor: 'rgba(30,60,180,0.1)',
    wave: {r:20, g:40, b:180},
    orb1: 'rgba(30,60,160,0.2)',
    orb2: 'rgba(60,80,200,0.12)',
  },
  attachment: {
    bg: '#0d0800',
    blobColor: 'rgba(220,100,20,0.12)',
    wave: {r:220, g:100, b:20},
    orb1: 'rgba(220,120,20,0.2)',
    orb2: 'rgba(200,80,40,0.15)',
  },
  suppression: {
    bg: '#040404',
    blobColor: 'rgba(40,40,60,0.06)',
    wave: {r:40, g:40, b:60},
    orb1: 'rgba(20,20,30,0.4)',
    orb2: 'rgba(15,15,20,0.6)',
  },
  fawn: {
    bg: '#0a0408',
    blobColor: 'rgba(200,80,130,0.1)',
    wave: {r:200, g:80, b:130},
    orb1: 'rgba(200,60,120,0.18)',
    orb2: 'rgba(240,140,80,0.12)',
  },
  cognitive: {
    bg: '#060408',
    blobColor: 'rgba(140,60,220,0.1)',
    wave: {r:140, g:60, b:220},
    orb1: 'rgba(140,60,220,0.2)',
    orb2: 'rgba(100,40,200,0.15)',
  },
  shame: {
    bg: '#080405',
    blobColor: 'rgba(120,20,40,0.08)',
    wave: {r:140, g:20, b:40},
    orb1: 'rgba(140,20,40,0.15)',
    orb2: 'rgba(100,10,20,0.1)',
  },
  default: {
    bg: '#06060a',
    blobColor: 'rgba(139,92,246,0.08)',
    wave: {r:80, g:40, b:160},
    orb1: 'rgba(139,92,246,0.15)',
    orb2: 'rgba(236,72,153,0.1)',
  }
};

// Pattern to state mapping
const patternToState = {
  "Rejection Anticipation": "rejection",
  "Anxious Attachment Activation": "attachment",
  "Abandonment Schema": "attachment",
  "Fearful Avoidant Conflict": "attachment",
  "Emotional Suppression": "suppression",
  "Emotional Numbing": "suppression",
  "Dissociative Avoidance": "suppression",
  "Alexithymia Response": "suppression",
  "Time Perception Distortion": "suppression",
  "Freeze Response": "suppression",
  "Fawn Response": "fawn",
  "People Pleasing Compulsion": "fawn",
  "Validation Hunger": "fawn",
  "Cognitive Distortion Loop": "cognitive",
  "Catastrophizing Spiral": "cognitive",
  "Rumination Cycle": "cognitive",
  "All-or-Nothing Processing": "cognitive",
  "Internalized Self-Doubt": "cognitive",
  "Shame Spiral": "shame",
  "Defectiveness Schema": "shame",
  "Core Wound Activation": "shame"
};

// Blob class for organic shapes
class Blob {
  constructor() {
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;
    this.radius = 60 + Math.random() * 90; // 60-150
    this.dx = (Math.random() - 0.5) * 0.8; // ±0.4 drift
    this.dy = (Math.random() - 0.5) * 0.8;
    this.phase = Math.random() * Math.PI * 2;
    this.phaseSpeed = 0.01 + Math.random() * 0.02;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
    this.phase += this.phaseSpeed;

    // Wrap at edges
    if (this.x < -this.radius) this.x = window.innerWidth + this.radius;
    if (this.x > window.innerWidth + this.radius) this.x = -this.radius;
    if (this.y < -this.radius) this.y = window.innerHeight + this.radius;
    if (this.y > window.innerHeight + this.radius) this.y = -this.radius;
  }

  draw(ctx, color) {
    const oscillation = Math.sin(this.phase) * 5;
    const currentRadius = this.radius + oscillation;
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

function init() {
  // Check if already initialized
  if (canvas) return;

  // Check for reduced motion preference
  prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Create canvas
  canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = '0';
  canvas.style.pointerEvents = 'none';
  
  ctx = canvas.getContext('2d');
  
  // Set canvas size
  resizeCanvas();
  
  // Create blobs
  blobs = [];
  for (let i = 0; i < 8; i++) {
    blobs.push(new Blob());
  }
  
  // Append to body
  document.body.appendChild(canvas);
  
  // Start animation
  animate();
  
  // Handle resize
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  maxRadius = Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2));
}

function animate() {
  if (!ctx || !canvas) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Get current state (default initially)
  const currentState = emotionalStates.default;
  
  // Draw blobs
  blobs.forEach(blob => {
    blob.update();
    blob.draw(ctx, currentState.blobColor);
  });
  
  // Draw wave if active
  if (isWaving && !prefersReducedMotion) {
    drawWave(currentState);
    waveProgress += 0.025;
    if (waveProgress >= 1) {
      isWaving = false;
      waveProgress = 0;
    }
  }
  
  animationId = requestAnimationFrame(animate);
}

function drawWave(state) {
  const radius = waveProgress * maxRadius;
  const opacity = Math.max(0, 1 - waveProgress);
  
  ctx.beginPath();
  ctx.arc(waveOriginX, waveOriginY, radius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${state.wave.r}, ${state.wave.g}, ${state.wave.b}, ${opacity * 0.3})`;
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Inner glow
  ctx.beginPath();
  ctx.arc(waveOriginX, waveOriginY, radius, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${state.wave.r}, ${state.wave.g}, ${state.wave.b}, ${opacity * 0.05})`;
  ctx.fill();
}

function activateVenom(patternName) {
  const stateName = patternToState[patternName] || 'default';
  const state = emotionalStates[stateName];
  
  if (!state) return;
  
  // Start wave animation
  if (!prefersReducedMotion) {
    waveOriginX = window.innerWidth / 2;
    waveOriginY = window.innerHeight / 2;
    waveProgress = 0;
    isWaving = true;
  }
  
  // Transition background
  document.body.style.transition = 'background 2500ms cubic-bezier(0.16,1,0.3,1)';
  document.body.style.background = state.bg;
  
  // Transition orbs
  const orb1 = document.querySelector('.orb-1');
  const orb2 = document.querySelector('.orb-2');
  
  if (orb1) {
    orb1.style.transition = 'background 2000ms ease';
    orb1.style.background = state.orb1;
  }
  
  if (orb2) {
    orb2.style.transition = 'background 2000ms ease';
    orb2.style.background = state.orb2;
  }
}

function resetVenom() {
  const state = emotionalStates.default;
  
  // No wave on reset
  isWaving = false;
  waveProgress = 0;
  
  // Reset background
  document.body.style.transition = 'background 1500ms cubic-bezier(0.16,1,0.3,1)';
  document.body.style.background = state.bg;
  
  // Reset orbs
  const orb1 = document.querySelector('.orb-1');
  const orb2 = document.querySelector('.orb-2');
  
  if (orb1) {
    orb1.style.transition = 'background 1500ms ease';
    orb1.style.background = state.orb1;
  }
  
  if (orb2) {
    orb2.style.transition = 'background 1500ms ease';
    orb2.style.background = state.orb2;
  }
}

function destroyVenom() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  
  if (canvas) {
    canvas.remove();
    canvas = null;
    ctx = null;
  }
  
  window.removeEventListener('resize', resizeCanvas);
  
  blobs = [];
  isWaving = false;
  waveProgress = 0;
}

// Auto-initialize on import
init();

export { activateVenom, resetVenom, destroyVenom };
