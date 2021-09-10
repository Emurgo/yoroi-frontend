// @flow

const ClassicMenuItem = {
  styleOverrides: {
    root: {
      padding: '14px 20px',
      backgroundColor: 'var(--mui-option-bg-color)',
      height: 50,
      color: 'var(--mui-option-text-color)',
      '&:hover': {
        background: 'var(--mui-option-bg-color-highlighted)',
      },
      '&.Mui-selected': {
        background: 'var(--mui-option-bg-color-highlighted)',
      },
    },
  },
};
const ModernMenuItem = {
  styleOverrides: {
    root: {
      padding: '14px 20px',
      backgroundColor: 'var(--mui-option-bg-color)',
      height: 50,
      color: 'var(--mui-option-text-color)',
      '&:hover': {
        background: 'var(--mui-option-bg-color-highlighted)',
      },
      '&.Mui-selected': {
        background: 'var(--mui-option-bg-color-highlighted)',
      },
    },
  },
};
export { ClassicMenuItem, ModernMenuItem };
