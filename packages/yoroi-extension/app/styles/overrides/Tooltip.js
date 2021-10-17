// @flow
const ClassicTooltip = {
  styleOverrides: {
    tooltip: {
      color: 'var(--component-tooltip-text) ',
      backgroundColor: 'var(--component-tooltip-background)',
      borderRadius: 0,
      fontSize: '0.75rem',
      boxShadow: '0 1.5px 5px 0 rgba(0, 0, 0, 0.18)',
      padding: '4px 12px',
    },
    arrow: {
      color: 'var(--component-tooltip-background)',
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
      color: 'var(--component-tooltip-text) ',
      backgroundColor: 'var(--component-tooltip-background)',
      borderRadius: 8,
      fontSize: '0.75rem',
      boxShadow: '0 1.5px 5px 0 rgba(0, 0, 0, 0.18)',
      padding: '4px 14px',
    },
    arrow: {
      color: 'var(--component-tooltip-background)',
    },
  },
  defaultProps: {
    arrow: true,
    placement: 'bottom',
  },
};
export { ClassicTooltip, ModernTooltip };
