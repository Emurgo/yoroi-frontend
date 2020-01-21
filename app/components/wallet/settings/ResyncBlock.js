// @flow
import React, { Component } from 'react';
import classNames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import styles from './ResyncBlock.scss';
import { observer } from 'mobx-react';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';

const messages = defineMessages({
  titleLabel: {
    id: 'wallet.settings.resync.label',
    defaultMessage: '!!!Resync wallet with the blockchain',
  },
  resyncExplanation: {
    id: 'wallet.settings.resync.explanation',
    defaultMessage: '!!!If you are experiencing issues with your wallet, or think you have an incorrect balance or transaction history, you can delete the local data stored by Yoroi and resync with the blockchain.',
  },
  resyncButtonlabel: {
    id: 'wallet.settings.resync.buttonLabel',
    defaultMessage: '!!!Resync wallet',
  },
});

type Props = {|
  isSubmitting: boolean,
  onResync: void => PossiblyAsync<void>,
|};

@observer
export default class ResyncBlock extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;

    const buttonClassNames = classNames([
      'primary',
      this.props.isSubmitting ? styles.submitButtonSpinning : styles.submitButton,
      'resyncButton' // classname for UI tests
    ]);
    return (
      <div className={styles.component}>
        <h2>{intl.formatMessage(messages.titleLabel)}</h2>

        <p>
          {intl.formatMessage(messages.resyncExplanation)}
        </p>

        <Button
          className={buttonClassNames}
          label={this.context.intl.formatMessage(messages.resyncButtonlabel)}
          skin={ButtonSkin}
          onClick={this.props.onResync}
          disabled={this.props.isSubmitting}
        />
      </div>
    );
  }


}
