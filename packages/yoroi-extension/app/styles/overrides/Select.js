// @flow
const ClassicSelect = {
  styleOverrides: {
    icon: {
      color: 'hsl(221 12% 59%)',
      right: '15px',
    },
  },
  defaultProps: {
    color: 'input',
    notched: false,
  },
};

const ModernSelect = {
  styleOverrides: {
    icon: {
      color: 'hsl(221 12% 59%)',
      right: '15px',
    },
  },
  defaultProps: {
    color: 'input',
    notched: true,
  },
};

export { ClassicSelect, ModernSelect };
