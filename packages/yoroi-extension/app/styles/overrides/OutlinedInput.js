// @flow

const OutlinedInput = {
  styleOverrides: {
    root: ({ theme }: any): any => ({
      paddingRight: '16px',
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.ds.gray_c900 },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.ds.gray_c400,
        borderRadius: 8,
        backgroundColor: 'transparent',
        letterSpacing: 'initial',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.ds.gray_c900,
        borderWidth: '2px',
      },
      '&.Mui-focused.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.ds.sys_magenta_c500,
        borderWidth: '2px',
      },
      '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.ds.gray_c200,
        backgroundColor: 'transparent',
        color: theme.palette.ds.gray_c200,
      },
      '&.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.ds.sys_magenta_c500,
        borderWidth: '2px',
      },
      '& .MuiOutlinedInput-input': {
        '&.Mui-disabled': {
          color: theme.palette.ds.gray_c200,
          WebkitTextFillColor: theme.palette.ds.gray_c200,
        },
      },
      '& svg': { color: theme.palette.ds.gray_c400 },
      '&.Mui-focused svg': { color: theme.palette.ds.gray_c600 },
      '&.Mui-disabled svg': { color: theme.palette.ds.gray_c200 },
    }),
  },
};
export { OutlinedInput };
