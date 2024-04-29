// @flow

import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import Dialog from '../../../widgets/Dialog/Dialog';
import DialogCloseButton from '../../../widgets/Dialog/DialogCloseButton';
import styles from './LessThanExpectedDialog.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

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
  reason4: {
    id: 'wallet.dashboard.lessthan.reason4',
    defaultMessage: '!!!A stake pool you are delegating to charges a flat fee greater than the pool\'s total reward',
  },
  reason5: {
    id: 'wallet.dashboard.lessthan.reason5',
    defaultMessage: '!!!A stake pool you are delegating to was or is saturated',
  },
});

type Props = {|
  +close: void => void,
|};

@observer
export default class LessThanExpectedDialog extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <Dialog
        className={classnames([styles.component, 'LessThanExpectedDialog'])}
        title={intl.formatMessage(messages.title)}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={this.props.close}
      >
        <div className={styles.header}>
          {intl.formatMessage(messages.header)}
        </div>
        <ul>
          <li key="1">{intl.formatMessage(messages.reason1)}</li>
          <li key="2">{intl.formatMessage(messages.reason2)}</li>
          <li key="4">{intl.formatMessage(messages.reason4)}</li>
          <li key="5">{intl.formatMessage(messages.reason5)}</li>
        </ul>
      </Dialog>);
  }
}
