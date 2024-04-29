// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import globalMessages from '../../../../i18n/global-messages';
import Dialog from '../../../widgets/Dialog/Dialog';
import DialogCloseButton from '../../../widgets/Dialog/DialogCloseButton';
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
});

type Props = {|
  +onCancel: void => void,
  +onCardano: void => void,
  +onCardanoPreprodTestnet: void => void,
  +onCardanoPreviewTestnet: void => void,
  +onCardanoSanchoTestnet: void => void,
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
              </>
            }
            {(!environment.isProduction() || environment.isNightly() || environment.isTest()) &&
              <>
                <OptionBlock
                  parentName="PickCurrencyOptionDialog"
                  type="cardanoTestnet"
                  title="Cardano Preview Testnet"
                  onSubmit={this.props.onCardanoPreviewTestnet}
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
              <>
                <OptionBlock
                  parentName="PickCurrencyOptionDialog"
                  type="cardanoTestnet"
                  title="Cardano Sancho Testnet"
                  onSubmit={this.props.onCardanoSanchoTestnet}
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
          </ul>
        </div>
      </Dialog>
    );
  }
}
