// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import SVGInline from 'react-svg-inline';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import styles from './AdaRedemptionSuccessOverlay.scss';
import successIcon from '../../../assets/images/success-big.inline.svg';
import closeCrossWhite from '../../../assets/images/close-cross-white.inline.svg';

const messages = defineMessages({
  headline: {
    id: 'wallet.redeem.success.overlay.headline',
    defaultMessage: '!!!You have successfully redeemed',
  },
  confirmButton: {
    id: 'wallet.redeem.success.overlay.confirmButton',
    defaultMessage: '!!!Great',
  },
});

type Props = {|
  amount: string,
  onClose: Function,
  classicTheme: boolean,
|};

@observer
export default class AdaRedemptionSuccessOverlay extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const { amount, onClose } = this.props;

    return (
      <div className={styles.component}>
        <SVGInline svg={successIcon} className={styles.icon} />
        <div className={styles.text}>
          <h1 className={styles.headline}>{intl.formatMessage(messages.headline)}</h1>
          <div className={styles.amount}>{amount} ADA</div>
          <Button
            className={styles.confirmButton}
            label={intl.formatMessage(messages.confirmButton)}
            onClick={onClose}
            skin={ButtonSkin}
          />
        </div>
        <DialogCloseButton onClose={onClose} icon={closeCrossWhite} />
      </div>
    );
  }

}
