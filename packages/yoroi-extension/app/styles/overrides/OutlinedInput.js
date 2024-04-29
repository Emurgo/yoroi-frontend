// @flow

const OutlinedInput = {
  styleOverrides: {
    root: ({ theme }: any): any => ({
      paddingRight: '16px',
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.grayscale[900] },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.grayscale[400],
        borderRadius: 8,
        backgroundColor: 'transparent',
        letterSpacing: 'initial',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.grayscale[900],
        borderWidth: '2px',
      },
      '&.Mui-focused.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.system.magenta[500],
        borderWidth: '2px',
      },
      '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.grayscale[200],
        backgroundColor: 'transparent',
        color: theme.palette.grayscale[200],
      },
      '&.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.system.magenta[500],
        borderWidth: '2px',
      },
      '& .MuiOutlinedInput-input': {
        '&.Mui-disabled': {
          color: theme.palette.grayscale[200],
          WebkitTextFillColor: theme.palette.grayscale[200],
        },
      },
      '& svg': { color: theme.palette.grayscale[400] },
      '&.Mui-focused svg': { color: theme.palette.grayscale[600] },
      '&.Mui-disabled svg': { color: theme.palette.grayscale[200] },
    }),
  },
};
export { OutlinedInput };
