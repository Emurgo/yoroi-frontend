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
        id: 'revamp.announcement.dialog.title',
        defaultMessage: '!!!new yoroi version is available',
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