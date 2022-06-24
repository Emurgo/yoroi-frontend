// @flow //
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import type {
  MessageType,
} from '../../../types/cmn';
import styles from './ResponseBlock.scss';

const messages = defineMessages({
  title: {
    id: 'response.title',
    defaultMessage: '!!!Response',
  },
});

type Props = {|
  response: MessageType
|};

@observer
export default class ResponseBlock extends Component<Props> {
  static contextTypes = { intl: intlShape.isRequired };

  root: ?HTMLElement;

  render() {
    const { intl } = this.context;
    const title = (
      <div className={styles.title}>
        {intl.formatMessage(messages.title)}
      </div>);

    return (
      <div className={styles.component}>
        {title}
        <div className={styles.response}>
          <pre>
            <code>
              {JSON.stringify(this.props.response, null, 2)}
            </code>
          </pre>
        </div>
      </div>
    );
  }
}
