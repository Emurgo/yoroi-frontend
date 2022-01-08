// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import styles from './ExportWallet.scss';
import { observer } from 'mobx-react';
import { Button } from '@mui/material';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

export const messages: * = defineMessages({
  titleLabel: {
    id: 'wallet.settings.export.label',
    defaultMessage: '!!!Export wallet',
  },
  exportExplanation: {
    id: 'wallet.settings.export.explanation',
    defaultMessage: '!!!This can be used to transfer a wallet between devices.',
  },
});

type Props = {|
  +openDialog: void => void,
|};

@observer
export default class ExportWallet extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <div className={styles.component}>
        <h2>{intl.formatMessage(messages.titleLabel)}</h2>

        <p>{intl.formatMessage(messages.exportExplanation)}</p>

        <Button
          variant="primary"
          className="exportWallet"
          onClick={this.props.openDialog}
          sx={{ marginTop: '20px', width: '400px' }}
        >
          {`${this.context.intl.formatMessage(globalMessages.exportButtonLabel)}`}
        </Button>
      </div>
    );
  }
}
