// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import AppStoreBadge from '../../../assets/images/app-store-badge.inline.svg';
import PlayStoreBadge from '../../../assets/images/google-play-badge.inline.svg';

import styles from './Voting.scss';

const messages = defineMessages({
  lineTitle: {
    id: 'wallet.voting.lineTitle',
    defaultMessage: '!!!Register to vote on Fund 3',
  },
  line2: {
    id: 'wallet.voting.line2',
    defaultMessage: '!!!Before you begin, make sure to complete steps below',
  },
  line3: {
    id: 'wallet.voting.line3',
    defaultMessage: '!!!Download the Catalyst Voting App.',
  },
  line4: {
    id: 'wallet.voting.line4',
    defaultMessage: '!!!Open the Catalyst Voting App and click on the Complete registration button.',
  },
});

type Props = {|
  +start: void => void,
  +onExternalLinkClick: MouseEvent => void,
|};

@observer
export default class Voting extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;;
    const buttonClasses = classnames([
      'primary',
    ]);

    return (
      <div className={styles.voting}>
        <div className={classnames([styles.lineTitle, styles.firstItem])}>
          {intl.formatMessage(messages.lineTitle)}
        </div>

        <div className={styles.lineText}>
          {intl.formatMessage(messages.line2)}
        </div>

        <div className={styles.cardContainer}>
          <div className={classnames([styles.card, styles.bgStep1])}>
            <div className={styles.number}>
              <span>1</span>
            </div>
            <div>
              <div className={classnames([styles.lineText])}>
                {intl.formatMessage(messages.line3)}
              </div>
              <div className={styles.appBadges}>
                <a
                  href="https://apps.apple.com/kg/app/catalyst-voting/id1517473397"
                  onClick={event => this.props.onExternalLinkClick(event)}
                >
                  <AppStoreBadge />
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=io.iohk.vitvoting"
                  onClick={event => this.props.onExternalLinkClick(event)}
                >
                  <PlayStoreBadge />
                </a>
              </div>
            </div>
          </div>
          <div className={classnames([styles.card, styles.bgStep2])}>
            <div className={styles.number}>
              <span>2</span>
            </div>
            <div className={classnames([styles.lineText, styles.step2Text])}>
              {intl.formatMessage(messages.line4)}
            </div>
          </div>
        </div>
        <div className={styles.registerButton}>
          <Button
            className={buttonClasses}
            label={intl.formatMessage(globalMessages.registerLabel)}
            onMouseUp={this.props.start}
            skin={ButtonSkin}
          />
        </div>
      </div>
    );
  }
}
