// Temporary functional test using Robinhood Chain token — replace CA at launch.
const CONFIG = {
  contractAddress: "0x39a200271525e9641e799127bdab299daef21953",
  buyUrl: "https://dexscreener.com/robinhood/0x39a200271525e9641e799127bdab299daef21953",
  explorerUrl: "https://blockscout.com/robinhoodchain/address/0x39a200271525e9641e799127bdab299daef21953",
  chartUrl: "https://dexscreener.com/robinhood/0x39a200271525e9641e799127bdab299daef21953?embed=1&theme=dark&info=0",
  chartExternalUrl: "https://dexscreener.com/robinhood/0x39a200271525e9641e799127bdab299daef21953",
  twitterUrl: "https://x.com/elonmusk",
  dexUrl: "https://dexscreener.com/robinhood/0x39a200271525e9641e799127bdab299daef21953"
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
  $("explorerLink").textContent = "View explorer";
  $("explorerLink").onclick = null;
}

if (CONFIG.chartExternalUrl) {
  $("chartExternalLink").href = CONFIG.chartExternalUrl;
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
      $("copyButton").textContent = "Copy CA";
    }, 1600);
  } catch {
    window.prompt("Copy contract address:", CONFIG.contractAddress);
  }
});