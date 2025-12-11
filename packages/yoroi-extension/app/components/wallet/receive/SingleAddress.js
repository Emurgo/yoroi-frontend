// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { defineMessages, IntlContext, FormattedMessage } from 'react-intl';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import { Box, Typography, styled } from '@mui/material';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import CopyableAddress from '../../widgets/CopyableAddress';
import QrCodeWrapper from '../../widgets/QrCodeWrapper';
import RawHash from '../../widgets/hashWrappers/RawHash';

const QrCodeBackground = styled(Box)(({ theme }) => ({
  background: theme.palette.ds.bg_gradient_1,
}));

const messages = defineMessages({
  walletAddressLabel: {
    id: 'wallet.receive.page.walletAddressLabel',
    defaultMessage: '!!!Your wallet address',
  },
  walletReceiveInstructions: {
    id: 'wallet.receive.page.singleAddress.walletReceiveInstructions',
    defaultMessage:
      '!!!Share this wallet address to receive payments.',
  },
});

type Props = {|
  +walletAddress: string,
  +selectedExplorer: SelectedExplorer,
  +isWalletAddressUsed: boolean,
  +onCopyAddressTooltip: (string) => void,
|};


export default class SingleAddress extends Component<Props> {
  static contextType: any = IntlContext;

  render(): Node {
    const { walletAddress, isWalletAddressUsed, onCopyAddressTooltip } = this.props;
    const intl = this.context;
    const locationId = 'wallet:receive:infoPanel:header';

    return (
      <Box>
        <Typography color="ds.text_gray_medium" mb="24px" variant="body1" fontWeight={500}>
          {intl.formatMessage(messages.walletAddressLabel)}
        </Typography>

        <Box display="flex" alignItems="start" justifyContent="center" mb="30px" pb="30px" gap="24px" position="relative">
          <Box display="flex" justifyContent="center" alignItems="center">
            <QrCodeBackground p="16px" borderRadius="16px" height="min-content">
              <Box
                alignItems="flex-start"
                display="flex"
                mx="auto"
                sx={{
                  '& canvas': {
                    border: '16px solid',
                    borderRadius: '8px',
                    borderColor: 'common.white',
                    boxSizing: 'content-box',
                    bgcolor: 'common.white',
                  },
                }}
              >
                <QrCodeWrapper value={walletAddress} size={153} id={locationId + '-addressQrCode-image'} />
              </Box>
            </QrCodeBackground>
          </Box>
          <Box width="100%">
            <Box mb="8px">
              <CopyableAddress
                id={locationId}
                darkVariant
                sx={{
                  justifyContent: 'flex-start',
                  alignItems: 'start',
                  bgcolor: 'transparent',
                  px: '0px',
                  pt: '0px',
                }}
                hash={walletAddress}
                elementId=""
                onCopyAddress={() => onCopyAddressTooltip(walletAddress)}
                notification={null}
                placementTooltip="bottom-start"
              >
                <ExplorableHashContainer
                  selectedExplorer={this.props.selectedExplorer}
                  hash={walletAddress}
                  light={isWalletAddressUsed}
                  linkType="address"
                >
                  <RawHash light={isWalletAddressUsed}>
                    <Typography component="div" variant="body1" color="ds.text_gray_medium">
                      {walletAddress}
                    </Typography>
                  </RawHash>
                </ExplorableHashContainer>
              </CopyableAddress>
            </Box>

            <Typography component="div" mb="24px" variant="body2" lineHeight="22px" color="ds.text_gray_low">
              <FormattedMessage {...messages.walletReceiveInstructions} values={{ newLine: <br /> }} />
            </Typography>

          </Box>
        </Box>
      </Box>
    );
  }
}
