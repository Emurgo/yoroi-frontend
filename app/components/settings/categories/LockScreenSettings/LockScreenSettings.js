// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import moment from 'moment';

import SetLockCodeDialog from './SetLockCodeDialog';

import { defineMessages, intlShape } from 'react-intl';
import LocalizableError from '../../../../i18n/LocalizableError';
import styles from './LockScreenSettings.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import IconDisabled from '../../../../assets/images/lockscreen-disabled.inline.svg';
import IconEnabled from '../../../../assets/images/lockscreen-enabled.inline.svg';

const messages = defineMessages({
  checkboxEnableLabel: {
    id: 'settings.lock.enable.label',
    defaultMessage: '!!!Enable lock screen',
  },
  checkboxDisableLabel: {
    id: 'settings.lock.disable.label',
    defaultMessage: '!!!Disable lock screen',
  },
  submitLabel: {
    id: 'settings.lock.submit',
    defaultMessage: '!!!Submit',
  },
  bottomTitle: {
    id: 'lock-screen.pin.label',
    defaultMessage: '!!!PIN code',
  },
  updated: {
    id: 'wallet.settings.passwordLastUpdated',
    defaultMessage: '!!!Last updated',
  },
  dialogSetTitle: {
    id: 'settings.lock.set',
    defaultMessage: '!!!Screen lock code creation',
  },
  dialogChangeTitle: {
    id: 'settings.lock.change',
    defaultMessage: '!!!Change pin code',
  },
});

type Props = {|
  toggleLockScreen: void => void,
  submit: string => void,
  isEnabled: boolean,
  pin: ?string,
  updated: ?Date,
  error?: ?LocalizableError,
|};

type State = {|
  changingCodeIsOpen: boolean,
|}

@observer
export default class LockScreenSettings extends Component<Props, State> {
  static defaultProps: {| error: void |} = {
    error: undefined
  };

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = { intl: intlShape.isRequired };

  state: State = {
    changingCodeIsOpen: false,
  }

  toggleChangeDialog: void => void = () => {
    const { changingCodeIsOpen } = this.state;
    this.setState({ changingCodeIsOpen: !changingCodeIsOpen });
  }

  handleChangeSubmit: string => void = (data) => {
    this.props.submit(data);
    this.toggleChangeDialog();
  }

  render(): Node {
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

    const lastUpdated = updated
      ? (
        intl.formatMessage(messages.updated, {
          lastUpdated: moment(updated).fromNow(),
        })
      )
      : '';

    const dialogTitle = changingCodeIsOpen ? messages.dialogChangeTitle : messages.dialogSetTitle;
    const checkboxLabel = isEnabled ? messages.checkboxDisableLabel : messages.checkboxEnableLabel;

    return (
      <div className={componentClassNames}>
        <div className={`${styles.enabling} ${styles.row}`}>
          <button type="button" className={styles.checkbox} onClick={toggleLockScreen}>
            {isEnabled ? <IconEnabled /> : <IconDisabled /> }
          </button>
          <span className={styles.title}>{intl.formatMessage(checkboxLabel)}</span>
        </div>
        <div className={styles.bottom}>
          {(pin == null || !isEnabled) && <div className={styles.overlay} />}
          <div className={styles.title}>{intl.formatMessage(messages.bottomTitle)}</div>
          <div className={styles.timeBox}>
            {lastUpdated}
            <button type="button" className={styles.change} onClick={this.toggleChangeDialog}>Change</button>
          </div>
        </div>

        {(changingCodeIsOpen || (pin == null && isEnabled)) && (
          <SetLockCodeDialog
            close={changingCodeIsOpen ? this.toggleChangeDialog : toggleLockScreen}
            title={intl.formatMessage(dialogTitle)}
            requestCurrent={changingCodeIsOpen}
            pin={pin}
            submit={changingCodeIsOpen ? this.handleChangeSubmit : submit}
          />
        )}

        {error && (
          <p className={styles.error}>
            {intl.formatMessage(error, error.values)}
          </p>
        )}

      </div>
    );
  }
}
