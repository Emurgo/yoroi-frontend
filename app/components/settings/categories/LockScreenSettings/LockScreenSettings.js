// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import SvgInline from 'react-svg-inline';
import moment from 'moment';

import SetLockCodeDialog from './SetLockCodeDialog';

import { defineMessages, intlShape } from 'react-intl';
import LocalizableError from '../../../../i18n/LocalizableError';
import styles from './LockScreenSettings.scss';

import iconDisabled from '../../../../assets/images/lockscreen-disabled.inline.svg';
import iconEnabled from '../../../../assets/images/lockscreen-enabled.inline.svg';

const messages = defineMessages({
  checkboxEnableLabel: {
    id: 'settings.lock.enable.label',
    defaultMessage: '!!!Enable lock screen',
    description: 'Label for the lock enabling checkbox.'
  },
  checkboxDisableLabel: {
    id: 'settings.lock.disable.label',
    defaultMessage: '!!!Disable lock screen',
    description: 'Label for the lock disabling checkbox.'
  },
  submitLabel: {
    id: 'settings.lock.submit',
    defaultMessage: '!!!Submit',
    description: 'Label for submit pin code button',
  },
  bottomTitle: {
    id: 'lock-screen.pin.label',
    defaultMessage: '!!!PIN code',
    description: 'Title for bottom section',
  },
  updated: {
    id: 'wallet.settings.passwordLastUpdated',
    defaultMessage: '!!!Last updated',
    description: 'Last updated X time ago message.',
  },
  dialogSetTitle: {
    id: 'settings.lock.set',
    defaultMessage: '!!!Set pin code',
    description: 'Title for setting pin code dialog',
  },
  dialogChangeTitle: {
    id: 'settings.lock.change',
    defaultMessage: '!!!Change pin code',
    description: 'Title for changing pin code dialog',
  },
});

type Props = {
  toggleLockScreen: Function,
  submit: Function,
  isEnabled: boolean,
  pin: string,
  updated: string,
  error?: ?LocalizableError,
};

type State = {
  changingCodeIsOpen: boolean,
}

@observer
export default class LockScreenSettings extends Component<Props, State> {
  static defaultProps = {
    error: undefined
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  state = {
    changingCodeIsOpen: false,
  }

  toggleChangeDialog = () => {
    const { changingCodeIsOpen } = this.state;
    this.setState({ changingCodeIsOpen: !changingCodeIsOpen });
  }

  handleChangeSubmit = (data: string) => {
    this.props.submit(data);
    this.toggleChangeDialog();
  }

  render() {
    const {
      toggleLockScreen,
      submit,
      isEnabled,
      error,
      pin,
      updated,
    } = this.props;
    const { changingCodeIsOpen } = this.state;
    const { intl } = this.context;

    const componentClassNames = classNames([styles.container, 'general']);

    const lastUpdated = updated ? (
      intl.formatMessage(messages.updated, {
        lastUpdated: moment(Number(updated)).fromNow(),
      })
    ) : '';

    const dialogTitle = changingCodeIsOpen ? messages.dialogChangeTitle : messages.dialogSetTitle;
    const checkboxLabel = isEnabled ? messages.checkboxDisableLabel : messages.checkboxEnableLabel;

    return (
      <div className={componentClassNames}>
        <div className={`${styles.enabling} ${styles.row}`}>
          <button type="button" className={styles.checkbox} onClick={toggleLockScreen}>
            <SvgInline svg={isEnabled ? iconEnabled : iconDisabled} cleanup={['title']} />
          </button>
          <span className={styles.title}>{intl.formatMessage(checkboxLabel)}</span>
        </div>
        <div className={styles.bottom}>
          {(!pin || !isEnabled) && <div className={styles.overlay} />}
          <div className={styles.title}>{intl.formatMessage(messages.bottomTitle)}</div>
          <div className={styles.timeBox}>
            {lastUpdated}
            <button type="button" className={styles.change} onClick={this.toggleChangeDialog}>Change</button>
          </div>
        </div>

        {(changingCodeIsOpen || (!pin && isEnabled)) && (
          <SetLockCodeDialog
            close={changingCodeIsOpen ? this.toggleChangeDialog : toggleLockScreen}
            title={intl.formatMessage(dialogTitle)}
            requestCurrent={changingCodeIsOpen}
            pin={pin}
            submit={changingCodeIsOpen ? this.handleChangeSubmit : submit}
          />
        )}

        {error && <p className={styles.error}>{error}</p>}

      </div>
    );
  }
}
