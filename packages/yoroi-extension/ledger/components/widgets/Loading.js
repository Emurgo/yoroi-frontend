// @flow //
import React from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import imgLoading from '../../assets/img/loading-full.gif';
import styles from './Loading.scss';

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
export default class Loading extends React.Component<Props> {
  static contextTypes = { intl: intlShape.isRequired };
  static defaultProps = { showText: false };

  render() {
    const { intl } = this.context;
    const { showText } = this.props;
    const textComp = (
      <div className={styles.text}>
        {intl.formatMessage(messages.text)}
      </div>);

    return (
      <div className={styles.component}>
        <div className={styles.wrapper}>
          <img
            className={styles.loadingImage}
            src={imgLoading}
            alt="Loading"
          />
          { showText && textComp}
        </div>
      </div>
    );
  }
}
