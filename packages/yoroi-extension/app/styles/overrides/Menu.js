// @flow
const ClassicMenu = {
  styleOverrides: {
    root: {
      left: -14,
      top: 5,
      '& .MuiMenu-list': {
        padding: 0,
        boxShadow: '0 1.5px 5px 1px rgb(0 0 0 / 10%)',
      },
      '&.Mui-selected': {
        background: 'var(--mui-option-bg-color)',
      },
    },
  },
};
const ModernMenu = {
  styleOverrides: {
    root: {
      left: -14,
      top: 5,
      '& .MuiMenu-list': {
        padding: 0,
        border: '1px solid var(--mui-option-bg-color)',
      },
      '&.Mui-selected': {
        background: 'var(--mui-option-bg-color)',
      },
    },
  },
};
export { ClassicMenu, ModernMenu };
