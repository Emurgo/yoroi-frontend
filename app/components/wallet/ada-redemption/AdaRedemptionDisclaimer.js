// @flow
import React, { Component } from 'react';
import SVGInline from 'react-svg-inline';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import { Button } from 'react-polymorph/lib/components/Button';
import { Checkbox } from 'react-polymorph/lib/components/Checkbox';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { CheckboxSkin } from 'react-polymorph/lib/skins/simple/CheckboxSkin';
import attentionIcon from '../../../assets/images/attention-big-light.inline.svg';
import styles from './AdaRedemptionDisclaimer.scss';
import globalMessages from '../../../i18n/global-messages';

const messages = defineMessages({
  disclaimerTitle: {
    id: 'wallet.redeem.disclaimerOverlay.title',
    defaultMessage: '!!!Daedalus Redemption Disclamer',
  },
  disclaimerText: {
    id: 'wallet.redeem.disclaimerOverlay.disclaimerText',
    defaultMessage: '!!!ATTENTION: Redeeming on the Cardano testnet will validate that your certificate or redemption key is correct and will allow you to redeem TEST-ADA for testing purposes only. KEEP your certificate or redemption key safe and secure. You will need to redeem on the mainnet. TEST-ADA holds no value.',
  },
  checkboxLabel: {
    id: 'wallet.redeem.disclaimerOverlay.checkboxLabel',
    defaultMessage: '!!!I’ve understood the information above',
  },
});

type Props = {|
  onSubmit: Function,
  classicTheme: boolean,
|};

type State = {
  isAccepted: boolean,
};

@observer
export default class AdaRedemptionDisclaimer extends Component<Props, State> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  state = {
    isAccepted: false,
  };

  onAcceptToggle = (value: boolean) => {
    this.setState({ isAccepted: value });
  };

  render() {
    const { intl } = this.context;
    const { onSubmit } = this.props;
    const { isAccepted } = this.state;

    return (
      <div className={styles.component}>

        <SVGInline svg={attentionIcon} className={styles.icon} />

        <h1>{intl.formatMessage(messages.disclaimerTitle)}</h1>

        <p>{intl.formatMessage(messages.disclaimerText)}</p>

        <div className={styles.adaRedemptionDisclaimerCheckbox}>
          <Checkbox
            label={intl.formatMessage(messages.checkboxLabel)}
            onChange={this.onAcceptToggle}
            checked={isAccepted}
            skin={CheckboxSkin}
          />
        </div>

        <Button
          className="disclaimer"
          label={intl.formatMessage(globalMessages.continue)}
          onClick={() => isAccepted && onSubmit()}
          disabled={!isAccepted}
          skin={ButtonSkin}
        />

      </div>
    );
  }
}
