const CONFIG = {
  contractAddress: "0xYOUR_CONTRACT_ADDRESS_FACE4663",
  buyUrl: "#",
  explorerUrl: "#",
  chartUrl: "",
  twitterUrl: "#",
  dexUrl: "#"
};

const $ = (id) => document.getElementById(id);

$("contractAddress").textContent = CONFIG.contractAddress;
$("buyLink").href = CONFIG.buyUrl;
$("explorerLink").href = CONFIG.explorerUrl;
$("chartExternalLink").href = CONFIG.dexUrl;
$("twitterLink").href = CONFIG.twitterUrl;
$("dexLink").href = CONFIG.dexUrl;
$("year").textContent = new Date().getFullYear();

if (CONFIG.chartUrl) {
  $("chartFrame").src = CONFIG.chartUrl;
  $("chartFrame").style.display = "block";
  $("chartPlaceholder").style.display = "none";
}

$("copyButton").addEventListener("click", async () => {
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