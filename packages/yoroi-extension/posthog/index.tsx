import { PostHogProvider } from '@posthog/react';
import posthog from 'posthog-js';
import environment from '../app/environment';
import type { EventDefinitions } from './events';

const PUBLIC_POSTHOG_KEY_PROD = 'phc_jmeOubKnbivH9L85PPvXVMbDFZevJLd1BLzuett3dII';
const PUBLIC_POSTHOG_KEY_DEV = 'phc_zUcStVLHhwXBHajxusEvlwS77zBVAEQWhpZDx5Ef8oj';
const PUBLIC_POSTHOG_HOST = 'https://eu.i.posthog.com';

posthog.init(
  (environment.isNightly() || environment.isDev()) ? PUBLIC_POSTHOG_KEY_DEV : PUBLIC_POSTHOG_KEY_PROD,
  {
    api_host: PUBLIC_POSTHOG_HOST,
  }
);

let isEnabled = false;

export function enablePosthog() {
  isEnabled = true;
}

export function YoroiPosthogProvider(children) {
  return (
    <PostHogProvider client={posthog}>
      {children}
    </PostHogProvider>
  );
}

const PLATFORM_ID = 'web';

export function captureEvent<EventName extends keyof EventDefinitions>(event: EventName, ...params: EventDefinitions[EventName]) {
  if (!isEnabled) {
    return;
  }
  posthog.capture(event, { ...params, platform: PLATFORM_ID });
}
