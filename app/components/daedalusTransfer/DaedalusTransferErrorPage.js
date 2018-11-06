// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import Button from 'react-polymorph/lib/components/Button';
import SimpleButtonSkin from 'react-polymorph/lib/skins/simple/raw/ButtonSkin';
import { defineMessages, intlShape } from 'react-intl';
import LocalizableError from '../../i18n/LocalizableError';
import styles from './DaedalusTransferErrorPage.scss';

const messages = defineMessages({
  title: {
    id: 'daedalusTransfer.errorPage.title.label',
    defaultMessage: '!!!Unable to restore Daedalus wallet',
    description: 'Label "Unable to restore Daedalus wallet" on the Daedalus transfer error page.'
  },
  backButtonLabel: {
    id: 'daedalusTransfer.errorPage.backButton.label',
    defaultMessage: '!!!Back',
    description: 'Label "Back" on the Daedalus transfer error page.'
  },
});

type Props = {
  error?: ?LocalizableError,
  onCancel: Function
};

@observer
export default class DaedalusTransferErrorPage extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const { error, onCancel } = this.props;
    const backButtonClasses = classnames([
      'flat',
      styles.button,
    ]);

    return (
      <div className={styles.component}>

        <div>
          <div className={styles.body}>

            <div className={styles.title}>
              {intl.formatMessage(messages.title)}
            </div>

            {error && <p className={styles.error}>{intl.formatMessage(error)}</p>}

            <div className={styles.buttonsWrapper}>
              <Button
                className={backButtonClasses}
                label={intl.formatMessage(messages.backButtonLabel)}
                onClick={onCancel}
                skin={<SimpleButtonSkin />}
              />
            </div>

          </div>
        </div>

      </div>
    );
  }
}
