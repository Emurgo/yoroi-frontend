// @flow
const ClassicCheckbox = {
  styleOverrides: {
    root: {
      border: 1,
      borderRadius: 0,
      color: 'var(--mui-checkbox-check-bg-color)',
      '&.Mui-checked': {
        color: 'var(--mui-checkbox-check-bg-color)',
      },
      '&.Mui-disabled': {
        color: 'var(--mui-checkbox-border-color-disabled)',
      },
      '& svg': {
        width: '1.15em',
        height: '1.15em',
      },
    },
  },
};
const ModernCheckbox = {
  styleOverrides: {
    root: {
      border: 2,
      color: 'var(--mui-checkbox-border-color)',
      '&.Mui-checked': {
        color: 'var(--mui-checkbox-check-bg-color)',
      },
      '&.Mui-disabled	': {
        color: 'var(--mui-checkbox-border-color-disabled)',
      },
      '& svg': {
        width: '1.15em',
        height: '1.15em',
      },
    },
  },
};

export { ClassicCheckbox, ModernCheckbox };
