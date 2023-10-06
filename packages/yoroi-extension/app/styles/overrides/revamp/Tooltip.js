// @flow
// import { } from '../../themes/'

const RevampTooltip = {
  styleOverrides: {
    tooltip: {
      color: 'var(--yoroi-palette-common-white)',
      backgroundColor: 'var(--yoroi-palette-common-black)',
      borderRadius: 8,
      fontSize: '0.75rem',
      boxShadow: '0 1.5px 5px 0 rgba(0, 0, 0, 0.18)',
      padding: '8px 14px',
    },
    arrow: { color: 'var(--yoroi-palette-common-black)' },
  },
  defaultProps: { arrow: true, placement: 'bottom' },
};
export { RevampTooltip };
