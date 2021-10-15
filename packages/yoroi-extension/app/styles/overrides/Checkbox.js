// @flow
const ClassicCheckbox = {
  styleOverrides: {
    root: {
      padding: 0,
      marginRight: '18px',
      color: 'var(--mui-checkbox-check-bg-color)',
      '&.Mui-checked': {
        color: 'var(--mui-checkbox-check-bg-color)',
      },
      '&.Mui-disabled': {
        color: 'var(--mui-checkbox-border-color-disabled)',
      },
    },
  },
};
const ModernCheckbox = {
  styleOverrides: {
    root: {
      padding: 0,
      marginRight: '18px',
      color: 'var(--mui-checkbox-border-color)',
      '&.Mui-checked': {
        color: 'var(--mui-checkbox-check-bg-color)',
      },
      '&.Mui-disabled	': {
        color: 'var(--mui-checkbox-border-color-disabled)',
      },
    },
  },
};

export { ClassicCheckbox, ModernCheckbox };
