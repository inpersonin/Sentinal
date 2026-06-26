/**
 * Sentinel — Multilingual Hate Speech Detection
 * script.js — Main JavaScript Module
 * 
 * Modules:
 *  1. Custom Cursor
 *  2. Navigation (scroll-aware)
 *  3. Particle Canvas Background
 *  4. Scroll Reveal Animations
 *  5. Magnetic Buttons
 *  6. Textarea & Character Counter
 *  7. Detection API Integration
 *  8. Result Display with Animations
 *  9. Dataset Bar Animations
 * 10. Utility Helpers
 */

'use strict';

/* ═══════════════════════════════════════════════════════
   CONFIGURATION
   ═══════════════════════════════════════════════════════ */
const CONFIG = {
  // Live Hugging Face Space endpoint
  API_URL: 'https://inpersonin-hate-speech-detection-api.hf.space/predict',
  API_TIMEOUT_MS: 15000,
  MAX_CHARS: 2000,
  PARTICLE_COUNT: 55,
  EXAMPLE_TEXTS: [
    'I really enjoy learning about different cultures and languages.',
    'This content is absolutely hateful and should be removed.',
    'यह लेख बहुत अच्छा है और सभी के लिए उपयोगी है।',
    'Everyone deserves to be treated with dignity and respect.',
    'इस तरह की बात करना बिल्कुल गलत है और नफरत फैलाती है।'
  ],
};

/* ═══════════════════════════════════════════════════════
   1. CUSTOM CURSOR
   ═══════════════════════════════════════════════════════ */
const Cursor = (() => {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');

  if (!dot || !ring) return { init: () => {} };

  let mouseX = -100, mouseY = -100;
  let ringX  = -100, ringY  = -100;
  let rafId  = null;

  const LERP_FACTOR = 0.18;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function updateCursor() {
    ringX = lerp(ringX, mouseX, LERP_FACTOR);
    ringY = lerp(ringY, mouseY, LERP_FACTOR);

    dot.style.left  = `${mouseX}px`;
    dot.style.top   = `${mouseY}px`;
    ring.style.left = `${ringX}px`;
    ring.style.top  = `${ringY}px`;

    rafId = requestAnimationFrame(updateCursor);
  }

  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  function onMouseOver(e) {
    const target = e.target.closest('a, button, [tabindex="0"], input, textarea, select');
    if (target) ring.classList.add('hovered');
  }

  function onMouseOut(e) {
    const target = e.target.closest('a, button, [tabindex="0"], input, textarea, select');
    if (target && !target.contains(e.relatedTarget)) ring.classList.remove('hovered');
  }

  function onMouseLeave() {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  }

  function onMouseEnter() {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  }

  return {
    init() {
      // Only enable on non-touch devices
      if (window.matchMedia('(pointer: coarse)').matches) {
        dot.remove();
        ring.remove();
        document.body.style.cursor = 'auto';
        return;
      }

      document.addEventListener('mousemove', onMouseMove, { passive: true });
      document.addEventListener('mouseover', onMouseOver, { passive: true });
      document.addEventListener('mouseout',  onMouseOut,  { passive: true });
      document.addEventListener('mouseleave', onMouseLeave, { passive: true });
      document.addEventListener('mouseenter', onMouseEnter, { passive: true });

      rafId = requestAnimationFrame(updateCursor);
    },

    destroy() {
      if (rafId) cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', onMouseMove);
    }
  };
})();

/* ═══════════════════════════════════════════════════════
   2. NAVIGATION — SCROLL AWARE
   ═══════════════════════════════════════════════════════ */
const Navigation = (() => {
  const nav = document.getElementById('mainNav');
  if (!nav) return { init: () => {} };

  let scrolled = false;

  function onScroll() {
    const shouldScrolled = window.scrollY > 40;
    if (shouldScrolled !== scrolled) {
      scrolled = shouldScrolled;
      nav.classList.toggle('scrolled', scrolled);
    }
  }

  return {
    init() {
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  };
})();

/* ═══════════════════════════════════════════════════════
   3. PARTICLE CANVAS BACKGROUND
   ═══════════════════════════════════════════════════════ */
const ParticleCanvas = (() => {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return { init: () => {} };

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId   = null;
  let W, H;

  class Particle {
    constructor() { this.reset(true); }

    reset(isInit = false) {
      this.x   = Math.random() * W;
      this.y   = isInit ? Math.random() * H : H + 10;
      this.r   = Math.random() * 1.6 + 0.4;
      this.vx  = (Math.random() - 0.5) * 0.18;
      this.vy  = -(Math.random() * 0.35 + 0.1);
      this.a   = 0;
      this.ta  = Math.random() * 0.5 + 0.15;
      this.life = 0;
      this.maxLife = Math.random() * 280 + 200;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;

      const progress = this.life / this.maxLife;
      if (progress < 0.15) {
        this.a = (progress / 0.15) * this.ta;
      } else if (progress > 0.75) {
        this.a = ((1 - progress) / 0.25) * this.ta;
      } else {
        this.a = this.ta;
      }

      if (this.life >= this.maxLife) this.reset();
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 106, 0, ${this.a})`;
      ctx.fill();
    }
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (const p of particles) { p.update(); p.draw(); }
    animId = requestAnimationFrame(tick);
  }

  return {
    init() {
      resize();
      window.addEventListener('resize', resize, { passive: true });
      particles = Array.from({ length: CONFIG.PARTICLE_COUNT }, () => new Particle());
      tick();
    },
    destroy() {
      if (animId) cancelAnimationFrame(animId);
    }
  };
})();

/* ═══════════════════════════════════════════════════════
   4. SCROLL REVEAL
   ═══════════════════════════════════════════════════════ */
const ScrollReveal = (() => {
  let observer = null;

  return {
    init() {
      const els = document.querySelectorAll('.reveal-up, .reveal-scale');
      if (!els.length) return;

      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.style.getPropertyValue('--delay') || '0ms';
            entry.target.style.transitionDelay = delay;
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

      els.forEach((el) => observer.observe(el));
    },
    destroy() {
      if (observer) observer.disconnect();
    }
  };
})();

/* ═══════════════════════════════════════════════════════
   5. MAGNETIC BUTTONS
   ═══════════════════════════════════════════════════════ */
const MagneticButtons = (() => {
  const STRENGTH = 0.28;

  function handleMove(btn, e) {
    const rect   = btn.getBoundingClientRect();
    const cx     = rect.left + rect.width / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = (e.clientX - cx) * STRENGTH;
    const dy     = (e.clientY - cy) * STRENGTH;
    btn.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  function handleLeave(btn) {
    btn.style.transform = '';
  }

  return {
    init() {
      // Only for pointer-fine (mouse) devices
      if (window.matchMedia('(pointer: coarse)').matches) return;

      document.querySelectorAll('.magnetic-btn').forEach((btn) => {
        btn.addEventListener('mousemove', (e) => handleMove(btn, e), { passive: true });
        btn.addEventListener('mouseleave', () => handleLeave(btn), { passive: true });
      });
    }
  };
})();

/* ═══════════════════════════════════════════════════════
   6. TEXTAREA & CHARACTER COUNTER
   ═══════════════════════════════════════════════════════ */
const TextInput = (() => {
  const textarea    = document.getElementById('textInput');
  const charCount   = document.getElementById('charCount');
  const charCounter = document.getElementById('charCounter');
  const pasteBtn    = document.getElementById('pasteBtn');
  const clearBtn    = document.getElementById('clearBtn');
  const exampleBtn  = document.getElementById('exampleBtn');

  if (!textarea) return { init: () => {} };

  let exampleIndex = 0;

  function updateCounter() {
    const len = textarea.value.length;
    if (charCount) charCount.textContent = len.toLocaleString();
    if (charCounter) {
      charCounter.classList.remove('warning', 'danger');
      if (len > CONFIG.MAX_CHARS * 0.9) charCounter.classList.add('danger');
      else if (len > CONFIG.MAX_CHARS * 0.7) charCounter.classList.add('warning');
    }
  }

  async function onPaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        textarea.value = text.slice(0, CONFIG.MAX_CHARS);
        updateCounter();
        textarea.focus();
      }
    } catch {
      // Clipboard not available — focus so user can paste manually
      textarea.focus();
      textarea.select();
    }
  }

  function onClear() {
    textarea.value = '';
    updateCounter();
    textarea.focus();
    // Also clear any result
    ResultDisplay.reset();
  }

  function onExample() {
    const text = CONFIG.EXAMPLE_TEXTS[exampleIndex % CONFIG.EXAMPLE_TEXTS.length];
    exampleIndex++;
    textarea.value = '';
    typeText(textarea, text, updateCounter);
    ResultDisplay.reset();
  }

  function typeText(el, text, onUpdate) {
    let i = 0;
    const interval = setInterval(() => {
      el.value += text[i++];
      if (onUpdate) onUpdate();
      if (i >= text.length) clearInterval(interval);
    }, 28);
  }

  return {
    init() {
      textarea.addEventListener('input', updateCounter, { passive: true });
      pasteBtn?.addEventListener('click', onPaste);
      clearBtn?.addEventListener('click', onClear);
      exampleBtn?.addEventListener('click', onExample);
      updateCounter();
    },
    getValue() {
      return textarea?.value?.trim() ?? '';
    }
  };
})();

/* ═══════════════════════════════════════════════════════
   7. DETECTION API
   ═══════════════════════════════════════════════════════ */
const DetectionAPI = (() => {
  /**
   * POST /predict
   * @param {string} text
   * @returns {Promise<{prediction: string, confidence: number}>}
   */
  async function predict(text) {
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT_MS);

    try {
      const response = await fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`Server returned ${response.status}: ${body || response.statusText}`);
      }

      const data = await response.json();

      // Validate response shape
      if (typeof data.prediction !== 'string' || typeof data.confidence !== 'number') {
        throw new Error('Unexpected response format from API.');
      }

      return data;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return { predict };
})();

/* ═══════════════════════════════════════════════════════
   8. RESULT DISPLAY
   ═══════════════════════════════════════════════════════ */
const ResultDisplay = (() => {
  const panel       = document.getElementById('resultPanel');
  const errorPanel  = document.getElementById('errorPanel');
  const errorMsg    = document.getElementById('errorMessage');
  const verdictBadge = document.getElementById('verdictBadge');
  const verdictIcon = document.getElementById('verdictIcon');
  const verdictText = document.getElementById('verdictText');
  const resultSummary = document.getElementById('resultSummary');
  const ringProgress = document.getElementById('ringProgress');
  const ringPct     = document.getElementById('ringPct');
  const confBarFill = document.getElementById('confBarFill');
  const confBarPct  = document.getElementById('confBarPct');
  const confBarTrack = document.querySelector('.conf-bar-track');

  /** Circumference of SVG ring (r=50, C = 2πr ≈ 314) */
  const RING_CIRCUM = 2 * Math.PI * 50;

  function reset() {
    if (panel) panel.hidden = true;
    if (errorPanel) errorPanel.hidden = true;
  }

  function showError(message) {
    if (panel) panel.hidden = true;
    if (errorPanel) {
      errorPanel.hidden = false;
      if (errorMsg) errorMsg.textContent = message;
    }
  }

  /**
   * @param {{ prediction: string, confidence: number }} result
   */
  function show(result) {
    if (errorPanel) errorPanel.hidden = true;
    if (!panel) return;

    const isToxic = result.prediction.toLowerCase().includes('toxic')
                  && !result.prediction.toLowerCase().includes('non');
    // confidence arrives as a percentage (0–100) from the backend
    const pct = Math.round(result.confidence);

    // Verdict badge
    if (verdictBadge) {
      verdictBadge.classList.remove('toxic', 'nontoxic');
      verdictBadge.classList.add(isToxic ? 'toxic' : 'nontoxic');
    }
    if (verdictIcon) verdictIcon.textContent = isToxic ? '⚠️' : '✅';
    if (verdictText) verdictText.textContent  = isToxic ? 'TOXIC' : 'NON-TOXIC';

    if (resultSummary) {
      const probLine = result.probabilities
        ? ` Toxic: ${result.probabilities.toxic}% · Non-Toxic: ${result.probabilities.non_toxic}%.`
        : '';
      resultSummary.textContent = isToxic
        ? `This content has been classified as potentially harmful or hateful. Confidence: ${pct}%.${probLine}`
        : `This content appears safe and non-toxic. Confidence: ${pct}%.${probLine}`;
    }

    // Colors
    const color     = isToxic ? '#FF453A' : '#30D158';
    const colorGlow = isToxic ? 'rgba(255,69,58,0.3)' : 'rgba(48,209,88,0.3)';

    // Ring
    if (ringProgress) {
      ringProgress.style.stroke = color;
      ringProgress.style.filter = `drop-shadow(0 0 6px ${colorGlow})`;
      // Start from 0 for animation
      ringProgress.style.strokeDashoffset = String(RING_CIRCUM);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // confidence is 0–100, convert to 0–1 for ring math
          const offset = RING_CIRCUM * (1 - result.confidence / 100);
          ringProgress.style.strokeDashoffset = String(offset);
        });
      });
    }

    if (ringPct) {
      ringPct.style.color = color;
      animateNumber(ringPct, 0, pct, 1200, (v) => `${v}%`);
    }

    // Bar
    if (confBarFill) {
      confBarFill.style.background = `linear-gradient(90deg, ${color}, ${colorGlow.replace('0.3', '0.8')})`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          confBarFill.style.width = `${pct}%`;
        });
      });
    }

    if (confBarPct) {
      animateNumber(confBarPct, 0, pct, 1200, (v) => `${v}%`);
    }

    if (confBarTrack) {
      confBarTrack.setAttribute('aria-valuenow', pct);
      confBarTrack.setAttribute('aria-label', `Confidence: ${pct}%`);
    }

    // Show panel with animation
    panel.hidden = false;

    // Scroll result into view
    setTimeout(() => {
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }

  /**
   * Animate a number from start to end.
   * @param {HTMLElement} el
   * @param {number} from
   * @param {number} to
   * @param {number} duration
   * @param {(val: number) => string} format
   */
  function animateNumber(el, from, to, duration, format) {
    const start = performance.now();
    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(from + (to - from) * eased);
      el.textContent = format(value);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  return { show, showError, reset };
})();

/* ═══════════════════════════════════════════════════════
   9. ANALYZE BUTTON & SUBMISSION FLOW
   ═══════════════════════════════════════════════════════ */
const AnalyzeController = (() => {
  const analyzeBtn = document.getElementById('analyzeBtn');
  if (!analyzeBtn) return { init: () => {} };

  let isLoading = false;

  function setLoading(loading) {
    isLoading = loading;
    analyzeBtn.disabled = loading;
    analyzeBtn.classList.toggle('loading', loading);
    analyzeBtn.setAttribute('aria-busy', loading ? 'true' : 'false');
  }

  async function onAnalyze() {
    if (isLoading) return;

    const text = TextInput.getValue();

    // Validate
    if (!text) {
      const textarea = document.getElementById('textInput');
      if (textarea) {
        textarea.focus();
        textarea.style.borderColor = 'rgba(255,59,48,0.5)';
        setTimeout(() => { textarea.style.borderColor = ''; }, 1800);
      }
      return;
    }

    if (text.length > CONFIG.MAX_CHARS) {
      ResultDisplay.showError(`Text exceeds ${CONFIG.MAX_CHARS.toLocaleString()} character limit.`);
      return;
    }

    ResultDisplay.reset();
    setLoading(true);

    try {
      const result = await DetectionAPI.predict(text);
      ResultDisplay.show(result);
    } catch (err) {
      let message = 'Unable to connect to the detection API.';

      if (err.name === 'AbortError') {
        message = 'Request timed out. The server may be starting up — please try again.';
      } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        message = `Cannot reach the API server at ${CONFIG.API_URL.split('/predict')[0]}. Ensure the Hugging Face Space is active.`;
      } else {
        message = err.message || message;
      }

      ResultDisplay.showError(message);
      console.error('[Sentinel] API error:', err);
    } finally {
      setLoading(false);
    }
  }

  return {
    init() {
      analyzeBtn.addEventListener('click', onAnalyze);

      // Keyboard shortcut: Ctrl+Enter / Cmd+Enter
      const textarea = document.getElementById('textInput');
      if (textarea) {
        textarea.addEventListener('keydown', (e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            onAnalyze();
          }
        });
      }
    }
  };
})();

/* ═══════════════════════════════════════════════════════
   10. DATASET BAR ANIMATIONS (triggered by intersection)
   ═══════════════════════════════════════════════════════ */
const DatasetBars = (() => {
  return {
    init() {
      const bars = document.querySelectorAll('.ds-bar-fill');
      if (!bars.length) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bar = entry.target;
            const targetW = bar.style.getPropertyValue('--w');
            // Small delay for visual polish
            setTimeout(() => { bar.style.width = targetW; }, 200);
            observer.unobserve(bar);
          }
        });
      }, { threshold: 0.5 });

      bars.forEach((b) => observer.observe(b));
    }
  };
})();

/* ═══════════════════════════════════════════════════════
   11. SMOOTH PARALLAX HERO
   ═══════════════════════════════════════════════════════ */
const HeroParallax = (() => {
  const heroVisual = document.querySelector('.hero-visual');

  return {
    init() {
      if (!heroVisual) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        heroVisual.style.transform = `translateY(calc(-50% + ${scrollY * 0.12}px))`;
      }, { passive: true });
    }
  };
})();

/* ═══════════════════════════════════════════════════════
   12. RIPPLE EFFECT ON BUTTONS
   ═══════════════════════════════════════════════════════ */
const Ripple = (() => {
  function createRipple(e, btn) {
    const existing = btn.querySelector('.ripple');
    if (existing) existing.remove();

    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height) * 2;
    const x      = e.clientX - rect.left - size / 2;
    const y      = e.clientY - rect.top  - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    Object.assign(ripple.style, {
      position:     'absolute',
      width:        `${size}px`,
      height:       `${size}px`,
      left:         `${x}px`,
      top:          `${y}px`,
      background:   'rgba(255,255,255,0.15)',
      borderRadius: '50%',
      transform:    'scale(0)',
      animation:    'rippleAnim 0.6s ease-out forwards',
      pointerEvents:'none',
    });

    // Inject keyframes once
    if (!document.getElementById('ripple-style')) {
      const style = document.createElement('style');
      style.id = 'ripple-style';
      style.textContent = `@keyframes rippleAnim { to { transform: scale(1); opacity: 0; } }`;
      document.head.appendChild(style);
    }

    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  }

  return {
    init() {
      document.querySelectorAll('.btn-primary, .btn-analyze, .nav-cta').forEach((btn) => {
        btn.addEventListener('click', (e) => createRipple(e, btn));
      });
    }
  };
})();

/* ═══════════════════════════════════════════════════════
   13. CURSOR-RESPONSIVE AMBIENT LIGHTING ON DETECT CARD
   ═══════════════════════════════════════════════════════ */
const CardLighting = (() => {
  const card = document.querySelector('.detect-card');
  if (!card) return { init: () => {} };

  return {
    init() {
      if (window.matchMedia('(pointer: coarse)').matches) return;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x    = ((e.clientX - rect.left) / rect.width)  * 100;
        const y    = ((e.clientY - rect.top)  / rect.height) * 100;
        card.style.setProperty('--gx', `${x}%`);
        card.style.setProperty('--gy', `${y}%`);
        card.style.background = `
          radial-gradient(ellipse at ${x}% ${y}%, rgba(255,106,0,0.04) 0%, transparent 60%),
          var(--bg-card)
        `;
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        card.style.background = '';
      }, { passive: true });
    }
  };
})();

/* ═══════════════════════════════════════════════════════
   14. PERFORMANCE — PAGE VISIBILITY
   ═══════════════════════════════════════════════════════ */
function handleVisibilityChange() {
  if (document.hidden) {
    ParticleCanvas.destroy();
  } else {
    ParticleCanvas.init();
  }
}

/* ═══════════════════════════════════════════════════════
   INIT — Boot all modules
   ═══════════════════════════════════════════════════════ */
function init() {
  Cursor.init();
  Navigation.init();
  ParticleCanvas.init();
  ScrollReveal.init();
  MagneticButtons.init();
  TextInput.init();
  AnalyzeController.init();
  DatasetBars.init();
  HeroParallax.init();
  Ripple.init();
  CardLighting.init();

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Log branding
  console.log(
    '%c SENTINEL %c Multilingual Hate Speech Detection %c v1.0.0 ',
    'background:#FF6A00;color:#000;font-weight:700;padding:4px 8px;border-radius:4px 0 0 4px;',
    'background:#111;color:#FF6A00;font-weight:600;padding:4px 8px;',
    'background:#222;color:#888;padding:4px 8px;border-radius:0 4px 4px 0;'
  );
  console.log('%cAPI endpoint: ' + CONFIG.API_URL, 'color:#FF6A00;');
  console.log('%cKeyboard shortcut: Ctrl+Enter to analyze', 'color:#555;');
}

// Boot when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
