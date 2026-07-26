const CONFIG = {
  contractAddress: "",
  buyUrl: "#",
  explorerUrl: "",
  chartUrl: "",
  chartExternalUrl: "",
  twitterUrl: "#",
  dexUrl: "#",
  dexScreenerApi: ""
};

const $ = (id) => document.getElementById(id);

// Live state — activate when contract address is set
if (CONFIG.contractAddress) {
  $("contractAddress").textContent = CONFIG.contractAddress;
  $("copyButton").disabled = false;

  // Activate buttons
  if (CONFIG.buyUrl && CONFIG.buyUrl !== "#") {
    $("buyLink").href = CONFIG.buyUrl;
    $("buyLink").textContent = "Buy now";
    $("buyLink").classList.remove("coming-soon-btn");
    $("buyLink").onclick = null;
  }
  if (CONFIG.explorerUrl) {
    $("explorerLink").href = CONFIG.explorerUrl;
    $("explorerLink").textContent = "View explorer";
    $("explorerLink").classList.remove("coming-soon-btn");
    $("explorerLink").onclick = null;
  }
}

if (CONFIG.chartExternalUrl) {
  $("chartExternalLink").href = CONFIG.chartExternalUrl;
  $("chartExternalLink").style.display = "inline-flex";
}

if (CONFIG.twitterUrl && CONFIG.twitterUrl !== "#") {
  $("twitterLink").href = CONFIG.twitterUrl;
}

if (CONFIG.dexUrl && CONFIG.dexUrl !== "#") {
  $("dexLink").href = CONFIG.dexUrl;
}

$("year").textContent = new Date().getFullYear();

// Live chart
if (CONFIG.chartUrl) {
  $("chartFrame").src = CONFIG.chartUrl;
  $("chartFrame").style.display = "block";
  $("chartPlaceholder").style.display = "none";
  $("chartLiveBadge").style.display = "inline-flex";
}

// Fetch live stats from DexScreener API
if (CONFIG.dexScreenerApi) {
  fetch(CONFIG.dexScreenerApi)
    .then((r) => r.json())
    .then((data) => {
      const pair = data.pairs && data.pairs[0];
      if (!pair) return;

      $("chartLiveBadge").style.display = "inline-flex";

      const ca = pair.baseToken ? pair.baseToken.address : "";
      $("statContract").textContent = ca ? ca.slice(0,4) + "..." + ca.slice(-6) : "—";
      $("statLiquidity").textContent = pair.liquidity && pair.liquidity.usd ? "$" + fmt(pair.liquidity.usd) : "—";
      $("statHolders").textContent = pair.info && pair.info.holders ? fmt(pair.info.holders) : "—";
      $("statMcap").textContent = pair.marketCap ? "$" + fmt(pair.marketCap) : (pair.fdv ? "$" + fmt(pair.fdv) : "—");
      $("statVolume").textContent = pair.volume && pair.volume.h24 ? "$" + fmt(pair.volume.h24) : "—";
      $("chartPairName").textContent = (pair.baseToken ? pair.baseToken.symbol : "TOKEN") + " / " + (pair.quoteToken ? pair.quoteToken.symbol : "ETH");
    })
    .catch(() => {});
}

function fmt(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return Number(n).toFixed(2);
}

// Copy CA
$("copyButton").addEventListener("click", async () => {
  if (!CONFIG.contractAddress) return;
  try {
    await navigator.clipboard.writeText(CONFIG.contractAddress);
    $("toast").classList.add("show");
    $("copyButton").textContent = "Copied";
    setTimeout(() => {
      $("toast").classList.remove("show");
      $("copyButton").textContent = "Copy CA";
    }, 1600);
  } catch {
    window.prompt("Copy contract address:", CONFIG.contractAddress);
  }
});