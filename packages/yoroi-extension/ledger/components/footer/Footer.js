// @flow //
import React from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import styles from './Footer.scss';

const messages = defineMessages({
  version: {
    id: 'footer.version',
    defaultMessage: '!!!Version:',
  },
  transportId: {
    id: 'footer.transportId',
    defaultMessage: '!!!Transport:',
  },
});

type Props = {|
  appVersion: string,
  transportId: string
|};

@observer
export default class Footer extends React.Component<Props> {
  static contextTypes = { intl: intlShape.isRequired };

  render() {
    const { intl } = this.context;
    const {
      appVersion,
      transportId
    } = this.props;

    return (
      <footer className={styles.component}>
        <div className={styles.wrapper}>
          <p className={styles.textLine}>
            {intl.formatMessage(messages.version)}&nbsp;{appVersion}
          </p>
          <p className={styles.textLine}>
            {intl.formatMessage(messages.transportId)}&nbsp;{transportId}
          </p>
        </div>
      </footer>
    );
  }
}
