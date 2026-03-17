
/* ========================
   1. DOOR ANIMATION
======================== */
function openDoors() {
  const doorLeft = document.querySelector('.door-left');
  const doorRight = document.querySelector('.door-right');
  const wrapper = document.getElementById('door-wrapper');
  const hint = document.querySelector('.door-hint');

  if (doorLeft.classList.contains('open')) return;
  
  doorLeft.classList.add('open');
  doorRight.classList.add('open');
  if (hint) hint.style.opacity = '0';
  
  // Auto-play music when doors are clicked
  if (!musicPlaying) toggleMusic();

  // Prepare invitation
  const invitation = document.getElementById('invitation');
  invitation.classList.remove('hidden');
  invitation.style.opacity = '0';
  invitation.style.transform = 'scale(0.95)';
  invitation.style.transition = 'opacity 1.5s ease-out, transform 1.5s cubic-bezier(0.25, 1, 0.5, 1)';

  // Reveal invitation as doors open
  setTimeout(() => {
    requestAnimationFrame(() => {
      invitation.style.opacity = '1';
      invitation.style.transform = 'scale(1)';
    });
  }, 100); // Slight delay

  // After doors fully open, hide wrapper and init page
  setTimeout(() => {
    wrapper.classList.add('gone');
    wrapper.style.display = 'none';
    initPage();
  }, 1500); // Matches the 1.5s transition time
}

/* ========================
   2. PAGE INIT (after opening)
======================== */
function initPage() {
  startCountdown();
  initScrollAnimations();
  initScrollTop();
}

/* ========================
   3. COUNTDOWN TIMER
======================== */
function startCountdown() {
  const weddingDate = new Date('2026-03-22T10:00:00');

  function update() {
    const now = new Date();
    const diff = weddingDate - now;

    if (diff <= 0) {
      document.getElementById('cd-days').textContent = '00';
      document.getElementById('cd-hours').textContent = '00';
      document.getElementById('cd-mins').textContent = '00';
      document.getElementById('cd-secs').textContent = '00';
      return;
    }

    const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs  = Math.floor((diff % (1000 * 60)) / 1000);

    setNum('cd-days',  days);
    setNum('cd-hours', hours);
    setNum('cd-mins',  mins);
    setNum('cd-secs',  secs);
  }

  function setNum(id, val) {
    const el = document.getElementById(id);
    const str = String(val).padStart(2, '0');
    if (el.textContent !== str) {
      el.textContent = str;
      el.classList.remove('tick');
      void el.offsetWidth; // reflow
      el.classList.add('tick');
    }
  }

  update();
  setInterval(update, 1000);
}

/* ========================
   4. SCROLL ANIMATIONS
======================== */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up, .fade-left, .fade-right, .zoom-in, .story-card, .event-card, .wish-card')
    .forEach(el => observer.observe(el));
}

/* ========================
   5. FALLING PETALS CANVAS
======================== */
function initPetals() {
  console.log('initPetals starting...');
  const canvas = document.getElementById('petals-canvas');
  if (!canvas) {
    console.error('Canvas not found!');
    return;
  }
  const ctx = canvas.getContext('2d');
  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }, 200);
  });

  const COLORS = ['#e31b23', '#ff4d6d', '#ff758f', '#ff8fa3', '#ffb3c1', '#c9184a'];
  const isMobile = window.innerWidth < 768;
  const HEART_COUNT = isMobile ? 30 : 60;
  const hearts = [];

  class Heart {
    constructor() { this.reset(true); }

    reset(initScattered = false) {
      this.x = Math.random() * W;
      this.y = initScattered ? Math.random() * H : -50;
      this.size = 12 + Math.random() * 10; // Slightly larger for visibility
      this.speedY = 1.0 + Math.random() * 2.5;
      this.speedX = (Math.random() - 0.5) * 1.0;
      this.rot    = Math.random() * Math.PI * 2;
      this.rotSpd = (Math.random() - 0.5) * 0.05;
      this.alpha  = 0.6 + Math.random() * 0.4;
      this.color  = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.wave   = Math.random() * Math.PI * 2;
      this.waveAmp = 1.0 + Math.random() * 2.0;
    }

    update() {
      this.wave += 0.04;
      this.x += this.speedX + Math.sin(this.wave) * this.waveAmp;
      this.y += this.speedY;
      this.rot += this.rotSpd;
      if (this.y > H + 50) this.reset();
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.beginPath();
      // Heart path
      const s = this.size;
      ctx.moveTo(0, s * 0.3);
      ctx.bezierCurveTo(0, 0, -s * 0.5, 0, -s * 0.5, s * 0.3);
      ctx.bezierCurveTo(-s * 0.5, s * 0.6, 0, s * 0.8, 0, s);
      ctx.bezierCurveTo(0, s * 0.8, s * 0.5, s * 0.6, s * 0.5, s * 0.3);
      ctx.bezierCurveTo(s * 0.5, 0, 0, 0, 0, s * 0.3);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < HEART_COUNT; i++) hearts.push(new Heart());

  function animate() {
    ctx.clearRect(0, 0, W, H);
    hearts.forEach(h => { h.update(); h.draw(); });
    requestAnimationFrame(animate);
  }
  console.log('Heart rain animation started with', HEART_COUNT, 'hearts.');
  animate();
}

/* ========================
   6. SCROLL TO TOP
======================== */
function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
}

/* ========================
   6. GIFT BOX
======================== */
function openGiftBox() {
  const box = document.getElementById('gift-box');
  const modal = document.getElementById('gift-modal');
  
  if (box.classList.contains('opening')) return;

  // Start opening animation
  box.classList.add('opening');

  // Delay modal appearance to match lid animation
  setTimeout(() => {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }, 800); // 0.8s matches CSS transition
}

function closeGiftBox() {
  const box = document.getElementById('gift-box');
  const modal = document.getElementById('gift-modal');
  
  modal.classList.remove('open');
  document.body.style.overflow = '';
  
  // Optional: reset box after a short delay so it can be opened again
  setTimeout(() => {
    box.classList.remove('opening');
  }, 500);
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ========================
   7. MUSIC TOGGLE
======================== */
let musicPlaying = false;

function toggleMusic() {
  const audio = document.getElementById('bg-music');
  const btn   = document.getElementById('music-btn');

  if (musicPlaying) {
    audio.pause();
    btn.classList.remove('playing');
    btn.textContent = '🎵';
    musicPlaying = false;
  } else {
    audio.volume = 0.5;
    audio.play().catch(() => {});
    btn.classList.add('playing');
    btn.textContent = '🎶';
    musicPlaying = true;
  }
}

/* ========================
   9. AUTO-INIT PETALS ON ENVELOPE
======================== */
(function() {
  // Show falling petals on envelope screen too
  initPetals();
})();
