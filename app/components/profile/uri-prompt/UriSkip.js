// @flow
import React, { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { defineMessages, intlShape } from 'react-intl';
import styles from './UriSkip.scss';
import globalMessages from '../../../i18n/global-messages';
import NoTransactionClassicSvg from '../../../assets/images/transaction/no-transactions-yet.classic.inline.svg';
import NoTransactionModernSvg from '../../../assets/images/transaction/no-transactions-yet.modern.inline.svg';


const messages = defineMessages({
  descriptionLine1: {
    id: 'profile.uriSkip.descriptionLine1',
    defaultMessage: '!!!Although you will not be able to use payment URLs, you will still be able to generate them.',
  },
  descriptionLine2: {
    id: 'profile.uriSkip.descriptionLine2',
    defaultMessage: '!!!You can enable this feature any time in the settings menu.',
  },
});

type Props = {|
  +onConfirm: void => PossiblyAsync<void>,
  +onBack: void => void,
  +classicTheme: boolean,
|};

@observer
export default class UriSkip extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const allowButtonClasses = classnames([
      'finishButton',
      'primary',
      styles.submitButton,
    ]);
    const skipButtonClasses = classnames([
      'secondary',
      styles.submitButton,
    ]);

    const noTransactionSvg = this.props.classicTheme
      ? <NoTransactionClassicSvg />
      : <NoTransactionModernSvg />;

    return (
      <div className={styles.component}>
        <div className={styles.centeredBox}>

          <span className={styles.aboutSvg}>
            {noTransactionSvg}
          </span>

          <div className={styles.explanation}>
            {intl.formatMessage(messages.descriptionLine1)}&nbsp;
            {intl.formatMessage(messages.descriptionLine2)}
          </div>

          <div className={styles.buttonsWrapper}>
            <Button
              className={skipButtonClasses}
              label={intl.formatMessage(globalMessages.backButtonLabel)}
              onMouseUp={this.props.onBack}
              skin={ButtonSkin}
            />

            <Button
              className={allowButtonClasses}
              label={intl.formatMessage(globalMessages.confirm)}
              onMouseUp={this.props.onConfirm}
              skin={ButtonSkin}
            />
          </div>
        </div>
      </div>
    );
  }

}
