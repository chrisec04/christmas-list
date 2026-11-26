/* Chris' Christmas List: page logic.
   Reads the list from items.js, runs the welcome flow, shows the gift tags, and keeps claims in sync.
   Claims live in Firebase when firebase-config.js is filled in; otherwise in this browser only (test mode). */

(function () {
  'use strict';

  var OWNER = window.OWNER;
  var SHOPPERS = window.SHOPPERS;
  var TIERS = window.TIERS;
  var ITEMS = window.ITEMS.filter(function (i) { return !i.hidden; });
  var PASSCODE = String(window.PASSCODE || '').toLowerCase();
  var OWNER_PASSCODE = String(window.OWNER_PASSCODE || '').toLowerCase();

  var ME_KEY = 'xmas-me-v1';
  var LOCAL_CLAIMS_KEY = 'xmas-claims-v1';
  var FIREBASE_VERSION = '10.12.2';
  var REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var state = {
    me: null,          // the name picked on this device
    screen: '',        // intro, code, who, back, list
    claims: {},        // itemId -> { by, status, at }
    claimsLoaded: false,
    tier: 0,           // index of the tier on show
    leaving: null,     // index of the tier sliding out
    dir: 'fwd',
    fresh: {},         // items that just got a stamp (plays the stamp animation)
    erasing: {},       // items whose stamp is fading out
    panel: false,      // picks drawer
    detail: null,      // item id shown in the Details window
    offline: false,
    scrolled: false,
    pulling: false,
    shake: 0
  };

  var store = null;
  var unsubscribe = null;
  var lastFocus = null;
  var toastTimer = null;
  var tierTimer = null;
  var backTimers = [];
  var modalReturnFocus = null;

  /* ---------- Small helpers ---------- */

  function $(sel) { return document.querySelector(sel); }

  function h(tag, attrs) {
    var el = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) {
      var kid = arguments[i];
      if (kid === null || kid === undefined || kid === false) continue;
      el.appendChild(typeof kid === 'string' ? document.createTextNode(kid) : kid);
    }
    return el;
  }

  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }

  // Copies a snippet of markup out of a <template> in index.html.
  function tpl(id) { return document.getElementById(id).content.cloneNode(true); }

  function money(n) {
    if (n === null || n === undefined) return 'Any amount';
    var whole = Math.round(n) === n;
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD',
      minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2
    }).format(n);
  }

  function isOwner() { return state.me === OWNER; }

  function toast(message) {
    var el = $('#toast');
    el.textContent = message;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-on'); }, 3200);
  }

  function loadMe() {
    try { return localStorage.getItem(ME_KEY); } catch (e) { return null; }
  }
  function saveMe(name) {
    try { localStorage.setItem(ME_KEY, name); } catch (e) { /* private mode: fine, just not remembered */ }
  }

  function lockScroll(on) { document.documentElement.style.overflow = on ? 'hidden' : ''; }

  /* ---------- Claim stores ---------- */

  // Test mode: claims saved in this browser only.
  function makeLocalStore() {
    function read() {
      try { return JSON.parse(localStorage.getItem(LOCAL_CLAIMS_KEY)) || {}; } catch (e) { return {}; }
    }
    function write(obj) {
      try { localStorage.setItem(LOCAL_CLAIMS_KEY, JSON.stringify(obj)); } catch (e) { /* ignore */ }
    }
    function mutate(id, fn) {
      var all = read();
      var next = fn(all[id]);
      if (next === undefined) return false;           // refused
      if (next === null) delete all[id]; else all[id] = next;
      write(all);
      return true;
    }
    return {
      kind: 'local',
      subscribe: function (cb) {
        function push() { cb(read()); }
        window.addEventListener('storage', push);
        push();
        return function () { window.removeEventListener('storage', push); };
      },
      refresh: function (cb) { cb(read()); },
      claim: function (id, by) {
        return Promise.resolve(mutate(id, function (cur) { return cur ? undefined : { by: by, status: 'planned', at: Date.now() }; }));
      },
      setStatus: function (id, by, status) {
        return Promise.resolve(mutate(id, function (cur) { return cur && cur.by === by ? { by: by, status: status, at: cur.at } : undefined; }));
      },
      release: function (id, by) {
        return Promise.resolve(mutate(id, function (cur) { return cur && cur.by === by ? null : undefined; }));
      }
    };
  }

  // Shared mode: Firebase Realtime Database. Transactions stop two people from claiming the same item.
  function makeFirebaseStore(cfg) {
    var base = 'https://www.gstatic.com/firebasejs/' + FIREBASE_VERSION + '/';
    return Promise.all([
      import(base + 'firebase-app.js'),
      import(base + 'firebase-database.js')
    ]).then(function (mods) {
      var app = mods[0].initializeApp(cfg);
      var fb = mods[1];
      var db = fb.getDatabase(app);

      function tx(id, fn) {
        return fb.runTransaction(fb.ref(db, 'claims/' + id), fn).then(function (r) { return r.committed; });
      }
      return {
        kind: 'firebase',
        subscribe: function (cb, onError) {
          return fb.onValue(fb.ref(db, 'claims'), function (snap) { cb(snap.val() || {}); }, onError);
        },
        claim: function (id, by) {
          return tx(id, function (cur) { return cur ? undefined : { by: by, status: 'planned', at: Date.now() }; });
        },
        setStatus: function (id, by, status) {
          return tx(id, function (cur) { return cur && cur.by === by ? { by: by, status: status, at: cur.at } : undefined; });
        },
        release: function (id, by) {
          return tx(id, function (cur) { return cur && cur.by === by ? null : undefined; });
        }
      };
    });
  }

  /* ---------- Claim actions ---------- */

  function afterAction(itemId, ok, okMessage, failMessage) {
    toast(ok ? okMessage : failMessage);
    if (store.kind === 'local') store.refresh(onClaims);
  }

  function doAction(itemId, run, okMessage, failMessage) {
    lastFocus = itemId;
    run().then(function (ok) {
      afterAction(itemId, ok, okMessage, failMessage);
    }).catch(function () {
      toast('That didn’t save. Check your connection and try again.');
    });
  }

  function claimItem(item) {
    if (coveringBox(item)) { toast('That one is already included in a Full Box someone is getting.'); return; }
    doAction(item.id, function () { return store.claim(item.id, state.me); },
      'You’re getting ' + item.name + '.',
      'Someone just claimed that one. Pick another.');
  }
  function markBought(item) {
    doAction(item.id, function () { return store.setStatus(item.id, state.me, 'bought'); },
      'Marked as bought.', 'Couldn’t update that item.');
  }
  function markPlanned(item) {
    doAction(item.id, function () { return store.setStatus(item.id, state.me, 'planned'); },
      'Back to “getting.”', 'Couldn’t update that item.');
  }
  // Puts back after the stamp has had a moment to fade away.
  function putBack(item) {
    if (state.erasing[item.id]) return;
    lastFocus = item.id;
    state.erasing[item.id] = true;
    renderPanes();
    renderDrawer();
    setTimeout(function () {
      store.release(item.id, state.me).then(function (ok) {
        delete state.erasing[item.id];
        afterAction(item.id, ok, 'Put back. It’s open again.', 'Couldn’t put that back.');
        renderPanes();
        renderDrawer();
      }).catch(function () {
        delete state.erasing[item.id];
        toast('That didn’t save. Check your connection and try again.');
        renderPanes();
        renderDrawer();
      });
    }, REDUCED ? 0 : 650);
  }

  /* ---------- Claims feed ---------- */

  function markFresh(id) {
    state.fresh[id] = true;
    setTimeout(function () { delete state.fresh[id]; }, 1000);
  }

  /* Chris never loads the claims at all, so there is nothing to peek at. */
  function connectClaims() {
    if (unsubscribe) { unsubscribe(); unsubscribe = null; }
    state.claims = {};
    state.claimsLoaded = false;
    if (!store || isOwner() || !state.me) return;
    unsubscribe = store.subscribe(onClaims, function () {
      state.offline = true;
      renderBanner();
      renderPanes();
    });
  }

  function onClaims(claims) {
    claims = claims || {};
    if (state.claimsLoaded) {
      Object.keys(claims).forEach(function (id) { if (!state.claims[id]) markFresh(id); });
    }
    state.claimsLoaded = true;
    state.offline = false;
    state.claims = claims;
    renderBanner();
    renderChrome();
    renderPanes();
    renderDrawer();
  }

  /* ---------- Screens ---------- */

  var SCREENS = ['intro', 'code', 'who', 'back', 'list'];

  function show(name) {
    state.screen = name;
    SCREENS.forEach(function (s) { $('#screen-' + s).hidden = s !== name; });
    window.scrollTo(0, 0);
    updateFloating();
  }

  function clearBackTimers() {
    backTimers.forEach(clearTimeout);
    backTimers = [];
  }

  function go(name) {
    clearBackTimers();
    closeDrawer(true);
    closeDetail(true);
    state.pulling = false;
    show(name);
    if (name === 'code') {
      var wrap = $('#orn-wrap');
      wrap.className = 'orn-wrap';
      $('#code-err').textContent = '';
      var input = $('#passcode');
      input.value = '';
      if (!('ontouchstart' in window)) setTimeout(function () { if (state.screen === 'code') input.focus(); }, 900);
    }
    if (name === 'who') renderWho();
  }

  /* ---------- Intro and passcode ---------- */

  function submitCode() {
    if (state.pulling) return;
    var input = $('#passcode');
    var typed = (input.value || '').trim().toLowerCase();
    var wrap = $('#orn-wrap');
    var err = $('#code-err');
    var asOwner = !!OWNER_PASSCODE && typed === OWNER_PASSCODE;
    if (typed && (asOwner || typed === PASSCODE)) {
      err.textContent = '';
      input.value = '';
      input.blur();
      state.pulling = true;
      wrap.className = 'orn-wrap pull';
      setTimeout(function () {
        if (state.screen !== 'code') return;
        state.pulling = false;
        if (asOwner) enterList(OWNER); else go('who');
      }, REDUCED ? 250 : 1200);
    } else {
      err.textContent = typed ? 'That passcode isn’t right. Check it and try again.' : 'Enter the passcode to continue.';
      state.shake = state.shake === 1 ? 2 : 1;
      wrap.className = 'orn-wrap';
      void wrap.offsetWidth;                         // restart the shake
      wrap.className = 'orn-wrap ' + (state.shake === 1 ? 'shakeA' : 'shakeB');
    }
  }

  function enterSite() {
    var intro = $('#screen-intro');
    intro.classList.add('out');
    setTimeout(function () { intro.classList.remove('out'); if (state.screen === 'intro') go('code'); }, REDUCED ? 0 : 450);
  }

  /* ---------- Who are you ---------- */

  function renderWho() {
    var names = $('#names');
    clear(names);
    SHOPPERS.forEach(function (name) {
      names.appendChild(h('button', { class: 'chipbtn', type: 'button', onclick: function () { enterList(name); }, text: name }));
    });
    var other = h('button', { class: 'chipbtn other', type: 'button', 'aria-expanded': 'false', text: 'Someone else' });
    other.addEventListener('click', function () {
      var form = $('#other-form');
      form.hidden = !form.hidden;
      other.classList.toggle('on', !form.hidden);
      other.setAttribute('aria-expanded', String(!form.hidden));
      if (!form.hidden) $('#yourname').focus();
    });
    names.appendChild(other);
    $('#other-form').hidden = true;
    $('#name-err').textContent = '';
    $('#yourname').value = '';
  }

  function submitOther() {
    var nm = ($('#yourname').value || '').trim();
    var err = $('#name-err');
    if (!nm) { err.textContent = 'Type your name to continue.'; return; }
    if (nm.toLowerCase() === OWNER.toLowerCase()) { err.textContent = OWNER + ' owns this list. Use a different name.'; return; }
    err.textContent = '';
    enterList(nm);
  }

  /* ---------- Welcome back and entering the list ---------- */

  function showBack(name) {
    clearBackTimers();
    state.me = name;
    connectClaims();
    var screen = $('#screen-back');
    clear(screen);
    screen.classList.remove('out');
    screen.appendChild(tpl('tpl-back'));
    $('#wb-name').textContent = name;
    show('back');
    backTimers.push(setTimeout(function () { screen.classList.add('out'); }, 2900));
    backTimers.push(setTimeout(function () { if (state.screen === 'back') enterList(name); }, 3400));
  }

  function enterList(name) {
    clearBackTimers();
    closeDrawer(true);
    closeDetail(true);
    var changed = state.me !== name;
    state.me = name;
    saveMe(name);
    if (changed || !unsubscribe) connectClaims();
    state.tier = 0;
    state.leaving = null;
    state.dir = 'fwd';
    $('#who-name').textContent = name;
    $('#not-me').textContent = 'Not ' + name + '?';
    $('#surprise-note').hidden = !isOwner();
    $('#tray').hidden = isOwner();
    show('list');
    renderBanner();
    renderChrome();
    renderPanes(true);
    renderDrawer();
  }

  function notMe() {
    if (!isOwner()) { go('who'); return; }
    var dlg = $('#leave-dialog');
    dlg.addEventListener('close', function onClose() {
      dlg.removeEventListener('close', onClose);
      if (dlg.returnValue === 'leave') go('who');
    });
    if (typeof dlg.showModal === 'function') dlg.showModal();
    else if (window.confirm('Switching shows who is getting what. Switch anyway?')) go('who');
  }

  /* ---------- List chrome: tabs, arrows, tray, banner ---------- */

  function mineIn(tierIndex) {
    if (isOwner()) return 0;
    var n = 0;
    ITEMS.forEach(function (it) {
      var c = state.claims[it.id];
      if (c && c.by === state.me && it.tier === TIERS[tierIndex].id) n += 1;
    });
    return n;
  }

  function myItems() {
    return ITEMS.filter(function (it) { var c = state.claims[it.id]; return !isOwner() && c && c.by === state.me; });
  }

  function renderTabs() {
    [$('#tabs'), $('#mini')].forEach(function (nav) {
      clear(nav);
      TIERS.forEach(function (t, n) {
        var count = mineIn(n);
        nav.appendChild(h('button', {
          class: 'tab ct' + n + (state.tier === n ? ' on' : ''), type: 'button',
          'aria-label': t.name + ', ' + t.range + (count ? ', ' + count + ' picked' : ''),
          'aria-current': state.tier === n ? 'true' : null,
          onclick: function () { changeTier(n, n > state.tier ? 'fwd' : 'back'); }
        }, h('span', { class: 'tl-name', text: t.name }), h('span', { class: 'tl-short', text: t.short }),
        count ? h('span', { class: 'badge', 'aria-hidden': 'true', text: String(count) }) : null));
      });
    });
  }

  function renderChrome() {
    renderTabs();
    var prev = (state.tier + TIERS.length - 1) % TIERS.length;
    var next = (state.tier + 1) % TIERS.length;
    $('#lbl-prev').textContent = TIERS[prev].name;
    $('#lbl-next').textContent = TIERS[next].name;
    $('#arrow-prev').setAttribute('aria-label', 'Previous price tier: ' + TIERS[prev].name);
    $('#arrow-next').setAttribute('aria-label', 'Next price tier: ' + TIERS[next].name);
    $('#tray-count').textContent = String(myItems().length);
    $('#tray').className = 'tray' + (myItems().length ? '' : ' empty');
  }

  function renderBanner() {
    var el = $('#banner');
    if (state.offline) {
      el.className = 'banner is-error';
      el.textContent = 'Can’t reach the shared list right now. Claiming is paused. Refresh the page to try again.';
      el.hidden = false;
    } else if (store && store.kind === 'local' && state.me && !isOwner() && state.screen === 'list') {
      el.className = 'banner';
      el.textContent = 'Test mode: claims are saved only in this browser until the shared database is connected.';
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  }

  function changeTier(to, dir) {
    if (to === state.tier) return;
    state.leaving = state.tier;
    state.tier = to;
    state.dir = dir;
    renderChrome();
    renderPanes(true);
    if ((window.scrollY || 0) > 200) {
      var sw = $('#list');
      window.scrollTo({ top: Math.max(0, sw.getBoundingClientRect().top + (window.scrollY || 0) - 70), behavior: REDUCED ? 'auto' : 'smooth' });
    }
    clearTimeout(tierTimer);
    tierTimer = setTimeout(function () {
      state.leaving = null;
      var old = $('#stage').querySelector('.pane.out-fwd, .pane.out-back');
      if (old) old.parentNode.removeChild(old);
    }, 420);
  }

  /* ---------- Gift tags ---------- */

  /* ---------- Related options (a full box that contains smaller options) ---------- */

  function itemById(id) { return ITEMS.filter(function (i) { return i.id === id; })[0]; }

  // The box (an item with "includes") that someone has already claimed and that contains this item.
  function coveringBox(item) {
    if (isOwner() || state.claims[item.id]) return null;
    var found = null;
    ITEMS.forEach(function (b) {
      if (b.includes && b.includes.indexOf(item.id) !== -1 && state.claims[b.id]) found = b;
    });
    return found;
  }

  // The smaller options inside this box that someone has already claimed.
  function claimedParts(item) {
    if (isOwner() || !item.includes) return [];
    return item.includes.map(itemById).filter(function (p) { return p && state.claims[p.id]; });
  }

  function partLabel(p) { return p.label || p.name; }

  function listOf(names) {
    if (names.length < 2) return names.join('');
    return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
  }

  // Short note for the tag and the Details window. Returns '' when there is nothing to say.
  function relatedNote(item, short) {
    var box = coveringBox(item);
    if (box && short) return state.claims[box.id].by === state.me ? 'In your Full Box.' : 'In a Full Box.';
    if (box) {
      var mineBox = state.claims[box.id].by === state.me;
      return (mineBox ? 'You’re getting the ' : 'Someone is getting the ') + partLabel(box) + ', which already includes this.';
    }
    var parts = claimedParts(item);
    if (parts.length && !state.claims[item.id]) {
      if (short) return 'Heads up: a smaller option is picked.';
      return 'Heads up: ' + (parts.every(function (p) { return state.claims[p.id].by === state.me; }) ? 'you have' : 'someone has') +
        ' already picked the ' + listOf(parts.map(partLabel)) + ', which this box includes.';
    }
    return '';
  }

  // The price, plus the usual price and an "On sale" label when item.regular is higher than item.price.
  function priceBlock(item, cls) {
    var main = h('p', { class: cls, text: money(item.price) });
    if (!(item.regular && item.price !== null && item.regular > item.price)) return main;
    return h('div', { class: 'pricerow ' + cls + 'row' }, main,
      h('div', { class: 'salebox' },
        h('span', { class: 'salepill', text: 'On sale' }),
        h('s', { class: 'was', 'aria-label': 'Usual price ' + money(item.regular), text: money(item.regular) })));
  }

  function renderTag(item) {
    var claim = isOwner() ? null : state.claims[item.id];
    var mine = !!claim && claim.by === state.me;
    var covered = coveringBox(item);
    var taken = (!!claim && !mine) || !!covered;
    var locked = state.offline || !store;
    var erasing = !!state.erasing[item.id];
    var related = relatedNote(item, true);

    var tag = h('article', { class: 'tag' + (taken ? ' other' : '') + (mine ? ' mine' : ''), 'data-item': item.id },
      h('i', { class: 'hole', 'aria-hidden': 'true' }), tpl('tpl-orn'),
      priceBlock(item, 'price'),
      h('p', { class: 'name', text: item.name }),
      item.stock === 'out' ? h('p', { class: 'stockpill', text: 'Out of stock right now' }) : null,
      item.retiring ? h('p', { class: 'stockpill retirepill', text: 'Retiring soon' }) : null,
      related ? h('p', { class: 'related', text: related }) : null);

    var details = h('button', { class: 'linkbtn details', type: 'button', onclick: function () { openDetail(item.id); }, text: 'Details' });

    if (isOwner()) {
      tag.appendChild(h('div', { class: 'row' }, details));
    } else if (item.shared) {
      tag.appendChild(h('p', { class: 'state', text: 'Open to everyone. No need to claim.' }));
      tag.appendChild(h('div', { class: 'row' }, details));
    } else if (covered) {
      tag.appendChild(h('div', { class: 'row' }, details));
    } else if (!claim) {
      tag.appendChild(h('div', { class: 'row' },
        h('button', { class: 'btn', type: 'button', disabled: locked, onclick: function () { claimItem(item); }, text: 'I’ll get this' }), details));
    } else if (mine) {
      var bought = claim.status === 'bought';
      var pill = h('span', { class: 'pill' }, tpl('tpl-check'), bought ? 'You bought this' : 'You’re getting this');
      var main = bought
        ? h('button', { class: 'btn ghost', type: 'button', disabled: locked, onclick: function () { markPlanned(item); }, text: 'Not bought yet' })
        : h('button', { class: 'btn ghost', type: 'button', disabled: locked, onclick: function () { markBought(item); }, text: 'Mark as bought' });
      tag.appendChild(h('p', { class: 'state strong' }, pill));
      tag.appendChild(h('div', { class: 'row stack' }, main,
        h('span', { class: 'pair' },
          h('button', { class: 'linkbtn', type: 'button', disabled: locked || erasing, onclick: function () { putBack(item); }, text: 'Put back' }), details)));
    } else {
      tag.appendChild(h('div', { class: 'row' }, details));
    }

    if (taken || mine) {
      var stampState = erasing ? 'out' : (state.fresh[item.id] ? 'in' : 'still');
      tag.appendChild(h('div', { class: 'stampwrap ' + stampState }, tpl('tpl-stamp')));
    }
    return h('div', { class: 'cell' }, h('div', { class: 'glow' + (mine ? ' on' : '') }, tag));
  }

  function renderPane(n, animate) {
    var t = TIERS[n];
    var cls = 'pane t' + (n + 1);
    if (animate) {
      if (state.tier === n) cls += ' in-' + state.dir;
      else if (state.leaving === n) cls += ' out-' + state.dir;
    }
    var grid = h('div', { class: 'grid' });
    ITEMS.filter(function (it) { return it.tier === t.id; }).forEach(function (it) { grid.appendChild(renderTag(it)); });
    return h('div', { class: cls },
      h('div', { class: 'phead' },
        h('h2', { class: 'tname', text: t.name }),
        h('p', { class: 'trange', text: t.range }),
        h('div', { class: 'flourish', 'aria-hidden': 'true' }, h('i'), h('b'), h('i'))),
      grid);
  }

  // animate is true only for the render that starts a tier change. Later renders (a claim arriving,
  // a button press) must not replay the swing, or the tags flash and animate twice.
  function renderPanes(animate) {
    if (state.screen !== 'list') return;
    var stage = $('#stage');
    clear(stage);
    TIERS.forEach(function (t, n) {
      if (n === state.tier || n === state.leaving) stage.appendChild(renderPane(n, animate));
    });
    if (lastFocus && !state.detail && !state.panel) {
      var btn = stage.querySelector('[data-item="' + lastFocus + '"] button:not([disabled])');
      if (btn) btn.focus({ preventScroll: true });
      lastFocus = null;
    }
  }

  /* ---------- Your picks drawer ---------- */

  function renderDrawer() {
    if (!state.panel) return;
    var body = $('#drawer-body');
    clear(body);
    var mineItems = myItems();
    var total = 0;
    if (!mineItems.length) body.appendChild(h('p', { class: 'pempty', text: 'Nothing yet. Tap “I’ll get this” on a tag and it will show up here.' }));
    mineItems.forEach(function (it) {
      var c = state.claims[it.id];
      var bought = c.status === 'bought';
      total += it.price || 0;
      var tierIndex = TIERS.map(function (t) { return t.id; }).indexOf(it.tier);
      body.appendChild(h('div', { class: 'prow' },
        h('i', { class: 'dot d' + tierIndex, 'aria-hidden': 'true' }),
        h('div', null, h('p', { class: 'pname', text: it.name }), h('p', { class: 'pmeta', text: money(it.price) + ', ' + (bought ? 'bought' : 'still to buy') })),
        h('div', { class: 'pbtns' },
          bought
            ? h('button', { class: 'linkbtn', type: 'button', onclick: function () { markPlanned(it); }, text: 'Not bought yet' })
            : h('button', { class: 'btn', type: 'button', onclick: function () { markBought(it); }, text: 'Mark as bought' }),
          h('button', { class: 'linkbtn', type: 'button', disabled: !!state.erasing[it.id], onclick: function () { putBack(it); }, text: 'Put back' }),
          h('button', { class: 'linkbtn', type: 'button', onclick: function () { showOnList(it); }, text: 'Show on list' }))));
    });
    $('#drawer-count').textContent = mineItems.length === 1 ? '1 gift' : mineItems.length + ' gifts';
    $('#drawer-total').textContent = '$' + total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function openDrawer() {
    state.panel = true;
    modalReturnFocus = document.activeElement;
    $('#drawer-wrap').hidden = false;
    lockScroll(true);
    updateFloating();
    renderDrawer();
    $('#drawer-close').focus();
  }

  function closeDrawer(quiet) {
    if (!state.panel) return;
    state.panel = false;
    $('#drawer-wrap').hidden = true;
    if (!state.detail) lockScroll(false);
    updateFloating();
    if (!quiet && modalReturnFocus && modalReturnFocus.focus) modalReturnFocus.focus({ preventScroll: true });
  }

  function showOnList(item) {
    closeDrawer(true);
    var idx = TIERS.map(function (t) { return t.id; }).indexOf(item.tier);
    changeTier(idx, idx > state.tier ? 'fwd' : 'back');
  }

  /* ---------- Details window ---------- */

  function itemLinks(item) {
    if (item.links && item.links.length) return item.links;
    return item.url ? [{ label: 'the store', url: item.url }] : [];
  }

  function openDetail(id) {
    var item = ITEMS.filter(function (i) { return i.id === id; })[0];
    if (!item) return;
    state.detail = id;
    modalReturnFocus = document.activeElement;
    var box = $('#detail');
    clear(box);

    var pic = h('div', { class: 'dpic' });
    function placeholder() {
      clear(pic);
      pic.appendChild(h('div', { class: 'dph' }, tpl('tpl-gift'), h('span', { text: 'Photo coming soon' })));
    }
    if (item.image) {
      var img = h('img', { src: item.image, alt: item.name });
      img.addEventListener('error', placeholder);
      pic.appendChild(img);
    } else {
      placeholder();
    }

    var info = h('div', { class: 'dinfo' },
      h('h2', { class: 'dname', id: 'detail-name', text: item.name }),
      priceBlock(item, 'dprice'),
      item.stock === 'out' ? h('p', { class: 'dstock', text: item.retiring ? 'Out of stock right now.' : 'Out of stock right now. You can still pick it, and it may come back.' }) : null,
      item.retiring ? h('p', { class: 'dstock dretire', text: 'Retiring soon. LEGO is about to stop selling this set, so it may not come back.' }) : null,
      relatedNote(item) ? h('p', { class: 'dstock drelated', text: relatedNote(item) }) : null,
      item.blurb ? h('p', { class: 'dblurb', text: item.blurb }) : null);

    var links = itemLinks(item);
    if (links.length) {
      var row = h('div', { class: 'dlinks' });
      links.forEach(function (l, k) {
        row.appendChild(h('a', { class: 'dbuy' + (k ? ' alt' : ''), href: l.url, target: '_blank', rel: 'noopener noreferrer' },
          (k ? 'Or at ' : 'Buy at ') + l.label, tpl('tpl-ext')));
      });
      info.appendChild(h('p', { class: 'dwhere', text: 'Where to buy' }));
      info.appendChild(row);
    } else {
      info.appendChild(h('p', { class: 'dnote', text: 'A store link will be added soon.' }));
    }

    box.appendChild(h('button', { class: 'xbtn dclose', type: 'button', onclick: function () { closeDetail(); }, 'aria-label': 'Close details', text: '×' }));
    box.appendChild(pic);
    box.appendChild(info);
    $('#detail-wrap').hidden = false;
    lockScroll(true);
    updateFloating();
    box.scrollTop = 0;
    box.querySelector('.dclose').focus();
  }

  function closeDetail(quiet) {
    if (!state.detail) return;
    var id = state.detail;
    state.detail = null;
    $('#detail-wrap').hidden = true;
    if (!state.panel) lockScroll(false);
    updateFloating();
    if (!quiet) {
      var back = $('[data-item="' + id + '"] .details');
      if (back) back.focus({ preventScroll: true });
    }
  }

  /* ---------- Floating tab bar (shows once the header has scrolled away) ---------- */

  function updateFloating() {
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    state.scrolled = y > 330;
    $('#mini').hidden = !(state.scrolled && state.screen === 'list' && !state.panel && !state.detail);
  }

  /* ---------- Keyboard help for the two pop-ups ---------- */

  function trapTab(e, container) {
    var els = container.querySelectorAll('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])');
    if (!els.length) return;
    var first = els[0], last = els[els.length - 1];
    if (!container.contains(document.activeElement)) { first.focus(); e.preventDefault(); return; }
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  }

  function onKey(e) {
    if (e.key === 'Escape') {
      if (state.detail) closeDetail();
      else if (state.panel) closeDrawer();
      return;
    }
    if (e.key === 'Tab') {
      if (state.detail) trapTab(e, $('#detail'));
      else if (state.panel) trapTab(e, $('#drawer'));
    }
  }

  /* ---------- Start ---------- */

  function wire() {
    $('#enter').addEventListener('click', enterSite);
    $('#code-go').addEventListener('click', submitCode);
    $('#passcode').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); submitCode(); } });
    $('#name-go').addEventListener('click', submitOther);
    $('#yourname').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); submitOther(); } });
    $('#not-me').addEventListener('click', notMe);
    $('#to-code').addEventListener('click', function () { go('code'); });
    $('#arrow-prev').addEventListener('click', function () { changeTier((state.tier + TIERS.length - 1) % TIERS.length, 'back'); });
    $('#arrow-next').addEventListener('click', function () { changeTier((state.tier + 1) % TIERS.length, 'fwd'); });
    $('#to-top').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }); });
    $('#tray').addEventListener('click', openDrawer);
    $('#drawer-close').addEventListener('click', function () { closeDrawer(); });
    $('#drawer-scrim').addEventListener('click', function () { closeDrawer(); });
    $('#detail-scrim').addEventListener('click', function () { closeDetail(); });
    $('#screen-back').addEventListener('click', function () { if (state.screen === 'back' && state.me) enterList(state.me); });
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', updateFloating, { passive: true });
  }

  function start() {
    $('#price-note').textContent = window.PRICE_NOTE || '';
    wire();

    var saved = loadMe();

    function ready(s) {
      store = s;
      connectClaims();
      renderBanner();
      if (state.screen === 'list') { renderChrome(); renderPanes(); }
    }

    if (saved) showBack(saved); else go('intro');

    if (window.FIREBASE_CONFIG) {
      makeFirebaseStore(window.FIREBASE_CONFIG).then(ready).catch(function () {
        state.offline = true;
        store = makeLocalStore();
        renderBanner();
        if (state.screen === 'list') renderPanes();
      });
    } else {
      ready(makeLocalStore());
    }
  }

  start();
})();
