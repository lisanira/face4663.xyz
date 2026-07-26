const CONFIG = {
  contractAddress: "0x8029c5759a18eb4307a57b56704647530197e26d",
  buyUrl: "https://dexscreener.com/robinhood/0x8029c5759a18eb4307a57b56704647530197e26d",
  explorerUrl: "https://blockscout.com/robinhood/0x8029c5759a18eb4307a57b56704647530197e26d",
  chartExternalUrl: "https://dexscreener.com/robinhood/0x8029c5759a18eb4307a57b56704647530197e26d",
  twitterUrl: "https://x.com/BangGans28",
  dexUrl: "https://dexscreener.com/robinhood/0x8029c5759a18eb4307a57b56704647530197e26d",
  pairAddress: "0x8029c5759a18eb4307a57b56704647530197e26d",
  geckoTerminalPool: "0x8029c5759a18eb4307a57b56704647530197e26d"
};

const $ = (id) => document.getElementById(id);

// Live state
if (CONFIG.contractAddress) {
  $("contractAddress").textContent = CONFIG.contractAddress;
  $("copyButton").disabled = false;

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

// === TradingView Lightweight Charts — Real Data ===
function initChart() {
  if (typeof LightweightCharts === 'undefined') return;

  const container = document.getElementById('chart-container');
  const chart = LightweightCharts.createChart(container, {
    layout: {
      background: { color: '#131722' },
      textColor: '#d1d4dc',
    },
    grid: {
      vertLines: { color: 'rgba(42, 46, 57, 0)' },
      horzLines: { color: '#2a2e39' },
    },
    crosshair: {
      mode: LightweightCharts.CrosshairMode.Normal,
    },
    priceScale: {
      borderColor: '#2a2e39',
      scaleMargins: { top: 0.1, bottom: 0.2 },
    },
    timeScale: {
      borderColor: '#2a2e39',
      timeVisible: true,
      secondsVisible: false,
    },
  });

  const candleSeries = chart.addCandlestickSeries({
    upColor: '#36fb36',
    downColor: '#ff3131',
    borderVisible: false,
    wickUpColor: '#36fb36',
    wickDownColor: '#ff3131',
  });

  const volumeSeries = chart.addHistogramSeries({
    color: '#26a69a',
    priceFormat: { type: 'volume' },
    priceScaleId: '',
  });

  volumeSeries.priceScale().applyOptions({
    scaleMargins: { top: 0.8, bottom: 0 },
  });

  // Fetch real OHLCV from GeckoTerminal
  async function loadChartData() {
    try {
      const res = await fetch(
        `https://api.geckoterminal.com/api/v2/networks/robinhood/pools/${CONFIG.geckoTerminalPool}/ohlcv/hour?limit=200`
      );
      const data = await res.json();
      const ohlcv = data.data.attributes.ohlcv_list;

      // GeckoTerminal returns [timestamp, open, high, low, close, volume]
      const candles = ohlcv.map(d => ({
        time: d[0],
        open: d[1],
        high: d[2],
        low: d[3],
        close: d[4],
      })).reverse();

      const volumes = ohlcv.map(d => ({
        time: d[0],
        value: d[5],
        color: d[4] >= d[1] ? 'rgba(54, 251, 54, 0.5)' : 'rgba(255, 49, 49, 0.5)',
      })).reverse();

      candleSeries.setData(candles);
      volumeSeries.setData(volumes);
      chart.timeScale().fitContent();
    } catch (e) {
      console.log('Chart data error:', e);
    }
  }

  loadChartData();

  window.addEventListener('resize', () => {
    chart.resize(container.clientWidth, container.clientHeight);
  });
}

// Init chart when library loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChart);
} else {
  initChart();
}

// Fetch live stats from DexScreener
async function loadStats() {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/search?q=${CONFIG.contractAddress}`
    );
    const data = await res.json();
    const pair = data.pairs && data.pairs[0];
    if (!pair) return;

    // Update pair name
    $("chartPairName").textContent =
      (pair.baseToken ? pair.baseToken.symbol : "TOKEN") + " / " +
      (pair.quoteToken ? pair.quoteToken.symbol : "ETH");

    // Update stats
    const ca = pair.baseToken ? pair.baseToken.address : "";
    $("statContract").textContent = ca ? ca.slice(0, 4) + "..." + ca.slice(-6) : "—";
    $("statLiquidity").textContent = pair.liquidity && pair.liquidity.usd ? "$" + fmt(pair.liquidity.usd) : "—";
    $("statMcap").textContent = pair.marketCap ? "$" + fmt(pair.marketCap) : (pair.fdv ? "$" + fmt(pair.fdv) : "—");
    $("statVolume").textContent = pair.volume && pair.volume.h24 ? "$" + fmt(pair.volume.h24) : "—";
    $("statHolders").textContent = pair.info && pair.info.holders ? fmt(pair.info.holders) : "—";
  } catch (e) {
    console.log('Stats error:', e);
  }
}

loadStats();

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
