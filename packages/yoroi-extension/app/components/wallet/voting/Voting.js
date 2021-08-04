// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import AppStoreBadge from '../../../assets/images/app-store-badge.inline.svg';
import PlayStoreBadge from '../../../assets/images/google-play-badge.inline.svg';
import WarningBox from '../../widgets/WarningBox';

import styles from './Voting.scss';
import type { WalletType } from './types';

const messages = defineMessages({
  lineTitle: {
    id: 'wallet.voting.lineTitle',
    defaultMessage: '!!!Register to vote on Fund {round}',
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
  notDelegated: {
    id: 'wallet.voting.notDelegated',
    defaultMessage: '!!!You have not delegated. Your voting power is how much you delegate and the voting rewards will be distributed to your delegation reward address. Please make sure to delegate before voting.',
  },
  keepDelegated: {
    id: 'wallet.voting.keepDelegated',
    defaultMessage: '!!!Your voting power is how much you delegate and the voting rewards will be distributed to your delegation reward address. Please keep delegated until the voting ends.',
  },
  trezorTRequirement: {
    id: 'wallet.voting.trezorTRequirement',
    defaultMessage: '!!!<a target="_blank" rel="noopener noreferrer" href="https://wiki.trezor.io/User_manual:Updating_the_Trezor_device_firmware">Update</a> your Trezor Model T firmware version to 2.4.1 or above.',
  },
  ledgerNanoRequirement: {
    id: 'wallet.voting.ledgerNanoRequirement',
    defaultMessage: '!!!<a target="_blank" rel="noopener noreferrer" href="https://emurgo.github.io/yoroi-extension-ledger-connect-vnext/catalyst/update-ledger-app/">Update</a>the Cardano app on your Ledger to version 2.3.2 or above with <a target="_blank" rel="noopener noreferrer" href="https://www.ledger.com/ledger-live"> Ledger Live</a>.',
  },
});

type Props = {|
  +start: void => void,
  +onExternalLinkClick: MouseEvent => void,
  +hasAnyPending: boolean,
  +isDelegated: boolean,
  +round: number,
  +walletType: WalletType,
|};

@observer
export default class Voting extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  renderStep3(): Node {
    const { walletType } = this.props;

    if (walletType === 'mnemonic') {
      return null;
    }
    if (walletType === 'trezorT') {
      return (
        <div className={classnames([styles.card, styles.bgStep3TrezorT])}>
          <div className={styles.number}>
            <span>3</span>
          </div>
          <div className={classnames([styles.lineText, styles.step2Text])}>
            <FormattedHTMLMessage {...messages.trezorTRequirement} />
          </div>
        </div>
      );
    }
    if (walletType === 'ledgerNano') {
      return (
        <div className={classnames([styles.card, styles.bgStep3LedgerNano])}>
          <div className={styles.number}>
            <span>3</span>
          </div>
          <div className={classnames([styles.lineText, styles.step2Text])}>
            <FormattedHTMLMessage {...messages.ledgerNanoRequirement} />
          </div>
        </div>
      );
    }
    throw new Error(`${nameof(Voting)} impossible wallet type`);
  }

  render(): Node {
    const { intl } = this.context;

    const round = this.props.round;

    const pendingTxWarningComponent = this.props.hasAnyPending
      ? (
        <div className={styles.warningBox}>
          <WarningBox>
            {this.context.intl.formatMessage(globalMessages.sendingIsDisabled)}
          </WarningBox>
        </div>
      )
      : (null);

    const buttonClasses = classnames([
      'primary',
    ]);

    return (
      <>
        {pendingTxWarningComponent}

        <div className={styles.voting}>
          <div className={styles.delegationStatus}>
            {this.props.isDelegated ?
              (
                <div className={styles.lineText}>
                  {intl.formatMessage(messages.keepDelegated)}
                </div>
              ) :
              (
                <div className={styles.warningBox}>
                  <WarningBox>
                    {intl.formatMessage(messages.notDelegated)}
                  </WarningBox>
                </div>
              )
            }
          </div>

          <div className={classnames([styles.lineTitle, styles.firstItem])}>
            {intl.formatMessage(messages.lineTitle, { round })}
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
            {this.renderStep3()}
          </div>
          <div className={styles.registerButton}>
            <Button
              className={buttonClasses}
              label={intl.formatMessage(globalMessages.registerLabel)}
              onMouseUp={this.props.start}
              skin={ButtonSkin}
              disabled={this.props.hasAnyPending}
            />
          </div>
        </div>
      </>
    );
  }
}
