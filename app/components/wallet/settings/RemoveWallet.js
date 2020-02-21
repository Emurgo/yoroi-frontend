// @flow
import React, { Component } from 'react';
import classNames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import styles from './RemoveWallet.scss';
import dangerousButtonStyles from '../../../themes/overrides/DangerousButton.scss';
import { observer } from 'mobx-react';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';

export const messages = defineMessages({
  titleLabel: {
    id: 'wallet.settings.remove.label',
    defaultMessage: '!!!Remove wallet',
  },
  removeExplanation: {
    id: 'wallet.settings.remove.explanation',
    defaultMessage: '!!!Removing a wallet does not affect the wallet balance. Your wallet can be restored again at any time.',
  },
});

type Props = {|
  +walletName: string,
  +openDialog: void => void,
|};

@observer
export default class RemoveWallet extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;

    const buttonClassNames = classNames([
      'primary',
      styles.submitButton,
      'removeWallet' // classname for UI tests
    ]);
    return (
      <div className={styles.component}>
        <h2>{intl.formatMessage(messages.titleLabel)}</h2>

        <p>
          {intl.formatMessage(messages.removeExplanation)}
        </p>

        <Button
          themeOverrides={dangerousButtonStyles}
          className={buttonClassNames}
          label={`${this.context.intl.formatMessage(globalMessages.remove)} ${this.props.walletName}`}
          skin={ButtonSkin}
          onClick={this.props.openDialog}
        />
      </div>
    );
  }
}
