// @flow

const RevampFormControl = {
  styleOverrides: {
    root: {
      paddingBottom: '20px',
      marginBottom: '10px',
      marginTop: '7px',
      '&:hover': {
        '& .MuiInputLabel-root': {
          color: 'grayscale.900',
          '&.Mui-disabled': { color: 'grayscale.200' },
          '&.Mui-error': { color: 'magenta.500' },
        },
      },
    },
  },
  defaultProps: {
    variant: 'outlined',
    fullWidth: true,
  },
};

export { RevampFormControl };
