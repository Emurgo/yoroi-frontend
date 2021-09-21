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
        '&:hover': {
          backgroundColor: 'var(--mui-option-bg-color-highlighted)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          borderColor: '#5e6066',
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
      backgroundColor: 'var(--mui-option-bg-color)',
      height: 50,
      color: 'var(--mui-option-text-color)',
      '&:hover': {
        background: 'var(--mui-option-bg-color-highlighted)',
      },
      '&.Mui-selected': {
        background: 'var(--mui-option-bg-color-highlighted)',
        position: 'relative',
        '&:hover': {
          backgroundColor: 'var(--mui-option-bg-color-highlighted)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          borderColor: '#5e6066',
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
