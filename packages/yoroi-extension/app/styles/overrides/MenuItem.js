// @flow
const ClassicMenuItem = {
  styleOverrides: {
    root: {
      padding: '14px 20px',
      backgroundColor: 'var(--yoroi-comp-menu-item-background)',
      height: 50,
      color: 'var(--yoroi-comp-menu-item-text)',
      '&:hover': {
        background: 'var(--yoroi-comp-menu-item-background-highlighted)',
      },
      '&.Mui-selected': {
        background: 'var(--yoroi-comp-menu-item-background-highlighted)',
        '&:hover': {
          backgroundColor: 'var(--yoroi-comp-menu-item-background-highlighted)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          borderColor: 'var(--yoroi-comp-menu-item-checkmark)',
          borderStyle: 'solid',
          borderWidth: '0 2px 2px 0',
          height: '9px',
          margin: '0 2px 3px auto',
          transform: 'rotate(45deg)',
          width: '5px',
          right: '22px',
        },
      },
    },
  },
};
const ModernMenuItem = {
  styleOverrides: {
    root: {
      padding: '14px 20px',
      backgroundColor: 'var(--yoroi-comp-menu-item-background)',
      height: 45,
      color: 'var(--yoroi-comp-menu-item-text)',
      '&:hover': {
        background: 'var(--yoroi-comp-menu-item-background-highlighted)',
      },
      '&.Mui-selected': {
        background: 'var(--yoroi-comp-menu-item-background-highlighted)',
        position: 'relative',
        '&:hover': {
          backgroundColor: 'var(--yoroi-comp-menu-item-background-highlighted)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          borderColor: 'var(--yoroi-comp-menu-item-checkmark)',
          borderStyle: 'solid',
          borderWidth: '0 2px 2px 0',
          height: '9px',
          margin: '0 2px 3px auto',
          transform: 'rotate(45deg)',
          width: '5px',
          right: '22px',
        },
      },
    },
  },
};
export { ClassicMenuItem, ModernMenuItem };
