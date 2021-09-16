// @flow
import type { Node } from 'react';
import { GlobalStyles } from '@mui/material';

const globalStyles = (theme: Object): Node => (
  <GlobalStyles
    styles={{
      ':root': {
        /* === BUTTON === */
        // general button primary variant
        '--mui-button-primary-background-color': theme.palette.secondary.main,
        '--mui-button-primary-background-color-hover': theme.palette.secondary.dark,
        '--mui-button-primary-background-color-active': theme.palette.secondary.dark,
        '--mui-button-primary-background-color-disabled': theme.palette.secondary.disabled,
        '--mui-button-primary-text-disabled': theme.palette.secondary.contrastText,
        '--mui-button-primary-text': theme.palette.secondary.contrastText,
        // general button secondary variant
        '--mui-button-outlined-background-color': 'transparent',
        '--mui-button-outlined-background-color-hover': theme.palette.secondary.light,
        '--mui-button-outlined-border-color': theme.palette.secondary.main,
        '--mui-button-outlined-border-color-disabled': theme.palette.secondary.disabled,
        '--mui-button-outlined-border-color-hover': theme.palette.secondary.dark,
        '--mui-button-outlined-background-color-active': theme.palette.secondary.light,
        '--mui-button-outlined-background-color-disabled': theme.palette.secondary.contrastText,
        '--mui-button-outlined-text-color-disabled': theme.palette.secondary.disabled,
        '--mui-button-outlined-text-color': theme.palette.secondary.main,
        '--mui-button-outlined-active-text-color': theme.palette.secondary.dark,
        // classic button secondary variant
        '--mui-button-flat-background-color': 'hsl(10deg 43% 97%)',
        '--mui-button-flat-background-color-hover': 'hsl(9 73% 81% / 10%)',
        '--mui-button-flat-background-color-active': 'hsl(9 30% 64% / 10%)',
        '--mui-button-flat-background-color-disabled': 'hsl(204 20% 95% / 30%)',
        '--mui-button-flat-text-color-disabled': 'hsl(237 37% 11%)',
        '--mui-button-flat-text-color': 'hsl(237 37% 11%)',
        // danger button
        '--mui-danger-color': 'hsl(344deg 100% 54%)',
        '--mui-danger-button-background-color': 'hsl(344deg 87% 43%)',
        '--mui-danger-button-background-color-hover': 'hsl(344deg 100% 54%)',
        '--mui-danger-button-background-color-active': 'hsl(344deg 87% 43%)',
        '--mui-danger-button-background-color-disabled': 'hsl(344deg 87% 43% / 35%)',

        /* === CHECKBOX === */
        '--mui-checkbox-border-color': 'hsl(0 0% 21%)',
        '--mui-checkbox-border-color-disabled': theme.palette.secondary.disabled,
        '--mui-checkbox-check-bg-color': theme.palette.secondary.main,
        '--mui-checkbox-label-text-color': 'hsl(228 4% 23%)',

        /* === TEXTFIELD === */
        '--mui-input-bg-color': 'hsl(0 0% 0% / 0%)',
        '--mui-input-bg-color-disabled': 'hsl(0 0% 0% / 0%)',
        '--mui-input-border-color': 'hsl(0 0% 61%)',
        '--mui-input-border-color-disabled': 'hsl(0 0% 61% / 50%)',
        '--mui-input-border-color-error': theme.palette.error.main,
        '--mui-input-border-color-focus': 'hsl(0 0% 29%)',
        '--mui-input-placeholder-color': 'hsl(225 4% 38% / 50%)',
        '--mui-input-placeholder-color-disabled': 'hsl(225 4% 38% / 50%)',
        '--mui-input-text-color': 'hsl(0 0% 21%)',
        '--mui-input-text-color-disabled': 'hsl(225 4% 38% / 50%)',

        /* === SELECT === */
        '--mui-option-bg-color': 'hsl(0 0% 100%)',
        '--mui-option-bg-color-highlighted': 'hsl(204 20% 95%)',
        '--mui-option-checkmark-color': 'hsl(0 0% 21%)',
        '--mui-option-text-color': 'hsl(0 0% 21%)',
        '--mui-option-border-color': 'hsl(0 0% 21%)',

        /* === TABS === */
        '--mui-tabs-background-color': 'hsl(0 0% 100%)',
        '--mui-tabs-text-color': 'hsl(233 6% 70%)',
        '--mui-tabs-text-color-active': theme.palette.secondary.main,
        '--mui-tabs-text-color-disabled': 'hsl(221 19% 81%)',

        /* === STATUS TX === */
        '--mui-transactions-state-pending-background-color': 'hsl(206 10% 86%)',
        '--mui-transactions-state-pending-text-color': 'hsl(233 6% 20%)',
        '--mui-transactions-state-high-background-color': 'hsl(167 50% 86%)',
        '--mui-transactions-state-high-text-color': 'hsl(167 80% 45%)',
        '--mui-transactions-state-failed-background-color': 'hsl(344 100% 54% / 50%) ',
        '--mui-transactions-state-failed-text-color': 'hsl(344 100% 45%) ',
        '--mui-transactions-state-medium-background-color': 'hsl(37 91% 55% / 30%)',
        '--mui-transactions-state-medium-text-color': 'hsl(37 91% 55%)',
        '--mui-transactions-state-low-background-color': 'hsl(344 100% 54% / 15%)',
        '--mui-transactions-state-low-text-color': 'hsl(344 94% 68%)',

        /* === TOOLTIP === */
        '--mui-tooltip-background-color': 'hsl(225 4% 38% / 0.9)',
        '--mui-tooltip-border-color': 'hsl(214deg 16% 81%)',
        '--mui-tooltip-text-color': 'hsl(0 0% 100%)',
      },
    }}
  />
);

export { globalStyles };
