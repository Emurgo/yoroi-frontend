// @flow

import React from 'react';

import { select, boolean, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import LoadingPage from './LoadingPage';
import { StorageLoadError, UnableToLoadError } from '../i18n/errors';
import { withScreenshot } from 'storycap';

export default {
  title: `${__filename.split('.')[0]}`,
  component: LoadingPage,
  decorators: [withScreenshot],
};

const PotentialErrors = {
  none: null,
  StorageLoadError: new StorageLoadError(),
  UnableToLoadError: new UnableToLoadError(),
};

export const Generic = () => (
  <LoadingPage
    generated={{
      stores: {
        profile: {
          hasLoadedCurrentLocale: boolean('hasLoadedCurrentLocale', true),
          hasLoadedCurrentTheme: boolean('hasLoadedCurrentTheme', true),
        },
        loading: {
          isLoading: boolean('isLoading', true),
          error: select(
            'error',
            PotentialErrors,
            PotentialErrors.none,
          ),
        }
      },
      handleExternalLinkClick: action('External link click'),
      downloadLogs: action('Download logs'),
    }}
  />
);

/* ===== Notable variations ===== */

export const NoLocale = () => (
  <LoadingPage
    generated={{
      stores: {
        profile: {
          hasLoadedCurrentLocale: false,
          hasLoadedCurrentTheme: boolean('hasLoadedCurrentTheme', true),
        },
        loading: {
          isLoading: boolean('isLoading', true),
          error: select(
            'error',
            PotentialErrors,
            PotentialErrors.none,
          ),
        }
      },
      handleExternalLinkClick: action('External link click'),
      downloadLogs: action('Download logs'),
    }}
  />
);

export const NoTheme = () => (
  <LoadingPage
    generated={{
      stores: {
        profile: {
          hasLoadedCurrentLocale: boolean('hasLoadedCurrentLocale', true),
          hasLoadedCurrentTheme: false,
        },
        loading: {
          isLoading: boolean('isLoading', true),
          error: select(
            'error',
            PotentialErrors,
            PotentialErrors.none,
          ),
        }
      },
      handleExternalLinkClick: action('External link click'),
      downloadLogs: action('Download logs'),
    }}
  />
);

export const StorageLoadFailed = () => (
  <LoadingPage
    generated={{
      stores: {
        profile: {
          hasLoadedCurrentLocale: boolean('hasLoadedCurrentLocale', true),
          hasLoadedCurrentTheme: boolean('hasLoadedCurrentTheme', true),
        },
        loading: {
          isLoading: boolean('isLoading', true),
          error: PotentialErrors.StorageLoadError,
        }
      },
      handleExternalLinkClick: action('External link click'),
      downloadLogs: action('Download logs'),
    }}
  />
);

export const UnknownLoadFailed = () => (
  <LoadingPage
    generated={{
      stores: {
        profile: {
          hasLoadedCurrentLocale: boolean('hasLoadedCurrentLocale', true),
          hasLoadedCurrentTheme: boolean('hasLoadedCurrentTheme', true),
        },
        loading: {
          isLoading: boolean('isLoading', true),
          error: PotentialErrors.UnableToLoadError,
        }
      },
      handleExternalLinkClick: action('External link click'),
      downloadLogs: action('Download logs'),
    }}
  />
);
