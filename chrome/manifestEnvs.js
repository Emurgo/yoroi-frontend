// @flow

// URL of Seiza for Yoroi
const POOLS_UI_URL_FOR_YOROI /*: string */ = process.env.POOLS_UI_URL_FOR_YOROI != null
  ? process.env.POOLS_UI_URL_FOR_YOROI // suggested: 'http://localhost:3001'
  : 'https://adapools.yoroiwallet.com';

/**
 * POOLS_UI_URL_FOR_YOROI is the URL of the yoroi version of Seiza, that's in an <iframe>
 * But the Yoroi version of Seiza has an "Open in Seiza" feature
 * that opens a new tab with original Seiza URL, which is a different URL than Seiza for Yoroi.
 * Therefore we also need to have SEIZA_URL in manifest.json (frame-src)
 */
const SEIZA_URL /*: string */ = process.env.SEIZA_URL != null
  ? process.env.SEIZA_URL // suggested: 'http://localhost:3000'
  : 'https://adapools.yoroiwallet.com';

module.exports = {
  POOLS_UI_URL_FOR_YOROI,
  SEIZA_URL,
};
