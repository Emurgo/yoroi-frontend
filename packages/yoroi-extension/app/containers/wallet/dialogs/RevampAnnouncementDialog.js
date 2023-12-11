// @flow

import { Component } from 'react';
import type { Node } from 'react';
import Dialog from '../../../components/widgets/Dialog';
import { defineMessages, intlShape } from 'react-intl';
import { observer } from 'mobx-react';
import { ReactComponent as NewThemeIllustration } from '../../../assets/images/new-theme-illustration.inline.svg';
import DialogCloseButton from '../../../components/widgets/DialogCloseButton';
import styles from './RevampAnnouncementDialog.scss';
import { Box, Stack, Typography } from '@mui/material';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  title: {
    id: 'wallet.revampAnnouncement.title',
    defaultMessage: '!!!Discover a new yoroi',
  },
  description: {
    id: 'wallet.revampAnnouncement.description',
    defaultMessage:
      '!!!Yoroi 5.0 is here. Check out our new and improved design enhancements. The latest version enables an even better experience and performance.',
  },
  updatesSectionTitle: {
    id: 'wallet.revampAnnouncement.updatesSectionTitle',
    defaultMessage: '!!!What’s In the Update:',
  },
  update1: {
    id: 'wallet.revampAnnouncement.updates.1',
    defaultMessage: '!!!User-friendly intuitive design',
  },
  update2: {
    id: 'wallet.revampAnnouncement.updates.2',
    defaultMessage: '!!!Multiple Asset Transactions',
  },
  update3: {
    id: 'wallet.revampAnnouncement.updates.3',
    defaultMessage: '!!!NFT Gallery',
  },
  update4: {
    id: 'wallet.revampAnnouncement.updates.4',
    defaultMessage: '!!!In-app self service Q&As',
  },
  update5: {
    id: 'wallet.revampAnnouncement.updates.5',
    defaultMessage: '!!!In-app get help ticketing',
  },
  update6: {
    id: 'wallet.revampAnnouncement.updates.6',
    defaultMessage: '!!!Fiat Pairing',
  },
  goToWalletLabel: {
    id: 'wallet.revampAnnouncement.goToWalletLabel',
    defaultMessage: '!!!Go to the wallet',
  },
});

type Props = {|
  onClose: void => void,
|};

@observer
export class RevampAnnouncementDialog extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { onClose } = this.props;
    const actions = [
      {
        label: intl.formatMessage(messages.goToWalletLabel),
        onClick: onClose,
        primary: true,
      },
    ];
    return (
      <Dialog
        title={intl.formatMessage(messages.title)}
        className={styles.dialog}
        onClose={onClose}
        closeButton={<DialogCloseButton onClose={onClose} />}
        actions={actions}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }} id="dialogRevampBox">
          <Typography component="div"
            variant="body1"
            sx={{
              textAlign: 'center',
              fontWeight: 500,
            }}
          >
            {intl.formatMessage(messages.description)}
          </Typography>

          <NewThemeIllustration />
          <Stack gap="16px">
            <Typography component="div" color="grayscale.900" variant="body1" fontWeight={500}>
              {intl.formatMessage(messages.updatesSectionTitle)}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
              }}
            >
              <Box
                component="ul"
                sx={{
                  listStyle: 'inside',
                  color: 'grayscale.900',
                  width: '100%',
                }}
              >
                {[messages.update1, messages.update2, messages.update3].map(message => (
                  <Typography component="li" variant="body1" color="grayscale.900">
                    {intl.formatMessage(message)}
                  </Typography>
                ))}
              </Box>
              <Box
                component="ul"
                sx={{
                  listStyle: 'inside',
                  color: 'grayscale.900',
                  width: '100%',
                }}
              >
                {[messages.update4, messages.update5, messages.update6].map(message => (
                  <Typography component="li" variant="body1" color="grayscale.900">
                    {intl.formatMessage(message)}
                  </Typography>
                ))}
              </Box>
            </Box>
          </Stack>
        </Box>
      </Dialog>
    );
  }
}
