// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import moment from 'moment';
import ReadOnlyInput from '../../widgets/forms/ReadOnlyInput';
import globalMessages from '../../../i18n/global-messages';
// import styles from './SpendingPasswordSetting.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  passwordLastUpdated: {
    id: 'wallet.settings.passwordLastUpdated',
    defaultMessage: '!!!Last updated',
  },
  unchangedPassword: {
    id: 'wallet.settings.unchangedPassword',
    defaultMessage: '!!!Password unchanged since wallet creation',
  },
});

type Props = {|
  +walletPasswordUpdateDate: ?Date,
  +openDialog: void => void,
  +classicTheme: boolean,
|};

@observer
export default class SpendingPasswordSetting extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const {
      walletPasswordUpdateDate,
      classicTheme,
    } = this.props;
    const passwordMessage = walletPasswordUpdateDate == null
      ? intl.formatMessage(messages.unchangedPassword)
      : (
        intl.formatMessage(messages.passwordLastUpdated, {
          lastUpdated: moment(walletPasswordUpdateDate).fromNow(),
        })
      );

    return (
      <ReadOnlyInput
        label={intl.formatMessage(globalMessages.walletPasswordLabel)}
        value={passwordMessage}
        isSet
        onClick={this.props.openDialog}
        classicTheme={classicTheme}
      />
    );
  }

}
