// @flow //
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import styles from './LoadingSpinner.scss';

const messages = defineMessages({
  text: {
    id: 'suspence.fallbackText',
    defaultMessage: '!!!Loading...',
  },
});

type Props = {|
  showText?: boolean
|};

@observer
export default class LoadingSpinner extends Component<Props> {
  static contextTypes = { intl: intlShape.isRequired };
  static defaultProps = { showText: false };

  root: ?HTMLElement;

  render() {
    const { intl } = this.context;
    const { showText } = this.props;
    const textComp = (
      <div className={styles.text}>
        {intl.formatMessage(messages.text)}
      </div>);

    return (
      <div className={styles.component}>
        <div className={styles.wrapper} ref={(div) => { this.root = div; }} />
        {showText && textComp}
      </div>
    );
  }
}
