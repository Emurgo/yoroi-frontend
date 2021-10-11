// @flow
const ClassicTooltip = {
  styleOverrides: {
    tooltip: {
      color: 'var(--mui-tooltip-text-color) ',
      backgroundColor: 'var(--mui-tooltip-background-color)',
      borderRadius: 2,
      fontSize: '0.75rem',
      boxShadow: '0 1.5px 5px 0 rgba(0, 0, 0, 0.18)',
      padding: '4px 12px',
    },
    arrow: {
      color: 'var(--mui-tooltip-background-color)',
    },
  },
  defaultProps: {
    arrow: true,
    placement: 'bottom',
  },
};
const ModernTooltip = {
  styleOverrides: {
    tooltip: {
      color: 'var(--mui-tooltip-text-color) ',
      backgroundColor: 'var(--mui-tooltip-background-color)',
      borderRadius: 4,
      fontSize: '0.75rem',
      boxShadow: '0 1.5px 5px 0 rgba(0, 0, 0, 0.18)',
      padding: '4px 14px',
    },
    arrow: {
      color: 'var(--mui-tooltip-background-color)',
    },
  },
  defaultProps: {
    arrow: true,
    placement: 'bottom',
  },
};
export { ClassicTooltip, ModernTooltip };
