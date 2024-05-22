// @flow
import type { ComponentType, Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { WalletType } from './types';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as AppStoreBadge } from '../../../assets/images/app-store-badge.inline.svg';
import { ReactComponent as PlayStoreBadge } from '../../../assets/images/google-play-badge.inline.svg';
import { ReactComponent as ExclamationIcon } from '../../../assets/images/revamp/icons/exclamation-circle.inline.svg';
import { ReactComponent as CrossIcon } from '../../../assets/images/revamp/icons/cross.inline.svg';
import { withLayout } from '../../../styles/context/layout';
import Step1Image from '../../../assets/images/revamp/catalyst-step1.inline.svg';
import Step2Image from '../../../assets/images/revamp/catalyst-step2.inline.svg';
import TrezorStepImage from '../../../assets/images/pic-catalyst-step3-trezor.inline.svg';
import LedgerStepImage from '../../../assets/images/pic-catalyst-step3-ledger.inline.svg';
import classnames from 'classnames';
import globalMessages from '../../../i18n/global-messages';
import WarningBox from '../../widgets/WarningBox';
import Card from '../../common/card/Card';
import styles from './Voting.scss';

const messages = defineMessages({
  lineTitle: {
    id: 'wallet.voting.lineTitle',
    defaultMessage: '!!!Register to vote on {fundName}',
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
    defaultMessage:
      '!!!Open the Catalyst Voting App and click on the Complete registration button.',
  },
  notDelegated: {
    id: 'wallet.voting.notDelegated',
    defaultMessage:
      "!!!You haven't delegated anything. Your voting power is determined by the amount you delegate and voting rewards are distributed to your delegation reward address. Please remember to delegate prior to voting.",
  },
  keepDelegated: {
    id: 'wallet.voting.keepDelegated',
    defaultMessage:
      '!!!Your voting power is how much you delegate and the voting rewards will be distributed to your delegation reward address. Please keep delegated until the voting ends.',
  },
  trezorTRequirement: {
    id: 'wallet.voting.trezorTRequirement',
    defaultMessage:
      '!!!<a target="_blank" rel="noopener noreferrer" href="https://wiki.trezor.io/User_manual:Updating_the_Trezor_device_firmware">Update</a> your Trezor Model T firmware version to 2.4.1 or above.',
  },
  ledgerNanoRequirement: {
    id: 'wallet.voting.ledgerNanoRequirement',
    defaultMessage:
      '!!!<a target="_blank" rel="noopener noreferrer" href="https://emurgo.github.io/yoroi-extension-ledger-connect-vnext/catalyst/update-ledger-app/">Update</a> the Cardano app on your Ledger to version 6 or above with <a target="_blank" rel="noopener noreferrer" href="https://www.ledger.com/ledger-live"> Ledger Live</a>.',
  },
});

type Props = {|
  +start: void => void,
  +onExternalLinkClick: MouseEvent => void,
  +hasAnyPending: boolean,
  +isDelegated: boolean,
  +name: string,
  +walletType: WalletType,
|};

type InjectedProps = {|
  +isRevampLayout: boolean,
|};

type State = {|
  +showDisclamer: boolean,
|};

@observer
class Voting extends Component<Props & InjectedProps, State> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  state = {
    showDisclamer: true,
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

  renderRevampLayout() {
    const { intl } = this.context;
    const { walletType } = this.props;
    const { showDisclamer } = this.state;
    const pendingTxWarningComponent = this.props.hasAnyPending ? (
      <div className={styles.warningBox}>
        <WarningBox>{this.context.intl.formatMessage(globalMessages.sendingIsDisabled)}</WarningBox>
      </div>
    ) : null;
    return (
      <>
        {pendingTxWarningComponent}

        <Box sx={{ maxWidth: '612px', mx: 'auto' }} className={styles.voting}>
          <Typography component="div" variant="h3" fontWeight={500}>
            {intl.formatMessage(messages.lineTitle, { fundName: 'Catalyst' })}
          </Typography>

          <Typography component="div" variant="body1" color="grayscale.800" mt="16px" mb="24px">
            {intl.formatMessage(messages.line2)}
          </Typography>

          {showDisclamer && (
            <Box
              sx={{
                background: 'linear-gradient(269.97deg, #E4E8F7 0%, #C6F7ED 100%)',
                borderRadius: '8px',
                px: '16px',
                py: '12px',
              }}
            >
              <Box mb="8px" sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div>
                  <ExclamationIcon />
                </div>
                <Box sx={{ flexGrow: '1' }}>
                  <Typography component="div" variant="body1" fontWeight={500} color="grayscale.900">
                    Disclamer
                  </Typography>
                </Box>
                <Box
                  sx={{ cursor: 'pointer' }}
                  onClick={() => this.setState({ showDisclamer: false })}
                >
                  <CrossIcon />
                </Box>
              </Box>
              <Typography component="div" variant="body1" color="grayscale.900">
                {intl.formatMessage(
                  this.props.isDelegated ? messages.keepDelegated : messages.notDelegated
                )}
              </Typography>
            </Box>
          )}

          <div className={styles.cardContainer}>
            <Card
              style={{ minHeight: '364px' }}
              label="Step 1"
              imageSrc={Step1Image}
              description={intl.formatMessage(messages.line3)}
            >
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
            </Card>
            <Card
              style={{ minHeight: '364px' }}
              label="Step 2"
              imageSrc={Step2Image}
              description={intl.formatMessage(messages.line4)}
            />
            {(walletType === 'trezorT' || walletType === 'ledgerNano') && (
              <Card
                style={{ minHeight: '364px' }}
                label="Step 3"
                imageSrc={walletType === 'ledgerNano' ? LedgerStepImage : TrezorStepImage}
                description={
                  <FormattedHTMLMessage
                    {...(walletType === 'ledgerNano'
                      ? messages.ledgerNanoRequirement
                      : messages.trezorTRequirement)}
                  />
                }
              />
            )}
          </div>
          <div className={styles.registerButton}>
            <Button
              variant="primary"
              sx={{ px: '20px !important' }}
              onClick={this.props.start}
              disabled={this.props.hasAnyPending}
            >
              {intl.formatMessage(globalMessages.registerLabel)}
            </Button>
          </div>
        </Box>
      </>
    );
  }

  renderLayout() {
    const { intl } = this.context;
    const fundName = this.props.name;
    const pendingTxWarningComponent = this.props.hasAnyPending ? (
      <div className={styles.warningBox}>
        <WarningBox>{this.context.intl.formatMessage(globalMessages.sendingIsDisabled)}</WarningBox>
      </div>
    ) : null;
    return (
      <>
        {pendingTxWarningComponent}

        <div className={styles.voting}>
          <div className={styles.delegationStatus}>
            {this.props.isDelegated ? (
              <div className={styles.lineText}>{intl.formatMessage(messages.keepDelegated)}</div>
            ) : (
              <div className={styles.warningBox}>
                <WarningBox>{intl.formatMessage(messages.notDelegated)}</WarningBox>
              </div>
            )}
          </div>

          <div className={classnames([styles.lineTitle, styles.firstItem])}>
            {intl.formatMessage(messages.lineTitle, { fundName })}
          </div>

          <div className={styles.lineText}>{intl.formatMessage(messages.line2)}</div>

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
              variant="primary"
              onClick={this.props.start}
              disabled={this.props.hasAnyPending}
              sx={{ width: '400px' }}
            >
              {intl.formatMessage(globalMessages.registerLabel)}
            </Button>
          </div>
        </div>
      </>
    );
  }

  render(): Node {
    return this.props.isRevampLayout ? this.renderRevampLayout() : this.renderLayout();
  }
}

export default (withLayout(Voting): ComponentType<Props>);
