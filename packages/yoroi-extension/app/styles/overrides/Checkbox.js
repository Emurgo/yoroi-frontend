// @flow
const ClassicCheckbox = {
  styleOverrides: {
    root: {
      padding: 0,
      marginRight: '18px',
      color: 'var(--component-checkbox-background-active)',
      '&.Mui-checked': {
        color: 'var(--component-checkbox-background-active)',
      },
      '&.Mui-disabled': {
        color: 'var(--component-checkbox-border-disabled)',
      },
    },
  },
};
const ModernCheckbox = {
  styleOverrides: {
    root: {
      padding: 0,
      marginRight: '18px',
      color: 'var(--component-checkbox-border)',
      '&.Mui-checked': {
        color: 'var(--component-checkbox-background-active)',
      },
      '&.Mui-disabled	': {
        color: 'var(--component-checkbox-border-disabled)',
      },
    },
  },
};

export { ClassicCheckbox, ModernCheckbox };
