(function () {
  'use strict';

  var BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  var PAIRS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT', 'DOGE/USDT', 'BNB/USDT', 'ADA/USDT', 'AVAX/USDT', 'DOT/USDT', 'LINK/USDT'];

  var TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', '1D', '1W'];

  function rnd(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function pick(arr) {
    return arr[rnd(0, arr.length - 1)];
  }

  function randomSolanaAddress() {
    var len = rnd(32, 44);
    var s = '';
    for (var i = 0; i < len; i++) s += BASE58[rnd(0, BASE58.length - 1)];
    return s;
  }

  function maskAddress(addr) {
    if (!addr || addr.length < 12) return addr;
    return addr.slice(0, 4) + '...' + addr.slice(-4);
  }

  function formatDuration(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function generateLeaderboard() {
    var used = {};
    var rows = [];
    for (var i = 0; i < 20; i++) {
      var addr = randomSolanaAddress();
      while (used[addr]) addr = randomSolanaAddress();
      used[addr] = true;
      var durationSec = rnd(12, 720);
      rows.push({
        address: maskAddress(addr),
        addressFull: addr,
        pair: pick(PAIRS),
        timeframe: pick(TIMEFRAMES),
        durationSec: durationSec,
        time: formatDuration(durationSec)
      });
    }
    rows.sort(function (a, b) { return a.durationSec - b.durationSec; });
    return rows;
  }

  function renderTable() {
    var tbody = document.getElementById('leaderboard-body');
    if (!tbody) return;
    var rows = generateLeaderboard();
    tbody.innerHTML = rows.map(function (row, i) {
      return '<tr><td class="lb-rank">' + (i + 1) + '</td><td class="lb-nick">' + escapeHtml(row.address) + '</td><td>' + escapeHtml(row.pair) + '</td><td>' + escapeHtml(row.timeframe) + '</td><td>' + escapeHtml(row.time) + '</td></tr>';
    }).join('');
  }

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  var modal = document.getElementById('leaderboard-modal');
  var openBtn = document.getElementById('open-leaderboard');
  var closeBtn = document.getElementById('leaderboard-close');
  var backdrop = document.getElementById('leaderboard-backdrop');

  function openModal() {
    renderTable();
    if (modal) {
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);
})();
