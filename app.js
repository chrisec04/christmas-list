/* Chris' Christmas List: page logic.
   Reads the list from items.js, shows it, and keeps claims in sync.
   Claims live in Firebase when firebase-config.js is filled in; otherwise in this browser only (test mode). */

(function () {
  'use strict';

  var OWNER = window.OWNER;
  var SHOPPERS = window.SHOPPERS;
  var TIERS = window.TIERS;
  var ITEMS = window.ITEMS.filter(function (i) { return !i.hidden; });

  var ME_KEY = 'xmas-me-v1';
  var LOCAL_CLAIMS_KEY = 'xmas-claims-v1';
  var FIREBASE_VERSION = '10.12.2';

  var state = {
    me: null,          // the name picked on this device
    claims: {},        // itemId -> { by, status, at }
    hideTaken: false,
    justMine: false,
    flashId: null,     // item that was just claimed (for the little "snap" animation)
    offline: false,    // true when the shared database can't be reached
    picking: false,    // true while the name picker is open
    askingName: false  // true while the "someone else" form is open
  };

  var store = null;
  var unsubscribe = null;
  var lastFocus = null;
  var toastTimer = null;

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

  /* ---------- Actions ---------- */

  function doAction(itemId, run, okMessage, failMessage, flash) {
    lastFocus = itemId;
    run().then(function (ok) {
      toast(ok ? okMessage : failMessage);
      if (ok && flash) {
        state.flashId = itemId;
        setTimeout(function () { state.flashId = null; }, 600);
      }
      if (store.kind === 'local') store.refresh(onClaims);
    }).catch(function () {
      toast('That didn’t save. Check your connection and try again.');
    });
  }

  function claimItem(item) {
    doAction(item.id, function () { return store.claim(item.id, state.me); },
      'You’re getting ' + item.name + '.',
      'Someone just claimed that one. Pick another.', true);
  }
  function markBought(item) {
    doAction(item.id, function () { return store.setStatus(item.id, state.me, 'bought'); },
      'Marked as bought.', 'Couldn’t update that item.');
  }
  function markPlanned(item) {
    doAction(item.id, function () { return store.setStatus(item.id, state.me, 'planned'); },
      'Back to “getting.”', 'Couldn’t update that item.');
  }
  function putBack(item) {
    doAction(item.id, function () { return store.release(item.id, state.me); },
      'Put back. It’s open again.', 'Couldn’t put that back.');
  }

  /* ---------- Identity ---------- */

  function chooseName(name) {
    state.me = name;
    state.picking = false;
    state.askingName = false;
    saveMe(name);
    connectClaims();
    renderAll();
    var main = $('#list');
    if (main) main.scrollIntoView({ block: 'start' });
  }

  function openPicker() {
    state.picking = true;
    renderAll();
  }

  function requestSwitch() {
    if (isOwner()) {
      var dlg = $('#leave-dialog');
      dlg.addEventListener('close', function onClose() {
        dlg.removeEventListener('close', onClose);
        if (dlg.returnValue === 'leave') openPicker();
      });
      if (typeof dlg.showModal === 'function') dlg.showModal();
      else if (window.confirm('Switching shows who is getting what. Switch anyway?')) openPicker();
    } else {
      openPicker();
    }
  }

  /* Chris never loads the claims at all, so there is nothing to peek at. */
  function connectClaims() {
    if (unsubscribe) { unsubscribe(); unsubscribe = null; }
    state.claims = {};
    if (!store || isOwner() || !state.me) return;
    unsubscribe = store.subscribe(onClaims, function () {
      state.offline = true;
      renderAll();
    });
  }

  function onClaims(claims) {
    state.offline = false;
    state.claims = claims || {};
    renderBanner();
    renderTiers();
    renderNav();
  }

  /* ---------- Rendering ---------- */

  function renderBanner() {
    var el = $('#banner');
    if (state.offline) {
      el.className = 'banner is-error';
      el.textContent = 'Can’t reach the shared list right now. Claiming is paused. Refresh the page to try again.';
      el.hidden = false;
    } else if (store && store.kind === 'local' && state.me && !isOwner()) {
      el.className = 'banner';
      el.textContent = 'Test mode: claims are saved only in this browser until the shared database is connected.';
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  }

  function renderWho() {
    var root = $('#who');
    root.textContent = '';

    if (state.me && !state.picking) {
      var surprise = isOwner();
      var bar = h('div', { class: 'who-bar' + (surprise ? ' is-surprise' : '') },
        h('p', null,
          surprise ? h('strong', { text: 'Surprise View. ' }) : 'Shopping as ',
          surprise ? 'Claims are hidden from you.' : h('strong', { text: state.me })),
        h('button', { class: 'btn-link', type: 'button', onclick: requestSwitch, text: surprise ? 'Not Chris?' : 'Not you? Switch' }));
      root.appendChild(bar);
      return;
    }

    root.appendChild(h('h2', { id: 'who-title', text: 'Who’s shopping?' }));
    var chips = h('ul', { class: 'chips' });
    SHOPPERS.forEach(function (name) {
      chips.appendChild(h('li', null, h('button', { class: 'chip', type: 'button', onclick: function () { chooseName(name); }, text: name })));
    });
    chips.appendChild(h('li', null, h('button', {
      class: 'chip', type: 'button', 'aria-expanded': state.askingName ? 'true' : 'false',
      onclick: function () { state.askingName = !state.askingName; renderWho(); if (state.askingName) { var i = $('#other-name'); if (i) i.focus(); } },
      text: 'Someone else'
    })));
    root.appendChild(chips);

    if (state.askingName) {
      var error = h('p', { class: 'form-error', id: 'name-error', role: 'alert', hidden: true });
      var input = h('input', { id: 'other-name', type: 'text', maxlength: '30', autocomplete: 'given-name', 'aria-label': 'Your name', placeholder: 'Your name' });
      var form = h('form', { class: 'name-form', onsubmit: function (e) {
        e.preventDefault();
        var name = input.value.trim();
        if (!name) { error.textContent = 'Type your name to continue.'; error.hidden = false; return; }
        if (name.toLowerCase() === OWNER.toLowerCase()) { error.textContent = 'That name is saved for the person this list is for. Use “I’m ' + OWNER + '” below if that’s you.'; error.hidden = false; return; }
        chooseName(name);
      } }, input, h('button', { class: 'btn btn-primary', type: 'submit', text: 'Continue' }));
      root.appendChild(h('div', { class: 'who-extra' }, form));
      root.appendChild(error);
    }

    root.appendChild(h('div', { class: 'who-extra' },
      h('button', { class: 'btn-link', type: 'button', onclick: function () { chooseName(OWNER); }, text: 'I’m ' + OWNER }),
      state.me ? h('button', { class: 'btn-link', type: 'button', onclick: function () { state.picking = false; state.askingName = false; renderAll(); }, text: 'Cancel' }) : null));
  }

  function tierOf(id) { return TIERS.filter(function (t) { return t.id === id; })[0]; }

  function visibleItems(tierId) {
    return ITEMS.filter(function (it) {
      if (it.tier !== tierId) return false;
      if (isOwner()) return true;
      var c = state.claims[it.id];
      if (state.justMine) return !!c && c.by === state.me;
      if (state.hideTaken) return !c || c.by === state.me || it.shared;
      return true;
    });
  }

  function openCount(tierId) {
    return ITEMS.filter(function (it) {
      return it.tier === tierId && (it.shared || !state.claims[it.id]);
    }).length;
  }
  function totalCount(tierId) {
    return ITEMS.filter(function (it) { return it.tier === tierId; }).length;
  }

  function renderNav() {
    var nav = $('#tier-nav');
    if (!state.me || state.picking) { nav.hidden = true; return; }
    nav.hidden = false;
    nav.textContent = '';
    TIERS.forEach(function (t) {
      var n = isOwner() ? totalCount(t.id) : openCount(t.id);
      nav.appendChild(h('a', { class: 'tier-link t-' + t.id, href: '#tier-' + t.id },
        t.name, h('span', { class: 'count', text: String(n) })));
    });
  }

  function renderFilters() {
    var el = $('#filters');
    el.textContent = '';
    if (!state.me || state.picking || isOwner()) { el.hidden = true; return; }
    el.hidden = false;
    el.appendChild(h('button', { class: 'toggle', type: 'button', 'aria-pressed': String(state.hideTaken),
      onclick: function () { state.hideTaken = !state.hideTaken; if (state.hideTaken) state.justMine = false; renderTiers(); renderFilters(); }, text: 'Hide taken' }));
    el.appendChild(h('button', { class: 'toggle', type: 'button', 'aria-pressed': String(state.justMine),
      onclick: function () { state.justMine = !state.justMine; if (state.justMine) state.hideTaken = false; renderTiers(); renderFilters(); }, text: 'Just mine' }));
  }

  function renderItem(item) {
    var claim = isOwner() ? null : state.claims[item.id];
    var mine = !!claim && claim.by === state.me;
    var taken = !!claim && !mine;

    var cls = 'item' + (taken ? ' is-taken' : '') + (mine ? ' is-mine' : '') + (state.flashId === item.id ? ' just-claimed' : '');
    var li = h('li', { class: cls, 'data-item': item.id });
    li.appendChild(h('p', { class: 'price', text: money(item.price) }));
    li.appendChild(h('p', { class: 'name', text: item.name }));
    if (item.note) li.appendChild(h('p', { class: 'note', text: item.note }));

    var actions = h('div', { class: 'actions' });

    if (!isOwner()) {
      var locked = state.offline || !store;
      if (item.shared) {
        actions.appendChild(h('p', { class: 'state', text: 'Open to everyone. No need to claim.' }));
      } else if (!claim) {
        actions.appendChild(h('button', { class: 'btn btn-primary', type: 'button', disabled: locked, onclick: function () { claimItem(item); }, text: 'I’ll get this' }));
      } else if (mine) {
        actions.appendChild(h('p', { class: 'state', text: claim.status === 'bought' ? 'You bought this.' : 'You’re getting this.' }));
        if (claim.status === 'bought') {
          actions.appendChild(h('button', { class: 'btn btn-quiet', type: 'button', disabled: locked, onclick: function () { markPlanned(item); }, text: 'Not bought yet' }));
        } else {
          actions.appendChild(h('button', { class: 'btn btn-quiet', type: 'button', disabled: locked, onclick: function () { markBought(item); }, text: 'Mark as bought' }));
        }
        actions.appendChild(h('button', { class: 'btn-link', type: 'button', disabled: locked, onclick: function () { putBack(item); }, text: 'Put back' }));
      } else {
        actions.appendChild(h('p', { class: 'state', text: claim.by + (claim.status === 'bought' ? ' bought this.' : ' is getting this.') }));
      }
    }

    if (item.url) {
      actions.appendChild(h('a', { class: 'view', href: item.url, target: '_blank', rel: 'noopener noreferrer', text: 'View item' }));
    }
    if (actions.childNodes.length) li.appendChild(actions);
    return li;
  }

  function renderTiers() {
    var main = $('#list');
    var noscript = main.querySelector('noscript');
    main.textContent = '';
    if (noscript) main.appendChild(noscript);

    if (!state.me || state.picking) return;

    TIERS.forEach(function (t) {
      var items = visibleItems(t.id);
      var section = h('section', { class: 'tier t-' + t.id, id: 'tier-' + t.id, 'aria-labelledby': 'tier-title-' + t.id });
      var left = isOwner()
        ? totalCount(t.id) + ' items'
        : openCount(t.id) + ' of ' + totalCount(t.id) + ' open';
      section.appendChild(h('div', { class: 'tier-head' },
        h('h2', { id: 'tier-title-' + t.id, text: t.name }),
        h('span', { class: 'range', text: t.range }),
        h('span', { class: 'left', text: left })));

      if (items.length) {
        var ul = h('ul', { class: 'items' });
        items.forEach(function (it) { ul.appendChild(renderItem(it)); });
        section.appendChild(ul);
      } else {
        section.appendChild(h('p', { class: 'empty', text: state.justMine ? 'You haven’t claimed anything in this tier yet.' : 'Everything in this tier is taken.' }));
      }
      main.appendChild(section);
    });

    if (lastFocus) {
      var btn = main.querySelector('[data-item="' + lastFocus + '"] button');
      if (btn) btn.focus({ preventScroll: true });
      lastFocus = null;
    }
  }

  function renderAll() {
    renderBanner();
    renderWho();
    renderFilters();
    renderNav();
    renderTiers();
  }

  /* ---------- Start ---------- */

  function start() {
    $('#price-note').textContent = window.PRICE_NOTE || '';

    var saved = loadMe();
    if (saved) state.me = saved;

    function ready(s) {
      store = s;
      connectClaims();
      renderAll();
    }

    if (window.FIREBASE_CONFIG) {
      renderAll();
      makeFirebaseStore(window.FIREBASE_CONFIG).then(ready).catch(function () {
        state.offline = true;
        store = makeLocalStore();
        renderAll();
      });
    } else {
      ready(makeLocalStore());
    }
  }

  start();
})();
