// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import { observer } from 'mobx-react';
import Dialog from '../../../widgets/Dialog';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { ReactComponent as RevampAnnouncement } from '../../../../assets/images/revamp-announcement.inline.svg';
import { List, ListItem, Typography } from '@mui/material';
import styles from './RevampSwitchDialog.scss'

const messages = defineMessages({
    dialogTitle: {
      id: 'wallet.dashboard.revampAnnouncement.dialog.dialogTitle',
      defaultMessage: '!!!new yoroi version is available',
    },
    header: {
      id: 'wallet.dashboard.revampAnnouncement.dialog.header',
      defaultMessage: '!!!New Yoroi version enables an exceptional experience for Cardano ADA holders. Apply it and take advantage of the new and improved existing features.'
    },
    feature1: {
      id: 'wallet.dashboard.revampAnnouncement.dialog.feature1',
      defaultMessage: '!!!Better performance and new UI',
    },
    feature2: {
      id: 'wallet.dashboard.revampAnnouncement.dialog.feature2',
      defaultMessage: '!!!Multiple asset transaction (NEW)',
    },
    feature3: {
      id: 'wallet.dashboard.revampAnnouncement.dialog.feature3',
      defaultMessage: '!!!NFT Gallery (NEW)',
    },
    feature4: {
      id: 'wallet.dashboard.revampAnnouncement.dialog.feature4',
      defaultMessage: '!!!FAQ (NEW)',
    },
    feature5: {
      id: 'wallet.dashboard.revampAnnouncement.dialog.feature5',
      defaultMessage: '!!!Support center (NEW)',
    },
    feature6: {
      id: 'wallet.dashboard.revampAnnouncement.dialog.feature6',
      defaultMessage: '!!!Fiat pairing (NEW)',
    },
    feature7: {
      id: 'wallet.dashboard.revampAnnouncement.dialog.feature7',
      defaultMessage: '!!!Release notes (Coming soon)',
    },
    footer: {
      id: 'wallet.dashboard.revampAnnouncement.dialog.footer',
      defaultMessage: '!!!P.S. You can always move back to the previous version.',
    },
    tryItNow: {
      id: 'wallet.dashboard.revampAnnouncement.dialog.tryItNowBtn',
      defaultMessage: '!!!try it now',
    },
    getStarted: {
      id: 'wallet.dashboard.revampAnnouncement.dialog.getStartedBtn',
      defaultMessage: '!!!get started',
    },
});

@observer
export default class RevampSwitchDialog extends Component {
    static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
        intl: intlShape.isRequired,
    };

    render(): Node {
        const { intl } = this.context;
        const features = [
            messages.feature1,
            messages.feature2,
            messages.feature3,
            messages.feature4,
            messages.feature5,
            messages.feature6,
            messages.feature7,
        ]

        const actions = [
          {
            label: intl.formatMessage(messages.tryItNow),
            onClick: () => {},
            primary: true,
          },
        ];
        return (
          <Dialog
            title={intl.formatMessage(messages.dialogTitle)}
            closeOnOverlayClick={false}
            closeButton={<DialogCloseButton />}
            onClose={this.props.onClose}
            actions={actions}
            className={styles.dialog}
          >
            <RevampAnnouncement />
            <Typography fontWeight='500' fontSize='16px' lineHeight='24px' color='var(--yoroi-palette-gray-900)' marginBottom='16px' marginTop='24px'>
              {intl.formatMessage(messages.header)}
            </Typography>
            <List disablePadding>
              {features.map((message) => (
                <ListItem
                  disablePadding
                  sx={{
                    display: 'list-item',
                    listStyle: 'inside',
                    fontWeight: '400',
                    fontSize: '16px',
                    lineHeight: '24px',
                    color: 'var(--yoroi-palette-gray-900)'
                  }}
                >
                  {intl.formatMessage(message)}
                </ListItem>
                ))}
            </List>

            <Typography fontWeight='500' fontSize='16px' lineHeight='24px' color='var(--yoroi-palette-gray-900)' marginTop='16px'>
              {intl.formatMessage(messages.footer)}
            </Typography>
          </Dialog>
        )
    }
}