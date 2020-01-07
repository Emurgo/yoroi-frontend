// @flow

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import Dialog from '../../../widgets/Dialog';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import styles from './LessThanExpectedDialog.scss';

const messages = defineMessages({
  title: {
    id: 'wallet.dashboard.lessthan.title',
    defaultMessage: '!!!Missing Reward Explanation',
  },
  header: {
    id: 'wallet.dashboard.lessthan.header',
    defaultMessage: '!!!There are many reasons why you could be getting less rewards than you expected. We list some common ones here',
  },
  reason1: {
    id: 'wallet.dashboard.lessthan.reason1',
    defaultMessage: '!!!A stake pool you are delegating to either was or is offline so it did not make any blocks',
  },
  reason2: {
    id: 'wallet.dashboard.lessthan.reason2',
    defaultMessage: '!!!Not enough time has passed since you delegated',
  },
  reason3: {
    id: 'wallet.dashboard.lessthan.reason3',
    defaultMessage: '!!!The amount earned was rounded down to 0 (if you delegated a very small amount)',
  },
  reason4: {
    id: 'wallet.dashboard.lessthan.reason4',
    defaultMessage: '!!!A stake pool you are delegating to charges a flat fee greater than the pool\'s total reward',
  },
});

type Props = {|
  +classicTheme: boolean,
  +close: void => void,
|};

@observer
export default class LessThanExpectedDialog extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const {
      classicTheme,
    } = this.props;

    return (
      <Dialog
        className={classnames([styles.component, 'LessThanExpectedDialog'])}
        title={intl.formatMessage(messages.title)}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={this.props.close}
        classicTheme={classicTheme}
      >
        <div className={styles.header}>
          {intl.formatMessage(messages.header)}
        </div>
        <ul>
          <li key="1">{intl.formatMessage(messages.reason1)}</li>
          <li key="2">{intl.formatMessage(messages.reason2)}</li>
          <li key="3">{intl.formatMessage(messages.reason3)}</li>
          <li key="4">{intl.formatMessage(messages.reason4)}</li>
        </ul>
      </Dialog>);
  }
}
