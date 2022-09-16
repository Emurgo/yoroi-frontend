// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import globalMessages from '../../../../i18n/global-messages';
import Dialog from '../../../widgets/Dialog';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import OptionBlock from '../../../widgets/options/OptionBlock';
import environment from '../../../../environment';

import styles from '../../../widgets/options/OptionListWrapperStyle.scss';

const messages = defineMessages({
  dialogTitle: {
    id: 'wallet.currency.pick.header',
    defaultMessage: '!!!Pick a currency or platform',
  },
  cardanoDescription: {
    id: 'wallet.currency.pick.cardano',
    defaultMessage: '!!!Cardano is the first provably secure proof of stake protocol',
  },
  testnetDescription: {
    id: 'wallet.currency.pick.testnetDescription',
    defaultMessage: '!!!Testnet are alternative chain to be used for testing. This allows application developers or testers to experiment, without having to use real coins.',
  },
  ergoDescription: {
    id: 'wallet.currency.pick.ergo',
    defaultMessage: '!!!Ergo builds advanced cryptographic features and radically new DeFi functionality on the rock-solid foundations laid by a decade of blockchain theory and development',
  },
});

type Props = {|
  +onCancel: void => void,
  +onCardano: void => void,
  +onCardanoTestnet: void => void,
  +onCardanoPreprodTestnet: void => void,
  +onErgo: void | (void => void),
  +onAlonzoTestnet: void => void,
  +onExternalLinkClick: MouseEvent => void,
|};

@observer
export default class PickCurrencyOptionDialog extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <Dialog
        title={intl.formatMessage(messages.dialogTitle)}
        closeOnOverlayClick={false}
        onClose={this.props.onCancel}
        closeButton={<DialogCloseButton />}
        className="PickCurrencyOptionDialog"
      >
        <div className={styles.component}>
          <ul className={styles.optionBlockList}>
            <OptionBlock
              parentName="PickCurrencyOptionDialog"
              type="cardano"
              title="Cardano"
              learnMoreText={
                <>
                  {intl.formatMessage(messages.cardanoDescription)}<br />
                  <a
                    href="https://cardano.org"
                    onClick={event => this.props.onExternalLinkClick(event)}
                  >
                    {intl.formatMessage(globalMessages.learnMore)}
                  </a>
                </>}
              onSubmit={this.props.onCardano}
            />
            {(!environment.isProduction() || environment.isNightly() || environment.isTest()) &&
              <>
                <OptionBlock
                  parentName="PickCurrencyOptionDialog"
                  type="cardanoTestnet"
                  title="Cardano Preprod Testnet"
                  onSubmit={this.props.onCardanoPreprodTestnet}
                  learnMoreText={
                    <>
                      {intl.formatMessage(messages.testnetDescription)}<br />
                      <a
                        href="https://testnets.cardano.org/"
                        onClick={event => this.props.onExternalLinkClick(event)}
                      >
                        {intl.formatMessage(globalMessages.learnMore)}
                      </a>
                    </>}
                />
                <OptionBlock
                  parentName="PickCurrencyOptionDialog"
                  type="cardanoTestnet"
                  title="Cardano Legacy Testnet"
                  onSubmit={this.props.onCardanoTestnet}
                  learnMoreText={
                    <>
                      {intl.formatMessage(messages.testnetDescription)}<br />
                      <a
                        href="https://testnets.cardano.org/"
                        onClick={event => this.props.onExternalLinkClick(event)}
                      >
                        {intl.formatMessage(globalMessages.learnMore)}
                      </a>
                    </>}
                />
              </>
            }
            {(!environment.isProduction() || environment.isNightly() || environment.isTest()) &&
              <OptionBlock
                parentName="PickCurrencyOptionDialog"
                type="alonzoWhiteTestnet"
                title="Alonzo White Testnet"
                onSubmit={this.props.onAlonzoTestnet}
                learnMoreText={
                  <>
                    {intl.formatMessage(messages.testnetDescription)}<br />
                    <a
                      href="https://testnets.cardano.org/"
                      onClick={event => this.props.onExternalLinkClick(event)}
                    >
                      {intl.formatMessage(globalMessages.learnMore)}
                    </a>
                  </>}
              />
            }
            {this.props.onErgo != null &&
              <OptionBlock
                parentName="PickCurrencyOptionDialog"
                type="ergo"
                title="Ergo"
                onSubmit={this.props.onErgo}
                learnMoreText={
                  <>
                    {intl.formatMessage(messages.ergoDescription)}<br />
                    <a
                      href="https://ergoplatform.org/en/"
                      onClick={event => this.props.onExternalLinkClick(event)}
                    >
                      {intl.formatMessage(globalMessages.learnMore)}
                    </a>
                  </>}
              />
            }
          </ul>
        </div>
      </Dialog>
    );
  }
}
