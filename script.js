// FACE4663 — Round Coin Rain + Config

// --- Round Coin Rain (logo as round falling coins) ---
function initCoinRain() {
  const canvas = document.getElementById('coinCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const coinImg = new Image();
  coinImg.src = 'logo.png';

  // Pre-render round coin to offscreen canvas
  let roundCoinReady = false;
  const roundCoinSize = 80;
  const offscreen = document.createElement('canvas');
  offscreen.width = roundCoinSize;
  offscreen.height = roundCoinSize;
  const offCtx = offscreen.getContext('2d');

  coinImg.onload = () => {
    // Clip logo into circle
    offCtx.beginPath();
    offCtx.arc(roundCoinSize / 2, roundCoinSize / 2, roundCoinSize / 2, 0, Math.PI * 2);
    offCtx.closePath();
    offCtx.clip();
    offCtx.drawImage(coinImg, 0, 0, roundCoinSize, roundCoinSize);
    roundCoinReady = true;
    draw();
  };

  const coins = [];
  const maxCoins = 20;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function spawnCoin() {
    if (coins.length >= maxCoins) return;
    coins.push({
      x: Math.random() * canvas.width,
      y: -80,
      size: 30 + Math.random() * 40,
      speedY: 0.4 + Math.random() * 1.2,
      speedX: (Math.random() - 0.5) * 0.6,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      opacity: 0.4 + Math.random() * 0.5,
    });
  }

  function draw() {
    if (!roundCoinReady) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = coins.length - 1; i >= 0; i--) {
      const c = coins[i];
      c.y += c.speedY;
      c.x += c.speedX;
      c.rotation += c.rotationSpeed;

      if (c.y > canvas.height + 80) {
        coins.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rotation);
      ctx.globalAlpha = c.opacity;
      ctx.drawImage(offscreen, -c.size / 2, -c.size / 2, c.size, c.size);
      ctx.restore();
    }

    if (Math.random() > 0.93) spawnCoin();

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
}

// --- Config ---
const CONFIG = {
  contractAddress: "",
  buyUrl: "#",
  explorerUrl: "#",
  chartUrl: "",
  chartExternalUrl: "",
  twitterUrl: "#",
  dexUrl: "#"
};

const $ = (id) => document.getElementById(id);

if (CONFIG.contractAddress) {
  $("contractAddress").textContent = CONFIG.contractAddress;
  $("copyButton").disabled = false;
}

if (CONFIG.buyUrl && CONFIG.buyUrl !== "#") {
  $("buyLink").href = CONFIG.buyUrl;
  $("buyLink").textContent = "Buy now";
  $("buyLink").onclick = null;
}

if (CONFIG.explorerUrl && CONFIG.explorerUrl !== "#") {
  $("explorerLink").href = CONFIG.explorerUrl;
  $("explorerLink").onclick = null;
}

if (CONFIG.twitterUrl && CONFIG.twitterUrl !== "#") {
  $("twitterLink").href = CONFIG.twitterUrl;
}

if (CONFIG.dexUrl && CONFIG.dexUrl !== "#") {
  $("dexLink").href = CONFIG.dexUrl;
}

$("year").textContent = new Date().getFullYear();

if (CONFIG.chartUrl) {
  $("chartFrame").src = CONFIG.chartUrl;
  $("chartFrame").style.display = "block";
  $("chartPlaceholder").style.display = "none";
}

$("copyButton").addEventListener("click", async () => {
  if (!CONFIG.contractAddress) return;
  try {
    await navigator.clipboard.writeText(CONFIG.contractAddress);
    $("toast").classList.add("show");
    $("copyButton").textContent = "Copied";
    setTimeout(() => {
      $("toast").classList.remove("show");
      $("copyButton").textContent = "Copy";
    }, 1600);
  } catch {
    window.prompt("Copy contract address:", CONFIG.contractAddress);
  }
});

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  initCoinRain();
});
