// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { defineMessages, intlShape, } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import TransferCards from './TransferCards';
import styles from './TransferTypeSelect.scss';

type Props = {|
  +onByron: void => void,
  +onShelleyItn: void => void,
|};

const messages = defineMessages({
  instruction: {
    id: 'wallet.transfer.instruction',
    defaultMessage: '!!!Any ADA claimed will be transferred to your currently selected wallet',
  },
});

@observer
export default class TransferTypeSelect extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    return (
      <div className={styles.component}>
        <div className={styles.hero}>
          <TransferCards
            onByron={this.props.onByron}
            onShelleyItn={this.props.onShelleyItn}
          />
          <div className={styles.instructions}>
            {intl.formatMessage(messages.instruction)}
          </div>
        </div>
      </div>
    );
  }
}
