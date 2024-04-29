// @flow
import type { Node } from 'react';
import { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import Dialog from '../widgets/Dialog/Dialog';
import DialogCloseButton from '../widgets/Dialog/DialogCloseButton';
import globalMessages from '../../i18n/global-messages';
import { ReactComponent as InvalidURIImg }  from '../../assets/images/uri/invalid-uri.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import RawHash from '../widgets/hashWrappers/RawHash';
import { truncateAddress } from '../../utils/formatters';

import styles from './URIInvalidDialog.scss';

const messages = defineMessages({
  uriInvalidTitle: {
    id: 'uri.invalid.dialog.title',
    defaultMessage: '!!!Invalid URL',
  },
  uriInvalidDialogWarningText1: {
    id: 'uri.invalid.dialog.warning.text1',
    defaultMessage: '!!!The link you clicked is invalid.',
  },
  uriInvalidDialogWarningText2: {
    id: 'uri.invalid.dialog.warning.text2',
    defaultMessage: '!!!Please ask the receiver to double-check the format.',
  },
  uriInvalidDialogInvalidAddressText1: {
    id: 'uri.invalid.dialog.warning.invalidAddressText1',
    defaultMessage: `!!!Couldn't find a wallet that supports this address type`,
  },
  uriInvalidDialogInvalidAddressText2: {
    id: 'uri.invalid.dialog.warning.invalidAddressText2',
    defaultMessage: '!!!Please ask the receiver to check the address and make sure you have at least one wallet that supports this address type.',
  },
});

type Props = {|
  +onClose: void => void,
  +onSubmit: void => void,
  +address: null | string,
|};

@observer
export default class URIInvalidDialog extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { onClose, onSubmit, address } = this.props;

    const dialogClasses = classnames([
      styles.component,
      'URIInvalidDialog'
    ]);

    const { intl } = this.context;

    const actions = [
      {
        label: intl.formatMessage(globalMessages.continue),
        onClick: onSubmit,
        primary: true
      }
    ];

    return (
      <Dialog
        actions={actions}
        className={dialogClasses}
        title={intl.formatMessage(messages.uriInvalidTitle)}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={onClose}
      >
        <div>
          <center>
            <span className={styles.invalidURIImg}><InvalidURIImg /></span>
          </center>
          <div className={styles.warningText}>
            {
              address !== null ? (
                <>
                  <div>{intl.formatMessage(messages.uriInvalidDialogInvalidAddressText1)}</div>
                  <br />
                  <div>{intl.formatMessage(messages.uriInvalidDialogInvalidAddressText2)}</div>
                  <br />
                  <RawHash light>
                    <span className={styles.address}>
                      {truncateAddress(address)}
                    </span>
                  </RawHash>
                </>
              ):
              (
                <>
                  <div>{intl.formatMessage(messages.uriInvalidDialogWarningText1)}</div>
                  <br />
                  <div>{intl.formatMessage(messages.uriInvalidDialogWarningText2)}</div>
                </>
              )
            }
          </div>
        </div>
      </Dialog>
    );
  }

}
