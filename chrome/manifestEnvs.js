// @flow

// URL of Seiza for Yoroi
const SEIZA_FOR_YOROI_URL = process.env.SEIZA_FOR_YOROI_URL != null ?
  process.env.SEIZA_FOR_YOROI_URL : 'https://seiza.com';
// export const SEIZA_FOR_YOROI_URL = process.env.SEIZA_FOR_YOROI_URL || 'http://localhost:3001';

/**
 * SEIZA_FOR_YOROI_URL is the URL of the yoroi version of Seiza, that's in an <iframe>
 * But the Yoroi version of Seiza has an "Open in Seiza" feature
 * that opens a new tab with original Seiza URL, which is a different URL than Seiza for Yoroi.
 * Therefore we also need to have SEIZA_URL in manifest.json (frame-src)
 */
const SEIZA_URL = process.env.SEIZA_URL != null ? process.env.SEIZA_URL : 'https://seiza.com';
// export const SEIZA_URL = process.env.SEIZA_URL || 'http://localhost:3001';

module.exports = {
  SEIZA_FOR_YOROI_URL,
  SEIZA_URL,
};
