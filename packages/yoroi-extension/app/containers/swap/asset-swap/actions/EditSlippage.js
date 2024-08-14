// @flow
import { Box, Typography, styled } from '@mui/material';
import { ReactComponent as EditIcon } from '../../../../assets/images/revamp/icons/edit.inline.svg';
import { InfoTooltip } from '../../../../components/widgets/InfoTooltip';

type EditSlippageProps = {|
  setOpenedDialog: (dialog: string) => void,
  slippageValue: string,
|};

export const EditSlippage = ({ setOpenedDialog, slippageValue }: EditSlippageProps): React$Node => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box display="flex" gap="8px" alignItems="center">
        <Typography component="div" variant="body1" color="ds.text_gray_medium">
          Slippage tolerance
        </Typography>
        <InfoTooltip
          content={
            'Slippage tolerance is set as a percentage of the total swap value. Your transactions will not be executed if the price moves by more than this amount'
          }
        />
      </Box>
      <IconWrapper onClick={setOpenedDialog} sx={{ cursor: 'pointer', display: 'flex', gap: '4px', alignItems: 'center' }}>
        <Typography component="div" variant="body1" color="ds.text_gray_medium">
          {slippageValue}%
        </Typography>
        <EditIcon />
      </IconWrapper>
    </Box>
  );
};

const IconWrapper = styled(Box)(({ theme }) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));
