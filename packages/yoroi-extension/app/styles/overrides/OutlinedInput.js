// @flow

const OutlinedInput = {
  styleOverrides: {
    root: ({ theme }: any): any => ({
      paddingRight: '16px',
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.ds.gray_900 },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.ds.text_gray_min,
        borderRadius: 8,
        backgroundColor: 'transparent',
        letterSpacing: 'initial',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.ds.gray_900,
        borderWidth: '2px',
      },
      '&.Mui-focused.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.ds.sys_magenta_500,
        borderWidth: '2px',
      },
      '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.ds.gray_200,
        backgroundColor: 'transparent',
        color: theme.palette.ds.gray_200,
      },
      '&.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.ds.sys_magenta_500,
        borderWidth: '2px',
      },
      '& .MuiOutlinedInput-input': {
        '&.Mui-disabled': {
          color: theme.palette.ds.gray_200,
          WebkitTextFillColor: theme.palette.ds.gray_200,
        },
      },
      '& svg': { color: theme.palette.ds.gray_400 },
      '&.Mui-focused svg': { color: theme.palette.ds.gray_600 },
      '&.Mui-disabled svg': { color: theme.palette.ds.gray_200 },
    }),
  },
};
export { OutlinedInput };
