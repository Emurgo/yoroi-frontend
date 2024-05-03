// @flow

const FormControl = {
  styleOverrides: {
    root: ({ theme }: any): any => ({
      paddingBottom: '20px',
      marginBottom: '10px',
      marginTop: '7px',
      '&:hover': {
        '& .MuiInputLabel-root': {
          color: theme.palette.ds.gray_c900,
          '&.Mui-disabled': { color: theme.palette.ds.gray_c200 },
          '&.Mui-error': { color: theme.palette.ds.sys_magenta_c500 },
        },
      },
    }),
  },
  defaultProps: {
    variant: 'outlined',
    fullWidth: true,
  },
};

export { FormControl };
