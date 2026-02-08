(function () {
  'use strict';

  var btn = document.getElementById('connect-wallet-btn');
  if (!btn) return;

  var phantom = typeof window !== 'undefined' && (window.phantom?.solana || window.solana);
  var currentAddress = null;

  function maskAddr(addr) {
    if (!addr || addr.length < 12) return addr;
    return addr.slice(0, 4) + '...' + addr.slice(-4);
  }

  function updateButton() {
    if (currentAddress) {
      btn.textContent = maskAddr(currentAddress);
      btn.classList.add('connected');
    } else {
      btn.textContent = 'Connect wallet';
      btn.classList.remove('connected');
    }
  }

  function connect() {
    if (!phantom) {
      window.open('https://phantom.app/', '_blank');
      return;
    }
    phantom.connect({ onlyIfTrusted: false })
      .then(function (res) {
        if (res && res.publicKey) {
          currentAddress = res.publicKey.toString();
          updateButton();
        }
      })
      .catch(function (err) {
        if (err && err.code !== 4001) console.warn('Phantom connect error', err);
      });
  }

  function disconnect() {
    if (!phantom) return;
    phantom.disconnect().then(function () {
      currentAddress = null;
      updateButton();
    }).catch(function () {
      currentAddress = null;
      updateButton();
    });
  }

  btn.addEventListener('click', function () {
    if (currentAddress) disconnect();
    else connect();
  });

  if (phantom && phantom.isConnected) {
    phantom.on('connect', function (pk) {
      currentAddress = pk && pk.publicKey ? pk.publicKey.toString() : null;
      if (!currentAddress && phantom.publicKey) currentAddress = phantom.publicKey.toString();
      updateButton();
    });
    phantom.on('disconnect', function () {
      currentAddress = null;
      updateButton();
    });
    if (phantom.publicKey) {
      currentAddress = phantom.publicKey.toString();
      updateButton();
    }
  }
})();
