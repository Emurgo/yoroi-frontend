// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import { observer } from 'mobx-react';
import Dialog from '../../../widgets/Dialog';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

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
    featrue4: {
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
    }
});

@observer
export default class RevampSwitchDialog extends Component {
    static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
        intl: intlShape.isRequired,
    };

    render(): Node {
        const { intl } = this.context;

        return (
          <Dialog
            title={intl.formatMessage(messages.dialogTitle)}
            closeOnOverlayClick={false}
            closeButton={<DialogCloseButton />}
            onClose={this.props.close}
          >
            <head>Hello, world</head>
          </Dialog>
        )
    }
}