// @flow
import type { Node } from 'react';
import { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { defineMessages, IntlContext } from 'react-intl';

import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';
import globalMessages from '../../i18n/global-messages';
import { ReactComponent as InvalidURIImg }  from '../../assets/images/uri/invalid-uri.inline.svg';
import RawHash from '../widgets/hashWrappers/RawHash';
import { truncateAddress } from '../../utils/formatters';

import styles from './URIInvalidDialog.scss';
import { Typography } from '@mui/material';

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

  static contextType:any = IntlContext;
  render(): Node {
    const { onClose, onSubmit, address } = this.props;

    const dialogClasses = classnames([
      styles.component,
      'URIInvalidDialog'
    ]);

    const intl = this.context;

    const actions = [
      {
        label: intl.formatMessage(globalMessages.continue),
        onClick: onSubmit,
        primary: true
      }
    ];

    return (
      <Dialog
        dialogActions={actions}
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
                  <Typography variant="body1" fontWeight={500} color="ds.text_gray_medium">
                    {intl.formatMessage(messages.uriInvalidDialogWarningText1)}
                  </Typography>
                  <Typography variant="body2" color="ds.text_gray_low">
                    {intl.formatMessage(messages.uriInvalidDialogWarningText2)}
                  </Typography>
                </>
              )
            }
          </div>
        </div>
      </Dialog>
    );
  }

}
