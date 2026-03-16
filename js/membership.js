/**
 * DFSLINEUPAI — Membership Tier System
 * =====================================
 * Defines tier levels, feature gates, and upgrade prompts.
 * Loaded by both index.html and Draftkings.html.
 *
 * Tier hierarchy:  free < standard < pro < elite
 * User's tier is stored in Firestore: users/{uid}.tier
 */

// ── Tier definitions ──────────────────────────────────────────
const TIERS = { free: 0, standard: 1, pro: 2, elite: 3 };

const TIER_META = {
  free: {
    label:    'FREE',
    color:    '#888',
    badge:    'FREE',
    monthly:  0,
    stripe:   null,
  },
  standard: {
    label:    'STANDARD',
    color:    '#00d4ff',
    badge:    'STANDARD',
    monthly:  9.99,
    stripe:   'STRIPE_PAYMENT_LINK_STANDARD',   // replace after Stripe setup
    features: ['Prop Builder', 'NS Projections', 'Accuracy Tracker', 'Prop Slip'],
  },
  pro: {
    label:    'PRO',
    color:    '#FFB800',
    badge:    'PRO',
    monthly:  19.99,
    stripe:   'STRIPE_PAYMENT_LINK_PRO',        // replace after Stripe setup
    features: ['Everything in Standard', 'Lineup Builder (Yahoo + DK)', 'NS POWER BOOST', 'CSV Export'],
  },
  elite: {
    label:    'ELITE',
    color:    '#00FF41',
    badge:    'ELITE',
    monthly:  29.99,
    stripe:   'STRIPE_PAYMENT_LINK_ELITE',      // replace after Stripe setup
    features: ['Everything in Pro', 'Weekly Email Reports', 'Favorite Team Projections', 'Early Slate Access'],
  },
};

// ── Feature → minimum tier required ───────────────────────────
const FEATURE_GATES = {
  // Lineup Builder
  'lineup-builder':     'pro',
  'csv-export':         'pro',
  'ns-boost':           'pro',
  'dk-lineup-builder':  'pro',
  'dk-csv-export':      'pro',
  'dk-ns-boost':        'pro',

  // Prop Builder
  'prop-builder':       'standard',
  'prop-slip':          'standard',
  'prop-tracker':       'standard',

  // Weekly emails
  'weekly-email':       'elite',
  'email-reports':      'elite',

  // Free (everything else defaults to free)
  'player-pool':        'free',
  'game-totals':        'free',
  'rankings':           'free',
  'top-picks':          'free',
};

// ── State: current user tier ───────────────────────────────────
window.CURRENT_TIER = 'free';

function setCurrentTier(tier) {
  window.CURRENT_TIER = (tier && TIERS[tier] !== undefined) ? tier : 'free';
}

function getCurrentTier() {
  return window.CURRENT_TIER || 'free';
}

// ── Access check ───────────────────────────────────────────────
function canAccess(feature) {
  const required = FEATURE_GATES[feature] || 'free';
  return TIERS[getCurrentTier()] >= TIERS[required];
}

function requiresUpgrade(feature) {
  return !canAccess(feature);
}

function requiredTierFor(feature) {
  return FEATURE_GATES[feature] || 'free';
}

// ── Upgrade gate: shows upgrade modal then optionally runs callback ──
function requireTier(feature, onGranted) {
  if (canAccess(feature)) {
    if (onGranted) onGranted();
    return;
  }
  const needed = requiredTierFor(feature);
  showUpgradeModal(needed);
}

// ── Upgrade Modal ──────────────────────────────────────────────
function showUpgradeModal(requiredTier) {
  document.getElementById('upgradeModal')?.remove();

  const meta      = TIER_META[requiredTier];
  const userTier  = getCurrentTier();
  const isDK      = typeof dkPlayers !== 'undefined'; // detect which page we're on
  const accentColor = isDK ? '#f6861f' : '#7B2FFF';

  const featuresHTML = (meta.features || []).map(f =>
    `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
      <span style="color:#00FF41;font-size:1em;">✓</span>
      <span style="font-family:'Share Tech Mono',monospace;font-size:0.8em;color:#e8edf5;">${f}</span>
    </div>`
  ).join('');

  const overlay = document.createElement('div');
  overlay.id = 'upgradeModal';
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:19999;
    background:rgba(4,7,18,0.92);backdrop-filter:blur(8px);
    display:flex;align-items:center;justify-content:center;padding:20px;
  `;
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };

  overlay.innerHTML = `
    <div style="
      background:#0C1020;border:2px solid ${meta.color};border-radius:18px;
      padding:36px 32px;max-width:460px;width:100%;text-align:center;
      box-shadow:0 0 60px ${meta.color}33;
    ">
      <div style="font-family:'Rajdhani',sans-serif;font-weight:900;font-size:0.72em;
        letter-spacing:4px;color:${meta.color};margin-bottom:8px;">UPGRADE REQUIRED</div>

      <div style="font-family:'Rajdhani',sans-serif;font-weight:900;font-size:2.2em;
        color:#fff;letter-spacing:3px;margin-bottom:4px;">
        <span style="color:#fff;">NEURAL</span><span style="color:${accentColor};">STITCH</span>™
      </div>
      <div style="font-family:'Rajdhani',sans-serif;font-weight:900;font-size:1.6em;
        color:${meta.color};letter-spacing:3px;margin-bottom:20px;">${meta.label} PLAN</div>

      <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:16px;
        margin-bottom:20px;text-align:left;">${featuresHTML}</div>

      <div style="font-family:'Share Tech Mono',monospace;font-size:1.5em;font-weight:900;
        color:${meta.color};margin-bottom:6px;">$${meta.monthly}<span style="font-size:0.55em;color:#888;">/mo</span></div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:0.65em;color:#666;
        margin-bottom:24px;">CANCEL ANYTIME · NO CONTRACTS</div>

      <button onclick="window.open('${meta.stripe}','_blank')" style="
        font-family:'Rajdhani',sans-serif;font-weight:900;font-size:1.15em;
        letter-spacing:3px;padding:14px 40px;border-radius:9px;cursor:pointer;
        background:${meta.color};border:none;color:#000;width:100%;margin-bottom:10px;
        transition:opacity 0.2s;
      " onmouseover="this.style.opacity=0.85" onmouseout="this.style.opacity=1">
        ⚡ UPGRADE TO ${meta.label}
      </button>
      <button onclick="document.getElementById('upgradeModal').remove()" style="
        font-family:'Rajdhani',sans-serif;font-weight:700;font-size:0.9em;
        letter-spacing:2px;padding:10px 20px;border-radius:7px;cursor:pointer;
        background:transparent;border:1px solid rgba(255,255,255,0.15);color:#888;width:100%;
      ">MAYBE LATER</button>
    </div>
  `;
  document.body.appendChild(overlay);
}

// ── Tier badge HTML (for topbar / profile display) ────────────
function tierBadgeHTML(tier) {
  const meta = TIER_META[tier] || TIER_META.free;
  if (tier === 'free') return '';
  return `<span style="
    font-family:'Rajdhani',sans-serif;font-weight:900;font-size:0.7em;
    padding:2px 7px;border-radius:4px;letter-spacing:2px;
    background:${meta.color}22;border:1px solid ${meta.color}66;color:${meta.color};
    vertical-align:middle;margin-left:4px;
  ">${meta.label}</span>`;
}

// ── Lock overlay for gated UI sections ────────────────────────
// Call on a container element to overlay it with a lock + upgrade CTA
function applyLockOverlay(containerId, feature) {
  const el = document.getElementById(containerId);
  if (!el || canAccess(feature)) return;

  const needed  = requiredTierFor(feature);
  const meta    = TIER_META[needed];
  const isDK    = typeof dkPlayers !== 'undefined';
  const accent  = isDK ? '#f6861f' : '#7B2FFF';

  el.style.position = 'relative';
  el.style.pointerEvents = 'none';
  el.style.userSelect = 'none';

  const lock = document.createElement('div');
  lock.className = 'ns-lock-overlay';
  lock.style.cssText = `
    position:absolute;inset:0;z-index:10;
    background:rgba(4,7,18,0.82);backdrop-filter:blur(4px);
    border-radius:inherit;display:flex;flex-direction:column;
    align-items:center;justify-content:center;gap:10px;
    pointer-events:all;cursor:pointer;
  `;
  lock.onclick = () => showUpgradeModal(needed);
  lock.innerHTML = `
    <div style="font-size:2em;">🔒</div>
    <div style="font-family:'Rajdhani',sans-serif;font-weight:900;font-size:1.1em;
      color:${meta.color};letter-spacing:3px;">${meta.label} FEATURE</div>
    <div style="font-family:'Share Tech Mono',monospace;font-size:0.7em;
      color:#888;letter-spacing:1px;">TAP TO UPGRADE</div>
  `;
  el.appendChild(lock);
}
