// @flow
import type { Node } from 'react';
import type { Notification } from '../../../types/notification.types';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import { LoadingButton } from '@mui/lab';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import { Box, Typography } from '@mui/material';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import LocalizableError from '../../../i18n/LocalizableError';
import styles from './StandardHeader.scss';
import CopyableAddress from '../../widgets/CopyableAddress';
import QrCodeWrapper from '../../widgets/QrCodeWrapper';
import RawHash from '../../widgets/hashWrappers/RawHash';

const messages = defineMessages({
  walletAddressLabel: {
    id: 'wallet.receive.page.walletAddressLabel',
    defaultMessage: '!!!Your wallet address',
  },
  walletReceiveInstructions: {
    id: 'wallet.receive.page.walletReceiveInstructions',
    defaultMessage:
      '!!!Share this wallet address to receive payments. To protect your privacy, new addresses are generated automatically once you use them.',
  },
  generateNewAddressButtonLabel: {
    id: 'wallet.receive.page.generateNewAddressButtonLabel',
    defaultMessage: '!!!Generate new address',
  },
});

type Props = {|
  +walletAddress: string,
  +selectedExplorer: SelectedExplorer,
  +isWalletAddressUsed: boolean,
  +onGenerateAddress: void => Promise<void>,
  +onCopyAddressTooltip: (string, string) => void,
  +notification: ?Notification,
  +isSubmitting: boolean,
  +error?: ?LocalizableError,
  +isFilterActive: boolean,
|};

@observer
export default class StandardHeaderRevamp extends Component<Props> {
  static defaultProps: {| error: void |} = {
    error: undefined,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  submit: void => Promise<void> = async () => {
    await this.props.onGenerateAddress();
  };

  render(): Node {
    const {
      walletAddress,
      isSubmitting,
      error,
      isWalletAddressUsed,
      onCopyAddressTooltip,
      notification,
    } = this.props;
    const { intl } = this.context;
    const mainAddressNotificationId = 'mainAddress-copyNotification';
    const locationId = 'wallet:receive:infoPanel:header'

    const generateAddressForm = (
      <LoadingButton
        variant="primary"
        loading={isSubmitting}
        className="generateAddressButton"
        onClick={this.submit}
        disabled={this.props.isFilterActive}
        sx={{
          '&.MuiButton-sizeMedium': {
            padding: '9px 16px',
            height: 'unset',
          },
        }}
        id={locationId + '-generateNewAddress-button'}
      >
        {intl.formatMessage(messages.generateNewAddressButtonLabel)}
      </LoadingButton>
    );

    const walletHeader = (
      <Box>
        <Typography component="div" mb="24px" variant="body1" fontWeight={500}>
          {intl.formatMessage(messages.walletAddressLabel)}
        </Typography>

        <Box
          display="flex"
          alignItems="start"
          justifyContent="center"
          mb="30px"
          pb="30px"
          gap="24px"
          position="relative"
        >
          <Box display="flex" justifyContent="center" alignItems="center">
            <Box
              p="16px"
              borderRadius="16px"
              height="min-content"
              sx={{
                background: theme => theme.palette.gradients['blue-green-bg'],
              }}
            >
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
                <QrCodeWrapper fgColor="#000" value={walletAddress} size={153} id={locationId + '-addressQrCode-image'} />
              </Box>
            </Box>
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
                elementId={mainAddressNotificationId}
                onCopyAddress={() => onCopyAddressTooltip(walletAddress, mainAddressNotificationId)}
                notification={notification}
                placementTooltip="bottom-start"
              >
                <ExplorableHashContainer
                  selectedExplorer={this.props.selectedExplorer}
                  hash={walletAddress}
                  light={isWalletAddressUsed}
                  linkType="address"
                >
                  <RawHash light={isWalletAddressUsed}>
                    <Typography component="div" variant="body1" color="grayscale.max">
                      {walletAddress}
                    </Typography>
                  </RawHash>
                </ExplorableHashContainer>
              </CopyableAddress>
            </Box>

            <Typography component="div" mb="24px" variant="body2" lineHeight="22px" color="grayscale.600">
              <FormattedHTMLMessage {...messages.walletReceiveInstructions} />
            </Typography>

            {generateAddressForm}
            {error && <div className={styles.error} id={locationId + '-addressError-text'}>{intl.formatMessage(error)}</div>}
          </Box>
        </Box>
      </Box>
    );

    return walletHeader;
  }
}
