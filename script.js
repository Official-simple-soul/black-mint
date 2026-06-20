// Global Utilities & Setup
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches;

// --- Background Particle Canvas ---
const bgCanvas = document.getElementById('bg-canvas');
const bgCtx = bgCanvas ? bgCanvas.getContext('2d') : null;
let bgParticles = [];
const maxBgParticles = 80;
const connectionDist = 120;
let mousePos = { x: null, y: null };

if (bgCanvas && bgCtx) {
  const resizeBgCanvas = () => {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  };
  resizeBgCanvas();
  window.addEventListener('resize', resizeBgCanvas);

  class Particle {
    constructor() {
      this.x = Math.random() * bgCanvas.width;
      this.y = Math.random() * bgCanvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2 + 1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > bgCanvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > bgCanvas.height) this.vy *= -1;
    }
    draw() {
      bgCtx.beginPath();
      bgCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      bgCtx.fillStyle = 'rgba(0, 240, 255, 0.4)';
      bgCtx.fill();
    }
  }

  for (let i = 0; i < maxBgParticles; i++) {
    bgParticles.push(new Particle());
  }

  window.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mousePos.x = null;
    mousePos.y = null;
  });

  const animateBg = () => {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    bgParticles.forEach((p) => {
      p.update();
      p.draw();
    });

    for (let i = 0; i < bgParticles.length; i++) {
      const p1 = bgParticles[i];
      for (let j = i + 1; j < bgParticles.length; j++) {
        const p2 = bgParticles[j];
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (dist < connectionDist) {
          const alpha = (1 - dist / connectionDist) * 0.12;
          bgCtx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
          bgCtx.lineWidth = 1;
          bgCtx.beginPath();
          bgCtx.moveTo(p1.x, p1.y);
          bgCtx.lineTo(p2.x, p2.y);
          bgCtx.stroke();
        }
      }

      if (mousePos.x !== null && mousePos.y !== null) {
        const dist = Math.hypot(p1.x - mousePos.x, p1.y - mousePos.y);
        if (dist < 180) {
          const alpha = (1 - dist / 180) * 0.18;
          bgCtx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
          bgCtx.lineWidth = 1.2;
          bgCtx.beginPath();
          bgCtx.moveTo(p1.x, p1.y);
          bgCtx.lineTo(mousePos.x, mousePos.y);
          bgCtx.stroke();
        }
      }
    }
    requestAnimationFrame(animateBg);
  };

  if (!prefersReducedMotion) {
    animateBg();
  }
}

// --- Global Cursor Glow ---
const glow = document.querySelector('.cursor-glow');
if (
  !prefersReducedMotion &&
  glow &&
  window.matchMedia('(pointer: fine)').matches
) {
  window.addEventListener('pointermove', (event) => {
    glow.style.opacity = '1';
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  });
}

// --- Dynamic Stats Updates (Ribbon) ---
const blockEl = document.getElementById('ribbon-block');
const hashEl = document.getElementById('ribbon-hash');
let currentBlock = 24801984;
let currentHashVal = 854.2;

setInterval(() => {
  if (blockEl && Math.random() > 0.4) {
    currentBlock += Math.floor(Math.random() * 3) + 1;
    blockEl.textContent = `$${currentBlock.toLocaleString()}`;
  }
  if (hashEl) {
    currentHashVal += (Math.random() - 0.5) * 4;
    hashEl.textContent = `${currentHashVal.toFixed(1)} T/S`;
  }
}, 5000);

// --- Hero Neural Core Canvas (3D Math Mesh) ---
const heroCanvas = document.getElementById('neural-core-canvas');
const heroCtx = heroCanvas ? heroCanvas.getContext('2d') : null;
let heroPoints = [];
const pointsCount = 60;
let pitch = 0.003;
let roll = 0.005;

if (heroCanvas && heroCtx) {
  const resizeHeroCanvas = () => {
    const parent = heroCanvas.parentElement;
    heroCanvas.width = parent.clientWidth;
    heroCanvas.height = parent.clientHeight;
  };
  resizeHeroCanvas();
  window.addEventListener('resize', resizeHeroCanvas);

  // Generate sphere coordinate points
  for (let i = 0; i < pointsCount; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = 90 + Math.random() * 20;
    heroPoints.push({
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.sin(phi) * Math.sin(theta),
      z: r * Math.cos(phi),
      color:
        Math.random() > 0.4
          ? 'rgba(0, 240, 255, 0.8)'
          : 'rgba(157, 0, 255, 0.8)',
    });
  }

  // Tilt stage on mousemove
  const stage = document.querySelector('.neural-stage-wrapper');
  if (!prefersReducedMotion && stage) {
    stage.addEventListener('pointermove', (event) => {
      const rect = stage.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 15;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * -15;
      stage.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg)`;
    });
    stage.addEventListener('pointerleave', () => {
      stage.style.transform = '';
    });
  }

  const renderHeroMesh = () => {
    heroCtx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
    const cx = heroCanvas.width / 2;
    const cy = heroCanvas.height / 2;

    // Rotate points
    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);
    const cosR = Math.cos(roll);
    const sinR = Math.sin(roll);

    heroPoints.forEach((p) => {
      const x1 = p.x * cosP - p.z * sinP;
      const z1 = p.x * sinP + p.z * cosP;
      const y1 = p.y * cosR - z1 * sinR;
      const z2 = p.y * sinR + z1 * cosR;

      p.x = x1;
      p.y = y1;
      p.z = z2;

      // Project onto 2D
      const scale = 260 / (260 + p.z);
      const px = cx + p.x * scale;
      const py = cy + p.y * scale;

      heroCtx.beginPath();
      heroCtx.arc(px, py, scale * 3, 0, Math.PI * 2);
      heroCtx.fillStyle = p.color;
      heroCtx.fill();
    });

    // Draw mesh lines
    for (let i = 0; i < heroPoints.length; i++) {
      const p1 = heroPoints[i];
      const scale1 = 260 / (260 + p1.z);
      const px1 = cx + p1.x * scale1;
      const py1 = cy + p1.y * scale1;

      for (let j = i + 1; j < heroPoints.length; j++) {
        const p2 = heroPoints[j];
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);
        if (dist < 75) {
          const scale2 = 260 / (260 + p2.z);
          const px2 = cx + p2.x * scale2;
          const py2 = cy + p2.y * scale2;

          heroCtx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
          heroCtx.lineWidth = 0.8;
          heroCtx.beginPath();
          heroCtx.moveTo(px1, py1);
          heroCtx.lineTo(px2, py2);
          bgCtx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
          heroCtx.stroke();
        }
      }
    }
    requestAnimationFrame(renderHeroMesh);
  };

  if (!prefersReducedMotion) {
    renderHeroMesh();
  }
}

// --- Parametric Synthesizer Workspace ---
const densitySlider = document.getElementById('density-slider');
const densityReadout = document.getElementById('density-readout');
const entropySlider = document.getElementById('entropy-slider');
const entropyReadout = document.getElementById('entropy-readout');
const freqSlider = document.getElementById('freq-slider');
const freqReadout = document.getElementById('freq-readout');

const telToken = document.getElementById('tel-token-id');
const telParams = document.getElementById('tel-parameters');
const telLoss = document.getElementById('tel-loss');
const telCost = document.getElementById('tel-cost');

const synthCanvas = document.getElementById('synth-hologram-canvas');
const synthCtx = synthCanvas ? synthCanvas.getContext('2d') : null;

// Preset Data
const frequencyModes = ['Delta', 'Theta', 'Alpha', 'Beta'];

const updateTelemetry = () => {
  const dVal = parseInt(densitySlider.value);
  const eVal = parseFloat(entropySlider.value) / 100;
  const fMode = frequencyModes[parseInt(freqSlider.value)];

  // Update text elements
  if (densityReadout) densityReadout.textContent = `${dVal}%`;
  if (entropyReadout) entropyReadout.textContent = `${eVal.toFixed(2)}`;
  if (freqReadout) freqReadout.textContent = fMode;

  // Calculate parameters count
  const paramsCount = (dVal * dVal * 0.16 + 1.2).toFixed(1);
  if (telParams) telParams.textContent = `${paramsCount}M`;

  // Loss depends inversely on density/complexity
  const lossVal = (0.24 - dVal * 0.002 + eVal * 0.04).toFixed(4);
  if (telLoss) telLoss.textContent = `${lossVal}%`;

  // Cost calculation
  const synthCost = (
    dVal * 0.02 +
    0.1 +
    (fMode === 'Beta' ? 0.38 : 0.05)
  ).toFixed(2);
  if (telCost) telCost.textContent = `${synthCost} MNT`;

  // Mock Token Hash ID based on sliders
  const hashSeed = (dVal * 9831 + eVal * 12345).toString(16).substring(0, 4);
  if (telToken) telToken.textContent = `NXT-0x${hashSeed}...d6`;

  // Also update floating telemetry in hero visual
  const heroEntropy = document.getElementById('hero-entropy-val');
  const heroDensity = document.getElementById('hero-density-val');
  if (heroEntropy) heroEntropy.textContent = `${eVal.toFixed(2)}`;
  if (heroDensity) heroDensity.textContent = `${dVal}%`;
};

// Listeners
[densitySlider, entropySlider, freqSlider].forEach((slider) => {
  if (slider) slider.addEventListener('input', updateTelemetry);
});

// Interactive Hologram Screen Draw
let timeOffset = 0;
if (synthCanvas && synthCtx) {
  const resizeSynthCanvas = () => {
    synthCanvas.width = synthCanvas.clientWidth;
    synthCanvas.height = synthCanvas.clientHeight;
  };
  resizeSynthCanvas();
  window.addEventListener('resize', resizeSynthCanvas);

  const drawHologramMesh = () => {
    synthCtx.clearRect(0, 0, synthCanvas.width, synthCanvas.height);

    const dVal = parseInt(densitySlider.value);
    const eVal = parseFloat(entropySlider.value) / 100;
    const fIdx = parseInt(freqSlider.value);

    // Speed scales with frequency
    const speeds = [0.008, 0.015, 0.03, 0.06];
    timeOffset += speeds[fIdx];

    const cx = synthCanvas.width / 2;
    const cy = synthCanvas.height / 2;
    const radius = 70 + dVal * 0.3;

    // Node connections rendering
    const pointCount = Math.floor(dVal * 0.4) + 12;
    const points = [];

    // Calculate coordinates with sine noise based on entropy
    for (let i = 0; i < pointCount; i++) {
      const angle = (i / pointCount) * Math.PI * 2 + timeOffset;
      const noise =
        Math.sin(angle * 5 + timeOffset * 2) * (radius * 0.25 * eVal);
      const x = cx + Math.cos(angle) * (radius + noise);
      const y = cy + Math.sin(angle) * (radius + noise);
      points.push({ x, y });
    }

    // Color based on Frequency preset
    const colors = [
      'rgba(157, 0, 255, 0.25)', // Delta - Violet
      'rgba(0, 240, 255, 0.25)', // Theta - Cyan
      'rgba(57, 255, 20, 0.25)', // Alpha - Lime
      'rgba(255, 0, 122, 0.25)', // Beta - Magenta
    ];
    const strokeColors = ['#9d00ff', '#00f0ff', '#39ff14', '#ff007a'];

    synthCtx.strokeStyle = colors[fIdx];
    synthCtx.lineWidth = 1;

    // Outer mesh lines
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const d = Math.hypot(
          points[i].x - points[j].x,
          points[i].y - points[j].y,
        );
        if (d < 100 + dVal * 0.4) {
          synthCtx.beginPath();
          synthCtx.moveTo(points[i].x, points[i].y);
          synthCtx.lineTo(points[j].x, points[j].y);
          synthCtx.stroke();
        }
      }
    }

    // Inner Nodes
    points.forEach((p, idx) => {
      synthCtx.beginPath();
      synthCtx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      synthCtx.fillStyle = strokeColors[fIdx];
      synthCtx.fill();

      // Mini lines to center core
      if (idx % 3 === 0) {
        synthCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        synthCtx.beginPath();
        synthCtx.moveTo(p.x, p.y);
        synthCtx.lineTo(cx, cy);
        synthCtx.stroke();
      }
    });

    // Draw central target rings
    synthCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    synthCtx.beginPath();
    synthCtx.arc(cx, cy, 15, 0, Math.PI * 2);
    synthCtx.stroke();

    requestAnimationFrame(drawHologramMesh);
  };

  if (!prefersReducedMotion) {
    drawHologramMesh();
  }
}

// Initialize workspace values on startup
updateTelemetry();

// --- Live Terminal Emulator ---
const terminal = document.getElementById('terminal-body');
const mockLogs = [
  'Synchronizing synaptic matrix nodes...',
  'Attesting compute attestation from Node-981-operator',
  'Loss optimization completed in 184ms: loss = 0.0381%',
  'IPFS weight mapping loaded at QmXn...88y1',
  'Verifying ZK state validity for synapset-v2',
  'Consensus finalized. Hash 0xf4a9...00b8 pinned.',
  'Distributing gas-backed incentives to edge validation units',
  'Model weight check verified: SHA256 integrity 100%',
  'Initializing next training iteration (Epoch 401)',
  'Telemetry push sent. Speed metrics = 854.2 T/S',
];

const writeTerminalLine = (text) => {
  if (!terminal) return;
  const line = document.createElement('div');
  line.className = 'terminal-line';

  const time = new Date().toLocaleTimeString();
  line.innerHTML = `<span class="time">[${time}]</span><span class="accent">&gt;</span> ${text}`;

  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;

  // Keep terminal short, remove older lines
  while (terminal.children.length > 20) {
    terminal.removeChild(terminal.firstChild);
  }
};

if (terminal) {
  // Prime terminal logs
  mockLogs.slice(0, 4).forEach((log) => writeTerminalLine(log));

  // Loop scrolling logs
  setInterval(() => {
    const randomLog = mockLogs[Math.floor(Math.random() * mockLogs.length)];
    writeTerminalLine(randomLog);
  }, 2200);
}

// --- Web3 Interactive Simulation Modal Flow ---
const modal = document.getElementById('checkoutModal');
const backdrop = document.getElementById('modal-backdrop');
const closeBtn = document.getElementById('modal-close-btn');
const mintBtn = document.getElementById('synth-mint-btn');
const heroMintBtn = document.getElementById('hero-mint-trigger');
const ctaMintBtn = document.getElementById('cta-mint-trigger');
const scrollTrigger = document.getElementById('hero-scroll-trigger');

const connectWalletBtn = document.getElementById('connect-wallet-btn');
const modalActionBtn = document.getElementById('modal-action-btn');
const modalSteps = document.getElementById('modal-steps');
const nftResultCard = document.getElementById('nft-result-card');

// Preset statuses
let isNeuralLinkConnected = false;
let isMintReadyForBackend = false;

// Sync wallet simulation
const handleWalletConnect = () => {
  if (!connectWalletBtn) return;
  const label = connectWalletBtn.querySelector('span');
  if (isNeuralLinkConnected) {
    isNeuralLinkConnected = false;
    label.textContent = 'Sync Neural Link';
    connectWalletBtn.style.borderColor = 'var(--neon-cyan)';
    connectWalletBtn.style.color = 'var(--neon-cyan)';
    writeTerminalLine('Neural Link client disconnected.');
  } else {
    label.textContent = 'Neural Link Active';
    connectWalletBtn.style.borderColor = 'var(--neon-lime)';
    connectWalletBtn.style.color = 'var(--neon-lime)';
    isNeuralLinkConnected = true;
    writeTerminalLine('Neural Link client synced successfully on port 8089.');
  }
};
if (connectWalletBtn) {
  connectWalletBtn.addEventListener('click', handleWalletConnect);
}

// Scroll navigation helper
if (scrollTrigger) {
  scrollTrigger.addEventListener('click', () => {
    document
      .getElementById('synthesizer')
      .scrollIntoView({ behavior: 'smooth' });
  });
}

// Modal open/close actions
const openModal = () => {
  if (!modal) return;

  isMintReadyForBackend = false;

  modalActionBtn.classList.remove('interact-button');

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Setup initial step screen
  modalSteps.style.display = 'flex';
  nftResultCard.style.display = 'none';

  // Reset statuses of transaction steps
  const steps = modalSteps.querySelectorAll('.modal-step-item');
  steps.forEach((s) => {
    s.className = 'modal-step-item pending';
    s.querySelector('.step-status').textContent = 'PENDING';
  });

  if (isNeuralLinkConnected) {
    // Skip step 1 immediately
    const step1 = document.getElementById('step-1');
    step1.className = 'modal-step-item success';
    step1.querySelector('.step-status').textContent = 'CONNECTED';

    // Enable attestation trigger button
    modalActionBtn.disabled = false;
    modalActionBtn.querySelector('span').textContent = 'Authorize Synthesis';
  } else {
    // Direct user to connect first
    modalActionBtn.disabled = false;
    modalActionBtn.querySelector('span').textContent = 'Connect Neural Link';
  }
};

const closeModal = () => {
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
  modal.classList.remove('is-open');
  modalActionBtn.classList.remove('interact-button');
  document.body.style.overflow = '';
};

[mintBtn, heroMintBtn, ctaMintBtn].forEach((btn) => {
  if (btn) btn.addEventListener('click', openModal);
});

[backdrop, closeBtn].forEach((btn) => {
  if (btn) btn.addEventListener('click', closeModal);
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal && modal.classList.contains('is-open'))
    closeModal();
});

// Run sequence flow inside modal
const startTransactionFlow = async () => {
  modalActionBtn.disabled = true;
  modalActionBtn.classList.remove('interact-button');

  if (!isNeuralLinkConnected) {
    // Step 1 simulation
    modalActionBtn.querySelector('span').textContent = 'Syncing Neural Link...';
    const step1 = document.getElementById('step-1');
    step1.className = 'modal-step-item active';
    step1.querySelector('.step-status').textContent = 'SYNCING';

    await new Promise((r) => setTimeout(r, 1200));

    handleWalletConnect(); // Synced
    step1.className = 'modal-step-item success';
    step1.querySelector('.step-status').textContent = 'CONNECTED';
  }

  // Step 2: Weight Generation
  const step2 = document.getElementById('step-2');
  step2.className = 'modal-step-item active';
  step2.querySelector('.step-status').textContent = 'COMPUTING';
  modalActionBtn.querySelector('span').textContent = 'Generating Weights...';

  const dVal = parseInt(densitySlider.value);
  const eVal = parseFloat(entropySlider.value) / 100;
  const paramsCount = (dVal * dVal * 0.16 + 1.2).toFixed(1);

  await new Promise((r) => setTimeout(r, 1400));
  step2.className = 'modal-step-item success';
  step2.querySelector('.step-status').textContent = `OK (${paramsCount}M)`;

  // Step 3: Compute Attestation
  const step3 = document.getElementById('step-3');
  step3.className = 'modal-step-item active';
  step3.querySelector('.step-status').textContent = 'ATTESTING';
  modalActionBtn.querySelector('span').textContent = 'Attesting ZK Proof...';

  await new Promise((r) => setTimeout(r, 1300));
  step3.className = 'modal-step-item success';
  step3.querySelector('.step-status').textContent = 'ATTESTED';

  // Step 4: Minting onchain NFT
  const step4 = document.getElementById('step-4');
  step4.className = 'modal-step-item active';
  step4.querySelector('.step-status').textContent = 'MINTING';
  modalActionBtn.querySelector('span').textContent = 'Writing Onchain...';

  await new Promise((r) => setTimeout(r, 1500));
  step4.className = 'modal-step-item success';
  step4.querySelector('.step-status').textContent = 'MINTED';

  // Populate minted metadata
  const nftName = document.getElementById('nft-token-name');
  const nftDensity = document.getElementById('nft-stat-density');
  const nftEntropy = document.getElementById('nft-stat-entropy');

  const randomID = Math.floor(Math.random() * 9000) + 1000;
  const fMode = frequencyModes[parseInt(freqSlider.value)];
  if (nftName)
    nftName.textContent = `NEURO-${fMode.toUpperCase()} #${randomID}`;
  if (nftDensity) nftDensity.textContent = `${dVal}%`;
  if (nftEntropy) nftEntropy.textContent = `${eVal.toFixed(2)}`;

  // Show NFT results
  await new Promise((r) => setTimeout(r, 400));
  modalSteps.style.display = 'none';
  nftResultCard.style.display = 'flex';

  // Render custom neural NFT spinning card canvas
  renderNftCanvas(dVal, eVal, fMode);

  modalActionBtn.disabled = false;
  modalActionBtn.querySelector('span').textContent = 'Complete Mint';
  modalActionBtn.classList.add('interact-button');
  isMintReadyForBackend = true;
};

modalActionBtn.addEventListener(
  'click',
  (event) => {
    if (!isMintReadyForBackend) {
      event.preventDefault();
      event.stopImmediatePropagation();
      modalActionBtn.classList.remove('interact-button');
      startTransactionFlow();
      return;
    }

    closeModal();
  },
  true,
);

// --- Rotating Brain NFT Card Canvas ---
let nftAnimFrameId = null;
const renderNftCanvas = (density, entropy, mode) => {
  const cardCanvas = document.getElementById('nft-card-canvas');
  if (!cardCanvas) return;
  const ctx = cardCanvas.getContext('2d');
  cardCanvas.width = 140;
  cardCanvas.height = 140;

  let angle = 0;
  const colorMap = {
    Delta: '#9d00ff',
    Theta: '#00f0ff',
    Alpha: '#39ff14',
    Beta: '#ff007a',
  };
  const color = colorMap[mode] || '#00f0ff';

  const drawCardVisual = () => {
    ctx.clearRect(0, 0, cardCanvas.width, cardCanvas.height);
    const cx = cardCanvas.width / 2;
    const cy = cardCanvas.height / 2;
    angle += 0.02;

    // Draw futuristic concentric mathematical waves representing the brain
    const ringCount = 5;
    for (let r = 0; r < ringCount; r++) {
      const radius = 20 + r * 9;
      ctx.beginPath();

      // Plot points along circle with noise
      const pointCount = 36;
      for (let p = 0; p <= pointCount; p++) {
        const phi = (p / pointCount) * Math.PI * 2;
        const waveFactor = Math.sin(phi * 4 + angle * 3) * (5 * entropy);
        const x =
          cx +
          Math.cos(phi + angle * (r % 2 === 0 ? 1 : -1) * 0.3) *
            (radius + waveFactor);
        const y =
          cy +
          Math.sin(phi + angle * (r % 2 === 0 ? 1 : -1) * 0.3) *
            (radius + waveFactor);

        if (p === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.closePath();
      ctx.strokeStyle = color;
      ctx.lineWidth = r === ringCount - 1 ? 1.5 : 0.6;
      ctx.stroke();
    }

    // Centered glowing core
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    nftAnimFrameId = requestAnimationFrame(drawCardVisual);
  };

  // Cancel past animations if any
  if (nftAnimFrameId) cancelAnimationFrame(nftAnimFrameId);
  drawCardVisual();
};

// 3D Card Hover tilting handler
const nftCard = document.getElementById('nft-card');
if (nftCard) {
  nftCard.addEventListener('mousemove', (e) => {
    const rect = nftCard.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Tilt equations
    const rotateY = (x / rect.width - 0.5) * 30; // Max 15 deg left/right
    const rotateX = (y / rect.height - 0.5) * -30; // Max 15 deg up/down

    nftCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  nftCard.addEventListener('mouseleave', () => {
    nftCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
  });
}
