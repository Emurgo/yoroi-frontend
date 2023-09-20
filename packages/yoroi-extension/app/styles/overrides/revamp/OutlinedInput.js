// @flow

const RevampOutlinedInput = {
  styleOverrides: {
    root: {
      paddingRight: '16px',
      height: '56px',
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'grayscale.900' },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'grayscale.400',
        borderRadius: 8,
        backgroundColor: 'transparent',
        letterSpacing: 'initial',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'grayscale.900',
        border: '2px solid',
      },
      '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
        borderColor: 'grayscale.200',
        backgroundColor: 'transparent',
        color: 'grayscale.200',
      },
      '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: 'magenta.500' },
      '& .MuiOutlinedInput-input': {
        '&.Mui-disabled': { color: 'grayscale.200', WebkitTextFillColor: 'grayscale.200' },
      },
      '& svg': { color: 'grayscale.400' },
      '&.Mui-focused svg': { color: 'grayscale.600' },
      '&.Mui-disabled svg': { color: 'grayscale.200' },
    },
  },
};
export { RevampOutlinedInput };
