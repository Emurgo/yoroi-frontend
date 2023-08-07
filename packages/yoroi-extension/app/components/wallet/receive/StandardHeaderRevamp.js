// @flow
import type { Node } from 'react';
import type { Notification } from '../../../types/notificationType';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import { LoadingButton } from '@mui/lab';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import { truncateAddress } from '../../../utils/formatters';
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

    const generateAddressForm = (
      <LoadingButton
        variant="primary"
        fullWidth
        loading={isSubmitting}
        className="generateAddressButton"
        onClick={this.submit}
        disabled={this.props.isFilterActive}
      >
        {intl.formatMessage(messages.generateNewAddressButtonLabel)}
      </LoadingButton>
    );

    const walletHeader = (
      <Box display="flex" alignItems="flex-end" mb="30px" pb="30px" gap="48px" position="relative">
        <Box maxWidth="500px" width="100%">
          <Typography mb="24px" variant="body1" fontWeight={500}>
            {intl.formatMessage(messages.walletAddressLabel)}
          </Typography>
          <Box mb="16px">
            <CopyableAddress
              darkVariant
              sx={{
                justifyContent: 'space-between',
                border: '1px solid',
                borderColor: 'grayscale.400',
                bgcolor: 'grayscale.50',
                p: '16px',
                pr: '14px',
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
                  <Typography variant="body1" color="grayscale.max">
                    {truncateAddress(walletAddress)}
                  </Typography>
                </RawHash>
              </ExplorableHashContainer>
            </CopyableAddress>
          </Box>

          <Typography mb="24px" variant="body2" lineHeight="22px" color="grayscale.600">
            <FormattedHTMLMessage {...messages.walletReceiveInstructions} />
          </Typography>

          {generateAddressForm}
          {error && <p className={styles.error}>{intl.formatMessage(error)}</p>}
        </Box>

        <Box display="flex" justifyContent="center" alignItems="center" width="100%">
          <Box
            py="16px"
            px="130px"
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
              <QrCodeWrapper fgColor="#000" value={walletAddress} size={153} />
            </Box>
          </Box>
        </Box>
      </Box>
    );

    return walletHeader;
  }
}
