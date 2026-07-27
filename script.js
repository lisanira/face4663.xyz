// Temporary functional test using Robinhood Chain token — replace CA at launch.
const CONFIG = {
  contractAddress: "0x0e49718b25e1cdf49bc62068198465b1681827e5",
  buyUrl: "https://dexscreener.com/robinhood/0x0e49718b25e1cdf49bc62068198465b1681827e5",
  explorerUrl: "https://robinhoodchain.blockscout.com/address/0x0e49718b25e1cdf49bc62068198465b1681827e5",
  chartUrl: "https://dexscreener.com/robinhood/0x0e49718b25e1cdf49bc62068198465b1681827e5?embed=1&theme=dark&info=0",
  chartExternalUrl: "https://dexscreener.com/robinhood/0x0e49718b25e1cdf49bc62068198465b1681827e5",
  twitterUrl: "https://x.com/ninehood_h",
  dexUrl: "https://dexscreener.com/robinhood/0x0e49718b25e1cdf49bc62068198465b1681827e5"
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