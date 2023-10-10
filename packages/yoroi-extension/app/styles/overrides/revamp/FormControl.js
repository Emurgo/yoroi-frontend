// @flow

const RevampFormControl = {
  styleOverrides: {
    root: ({ theme }: any): any => ({
      paddingBottom: '20px',
      marginBottom: '10px',
      marginTop: '7px',
      '&:hover': {
        '& .MuiInputLabel-root': {
          color: theme.palette.grayscale[900],
          '&.Mui-disabled': { color: theme.palette.grayscale[200] },
          '&.Mui-error': { color: theme.palette.magenta[500] },
        },
      },
    }),
  },
  defaultProps: {
    variant: 'outlined',
    fullWidth: true,
  },
};

export { RevampFormControl };
