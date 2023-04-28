import { revampBaseTheme } from '../themes/revamp-base-theme';

// @flow
const ClassicCheckbox = {
  styleOverrides: {
    root: {
      padding: 0,
      marginRight: '18px',
      color: 'var(--yoroi-comp-checkbox-background-active)',
      '&.Mui-checked': {
        color: 'var(--yoroi-comp-checkbox-background-active)',
      },
      '&.Mui-disabled': {
        color: 'var(--yoroi-comp-checkbox-border-disabled)',
      },
    },
  },
};

const ModernCheckbox = {
  styleOverrides: {
    root: {
      padding: 0,
      marginRight: '18px',
      color: 'var(--yoroi-comp-checkbox-border)',
      '&.Mui-checked': {
        color: 'var(--yoroi-comp-checkbox-background-active)',
      },
      '&.Mui-disabled': {
        color: 'var(--yoroi-comp-checkbox-border-disabled)',
      },
    },
  },
};

const RevampCheckbox = {
  styleOverrides: {
    root: {
      padding: 0,
      marginRight: '18px',
      borderRadius: '2px',
      color: 'primary.500',
      '&.Mui-checked': {
        color: 'primary.500',
      },
      '&.Mui-disabled': {
        color: revampBaseTheme.palette.gray[400],
        backgroundColor: revampBaseTheme.palette.gray[400],
      },
    },
  },
};

export { ClassicCheckbox, ModernCheckbox, RevampCheckbox };
