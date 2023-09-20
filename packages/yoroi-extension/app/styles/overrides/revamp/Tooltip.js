// @flow

const RevampTooltip = {
  styleOverrides: {
    tooltip: {
      color: 'grayscale.600',
      backgroundColor: 'grayscale.700',
      borderRadius: 8,
      fontSize: '0.75rem',
      boxShadow: '0 1.5px 5px 0 rgba(0, 0, 0, 0.18)',
      padding: '8px 14px',
    },
    arrow: { color: 'grayscale.700' },
  },
  defaultProps: { arrow: true, placement: 'bottom' },
};
export { RevampTooltip };
