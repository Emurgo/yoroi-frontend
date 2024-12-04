// @flow
import GlobalStyles from '@mui/material/GlobalStyles';

export const GlobalStyledScrollbar = (): React$Element<any> => {
    return (
      <GlobalStyles
        styles={theme => ({
          '&::-webkit-scrollbar-track': {
            backgroundColor: theme.palette.ds.bg_color_contrast_high,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.ds.bg_color_contrast_min,
          },
        })}
      />
    );
  };