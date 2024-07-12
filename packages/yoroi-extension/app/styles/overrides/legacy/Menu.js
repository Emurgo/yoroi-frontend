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
        boxShadow: '0 3px 7px 0 rgba(74,74,74,0.16)',
      },
    },
  },
};
const ModernMenu = {
  styleOverrides: {
    root: {
      '& .MuiMenu-paper': {
        maxHeight: '500px',
        borderRadius: 6,
        boxShadow: '0 3px 7px 0 rgba(74,74,74,0.16)',
        marginTop: '4px',
      },
      '& .MuiMenu-list': {
        padding: 0,
      },
    },
  },
};
export { ClassicMenu, ModernMenu };
