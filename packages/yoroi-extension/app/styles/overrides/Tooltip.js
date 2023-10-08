// @flow
const ClassicTooltip = {
  styleOverrides: {
    tooltip: {
      color: 'var(--yoroi-comp-tooltip-text) ',
      backgroundColor: 'var(--yoroi-comp-tooltip-background)',
      borderRadius: 0,
      fontSize: '0.75rem',
      boxShadow: '0 1.5px 5px 0 rgba(0, 0, 0, 0.18)',
      padding: '8px 12px',
    },
    arrow: {
      color: 'var(--yoroi-comp-tooltip-background)',
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
      color: 'var(--yoroi-comp-tooltip-text) ',
      backgroundColor: 'var(--yoroi-comp-tooltip-background)',
      borderRadius: 8,
      fontSize: '0.75rem',
      boxShadow: '0 1.5px 5px 0 rgba(0, 0, 0, 0.18)',
      padding: '8px 14px',
    },
    arrow: {
      color: 'var(--yoroi-comp-tooltip-background)',
    },
  },
  defaultProps: {
    arrow: true,
    placement: 'bottom',
  },
};
export { ClassicTooltip, ModernTooltip };
