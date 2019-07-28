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
  },
  forceVendedTabTitle: {
    id: 'wallet.redeem.choices.tab.title.forceVended',
    defaultMessage: '!!!Force vended',
  },
  paperVendedTabTitle: {
    id: 'wallet.redeem.choices.tab.title.paperVended',
    defaultMessage: '!!!Paper vended',
  },
  recoveryRegularTabTitle: {
    id: 'wallet.redeem.choices.tab.title.recoveryRegular',
    defaultMessage: '!!!Recovery - regular',
  },
  recoveryForceVendedTabTitle: {
    id: 'wallet.redeem.choices.tab.title.recoveryForceVended',
    defaultMessage: '!!!Recovery - force vended',
  },
});

type Props = {|
  activeChoice: RedemptionTypeChoices,
  onSelectChoice: Function,
  classicTheme: boolean,
|};

@observer
export default class AdaRedemptionChoices extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  renderChoiceButton(adaRedemptionType: RedemptionTypeChoices) {
    const { intl } = this.context;
    const { activeChoice, onSelectChoice } = this.props;
    return (
      <button
        type="button"
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
        {this.renderChoiceButton(ADA_REDEMPTION_TYPES.REGULAR)}
        {this.renderChoiceButton(ADA_REDEMPTION_TYPES.FORCE_VENDED)}
        {this.renderChoiceButton(ADA_REDEMPTION_TYPES.PAPER_VENDED)}
        {this.renderChoiceButton(ADA_REDEMPTION_TYPES.RECOVERY_REGULAR)}
        {this.renderChoiceButton(ADA_REDEMPTION_TYPES.RECOVERY_FORCE_VENDED)}
      </div>
    );
  }

}
