(function () {
  'use strict';

  var STATUS_MESSAGES = [
    'Calibrating perception…',
    'Analyzing behavior…',
    'Behavioral noise increased',
    'Observer effect detected',
    'Calibration unstable',
    'Low signal',
    'Signal nominal',
    'Recalibrating…',
    'Ambient awareness stable'
  ];

  var OBSERVER_MESSAGE = 'You noticed too much.';
  var OBSERVER_CHANCE = 0.02;
  var NOISE_FRACTION = 0.35;
  var IDLE_THRESHOLD_MS = 15000;
  var RAPID_CLICK_WINDOW_MS = 800;
  var RAPID_CLICK_COUNT = 4;

  function rnd(min, max) {
    return min + Math.random() * (max - min);
  }
  function rndInt(min, max) {
    return Math.floor(rnd(min, max + 1));
  }
  function coin() { return Math.random() < 0.5; }
  function withNoise(value, delta) {
    return coin() && Math.random() < NOISE_FRACTION ? value - delta : value;
  }

  var state = {
    awareness: 0,
    frozen: false,
    frozenUntil: 0,
    observerTriggeredThisSession: false,
    lastInteraction: 0,
    clickCount: 0,
    clickWindowStart: 0,
    idleTimer: null,
    driftTimer: null
  };

  var el = {
    value: document.getElementById('goon-meter-value'),
    fill: document.getElementById('goon-meter-fill'),
    status: document.getElementById('goon-meter-status')
  };

  function setAwareness(v) {
    state.awareness = Math.max(0, Math.min(100, v));
    if (el.value) el.value.textContent = state.awareness.toFixed(1) + '%';
    if (el.fill) el.fill.style.width = state.awareness + '%';
  }

  function setStatus(text) {
    if (el.status) el.status.textContent = text;
  }

  function pickStatus() {
    setStatus(STATUS_MESSAGES[rndInt(0, STATUS_MESSAGES.length - 1)]);
  }

  function triggerObserverEffect() {
    if (state.observerTriggeredThisSession) return;
    state.observerTriggeredThisSession = true;
    state.frozen = true;
    state.frozenUntil = Date.now() + rndInt(5000, 10000);
    setAwareness(0);
    setStatus(OBSERVER_MESSAGE);
    setTimeout(function () {
      state.frozen = false;
      setAwareness(rnd(5, 15));
      pickStatus();
      scheduleDrift();
    }, state.frozenUntil - Date.now());
  }

  function applyDrift() {
    if (state.frozen) return;
    if (Math.random() < OBSERVER_CHANCE) {
      triggerObserverEffect();
      return;
    }
    var delta = rnd(0.1, 0.7) * (coin() ? 1 : -1);
    setAwareness(state.awareness + delta);
    if (Math.random() < 0.4) pickStatus();
    scheduleDrift();
  }

  function scheduleDrift() {
    if (state.driftTimer) clearTimeout(state.driftTimer);
    state.driftTimer = setTimeout(applyDrift, rndInt(5000, 15000));
  }

  function maybeNoise(delta) {
    return Math.random() < NOISE_FRACTION ? -delta : delta;
  }

  function onScroll() {
    if (state.frozen) return;
    state.lastInteraction = Date.now();
    resetIdleTimer();
    var d = rnd(0.1, 0.5);
    setAwareness(state.awareness + maybeNoise(d));
    if (Math.random() < 0.35) pickStatus();
  }

  function onIdle() {
    if (state.frozen) return;
    var d = rnd(0.2, 0.6);
    setAwareness(state.awareness - maybeNoise(d));
    if (Math.random() < 0.4) pickStatus();
  }

  function resetIdleTimer() {
    if (state.idleTimer) clearTimeout(state.idleTimer);
    state.idleTimer = setTimeout(onIdle, IDLE_THRESHOLD_MS);
  }

  function onScrollThrottled() {
    if (!state._scrollScheduled) {
      state._scrollScheduled = true;
      requestAnimationFrame(function () {
        state._scrollScheduled = false;
        onScroll();
      });
    }
  }

  function onClick() {
    if (state.frozen) return;
    state.lastInteraction = Date.now();
    resetIdleTimer();
    var now = Date.now();
    if (now - state.clickWindowStart > RAPID_CLICK_WINDOW_MS) {
      state.clickWindowStart = now;
      state.clickCount = 0;
    }
    state.clickCount++;
    if (state.clickCount >= RAPID_CLICK_COUNT && Math.random() < 0.5) {
      setAwareness(state.awareness - rnd(0.3, 0.8));
      if (Math.random() < 0.4) pickStatus();
    } else if (Math.random() < 0.35) {
      setAwareness(state.awareness + rnd(0.05, 0.25));
    }
  }

  function onFocus() {
    if (state.frozen) return;
    state.lastInteraction = Date.now();
    var spike = rnd(0.3, 1.2) * (coin() ? 1 : -1);
    setAwareness(state.awareness + spike);
    if (Math.random() < 0.5) pickStatus();
  }

  function onBlur() {
    if (state.frozen) return;
    var spike = rnd(0.2, 0.9) * (coin() ? 1 : -1);
    setAwareness(state.awareness + spike);
    if (Math.random() < 0.4) pickStatus();
  }

  var mouseThrottle = 0;
  function onMouseMove() {
    if (state.frozen) return;
    state.lastInteraction = Date.now();
    mouseThrottle++;
    if (mouseThrottle % 12 !== 0) return;
    if (Math.random() < 0.4) return;
    var d = rnd(0.02, 0.08) * (coin() ? 1 : -1);
    setAwareness(state.awareness + d);
  }

  function init() {
    state.awareness = rnd(40, 75);
    setAwareness(state.awareness);
    pickStatus();
    scheduleDrift();
    resetIdleTimer();

    window.addEventListener('scroll', onScrollThrottled, { passive: true });
    window.addEventListener('click', onClick);
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    window.addEventListener('mousemove', onMouseMove);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
