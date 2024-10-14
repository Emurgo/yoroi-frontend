// @flow
import type { Node } from 'react';
import type { Notification } from '../../types/notification.types';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import { buildURI } from '../../utils/URIHandling';
import { ReactComponent as InfoIcon } from '../../assets/images/revamp/icons/info.inline.svg';
import { Box, Typography, styled, useTheme } from '@mui/material';
import classnames from 'classnames';
import Dialog from '../widgets/Dialog';
import DialogBackButton from '../widgets/DialogBackButton';
import DialogCloseButton from '../widgets/DialogCloseButton';
import QrCodeWrapper from '../widgets/QrCodeWrapper';
import CopyableAddress from '../widgets/CopyableAddress';
import BigNumber from 'bignumber.js';
import styles from './URIDisplayDialog.scss';
import globalMessages from '../../i18n/global-messages';

const WarningBox = styled(Box)(({ theme }) => ({
  padding: '16px',
  paddingTop: '12px',
  borderRadius: '8px',
  background: theme.palette.ds.bg_gradient_1,
}));

const messages = defineMessages({
  uriDisplayDialogTitle: {
    id: 'uri.display.dialog.title',
    defaultMessage: '!!!Generated URL',
  },
  uriDisplayDialogCopyNotification: {
    id: 'uri.display.dialog.copy.notification',
    defaultMessage: '!!!URL successfully copied',
  },
  usabilityWarning: {
    id: 'uri.display.dialog.usabilityWarning',
    defaultMessage: '!!!This link can only be opened by users with Yoroi installed on their browser',
  },
});

type Props = {|
  +onClose: void => void,
  +notification: ?Notification,
  +onCopyAddressTooltip: string => void,
  +onBack: void => void,
  +address: string,
  +amount: BigNumber,
|};

@observer
export default class URIDisplayDialog extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { onClose, onBack, notification, onCopyAddressTooltip, address, amount } = this.props;

    const { intl } = this.context;

    const uri = buildURI(address, amount);
    const uriNotificationId = 'uri-copyNotification';

    return (
      <Dialog
        title={intl.formatMessage(messages.uriDisplayDialogTitle)}
        className={classnames([styles.component, 'URIDisplayDialog'])}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={onClose}
        backButton={<DialogBackButton onBack={onBack} />}
        id="uriDisplayDialog"
      >
        <Box maxWidth="600px">
          <WarningBox>
            <Box mb="8px" display="flex" alignItems="center" justifyContent="flex-start" gap="8px">
              <Box component="span" color="grayscale.max">
                <InfoIcon />
              </Box>
              <Typography color="ds.text_gray_medium" variant="body1" fontWeight={500}>
                {intl.formatMessage(globalMessages.important)}
              </Typography>
            </Box>

            <Typography variant="body1" color="ds.text_gray_medium">
              {intl.formatMessage(messages.usabilityWarning)}
            </Typography>
          </WarningBox>
          <QRCodeSection uri={uri} />
          <div className={styles.uriDisplay}>
            <CopyableAddress
              id="uriDisplayDialog"
              hash={uri}
              elementId={uriNotificationId}
              onCopyAddress={() => onCopyAddressTooltip(uriNotificationId)}
              notification={notification}
              placementTooltip="bottom-start"
              sx={{
                color: 'ds.text_gray_medium',
                alignItems: 'flex-start',
                '& > .CopyableAddress_copyIconBig': {
                  p: '6px',
                  width: 'auto',
                  height: 'auto',
                },
              }}
            >
              <span className={styles.uri}>{uri}</span>
            </CopyableAddress>
          </div>
        </Box>
      </Dialog>
    );
  }
}

const QRCodeSection = ({ uri }) => {
  const { name } = useTheme();
  return (
    <Box className={styles.qrCode} p="16px" sx={{ '& canvas': { borderRadius: '8px' } }}>
      <QrCodeWrapper value={uri} size={152} includeMargin={name === 'dark-theme'} />
    </Box>
  );
};
