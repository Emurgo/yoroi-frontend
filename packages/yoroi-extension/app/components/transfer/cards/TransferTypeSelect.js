// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { defineMessages, intlShape, } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import TransferCards from './TransferCards';
import styles from './TransferTypeSelect.scss';
import { handleExternalLinkClick } from '../../../utils/routing';

type Props = {|
  +onByron: void => void,
  +ticker: string,
|};

const messages = defineMessages({
  instruction: {
    id: 'wallet.transfer.instruction',
    defaultMessage: '!!!Any {ticker} claimed will be transferred to your currently selected wallet',
  },
  subInstruction: {
    id: 'wallet.transfer.subInstruction',
    defaultMessage: '!!!Learn more about Byron and Shelley eras and how to claim ADA on our',
  }
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
          <div className={styles.instructions}>
            <div className={styles.headerText}>
              {intl.formatMessage(
                messages.instruction,
                { ticker: this.props.ticker }
              )}
            </div>
            <span>
              {intl.formatMessage(
                messages.subInstruction,
                { ticker: this.props.ticker }
              )}
              <a onClick={event => handleExternalLinkClick(event)} href="https://yoroi-wallet.com/#/faq/1"> FAQ</a>
            </span>
          </div>
          <TransferCards onByron={this.props.onByron} />
        </div>
      </div>
    );
  }
}
