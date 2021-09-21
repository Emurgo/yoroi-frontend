// @flow
const ClassicMenu = {
  styleOverrides: {
    root: {
      '& .MuiMenu-paper': {
        maxHeight: '500px',
        borderRadius: 0,
      },
      '& .MuiMenu-list': {
        padding: 0,
        boxShadow: '0 1.5px 5px 1px rgb(0 0 0 / 10%)',
      },
    },
  },
};
const ModernMenu = {
  styleOverrides: {
    root: {
      '& .MuiMenu-paper': {
        maxHeight: '500px',
        borderRadius: 8,
      },
      '& .MuiMenu-list': {
        padding: 0,
        border: '1px solid var(--mui-option-bg-color)',
      },
    },
  },
};
export { ClassicMenu, ModernMenu };
