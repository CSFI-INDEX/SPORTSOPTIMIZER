/**
 * DFSLINEUPAI — Stripe Payment Links Configuration
 * =================================================
 * Replace the placeholder values below with your real Stripe Payment Links
 * after setting up products in your Stripe Dashboard.
 *
 * HOW TO GET PAYMENT LINKS:
 *   1. Go to https://dashboard.stripe.com/payment-links
 *   2. Create a product for each tier (Standard, Pro, Elite)
 *   3. Set billing as "Recurring - Monthly"
 *   4. Copy the payment link URL (e.g. https://buy.stripe.com/xxxx)
 *   5. Paste below
 *
 * WEBHOOK SETUP (required for automatic tier upgrades after payment):
 *   - Endpoint: https://us-central1-sportsoptimizercom.cloudfunctions.net/stripeWebhook
 *   - Events: checkout.session.completed, customer.subscription.deleted
 *   - Copy the webhook signing secret → STRIPE_WEBHOOK_SECRET in Firebase env
 */

const STRIPE_LINKS = {
  standard: 'https://buy.stripe.com/REPLACE_STANDARD',   // $9.99/mo
  pro:      'https://buy.stripe.com/REPLACE_PRO',         // $19.99/mo
  elite:    'https://buy.stripe.com/REPLACE_ELITE',       // $29.99/mo
};

/**
 * Opens the Stripe checkout for a given tier.
 * Appends ?prefilled_email= if user is logged in (improves checkout UX).
 *
 * @param {string} tier - 'standard' | 'pro' | 'elite'
 */
function openStripeCheckout(tier) {
  const base = STRIPE_LINKS[tier];
  if (!base || base.includes('REPLACE')) {
    alert('Payment processing is coming soon. Check back April 1!');
    return;
  }
  let url = base;
  // Pre-fill email if Firebase user is signed in
  try {
    const user = firebase.auth().currentUser;
    if (user && user.email) {
      url += (url.includes('?') ? '&' : '?') + 'prefilled_email=' + encodeURIComponent(user.email);
    }
  } catch(e) { /* Firebase may not be loaded on pricing page */ }
  window.open(url, '_blank');
}

// Expose on TIER_META so membership.js upgrade modal can use real links
if (typeof TIER_META !== 'undefined') {
  TIER_META.standard.stripe = STRIPE_LINKS.standard;
  TIER_META.pro.stripe      = STRIPE_LINKS.pro;
  TIER_META.elite.stripe    = STRIPE_LINKS.elite;
}
