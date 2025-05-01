// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, IntlContext } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import CustomTooltip from '../../widgets/CustomTooltip';

import { Box, Typography, styled } from '@mui/material';
import PaperWalletLogo from '../../../assets/images/add-wallet/option-dialog/restore-paper-wallet-modern.inline.svg';

const messages = defineMessages({
  yoroiPaperLabel: {
    id: 'yoroiTransfer.start.instructions.legacy-yoroiPaper',
    defaultMessage: '!!!Legacy Yoroi paper wallet',
  },
});

const GradientBox = styled(Box)(({ theme }: any) => ({
  backgroundImage: theme.palette.ds.bg_gradient_1,
  '&:hover': {
    backgroundImage: theme.palette.ds.bg_gradient_2,
  },
}));

const SBox = styled(Box)(({ theme }) => ({
  '& svg': {
    width: '20px',
    height: '20px',
    '& g': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));

type Props = {|
  +onByron: void => void,
|};

@observer
export default class TransferCards extends Component<Props> {
  static contextType:any = IntlContext;
  render(): Node {
    const intl = this.context;

    return (
      <Box display="flex">
        <GradientBox component="button" onClick={this.props.onByron} borderRadius="8px" width="312px" height="475px">
          <Box padding="24px" textAlign="center" display="flex" flexDirection="column" justifyContent="flex-end" height="100%">
            <Box marginBottom="60px">
              <img src={PaperWalletLogo} alt={intl.formatMessage(messages.yoroiPaperLabel)} />
            </Box>
            <SBox paddingTop="32px" display="flex" flexDirection="row" justifyContent="space-between" alignItems="flex-end">
              <Typography color="ds.text_gray_max" variant="h4" fontWeight={500} textAlign="center">
                {intl.formatMessage(messages.yoroiPaperLabel)}
              </Typography>
              <CustomTooltip
                toolTip={
                  <Box>
                    <Typography color="ds.gray_min">
                      {intl.formatMessage(globalMessages.restoreByronEraWalletDescription)}
                    </Typography>
                  </Box>
                }
              />
            </SBox>
            <Typography color="ds.text_gray_low">2017-2020</Typography>
          </Box>
        </GradientBox>
      </Box>
    );
  }
}
