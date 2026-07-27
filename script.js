/*
  FACE4663 WEBSITE CONFIG
  Replace the placeholder values below after the official deployment and DEX pair are live.
*/
const CONFIG = {
  contractAddress: "0x00000000000000000000000000000000face4663",
  explorerUrl: "#",
  chartEmbedUrl: "",
  fullChartUrl: "#",
  tradeUrl: "#",
  xUrl: "#"
};

const truncateContract = (address) => {
  if (!address || address.length < 18) return address;
  return `${address.slice(0, 8)}...${address.slice(-12)}`;
};

document.querySelectorAll("[data-contract-full]").forEach((node) => {
  node.textContent = CONFIG.contractAddress;
});

document.querySelectorAll("[data-contract-display]").forEach((node) => {
  node.textContent = truncateContract(CONFIG.contractAddress);
});

document.querySelectorAll("[data-explorer-link]").forEach((link) => {
  link.href = CONFIG.explorerUrl;
});

document.querySelectorAll("[data-full-chart-link]").forEach((link) => {
  link.href = CONFIG.fullChartUrl;
});

document.querySelectorAll("[data-trade-link]").forEach((link) => {
  link.href = CONFIG.tradeUrl;
});

document.querySelectorAll("[data-x-link]").forEach((link) => {
  link.href = CONFIG.xUrl;
});

const chartFrame = document.querySelector("[data-chart-frame]");
const chartPlaceholder = document.querySelector("[data-chart-placeholder]");

if (CONFIG.chartEmbedUrl) {
  chartFrame.src = CONFIG.chartEmbedUrl;
  chartPlaceholder.hidden = true;
} else {
  chartFrame.hidden = true;
}

const statusNodes = document.querySelectorAll("[data-copy-status]");

document.querySelectorAll("[data-copy-contract]").forEach((button) => {
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(CONFIG.contractAddress);
      button.textContent = "Copied";
      statusNodes.forEach((node) => {
        node.textContent = "Contract copied to clipboard.";
      });
      window.setTimeout(() => {
        button.textContent = button.classList.contains("copy-button") ? "Copy" : "Copy Contract";
        statusNodes.forEach((node) => {
          node.textContent = "";
        });
      }, 1800);
    } catch {
      statusNodes.forEach((node) => {
        node.textContent = `Copy manually: ${CONFIG.contractAddress}`;
      });
    }
  });
});

const header = document.querySelector(".site-header");
const updateHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const createFallingItems = () => {
  const layer = document.getElementById("falling-layer");
  const isMobile = window.matchMedia("(max-width: 680px)").matches;
  const itemCount = isMobile ? 10 : 18;

  layer.innerHTML = "";

  for (let i = 0; i < itemCount; i += 1) {
    const item = document.createElement("span");
    const isCoin = Math.random() > 0.48;
    item.className = `falling-item ${isCoin ? "coin" : "robinhood-logo"}`;

    const size = isCoin
      ? Math.round(26 + Math.random() * (isMobile ? 22 : 38))
      : Math.round(32 + Math.random() * (isMobile ? 30 : 48));

    item.style.left = `${Math.random() * 100}%`;
    item.style.setProperty("--size", `${size}px`);
    item.style.setProperty("--duration", `${12 + Math.random() * 14}s`);
    item.style.setProperty("--delay", `${Math.random() * -22}s`);
    item.style.setProperty("--drift", `${-70 + Math.random() * 140}px`);
    item.style.setProperty("--opacity", `${0.28 + Math.random() * 0.42}`);

    if (isCoin) {
      const img = document.createElement("img");
      img.src = "./assets/face4663-mascot.jpg";
      img.alt = "";
      item.appendChild(img);
    }

    layer.appendChild(item);
  }
};

createFallingItems();
let resizeTimer;
window.addEventListener("resize", () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(createFallingItems, 180);
});
