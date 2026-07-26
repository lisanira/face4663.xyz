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

// === TradingView Lightweight Charts ===
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
      barSpacing: 10,
    },
  });

  const candlestickSeries = chart.addSeries(LightweightCharts.CandlestickSeries, {
    upColor: '#36fb36',
    downColor: '#ff3131',
    borderVisible: false,
    wickUpColor: '#36fb36',
    wickDownColor: '#ff3131',
  });

  const volumeSeries = chart.addSeries(LightweightCharts.HistogramSeries, {
    color: '#26a69a',
    priceFormat: { type: 'volume' },
    priceScaleId: '',
  });

  volumeSeries.priceScale().applyOptions({
    scaleMargins: { top: 0.8, bottom: 0 },
  });

  // Generate simulated data (replace with API data later)
  const generateData = () => {
    const data = [];
    const volumeData = [];
    let time = Math.floor(Date.now() / 1000) - (200 * 3600);
    let price = 0.00000005;

    for (let i = 0; i < 150; i++) {
      const step = 3600;
      let volatility = (Math.random() - 0.48) * 0.00000001;
      if (i > 120) volatility += 0.00000005;

      const open = price;
      const close = price + volatility;
      const high = Math.max(open, close) + Math.random() * 0.000000005;
      const low = Math.min(open, close) - Math.random() * 0.000000005;

      price = Math.max(0.000000001, close);

      const isUp = close > open;
      const volume = Math.random() * (i > 130 ? 100000000 : 20000000);

      const barTime = time + (i * step);
      data.push({ time: barTime, open, high, low, close });
      volumeData.push({
        time: barTime,
        value: volume,
        color: isUp ? 'rgba(54, 251, 54, 0.5)' : 'rgba(255, 49, 49, 0.5)'
      });
    }
    return { candles: data, volumes: volumeData };
  };

  const chartData = generateData();
  candlestickSeries.setData(chartData.candles);
  volumeSeries.setData(chartData.volumes);

  // Live update simulation
  let lastBar = chartData.candles[chartData.candles.length - 1];
  let lastVolume = chartData.volumes[chartData.volumes.length - 1];

  setInterval(() => {
    const change = (Math.random() - 0.4) * 0.000000002;
    const newClose = lastBar.close + change;

    lastBar = {
      ...lastBar,
      close: newClose,
      high: Math.max(lastBar.high, newClose),
      low: Math.min(lastBar.low, newClose),
    };

    candlestickSeries.update(lastBar);

    lastVolume = {
      ...lastVolume,
      value: lastVolume.value + Math.random() * 100000,
      color: lastBar.close > lastBar.open ? 'rgba(54, 251, 54, 0.5)' : 'rgba(255, 49, 49, 0.5)'
    };
    volumeSeries.update(lastVolume);
  }, 2000);

  // Responsive
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

// Fetch live stats from DexScreener API
if (CONFIG.dexScreenerApi) {
  fetch(CONFIG.dexScreenerApi)
    .then((r) => r.json())
    .then((data) => {
      const pair = data.pairs && data.pairs[0];
      if (!pair) return;

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
