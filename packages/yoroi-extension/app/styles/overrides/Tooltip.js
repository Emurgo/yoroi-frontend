// @flow
// import { } from '../../themes/'

const Tooltip = {
  styleOverrides: {
    tooltip: ({ theme }: any): any => ({
      color: theme.palette.ds.gray_min,
      backgroundColor: theme.palette.ds.gray_900,
      borderRadius: 8,
      fontSize: '0.75rem',
      boxShadow: '0 1.5px 5px 0 rgba(0, 0, 0, 0.18)',
      padding: '8px 14px',
    }),
    arrow: ({ theme }: any): any => ({ color: theme.palette.ds.gray_900 }),
  },
  defaultProps: { arrow: true, placement: 'bottom' },
};
export { Tooltip };
