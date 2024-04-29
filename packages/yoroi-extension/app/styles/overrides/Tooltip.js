// @flow
// import { } from '../../themes/'

const Tooltip = {
  styleOverrides: {
    tooltip: ({ theme }: any): any => ({
      color: theme.palette.static.white,
      backgroundColor: theme.palette.grayscale[900],
      borderRadius: 8,
      fontSize: '0.75rem',
      boxShadow: '0 1.5px 5px 0 rgba(0, 0, 0, 0.18)',
      padding: '8px 14px',
    }),
    arrow: ({ theme }: any): any => ({ color: theme.palette.grayscale[900] }),
  },
  defaultProps: { arrow: true, placement: 'bottom' },
};
export { Tooltip };
