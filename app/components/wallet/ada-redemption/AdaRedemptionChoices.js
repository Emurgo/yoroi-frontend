// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import styles from './AdaRedemptionChoices.scss';
import { ADA_REDEMPTION_TYPES } from '../../../types/redemptionTypes';
import type { RedemptionTypeChoices } from '../../../types/redemptionTypes';

const messages = defineMessages({
  regularTabTitle: {
    id: 'wallet.redeem.choices.tab.title.regularVended',
    defaultMessage: '!!!Regular',
    description: 'Tab title "Regular" on Ada redemption page.'
  },
  forceVendedTabTitle: {
    id: 'wallet.redeem.choices.tab.title.forceVended',
    defaultMessage: '!!!Force vended',
    description: 'Tab title "Force vended" on Ada redemption page.'
  },
  paperVendedTabTitle: {
    id: 'wallet.redeem.choices.tab.title.paperVended',
    defaultMessage: '!!!Paper vended',
    description: 'Tab title "Paper vended" on Ada redemption page.'
  },
  recoveryRegularTabTitle: {
    id: 'wallet.redeem.choices.tab.title.recoveryRegular',
    defaultMessage: '!!!Recovery - regular',
    description: 'Tab title "Recovery - regular" on Ada redemption page.'
  },
  recoveryForceVendedTabTitle: {
    id: 'wallet.redeem.choices.tab.title.recoveryForceVended',
    defaultMessage: '!!!Recovery - force vended',
    description: 'Tab title "Recovery - force vended" on Ada redemption page.'
  },
});

type Props = {
  activeChoice: RedemptionTypeChoices,
  onSelectChoice: Function,
};

@observer
export default class AdaRedemptionChoices extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  renderChoiceButton(adaRedemptionType, index) {
    const { intl } = this.context;
    const { activeChoice, onSelectChoice } = this.props;
    return (
      <button
        key={index}
        className={activeChoice === adaRedemptionType ? styles.activeButton : ''}
        onClick={() => onSelectChoice(adaRedemptionType)}
      >
        {intl.formatMessage(messages[adaRedemptionType + 'TabTitle'])}
      </button>
    );
  }

  render() {
    return (
      <div className={styles.component}>
        {
          Object.values(ADA_REDEMPTION_TYPES).map(this.renderChoiceButton.bind(this))
        }
      </div>
    );
  }

}
