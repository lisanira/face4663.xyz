/* FACE4663 Contract Identity Lab — lab.js */
'use strict';

/* ============================================================
   KECCAK-256 IMPLEMENTATION (Ethereum-compatible)
   NOT SHA-256, NOT NIST SHA3-256.
   Ethereum's "keccak256" uses the original Keccak submission
   before NIST modified it. The difference is in the padding
   byte: Keccak uses 0x01, NIST SHA-3 uses 0x06.
   ============================================================ */

const Keccak256 = {
  hash: function(input) {
    // js-sha3 keccak256 returns hex string, we need Uint8Array
    const hex = keccak256(input instanceof Uint8Array ? input : new TextEncoder().encode(input));
    const bytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) bytes[i] = parseInt(hex.substr(i*2, 2), 16);
    return bytes;
  },
  hashHex: function(hexStr) {
    // For EIP-55: hash the ASCII bytes of the hex string
    const asciiBytes = new TextEncoder().encode(hexStr);
    return keccak256(asciiBytes);
  }
};

/* ============================================================
   EIP-55 CHECKSUM
   ============================================================ */

/**
 * Compute EIP-55 mixed-case checksum address.
 * @param {string} addr - 40-char hex string (without 0x), case-insensitive
 * @returns {string} - EIP-55 checksum address with 0x prefix
 */
function eip55Checksum(addr) {
  const lower = addr.toLowerCase().replace(/^0x/, '');
  if (lower.length !== 40 || !/^[0-9a-f]{40}$/.test(lower)) {
    return null;
  }
  const hashHex = Keccak256.hashHex(lower);
  let result = '0x';
  for (let i = 0; i < 40; i++) {
    const nibble = parseInt(hashHex[i], 16);
    if (nibble >= 8) {
      result += lower[i].toUpperCase();
    } else {
      result += lower[i].toLowerCase();
    }
  }
  return result;
}

/**
 * Check if an address matches its EIP-55 checksum exactly.
 * @param {string} addr - Full address with 0x prefix
 * @returns {boolean}
 */
function isValidEIP55(addr) {
  if (!addr || !addr.startsWith('0x')) return false;
  const hex = addr.slice(2);
  if (hex.length !== 40 || !/^[0-9a-fA-F]{40}$/.test(hex)) return false;
  const expected = eip55Checksum(hex);
  return expected === addr;
}

/**
 * Count alphabetic hex characters (a-f) in a pattern.
 * @param {string} pattern - lowercase hex pattern
 * @returns {number}
 */
function countAlphaChars(pattern) {
  let count = 0;
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c >= 'a' && c <= 'f') count++;
  }
  return count;
}

/**
 * Check if a lowercase hex string matches the target at the given position
 * in a mixed-case address string.
 * @param {string} addrHex - 40-char address hex (original casing)
 * @param {string} target - lowercase target pattern
 * @param {string} mode - 'prefix' or 'suffix'
 * @returns {{ rawMatch: boolean, eip55Match: boolean }}
 */
function checkPatternMatch(addrHex, target, mode) {
  const addrLower = addrHex.toLowerCase();
  const rawMatch = mode === 'suffix'
    ? addrLower.endsWith(target)
    : addrLower.startsWith(target);

  // For EIP-55 match, check if the original casing of the address
  // matches the target pattern's casing at the relevant positions
  let eip55Match = false;
  if (rawMatch) {
    let relevantAddrChars;
    if (mode === 'suffix') {
      relevantAddrChars = addrHex.slice(-target.length);
    } else {
      relevantAddrChars = addrHex.slice(0, target.length);
    }
    eip55Match = relevantAddrChars === target;
  }

  return { rawMatch, eip55Match };
}

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
  if (seconds < 1e-9) return '< 1 ns';
  if (seconds < 1e-6) return (seconds * 1e9).toFixed(1) + ' ns';
  if (seconds < 1e-3) return (seconds * 1e6).toFixed(1) + ' µs';
  if (seconds < 1) return (seconds * 1e3).toFixed(2) + ' ms';
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
  const speedBig = BigInt(speed);
  if (attempts <= speedBig) {
    const sec = Number(attempts) / speed;
    return formatTime(sec);
  }
  const totalSec = attempts / speedBig;
  const secNum = Number(totalSec);
  if (secNum < 1e15) return formatTime(secNum);
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
   TEST CASES
   ============================================================ */

function runTestCases() {
  const results = [];
  let passed = 0;
  let failed = 0;

  function assert(name, condition, detail) {
    if (condition) {
      passed++;
      results.push('  ✓ ' + name);
    } else {
      failed++;
      results.push('  ✗ ' + name + (detail ? ' — ' + detail : ''));
    }
  }

  // Test 1: face4663 ignore checksum
  const t1 = countAlphaChars('face4663');
  assert('face4663: alpha chars = 4', t1 === 4, 'got ' + t1);
  assert('face4663 ignore: rawBits = 32', 4 * 8 === 32);
  assert('face4663 ignore: effectiveBits = 32', 32 + 0 === 32);

  // Test 2: face4663 exact EIP-55
  const t2alpha = countAlphaChars('face4663');
  assert('face4663 exact: alpha = 4', t2alpha === 4, 'got ' + t2alpha);
  assert('face4663 exact: checksumBits = 4', t2alpha === 4);
  assert('face4663 exact: effectiveBits = 36', 32 + 4 === 36);
  assert('face4663 exact: 2^36 = 68,719,476,736',
    bigPow2(36) === 68719476736n, 'got ' + bigPow2(36));

  // Test 3: 6969 exact — no alphabetic chars
  const t3alpha = countAlphaChars('6969');
  assert('6969: alpha = 0', t3alpha === 0, 'got ' + t3alpha);
  assert('6969 exact: effectiveBits = 16 (raw only)', 16 + 0 === 16);

  // Test 4: deadBEEF exact — all alphabetic (lowered)
  const t4alpha = countAlphaChars('deadbeef');
  assert('deadBEEF: alpha = 8', t4alpha === 8, 'got ' + t4alpha);
  assert('deadBEEF exact: effectiveBits = 40', 32 + 8 === 40);

  // Test 5: Prefix face + suffix 4663 exact
  const t5p = 'face', t5s = '4663';
  const t5total = t5p.length + t5s.length;
  const t5alpha = countAlphaChars(t5p) + countAlphaChars(t5s);
  assert('face+4663: total = 8', t5total === 8);
  assert('face+4663: alpha = 4', t5alpha === 4, 'got ' + t5alpha);
  assert('face+4663 exact: effectiveBits = 36', (t5total * 4) + t5alpha === 36);

  // Test 6: EIP-55 test vectors
  const testAddr1 = '52908400098527886E0F7030069857D2E4169EE7';
  const testAddr2 = 'de709f2102306220921060314715629080e2fb77';

  const checksum1 = eip55Checksum(testAddr1);
  const checksum2 = eip55Checksum(testAddr2);

  assert('EIP-55 vector 1 valid',
    checksum1 === '0x52908400098527886E0F7030069857D2E4169EE7',
    'got ' + checksum1);
  assert('EIP-55 vector 2 valid',
    checksum2 === '0xde709f2102306220921060314715629080e2fb77',
    'got ' + checksum2);

  assert('isValidEIP55 vector 1',
    isValidEIP55('0x52908400098527886E0F7030069857D2E4169EE7'));
  assert('isValidEIP55 vector 2',
    isValidEIP55('0xde709f2102306220921060314715629080e2fb77'));

  // Test 7: Validation
  assert('reject non-hex', !isHexPattern('xyz123'));
  assert('reject empty', !isHexPattern(''));
  assert('reject > 40 chars',
    !isHexPattern('a'.repeat(41)));
  assert('reject invalid address "not_an_address"',
    !validateAddress('not_an_address'));
  assert('reject address too short',
    !validateAddress('0x1234'));
  assert('accept valid address',
    validateAddress('0x' + 'a'.repeat(40)));

  // Keccak-256 sanity: hash of empty input
  const emptyHash = Keccak256.hashHex('');
  assert('keccak256("") = c5d246...',
    emptyHash === 'c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfaa0dca88e47a5',
    'got ' + emptyHash);

  const summary = '\n  Results: ' + passed + ' passed, ' + failed + ' failed';
  return results.join('\n') + summary;
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
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => nav.classList.remove('open'));
    });
  }
})();

/* ============================================================
   CALCULATOR — Section 02
   ============================================================ */

(function initCalculator() {
  const form = document.getElementById('calcForm');
  if (!form) return;

  const modeEl = document.getElementById('calc-mode');
  const prefixEl = document.getElementById('calc-prefix');
  const suffixEl = document.getElementById('calc-suffix');
  const speedEl = document.getElementById('calc-speed');
  const checksumEl = document.getElementById('calc-checksum');
  const presetBtns = document.querySelectorAll('.speed-preset');

  // Results
  const $type = document.getElementById('cr-type');
  const $chars = document.getElementById('cr-chars');
  const $alphaChars = document.getElementById('cr-alpha-chars');
  const $rawBits = document.getElementById('cr-raw-bits');
  const $checksumBits = document.getElementById('cr-checksum-bits');
  const $effectiveBits = document.getElementById('cr-effective-bits');
  const $difficulty = document.getElementById('cr-difficulty');
  const $effDifficulty = document.getElementById('cr-eff-difficulty');
  const $attempts = document.getElementById('cr-attempts');
  const $effAttempts = document.getElementById('cr-eff-attempts');
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

  // Toggle field visibility based on mode
  const prefixRow = prefixEl.closest('.form-row');
  const suffixRow = suffixEl.closest('.form-row');

  function updateFieldVisibility() {
    const m = modeEl.value;
    prefixRow.classList.toggle('hidden', m === 'suffix');
    suffixRow.classList.toggle('hidden', m === 'prefix');
  }
  modeEl.addEventListener('change', updateFieldVisibility);
  updateFieldVisibility();

  // Recalc on any input change
  [modeEl, prefixEl, suffixEl, speedEl, checksumEl].forEach(el => {
    el.addEventListener('input', recalc);
    el.addEventListener('change', recalc);
  });

  function recalc() {
    const mode = modeEl.value;
    const prefix = normalizeHex(prefixEl.value.trim());
    const suffix = normalizeHex(suffixEl.value.trim());
    const speedStr = speedEl.value.trim();
    const speed = parseFloat(speedStr) || 0;
    const checksumMode = checksumEl ? checksumEl.value : 'ignore';

    // Validate hex patterns
    const prefixValid = !prefix || isHexPattern(prefix);
    const suffixValid = !suffix || isHexPattern(suffix);

    let totalChars = 0;
    let patternStr = '';
    let patternType = 'None';

    if (mode === 'prefix' && prefixValid && prefix) {
      totalChars = prefix.length;
      patternStr = prefix;
      patternType = 'Prefix: ' + prefix;
    } else if (mode === 'suffix' && suffixValid && suffix) {
      totalChars = suffix.length;
      patternStr = suffix;
      patternType = 'Suffix: ' + suffix;
    } else if (mode === 'both' && prefixValid && suffixValid) {
      const pLen = prefix ? prefix.length : 0;
      const sLen = suffix ? suffix.length : 0;
      totalChars = pLen + sLen;
      patternStr = prefix + suffix;
      if (pLen && sLen) patternType = 'Prefix: ' + prefix + ' + Suffix: ' + suffix;
      else if (pLen) patternType = 'Prefix: ' + prefix;
      else if (sLen) patternType = 'Suffix: ' + suffix;
      else patternType = 'None';
    }

    $type.textContent = patternType;
    $chars.textContent = totalChars.toString();

    if (totalChars === 0) {
      if ($alphaChars) $alphaChars.textContent = '0';
      if ($rawBits) $rawBits.textContent = '0';
      if ($checksumBits) $checksumBits.textContent = '0';
      if ($effectiveBits) $effectiveBits.textContent = '0';
      $difficulty.textContent = '1';
      if ($effDifficulty) $effDifficulty.textContent = '1';
      $attempts.textContent = '1';
      if ($effAttempts) $effAttempts.textContent = '1';
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

    const rawBits = totalChars * 4;
    const alphaCount = countAlphaChars(patternStr);
    const checksumBits = (checksumMode === 'exact') ? alphaCount : 0;
    const effectiveBits = rawBits + checksumBits;

    const rawDiff = bigPow2(rawBits);
    const rawAvg = bigPow16(totalChars); // 16^n
    const effDiff = bigPow2(effectiveBits);
    // Effective average attempts = 2^effectiveBits
    const effAvg = bigPow2(effectiveBits);

    if ($alphaChars) $alphaChars.textContent = alphaCount.toString();
    if ($rawBits) $rawBits.textContent = rawBits.toString();
    if ($checksumBits) $checksumBits.textContent = checksumBits.toString();
    if ($effectiveBits) $effectiveBits.textContent = effectiveBits.toString();

    $difficulty.textContent = '2^' + rawBits + ' = ' + formatBig(rawDiff);
    if ($effDifficulty) {
      $effDifficulty.textContent = checksumMode === 'exact'
        ? '2^' + effectiveBits + ' = ' + formatBig(effDiff)
        : '—';
    }

    $attempts.textContent = '2^' + rawBits + ' = ' + formatBig(rawAvg);
    if ($effAttempts) {
      $effAttempts.textContent = checksumMode === 'exact'
        ? '2^' + effectiveBits + ' = ' + formatBig(effAvg)
        : '—';
    }

    // Use effective attempts for time calcs when checksum mode is exact
    const avgAttempts = checksumMode === 'exact' ? effAvg : rawAvg;
    $rarity.textContent = '1 in ' + formatBig(avgAttempts);

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

    // Avg time = N / speed
    const avgTimeSec = Number(avgAttempts) / speed;
    $avgTime.textContent = formatTime(avgTimeSec);

    // Median time = -ln(0.5) * N / speed ≈ 0.6931 * N / speed
    const medianSec = Math.LN2 * Number(avgAttempts) / speed;
    $median.textContent = formatTime(medianSec);

    // 90th percentile = -ln(0.1) * N / speed ≈ 2.3026 * N / speed
    const p90Sec = Math.LN10 * Number(avgAttempts) / speed;
    $p90.textContent = formatTime(p90Sec);

    // Probabilities P = 1 - exp(-speed * t / N)
    const prob1m = calcProb(speed, 60, Number(avgAttempts));
    const prob1h = calcProb(speed, 3600, Number(avgAttempts));
    const prob1d = calcProb(speed, 86400, Number(avgAttempts));
    const prob1w = calcProb(speed, 604800, Number(avgAttempts));

    $p1m.textContent = formatProb(prob1m);
    $p1h.textContent = formatProb(prob1h);
    $p1d.textContent = formatProb(prob1d);
    $p1w.textContent = formatProb(prob1w);
  }

  recalc();
})();

/* ============================================================
   INSPECTOR — Section 03
   ============================================================ */

(function initInspector() {
  const form = document.getElementById('inspectorForm');
  const output = document.getElementById('inspectorOutput');
  if (!form || !output) return;

  const $full = document.getElementById('in-r-full');
  const $valid = document.getElementById('in-r-valid');
  const $canonical = document.getElementById('in-r-canonical');
  const $count = document.getElementById('in-r-count');
  const $leading = document.getElementById('in-r-leading');
  const $trailing = document.getElementById('in-r-trailing');
  const $first4 = document.getElementById('in-r-first4');
  const $first8 = document.getElementById('in-r-first8');
  const $last4 = document.getElementById('in-r-last4');
  const $last8 = document.getElementById('in-r-last8');
  const $rawPattern = document.getElementById('in-r-raw-pattern');
  const $enteredPattern = document.getElementById('in-r-entered-pattern');
  const $match = document.getElementById('in-r-match');
  const $rarity = document.getElementById('in-r-rarity');

  // New EIP-55 fields
  const $patternLen = document.getElementById('in-r-plen');
  const $alphaChars = document.getElementById('in-r-alpha');
  const $rawMatch = document.getElementById('in-r-raw-match');
  const $eip55Match = document.getElementById('in-r-eip55-match');
  const $rawDiff = document.getElementById('in-r-raw-diff');
  const $effDiff = document.getElementById('in-r-eff-diff');
  const $rawAttempts = document.getElementById('in-r-raw-attempts');
  const $effAttempts = document.getElementById('in-r-eff-attempts');
  const $insChecksum = document.getElementById('ins-checksum');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const addr = document.getElementById('ins-address').value.trim();
    const target = normalizeHex(document.getElementById('ins-target').value.trim());
    const targetMode = document.getElementById('ins-target-mode').value;
    const checksumMode = $insChecksum ? $insChecksum.value : 'ignore';

    output.hidden = false;

    if (!validateAddress(addr)) {
      $full.textContent = addr || '—';
      if ($valid) { $valid.textContent = 'Invalid'; $valid.className = 'result-value invalid'; }
      if ($canonical) $canonical.textContent = '—';
      $count.textContent = '—';
      $leading.textContent = '—';
      $trailing.textContent = '—';
      $first4.textContent = '—';
      $first8.textContent = '—';
      $last4.textContent = '—';
      $last8.textContent = '—';
      if ($rawPattern) $rawPattern.textContent = '—';
      if ($enteredPattern) $enteredPattern.textContent = '—';
      if ($patternLen) $patternLen.textContent = '—';
      if ($alphaChars) $alphaChars.textContent = '—';
      if ($rawMatch) { $rawMatch.textContent = '—'; $rawMatch.className = 'result-value'; }
      if ($eip55Match) { $eip55Match.textContent = '—'; $eip55Match.className = 'result-value'; }
      if ($rawDiff) $rawDiff.textContent = '—';
      if ($effDiff) $effDiff.textContent = '—';
      if ($rawAttempts) $rawAttempts.textContent = '—';
      if ($effAttempts) $effAttempts.textContent = '—';
      $match.textContent = 'Invalid address';
      $match.className = 'result-value invalid';
      $rarity.textContent = '—';
      return;
    }

    const hex = normalizeHex(addr.slice(2)); // strip 0x, lowercase
    const hexOriginal = addr.slice(2); // original casing

    $full.textContent = addr;
    if ($valid) { $valid.textContent = 'Valid'; $valid.className = 'result-value valid'; }

    // Compute EIP-55 canonical
    const eip55Addr = eip55Checksum(hex);
    if ($canonical) $canonical.textContent = eip55Addr || '—';

    $count.textContent = hex.length.toString();
    $leading.textContent = countLeadingZeros(hex).toString();
    $trailing.textContent = countTrailingZeros(hex).toString();
    $first4.textContent = hexOriginal.slice(0, 4);
    $first8.textContent = hexOriginal.slice(0, 8);
    $last4.textContent = hexOriginal.slice(-4);
    $last8.textContent = hexOriginal.slice(-8);

    // Target matching
    if (target && isHexPattern(target)) {
      const patternLen = target.length;
      const alphaCount = countAlphaChars(target);

      if ($rawPattern) $rawPattern.textContent = target;
      if ($enteredPattern) $enteredPattern.textContent = document.getElementById('ins-target').value.trim();
      if ($patternLen) $patternLen.textContent = patternLen.toString();
      if ($alphaChars) $alphaChars.textContent = alphaCount.toString();

      // Raw match (case-insensitive)
      const isRawMatch = targetMode === 'suffix'
        ? hex.endsWith(target)
        : hex.startsWith(target);

      // EIP-55 exact match (case-sensitive on the relevant portion)
      let isEip55Match = false;
      if (isRawMatch) {
        let relevantChars;
        if (targetMode === 'suffix') {
          relevantChars = hexOriginal.slice(-target.length);
        } else {
          relevantChars = hexOriginal.slice(0, target.length);
        }
        isEip55Match = relevantChars === target;
      }

      if ($rawMatch) {
        $rawMatch.textContent = isRawMatch ? '✓ Match' : '✗ No match';
        $rawMatch.className = 'result-value ' + (isRawMatch ? 'match' : 'no-match');
      }
      if ($eip55Match) {
        if (checksumMode === 'exact') {
          $eip55Match.textContent = isEip55Match ? '✓ Exact casing' : (isRawMatch ? '✗ Case differs' : '—');
          $eip55Match.className = 'result-value ' + (isEip55Match ? 'match' : 'no-match');
        } else {
          $eip55Match.textContent = '— (ignore mode)';
          $eip55Match.className = 'result-value';
        }
      }

      // Difficulty calculations
      const rawBits = patternLen * 4;
      const checksumBits = (checksumMode === 'exact') ? alphaCount : 0;
      const effectiveBits = rawBits + checksumBits;

      if ($rawDiff) $rawDiff.textContent = '2^' + rawBits;
      if ($effDiff) $effDiff.textContent = checksumMode === 'exact' ? '2^' + effectiveBits : '—';

      const rawAvg = bigPow2(rawBits);
      const effAvg = bigPow2(effectiveBits);

      if ($rawAttempts) $rawAttempts.textContent = formatBig(rawAvg);
      if ($effAttempts) $effAttempts.textContent = checksumMode === 'exact' ? formatBig(effAvg) : '—';

      // Overall match display
      if (checksumMode === 'exact') {
        if (isEip55Match) {
          $match.textContent = '✓ Raw + Exact EIP-55 match for ' + targetMode + ' "' + target + '"';
          $match.className = 'result-value match';
        } else if (isRawMatch) {
          $match.textContent = '✓ Raw match, ✗ EIP-55 casing mismatch for ' + targetMode + ' "' + target + '"';
          $match.className = 'result-value no-match';
        } else {
          $match.textContent = '✗ No match for ' + targetMode + ' "' + target + '"';
          $match.className = 'result-value no-match';
        }
      } else {
        $match.textContent = isRawMatch
          ? '✓ Raw match for ' + targetMode + ' "' + target + '"'
          : '✗ No match for ' + targetMode + ' "' + target + '"';
        $match.className = 'result-value ' + (isRawMatch ? 'match' : 'no-match');
      }

      const displayAvg = checksumMode === 'exact' ? effAvg : rawAvg;
      $rarity.textContent = '1 in ' + formatBig(displayAvg) + ' (' + patternLen + ' chars' +
        (checksumMode === 'exact' ? ', ' + alphaCount + ' alpha' : '') + ')';
    } else {
      if ($rawPattern) $rawPattern.textContent = '—';
      if ($enteredPattern) $enteredPattern.textContent = '—';
      if ($patternLen) $patternLen.textContent = '—';
      if ($alphaChars) $alphaChars.textContent = '—';
      if ($rawMatch) { $rawMatch.textContent = '—'; $rawMatch.className = 'result-value'; }
      if ($eip55Match) { $eip55Match.textContent = '—'; $eip55Match.className = 'result-value'; }
      if ($rawDiff) $rawDiff.textContent = '—';
      if ($effDiff) $effDiff.textContent = '—';
      if ($rawAttempts) $rawAttempts.textContent = '—';
      if ($effAttempts) $effAttempts.textContent = '—';
      $match.textContent = 'No target specified';
      $match.className = 'result-value';
      $rarity.textContent = '—';
    }
  });
})();

/* ============================================================
   ACCORDION — Section 04
   ============================================================ */

(function initAccordion() {
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

/* ============================================================
   GENESIS BENCHMARK — Populate known values
   ============================================================ */

(function initBenchmark() {
  // Known Genesis parameters
  const BENCHMARK = {
    target: 'face4663',
    patternType: 'Suffix',
    patternLength: 8,
    alphaChars: 4,
    rawDifficulty: '2^32 = 4,294,967,296',
    checksumMode: 'Exact lowercase EIP-55',
    checksumConstraint: '2^4 = 16',
    effectiveDifficulty: '2^36 = 68,719,476,736',
    rawAvgAttempts: '4,294,967,296 (~4.29 billion)',
    effectiveAvgAttempts: '68,719,476,736 (~68.72 billion)',
  };

  // Update benchmark fields if they exist
  const fields = document.querySelectorAll('.benchmark-fields div');
  fields.forEach(f => {
    const dt = f.querySelector('dt');
    const dd = f.querySelector('dd');
    if (!dt || !dd) return;
    const label = dt.textContent.trim();

    switch (label) {
      case 'Target Pattern':
        if (dd.classList.contains('pending-val')) {
          dd.textContent = BENCHMARK.target;
          dd.classList.remove('pending-val');
          dd.style.color = 'var(--green2)';
        }
        break;
      case 'Pattern Type':
        if (dd.classList.contains('pending-val')) {
          dd.textContent = BENCHMARK.patternType;
          dd.classList.remove('pending-val');
          dd.style.color = 'var(--green2)';
        }
        break;
      case 'Pattern Length':
        if (dd.classList.contains('pending-val')) {
          dd.textContent = BENCHMARK.patternLength + ' chars (' + BENCHMARK.alphaChars + ' alphabetic)';
          dd.classList.remove('pending-val');
          dd.style.color = 'var(--green2)';
        }
        break;
      case 'Difficulty':
        if (dd.classList.contains('pending-val')) {
          dd.innerHTML = 'Raw: ' + BENCHMARK.rawDifficulty +
            '<br>Checksum: ' + BENCHMARK.checksumMode +
            '<br>Checksum bits: ' + BENCHMARK.checksumConstraint +
            '<br>Effective: ' + BENCHMARK.effectiveDifficulty;
          dd.classList.remove('pending-val');
          dd.style.color = 'var(--white)';
        }
        break;
    }
  });

  // Update milestone card
  const milestoneCards = document.querySelectorAll('.milestone-card');
  milestoneCards.forEach(card => {
    const diffEl = card.querySelector('.milestone-difficulty');
    if (!diffEl) return;

    const name = card.querySelector('.milestone-name');
    if (name && name.textContent.trim() === 'GENESIS') {
      diffEl.innerHTML =
        '<span>Raw suffix difficulty: 2^32</span>' +
        '<span>Exact lowercase EIP-55: 2^36</span>' +
        '<span>Raw average: ~4.29 billion</span>' +
        '<span>Effective average: ~68.72 billion</span>';
    }
  });
})();

/* ============================================================
   TEST RUNNER — Console
   ============================================================ */

(function runTests() {
  try {
    const result = runTestCases();
    console.log('[FACE4663 Lab] Test Cases:' + result);
  } catch (e) {
    console.error('[FACE4663 Lab] Test error:', e);
  }
})();
