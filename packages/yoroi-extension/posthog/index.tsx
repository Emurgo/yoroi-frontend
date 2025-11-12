import posthog from 'posthog-js/dist/module.no-external';
import environment from '../app/environment';
import type { EventDefinitions } from './events';

const PUBLIC_POSTHOG_KEY_PROD = 'phc_jmeOubKnbivH9L85PPvXVMbDFZevJLd1BLzuett3dII';
const PUBLIC_POSTHOG_KEY_DEV = 'phc_zUcStVLHhwXBHajxusEvlwS77zBVAEQWhpZDx5Ef8oj';
const PUBLIC_POSTHOG_HOST = 'https://eu.i.posthog.com';

posthog.init(environment.isNightly() || environment.isDev() ? PUBLIC_POSTHOG_KEY_DEV : PUBLIC_POSTHOG_KEY_PROD, {
  api_host: PUBLIC_POSTHOG_HOST,
  autocapture: false,
  capture_pageview: false,
  capture_pageleave: false,
  capture_dead_clicks: false,
  disable_surveys: true,
  disable_session_recording: true,
});

let isEnabled = false;

export function enablePosthog() {
  isEnabled = true;
}

export function disablePosthog() {
  isEnabled = false;
}

const PLATFORM_ID = 'web';

export function captureEvent<EventName extends keyof EventDefinitions>(event: EventName, ...params: EventDefinitions[EventName]) {
  if (!isEnabled) {
    return;
  }
  if (environment.isDev()) {
    console.info('posthog event %s captured', event);
  }
  posthog.capture(event, { ...(params[0]), platform: PLATFORM_ID });
}
