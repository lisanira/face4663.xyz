const CONFIG = {
  contractAddress: "",
  buyUrl: "#",
  explorerUrl: "",
  chartUrl: "",
  chartExternalUrl: "",
  twitterUrl: "#",
  dexUrl: "#"
};

const $ = (id) => document.getElementById(id);

// Coming Soon state — don't override if address is empty
if (CONFIG.contractAddress) {
  $("contractAddress").textContent = CONFIG.contractAddress;
  $("contractAddress").classList.remove("coming-soon-text");
  $("copyButton").disabled = false;
  $("copyButton").classList.remove("disabled-btn");
}

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

// Live chart — DexScreener embed
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
