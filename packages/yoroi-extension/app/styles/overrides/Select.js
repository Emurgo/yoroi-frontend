// @flow
const ClassicSelect = {
  styleOverrides: {
    icon: {
      color: 'var(--yoroi-comp-menu-icon)',
      right: '15px',
    },
  },
  defaultProps: {
    notched: false,
  },
};

const ModernSelect = {
  styleOverrides: {
    icon: {
      color: 'var(--yoroi-comp-menu-icon)',
      right: '15px',
    },
  },
  defaultProps: {
    notched: true,
  },
};

export { ClassicSelect, ModernSelect };
