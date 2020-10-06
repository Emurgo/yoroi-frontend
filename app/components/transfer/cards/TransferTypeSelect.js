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
  +onShelley: void => void,
  +ticker: string,
|};

const messages = defineMessages({
  instruction: {
    id: 'wallet.transfer.instruction',
    defaultMessage: '!!!Any {ticker} claimed will be transferred to your currently selected wallet',
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
            onShelley={this.props.onShelley}
          />
          <div className={styles.instructions}>
            {intl.formatMessage(
              messages.instruction,
              { ticker: this.props.ticker }
            )}
          </div>
        </div>
      </div>
    );
  }
}
