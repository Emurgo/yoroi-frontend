// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { Checkbox } from 'react-polymorph/lib/components/Checkbox';
import { CheckboxSkin } from 'react-polymorph/lib/skins/simple/CheckboxSkin';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import styles from './NightlyForm.scss';
import globalMessages from '../../../i18n/global-messages';
import NightlyIcon from '../../../assets/images/yoroi-nightly-icon.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  header: {
    id: 'profile.nightly.header',
    defaultMessage: '!!!<strong>Yoroi Nightly automatically updates nightly</strong> with the latest in-progress features. Although we will never intentionally push bugs or broken code, features may still be in-progress or contain errors.',
  },
  warningHeader: {
    id: 'profile.nightly.warningHeader',
    defaultMessage: '!!!In order to simulate a production environment:',
  },
  warning1: {
    id: 'profile.nightly.warning1',
    defaultMessage: '!!!Yoroi Nightly does NOT operate on a mock blockchain or test server.',
  },
  warning2: {
    id: 'profile.nightly.warning2',
    defaultMessage: '!!!Any transactions you send will be visible on-chain and in production servers.',
  },
  recommendationHeader: {
    id: 'profile.nightly.recommendationHeader',
    defaultMessage: '!!!We recommend that:',
  },
  recommendation1: {
    id: 'profile.nightly.recommendation1',
    defaultMessage: '!!!You only use wallets with a small amount of ADA to minimize risk.',
  },
  recommendation2: {
    id: 'profile.nightly.recommendation2',
    defaultMessage: '!!!You report any issues to EMURGO through the Yoroi Nightly channel.',
  },
  acknowledgedRisks: {
    id: 'profile.nightly.acknowledgedRisks',
    defaultMessage: '!!!I Understand the risk',
  },
});

type Props = {|
  +onSubmit: void => PossiblyAsync<void>,
|};

type State = {|
  acknowledgedRisks: boolean,
|};

@observer
export default class NightlyForm extends Component<Props, State> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    acknowledgedRisks: false,
  };

  toggleAcceptance(): void {
    this.setState(prevState => ({ acknowledgedRisks: !prevState.acknowledgedRisks }));
  }

  render(): Node {
    const { intl } = this.context;

    return (
      <div className={styles.component}>
        <div className={styles.centeredBox}>
          <div className={styles.logo}>
            <NightlyIcon />
          </div>
          <div className={styles.content}>
            <FormattedHTMLMessage {...messages.header} />
            <br /><br />
            <div className={styles.header}>
              {intl.formatMessage(messages.warningHeader)}
            </div>
            <ul>
              <li>
                {intl.formatMessage(messages.warning1)}
              </li>
              <li>
                {intl.formatMessage(messages.warning2)}
              </li>
            </ul>
            <br />
            <div className={styles.header}>
              {intl.formatMessage(messages.recommendationHeader)}
            </div>
            <ul>
              <li>
                {intl.formatMessage(messages.recommendation1)}
              </li>
              <li>
                {intl.formatMessage(messages.recommendation2)}
              </li>
            </ul>
          </div>
          <div className={styles.checkbox}>
            <Checkbox
              label={intl.formatMessage(messages.acknowledgedRisks)}
              onChange={this.toggleAcceptance.bind(this)}
              checked={this.state.acknowledgedRisks}
              skin={CheckboxSkin}
            />
          </div>
          <Button
            className={classnames(['primary', styles.button])}
            label={intl.formatMessage(globalMessages.continue)}
            onMouseUp={this.props.onSubmit}
            skin={ButtonSkin}
            disabled={!this.state.acknowledgedRisks}
          />
        </div>
      </div>
    );
  }

}
