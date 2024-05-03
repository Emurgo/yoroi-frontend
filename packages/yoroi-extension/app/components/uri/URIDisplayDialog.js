// @flow
import type { Node } from 'react';
import type { Notification } from '../../types/notification.types';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import { buildURI } from '../../utils/URIHandling';
import { ReactComponent as InfoIcon } from '../../assets/images/revamp/icons/info.inline.svg';
import { Box, Typography } from '@mui/material';
import classnames from 'classnames';
import Dialog from '../widgets/Dialog/Dialog';
import DialogBackButton from '../widgets/Dialog/DialogBackButton';
import DialogCloseButton from '../widgets/Dialog/DialogCloseButton';
import QrCodeWrapper from '../widgets/QrCodeWrapper';
import CopyableAddress from '../widgets/CopyableAddress';
import BigNumber from 'bignumber.js';
import styles from './URIDisplayDialog.scss';
import globalMessages from '../../i18n/global-messages';

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
    defaultMessage:
      '!!!This link can only be opened by users with Yoroi installed on their browser',
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
      >
        <Box maxWidth="600px">
          <Box
            sx={{
              p: '16px',
              pt: '12px',
              borderRadius: '8px',
              background: 'linear-gradient(269.97deg, #E4E8F7 0%, #C6F7ED 100%)',
            }}
          >
            <Box mb="8px" display="flex" alignItems="center" justifyContent="flex-start" gap="8px">
              <Box component="span" color="ds.gray_cmax">
                <InfoIcon />
              </Box>
              <Typography component="div" variant="body1" fontWeight={500}>
                {intl.formatMessage(globalMessages.important)}
              </Typography>
            </Box>
            <Typography component="div" variant="body1" color="ds.gray_cmax">
              {intl.formatMessage(messages.usabilityWarning)}
            </Typography>
          </Box>
          <div className={styles.qrCode}>
            <QrCodeWrapper value={uri} fgColor="black" size={152} />
          </div>
          <div className={styles.uriDisplay}>
            <CopyableAddress
              id='uriDisplayDialog'
              hash={uri}
              elementId={uriNotificationId}
              onCopyAddress={() => onCopyAddressTooltip(uriNotificationId)}
              notification={notification}
              placementTooltip="bottom-start"
              sx={{
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
