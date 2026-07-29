/* FACE4663 Contract Identity Lab — lab.js */
'use strict';

/* ============================================================
   UTILITIES
   ============================================================ */

const HEX_RE = /^[0-9a-fA-F]$/;
const ADDR_RE = /^0x[0-9a-fA-F]{40}$/;

function isHexChar(c) { return HEX_RE.test(c); }
function isHexPattern(s) { return /^[0-9a-f]+$/.test(s.toLowerCase()); }
function normalizeHex(s) { return s.toLowerCase(); }

function validateAddress(addr) {
  if (typeof addr !== 'string') return false;
  return ADDR_RE.test(addr.trim());
}

function countLeadingZeros(hex) {
  let c = 0;
  for (let i = 0; i < hex.length; i++) {
    if (hex[i] === '0') c++; else break;
  }
  return c;
}

function countTrailingZeros(hex) {
  let c = 0;
  for (let i = hex.length - 1; i >= 0; i--) {
    if (hex[i] === '0') c++; else break;
  }
  return c;
}

function findRepeatedPrefix(hex) {
  if (hex.length < 2) return null;
  const c = hex[0];
  let count = 1;
  for (let i = 1; i < hex.length; i++) {
    if (hex[i] === c) count++; else break;
  }
  return count >= 2 ? c.repeat(count) : null;
}

function findRepeatedSuffix(hex) {
  if (hex.length < 2) return null;
  const c = hex[hex.length - 1];
  let count = 1;
  for (let i = hex.length - 2; i >= 0; i--) {
    if (hex[i] === c) count++; else break;
  }
  return count >= 2 ? c.repeat(count) : null;
}

/** BigInt 2^n */
function bigPow2(n) {
  if (n <= 0) return 1n;
  return 2n ** BigInt(n);
}

/** BigInt 16^n */
function bigPow16(n) {
  if (n <= 0) return 1n;
  return 16n ** BigInt(n);
}

/** Format BigInt with commas */
function formatBig(n) {
  const s = n.toString();
  let result = '';
  let count = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    if (count > 0 && count % 3 === 0) result = ',' + result;
    result = s[i] + result;
    count++;
  }
  return result;
}

/** Format time in seconds to human-readable string */
function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return '—';
  if (seconds < 0.001) return '< 1 ms';
  if (seconds < 1) return seconds.toFixed(2) + ' s';
  if (seconds < 60) return seconds.toFixed(1) + ' s';

  const mins = seconds / 60;
  if (mins < 60) return mins.toFixed(1) + ' min';

  const hours = mins / 60;
  if (hours < 24) return hours.toFixed(1) + ' hr';

  const days = hours / 24;
  if (days < 365) return days.toFixed(1) + ' days';

  const years = days / 365.25;
  if (years < 1000) return years.toFixed(1) + ' years';

  const kYears = years / 1000;
  if (kYears < 1000) return kYears.toFixed(1) + 'K years';

  const mYears = kYears / 1000;
  if (mYears < 1000) return mYears.toFixed(1) + 'M years';

  const bYears = mYears / 1000;
  return bYears.toFixed(1) + 'B years';
}

/** Format time using BigInt (attempts / speed) for very large numbers */
function formatTimeBigInt(attempts, speed) {
  if (speed <= 0) return '—';
  // attempts / speed in seconds
  const speedBig = BigInt(speed);
  if (attempts <= speedBig) {
    // sub-second
    const sec = Number(attempts) / speed;
    return formatTime(sec);
  }
  const totalSec = attempts / speedBig; // BigInt division
  const secNum = Number(totalSec);
  if (secNum < 1e15) return formatTime(secNum);
  // Very large — use years
  const years = secNum / (365.25 * 24 * 3600);
  if (years < 1e6) return years.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' years';
  if (years < 1e9) return (years / 1e6).toFixed(1) + 'M years';
  if (years < 1e12) return (years / 1e9).toFixed(1) + 'B years';
  return (years / 1e12).toFixed(1) + 'T years';
}

/** Calculate probability: P = 1 - exp(-speed * t / N) */
function calcProb(speed, timeSec, avgAttempts) {
  if (speed <= 0 || avgAttempts <= 0) return 0;
  const lambda = speed / avgAttempts;
  const prob = 1 - Math.exp(-lambda * timeSec);
  return prob;
}

/** Format probability as percentage */
function formatProb(p) {
  if (p <= 0) return '0%';
  if (p >= 1) return '100%';
  if (p < 0.0001) return '< 0.01%';
  return (p * 100).toFixed(2) + '%';
}

/* ============================================================
   HEADER SCROLL & MOBILE MENU
   ============================================================ */

(function initHeader() {
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('is-scrolled', window.scrollY > 30);
    }, { passive: true });
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
    // Close on nav link click
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => nav.classList.remove('open'));
    });
  }
})();

/* ============================================================
   PLAYGROUND — Section 02
   ============================================================ */

(function initPlayground() {
  const form = document.getElementById('playgroundForm');
  const output = document.getElementById('playgroundOutput');
  if (!form || !output) return;

  const $addr = document.getElementById('pg-r-address');
  const $valid = document.getElementById('pg-r-valid');
  const $pattern = document.getElementById('pg-r-pattern');
  const $mode = document.getElementById('pg-r-mode');
  const $length = document.getElementById('pg-r-length');
  const $match = document.getElementById('pg-r-match');
  const $difficulty = document.getElementById('pg-r-difficulty');
  const $attempts = document.getElementById('pg-r-attempts');
  const $rarity = document.getElementById('pg-r-rarity');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const addr = document.getElementById('pg-address').value.trim();
    const mode = document.getElementById('pg-mode').value;
    let target = document.getElementById('pg-target').value.trim().toLowerCase();

    // Validate address
    const addrValid = validateAddress(addr);
    if (!addrValid) {
      showResults(addr, 'Invalid', target, mode, 0, false, 0n, 0n);
      return;
    }

    // Validate target
    if (!target || !isHexPattern(target)) {
      showResults(addr, 'Valid', target || '(none)', mode, 0, false, 0n, 0n);
      return;
    }

    // Check match
    const addrLower = normalizeHex(addr.slice(2)); // strip 0x
    let matched = false;
    if (mode === 'suffix') {
      matched = addrLower.endsWith(target);
    } else {
      matched = addrLower.startsWith(target);
    }

    const n = target.length * 4; // bits = chars * 4
    const difficulty = bigPow2(n);
    const attempts = bigPow16(target.length);

    showResults(addr, 'Valid', target, mode, target.length, matched, difficulty, attempts);
  });

  function showResults(addr, validity, target, mode, len, matched, difficulty, attempts) {
    output.hidden = false;

    $addr.textContent = addr || '—';
    $addr.className = 'result-value';

    $valid.textContent = validity;
    $valid.className = 'result-value ' + (validity === 'Valid' ? 'valid' : 'invalid');

    $pattern.textContent = target || '—';
    $mode.textContent = mode === 'suffix' ? 'Suffix' : 'Prefix';
    $length.textContent = len > 0 ? len + ' chars (' + (len * 4) + ' bits)' : '—';

    $match.textContent = len > 0 ? (matched ? '✓ Match' : '✗ No Match') : '—';
    $match.className = 'result-value ' + (matched ? 'match' : (len > 0 ? 'no-match' : ''));

    $difficulty.textContent = len > 0 ? '2^' + (len * 4) + ' = ' + formatBig(difficulty) : '—';
    $attempts.textContent = len > 0 ? '16^' + len + ' = ' + formatBig(attempts) : '—';
    $rarity.textContent = len > 0 ? '1 in ' + formatBig(attempts) : '—';
  }
})();

/* ============================================================
   CALCULATOR — Section 03
   ============================================================ */

(function initCalculator() {
  const form = document.getElementById('calcForm');
  if (!form) return;

  const modeEl = document.getElementById('calc-mode');
  const prefixEl = document.getElementById('calc-prefix');
  const suffixEl = document.getElementById('calc-suffix');
  const speedEl = document.getElementById('calc-speed');
  const presetBtns = document.querySelectorAll('.speed-preset');

  // Results
  const $type = document.getElementById('cr-type');
  const $chars = document.getElementById('cr-chars');
  const $difficulty = document.getElementById('cr-difficulty');
  const $attempts = document.getElementById('cr-attempts');
  const $rarity = document.getElementById('cr-rarity');
  const $avgTime = document.getElementById('cr-avg-time');
  const $median = document.getElementById('cr-median');
  const $p90 = document.getElementById('cr-p90pct');
  const $p1m = document.getElementById('cr-p1m');
  const $p1h = document.getElementById('cr-p1h');
  const $p1d = document.getElementById('cr-p1d');
  const $p1w = document.getElementById('cr-p1w');

  // Speed presets
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.dataset.speed;
      if (val === 'custom') {
        speedEl.focus();
        speedEl.select();
      } else {
        speedEl.value = val;
      }
      recalc();
    });
  });

  // Recalc on any input change
  [modeEl, prefixEl, suffixEl, speedEl].forEach(el => {
    el.addEventListener('input', recalc);
    el.addEventListener('change', recalc);
  });

  function recalc() {
    const mode = modeEl.value;
    const prefix = normalizeHex(prefixEl.value.trim());
    const suffix = normalizeHex(suffixEl.value.trim());
    const speedStr = speedEl.value.trim();
    const speed = parseFloat(speedStr) || 0;

    // Validate hex patterns
    const prefixValid = !prefix || isHexPattern(prefix);
    const suffixValid = !suffix || isHexPattern(suffix);

    let totalChars = 0;
    let patternType = 'None';

    if (mode === 'prefix' && prefixValid && prefix) {
      totalChars = prefix.length;
      patternType = 'Prefix: ' + prefix;
    } else if (mode === 'suffix' && suffixValid && suffix) {
      totalChars = suffix.length;
      patternType = 'Suffix: ' + suffix;
    } else if (mode === 'both' && prefixValid && suffixValid) {
      const pLen = prefix ? prefix.length : 0;
      const sLen = suffix ? suffix.length : 0;
      totalChars = pLen + sLen;
      if (pLen && sLen) patternType = 'Prefix: ' + prefix + ' + Suffix: ' + suffix;
      else if (pLen) patternType = 'Prefix: ' + prefix;
      else if (sLen) patternType = 'Suffix: ' + suffix;
      else patternType = 'None';
    }

    $type.textContent = patternType;
    $chars.textContent = totalChars.toString();

    if (totalChars === 0) {
      $difficulty.textContent = '1';
      $attempts.textContent = '1';
      $rarity.textContent = '1 in 1';
      $avgTime.textContent = '—';
      $median.textContent = '—';
      $p90.textContent = '—';
      $p1m.textContent = '—';
      $p1h.textContent = '—';
      $p1d.textContent = '—';
      $p1w.textContent = '—';
      return;
    }

    const n = totalChars * 4;
    const diff = bigPow2(n);
    const avg = bigPow16(totalChars);

    $difficulty.textContent = '2^' + n + ' = ' + formatBig(diff);
    $attempts.textContent = '16^' + totalChars + ' = ' + formatBig(avg);
    $rarity.textContent = '1 in ' + formatBig(avg);

    // Speed validation
    if (speed <= 0) {
      $avgTime.textContent = '⚠ Enter speed > 0';
      $median.textContent = '—';
      $p90.textContent = '—';
      $p1m.textContent = '—';
      $p1h.textContent = '—';
      $p1d.textContent = '—';
      $p1w.textContent = '—';
      return;
    }

    // Avg time = N / speed (where N = 16^totalChars = avg attempts)
    const avgTimeSec = Number(avg) / speed;
    $avgTime.textContent = formatTime(avgTimeSec);

    // Median time = -ln(0.5) * N / speed ≈ 0.6931 * N / speed
    const medianSec = Math.LN2 * Number(avg) / speed;
    $median.textContent = formatTime(medianSec);

    // 90th percentile = -ln(0.1) * N / speed ≈ 2.3026 * N / speed
    const p90Sec = Math.LN10 * Number(avg) / speed;
    $p90.textContent = formatTime(p90Sec);

    // Probabilities P = 1 - exp(-speed * t / N)
    // For very large avg, use approximation: lambda = speed / avg
    const prob1m = calcProb(speed, 60, Number(avg));
    const prob1h = calcProb(speed, 3600, Number(avg));
    const prob1d = calcProb(speed, 86400, Number(avg));
    const prob1w = calcProb(speed, 604800, Number(avg));

    $p1m.textContent = formatProb(prob1m);
    $p1h.textContent = formatProb(prob1h);
    $p1d.textContent = formatProb(prob1d);
    $p1w.textContent = formatProb(prob1w);
  }

  recalc();
})();

/* ============================================================
   INSPECTOR — Section 04
   ============================================================ */

(function initInspector() {
  const form = document.getElementById('inspectorForm');
  const output = document.getElementById('inspectorOutput');
  if (!form || !output) return;

  const $full = document.getElementById('in-r-full');
  const $count = document.getElementById('in-r-count');
  const $leading = document.getElementById('in-r-leading');
  const $trailing = document.getElementById('in-r-trailing');
  const $first4 = document.getElementById('in-r-first4');
  const $first8 = document.getElementById('in-r-first8');
  const $last4 = document.getElementById('in-r-last4');
  const $last8 = document.getElementById('in-r-last8');
  const $repPrefix = document.getElementById('in-r-rep-prefix');
  const $repSuffix = document.getElementById('in-r-rep-suffix');
  const $match = document.getElementById('in-r-match');
  const $rarity = document.getElementById('in-r-rarity');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const addr = document.getElementById('ins-address').value.trim();
    const target = normalizeHex(document.getElementById('ins-target').value.trim());
    const targetMode = document.getElementById('ins-target-mode').value;

    output.hidden = false;

    if (!validateAddress(addr)) {
      $full.textContent = addr || '—';
      $count.textContent = '—';
      $leading.textContent = '—';
      $trailing.textContent = '—';
      $first4.textContent = '—';
      $first8.textContent = '—';
      $last4.textContent = '—';
      $last8.textContent = '—';
      $repPrefix.textContent = '—';
      $repSuffix.textContent = '—';
      $match.textContent = 'Invalid address';
      $match.className = 'result-value invalid';
      $rarity.textContent = '—';
      return;
    }

    const hex = normalizeHex(addr.slice(2)); // strip 0x
    $full.textContent = addr;
    $count.textContent = hex.length.toString();
    $leading.textContent = countLeadingZeros(hex).toString();
    $trailing.textContent = countTrailingZeros(hex).toString();
    $first4.textContent = hex.slice(0, 4);
    $first8.textContent = hex.slice(0, 8);
    $last4.textContent = hex.slice(-4);
    $last8.textContent = hex.slice(-8);

    const repP = findRepeatedPrefix(hex);
    const repS = findRepeatedSuffix(hex);
    $repPrefix.textContent = repP ? repP + ' (' + repP.length + ' chars)' : 'None';
    $repSuffix.textContent = repS ? repS + ' (' + repS.length + ' chars)' : 'None';

    // Target matching
    if (target && isHexPattern(target)) {
      let matched = false;
      if (targetMode === 'suffix') {
        matched = hex.endsWith(target);
      } else {
        matched = hex.startsWith(target);
      }
      $match.textContent = matched ? '✓ Matches ' + targetMode + ' "' + target + '"' : '✗ No match for "' + target + '"';
      $match.className = 'result-value ' + (matched ? 'match' : 'no-match');

      // Estimated rarity
      const attempts = bigPow16(target.length);
      $rarity.textContent = '1 in ' + formatBig(attempts) + ' (' + target.length + ' chars)';
    } else {
      $match.textContent = 'No target specified';
      $match.className = 'result-value';
      $rarity.textContent = '—';
    }
  });
})();

/* ============================================================
   ACCORDION — Section 05
   ============================================================ */

(function initAccordion() {
  // Allow only one open at a time
  const items = document.querySelectorAll('.acc-item');
  items.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        items.forEach(other => {
          if (other !== item) other.open = false;
        });
      }
    });
  });
})();
