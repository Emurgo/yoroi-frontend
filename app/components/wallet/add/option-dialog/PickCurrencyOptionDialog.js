// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
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
});

type Props = {|
  +onCancel: void => void,
  +onCardano: void => void,
  +onExternalLinkClick: MouseEvent => void,
|};

@observer
export default class PickCurrencyOptionDialog extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { onCancel, onCardano, } = this.props;

    return (
      <Dialog
        title={intl.formatMessage(messages.dialogTitle)}
        closeOnOverlayClick={false}
        onClose={onCancel}
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
              onSubmit={onCardano}
            />
          </ul>
        </div>
      </Dialog>
    );
  }
}
