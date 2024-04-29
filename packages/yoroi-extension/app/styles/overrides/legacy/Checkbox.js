// @flow
import { lightTheme } from '../../themes/light-theme-base';

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

const RevampCheckbox: any = {
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
        color: lightTheme.palette.grayscale[400],
        backgroundColor: lightTheme.palette.grayscale[400],
      },
    },
  },
};

export { ClassicCheckbox, ModernCheckbox, RevampCheckbox };
