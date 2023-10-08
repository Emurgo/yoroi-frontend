// @flow

const RevampFormHelperText = {
  styleOverrides: {
    root: ({ theme }: any): any => ({
      color: theme.palette.grayscale[600],
      marginTop: 0,
      marginLeft: '14px',
      fontWeight: 400,
      position: 'absolute',
      bottom: '-2px',
      fontSize: '0.75rem',
      '&.Mui-disabled': { color: theme.palette.grayscale[200] },
      '&.Mui-error': { color: theme.palette.magenta[500] },
    }),
  },
  defaultProps: { variant: 'outlined' },
};
export { RevampFormHelperText };
