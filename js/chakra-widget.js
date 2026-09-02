// Interactive Kundalini Bio-Magnetic Ascension Pathway & Chakra Visualizer
// Formulated according to Yogiraj Vethathiri Maharishi's Bio-Magnetism & Universal Magnetism Principles

(function() {
  let activeIndex = 5; // Default: Agna (5)
  let autoAscendInterval = null;
  let isAutoAscending = false;
  let audioCtx = null;
  let activeOscillator = null;
  let activeGain = null;
  let soundEnabled = false;

  // Chakra Frequencies (Hz) for sound and Brainwave stages
  const CHAKRA_METRICS = [
    { hz: 194.18, wave: "Beta (35 Hz)", waveClass: "beta", gland: "Gonads & Adrenals", intensity: "15%" },    // Mooladhara
    { hz: 210.42, wave: "Beta (25 Hz)", waveClass: "beta", gland: "Leydig / Reproductive", intensity: "28%" }, // Swadhisthana
    { hz: 126.22, wave: "Beta-Alpha (16 Hz)", waveClass: "beta", gland: "Pancreas & Adrenal Cortex", intensity: "42%" }, // Manipura
    { hz: 136.10, wave: "Alpha (12 Hz)", waveClass: "alpha", gland: "Thymus (Immune)", intensity: "58%" },   // Anahata
    { hz: 141.27, wave: "Alpha (10 Hz)", waveClass: "alpha", gland: "Thyroid & Parathyroid", intensity: "70%" }, // Vishuddhi
    { hz: 221.23, wave: "Alpha-Theta (8 Hz)", waveClass: "alpha", gland: "Pituitary (Master Gland)", intensity: "85%" }, // Agna
    { hz: 172.06, wave: "Theta (4-7 Hz)", waveClass: "theta", gland: "Pineal Gland", intensity: "95%" },     // Thuriya
    { hz: 432.00, wave: "Delta / Cosmic (1-3 Hz)", waveClass: "delta", gland: "Cosmic Field / Plenum", intensity: "100%" } // Thuriyatheetha
  ];

  function playChakraTone(freq) {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      if (activeOscillator) {
        activeGain.gain.setValueAtTime(activeGain.gain.value, audioCtx.currentTime);
        activeGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
        setTimeout(() => {
          try { activeOscillator.stop(); } catch(e) {}
        }, 120);
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();

      activeOscillator = osc;
      activeGain = gain;
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
  }

  function stopChakraTone() {
    if (activeGain && audioCtx) {
      try {
        activeGain.gain.setValueAtTime(activeGain.gain.value, audioCtx.currentTime);
        activeGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
        setTimeout(() => {
          if (activeOscillator) {
            try { activeOscillator.stop(); } catch(e) {}
            activeOscillator = null;
          }
        }, 220);
      } catch(e) {}
    }
  }

  // Particle System for Bio-Magnetic Energy Flow
  class EnergyParticle {
    constructor(w, h, startY, targetY, color) {
      this.w = w;
      this.h = h;
      this.x = w / 2 + (Math.random() - 0.5) * 24;
      this.y = startY + Math.random() * 20;
      this.targetY = targetY;
      this.speed = 1.2 + Math.random() * 2.2;
      this.size = 2 + Math.random() * 3.5;
      this.color = color;
      this.alpha = 0.8 + Math.random() * 0.2;
      this.angle = Math.random() * Math.PI * 2;
      this.drift = (Math.random() - 0.5) * 1.5;
    }

    update() {
      this.y -= this.speed;
      this.x += Math.sin(this.angle) * this.drift;
      this.angle += 0.08;
      this.alpha -= 0.008;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Canvas Animation Controller
  let canvas, ctx;
  let particles = [];
  let animId = null;
  let torusAngle = 0;

  function initCanvas() {
    canvas = document.getElementById('chakraAuraCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    if (animId) cancelAnimationFrame(animId);
    animate();
  }

  function resizeCanvas() {
    if (!canvas) return;
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth || 420;
    canvas.height = parent.clientHeight || 560;
  }

  function animate() {
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const chakras = window.SKY_DATA ? window.SKY_DATA.chakras : [];
    const totalChakras = chakras.length || 8;
    const activeChakra = chakras[activeIndex] || { color: '#D4AF37' };

    // Spine Coordinate calculations
    const spineTop = h * 0.12;
    const spineBottom = h * 0.88;
    const spineLength = spineBottom - spineTop;
    const step = spineLength / (totalChakras - 1);

    // 1. Draw Bio-Magnetic Toroidal Field Lines
    torusAngle += 0.015;
    ctx.save();
    ctx.lineWidth = 1.2;
    const activeNodeY = spineBottom - activeIndex * step;
    
    for (let r = 1; r <= 3; r++) {
      const radiusX = 60 + r * 38 + Math.sin(torusAngle + r) * 6;
      const radiusY = 35 + r * 22 + Math.cos(torusAngle + r) * 4;
      ctx.strokeStyle = activeChakra.color + (r === 1 ? '55' : r === 2 ? '33' : '18');
      ctx.beginPath();
      ctx.ellipse(w / 2, activeNodeY, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Draw Central Sushumna Nadi (Spinal Energy Column)
    ctx.save();
    const grad = ctx.createLinearGradient(w / 2, spineBottom, w / 2, spineTop);
    grad.addColorStop(0, '#E74C3C');
    grad.addColorStop(0.3, '#F1C40F');
    grad.addColorStop(0.6, '#3498DB');
    grad.addColorStop(0.85, '#9B59B6');
    grad.addColorStop(1, '#FFF5C0');

    ctx.strokeStyle = grad;
    ctx.lineWidth = 4;
    ctx.shadowColor = activeChakra.color;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.moveTo(w / 2, spineBottom + 10);
    ctx.lineTo(w / 2, spineTop - 15);
    ctx.stroke();

    // Secondary Ida & Pingala subtle spiraling channels
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
    ctx.beginPath();
    for (let y = spineBottom; y >= spineTop; y -= 4) {
      const xOffset = Math.sin((spineBottom - y) * 0.045 + torusAngle) * 22;
      if (y === spineBottom) ctx.moveTo(w / 2 + xOffset, y);
      else ctx.lineTo(w / 2 + xOffset, y);
    }
    ctx.stroke();

    ctx.beginPath();
    for (let y = spineBottom; y >= spineTop; y -= 4) {
      const xOffset = -Math.sin((spineBottom - y) * 0.045 + torusAngle) * 22;
      if (y === spineBottom) ctx.moveTo(w / 2 + xOffset, y);
      else ctx.lineTo(w / 2 + xOffset, y);
    }
    ctx.stroke();
    ctx.restore();

    // 3. Spawn and render Ascending Prana / Bio-Magnetic Particles
    if (particles.length < 50 && Math.random() < 0.6) {
      const startNodeY = spineBottom;
      const targetNodeY = activeNodeY;
      particles.push(new EnergyParticle(w, h, startNodeY, targetNodeY, activeChakra.color));
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw(ctx);
      if (particles[i].alpha <= 0 || particles[i].y < spineTop - 30) {
        particles.splice(i, 1);
      }
    }

    // 4. Draw Glowing Energy Nodes
    chakras.forEach((c, idx) => {
      const nodeY = spineBottom - idx * step;
      const isCur = idx === activeIndex;
      const isPast = idx < activeIndex;

      ctx.save();
      // Outer aura ring if active
      if (isCur) {
        const pulse = 18 + Math.sin(torusAngle * 3) * 6;
        const auraGrad = ctx.createRadialGradient(w / 2, nodeY, 6, w / 2, nodeY, pulse + 16);
        auraGrad.addColorStop(0, c.color + 'DD');
        auraGrad.addColorStop(0.5, c.color + '44');
        auraGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(w / 2, nodeY, pulse + 16, 0, Math.PI * 2);
        ctx.fill();
      }

      // Center Node Circle
      ctx.fillStyle = isCur ? '#FFFFFF' : (isPast ? c.color : 'rgba(255, 255, 255, 0.4)');
      ctx.shadowColor = c.color;
      ctx.shadowBlur = isCur ? 24 : (isPast ? 12 : 4);
      ctx.beginPath();
      ctx.arc(w / 2, nodeY, isCur ? 10 : (isPast ? 7 : 5), 0, Math.PI * 2);
      ctx.fill();

      // Small glowing ring
      ctx.strokeStyle = c.color;
      ctx.lineWidth = isCur ? 2.5 : 1;
      ctx.beginPath();
      ctx.arc(w / 2, nodeY, isCur ? 15 : 9, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    });

    animId = requestAnimationFrame(animate);
  }

  // UI Updates & Interactions
  function renderUI() {
    const lang = window.currentLang || 'en';
    const chakras = window.SKY_DATA ? window.SKY_DATA.chakras : [];
    if (!chakras || chakras.length === 0) return;

    const chakra = chakras[activeIndex];
    const metric = CHAKRA_METRICS[activeIndex] || CHAKRA_METRICS[0];

    // Details elements
    const nameEl = document.getElementById('chakraName');
    const tamilEl = document.getElementById('chakraTamil');
    const locationEl = document.getElementById('chakraLocation');
    const elementEl = document.getElementById('chakraElement');
    const deityEl = document.getElementById('chakraDeity');
    const descEl = document.getElementById('chakraDesc');
    const affirmationEl = document.getElementById('chakraAffirmation');
    const waveEl = document.getElementById('chakraWaveGauge');
    const intensityBar = document.getElementById('chakraIntensityBar');
    const glandEl = document.getElementById('chakraGland');
    const freqEl = document.getElementById('chakraHzValue');

    const cName = typeof chakra.name === 'object' ? chakra.name[lang] || chakra.name.en : chakra.name;
    const cLoc = typeof chakra.location === 'object' ? chakra.location[lang] || chakra.location.en : chakra.location;
    const cElem = typeof chakra.element === 'object' ? chakra.element[lang] || chakra.element.en : chakra.element;
    const cDeity = typeof chakra.deityAspect === 'object' ? chakra.deityAspect[lang] || chakra.deityAspect.en : chakra.deityAspect;
    const cDesc = typeof chakra.description === 'object' ? chakra.description[lang] || chakra.description.en : chakra.description;
    const cAffirm = typeof chakra.affirmation === 'object' ? chakra.affirmation[lang] || chakra.affirmation.en : chakra.affirmation;

    if (nameEl) {
      nameEl.textContent = cName;
      nameEl.style.color = chakra.color;
    }
    if (tamilEl) tamilEl.textContent = cLoc;
    if (locationEl) locationEl.textContent = cLoc;
    if (elementEl) elementEl.textContent = cElem;
    if (deityEl) deityEl.textContent = cDeity;
    if (descEl) descEl.textContent = cDesc;
    if (affirmationEl) affirmationEl.textContent = `"${cAffirm}"`;
    if (glandEl) glandEl.textContent = metric.gland;
    if (freqEl) freqEl.textContent = `${metric.hz.toFixed(1)} Hz (Harmonic Tone)`;

    if (waveEl) {
      waveEl.textContent = metric.wave;
      waveEl.className = `wave-badge wave-${metric.waveClass}`;
    }
    if (intensityBar) {
      intensityBar.style.width = metric.intensity;
      intensityBar.style.backgroundColor = chakra.color;
      intensityBar.style.boxShadow = `0 0 12px ${chakra.color}`;
    }

    // Update node list active states
    document.querySelectorAll('.chakra-node').forEach((node, idx) => {
      if (idx === activeIndex) {
        node.classList.add('active');
        node.style.borderColor = chakra.color;
        node.style.boxShadow = `0 0 16px ${chakra.color}44`;
      } else {
        node.classList.remove('active');
        node.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        node.style.boxShadow = 'none';
      }
    });

    if (soundEnabled) {
      playChakraTone(metric.hz);
    }
  }

  function buildChakraNodeList() {
    const chakraListContainer = document.getElementById('chakraListNodes');
    if (!chakraListContainer || !window.SKY_DATA) return;

    const chakras = window.SKY_DATA.chakras;
    const lang = window.currentLang || 'en';

    chakraListContainer.innerHTML = '';
    chakras.forEach((chakra, index) => {
      const node = document.createElement('div');
      node.className = `chakra-node ${index === activeIndex ? 'active' : ''}`;
      node.dataset.index = index;

      const chakraNameStr = typeof chakra.name === 'object' ? chakra.name[lang] || chakra.name.en : chakra.name;
      const chakraLocStr = typeof chakra.location === 'object' ? chakra.location[lang] || chakra.location.en : chakra.location;

      node.innerHTML = `
        <div class="chakra-dot" style="background-color: ${chakra.color}; border: 2px solid #FFF; box-shadow: 0 0 12px ${chakra.color};"></div>
        <div style="flex-grow: 1;">
          <div style="font-weight: 600; font-size: 0.95rem; color: #FFF;">${chakraNameStr}</div>
          <div style="font-size: 0.78rem; color: #A1A1AA;">${chakraLocStr}</div>
        </div>
        <span class="chakra-node-step">${index + 1}</span>
      `;

      node.addEventListener('click', () => {
        setChakra(index);
      });

      chakraListContainer.appendChild(node);
    });
  }

  function setChakra(index) {
    activeIndex = Math.max(0, Math.min(index, (window.SKY_DATA ? window.SKY_DATA.chakras.length - 1 : 7)));
    window.selectedChakraIndex = activeIndex;
    renderUI();
  }

  // Public Actions
  window.ascendKundalini = function() {
    const total = window.SKY_DATA ? window.SKY_DATA.chakras.length : 8;
    if (activeIndex < total - 1) {
      setChakra(activeIndex + 1);
    } else {
      setChakra(0);
    }
  };

  window.groundKundalini = function() {
    setChakra(0); // Shanthi back to Mooladhara
  };

  window.toggleAutoAscension = function() {
    const btn = document.getElementById('btnAutoAscend');
    if (isAutoAscending) {
      clearInterval(autoAscendInterval);
      isAutoAscending = false;
      if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> Auto Ascend Flow';
    } else {
      isAutoAscending = true;
      if (btn) btn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause Flow';
      autoAscendInterval = setInterval(() => {
        window.ascendKundalini();
      }, 2600);
    }
  };

  window.toggleChakraSound = function() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('btnChakraSound');
    if (soundEnabled) {
      const metric = CHAKRA_METRICS[activeIndex] || CHAKRA_METRICS[0];
      playChakraTone(metric.hz);
      if (btn) {
        btn.classList.add('active-sound');
        btn.innerHTML = '<i class="fa-solid fa-volume-high"></i> Harmonic Sound: ON';
      }
    } else {
      stopChakraTone();
      if (btn) {
        btn.classList.remove('active-sound');
        btn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> Harmonic Sound: OFF';
      }
    }
  };

  window.renderChakraDetails = function() {
    buildChakraNodeList();
    renderUI();
  };

  function init() {
    initCanvas();
    buildChakraNodeList();
    renderUI();
  }

  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
  }
})();
