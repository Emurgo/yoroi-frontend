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
      '&.Mui-disabled	': {
        color: 'var(--yoroi-comp-checkbox-border-disabled)',
      },
    },
  },
};

export { ClassicCheckbox, ModernCheckbox };
