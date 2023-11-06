// @flow //
import React from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages, FormattedMessage } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import imgWarningIcon from '../../../assets/img/warning-icon.svg';
import styles from './WebAuthnTopBlock.scss';

const messages = defineMessages({
  noteText: {
    id: 'webauthn.note',
    defaultMessage: '!!!Do not press the <strong>Cancel</strong> button',
  }
});

type Props = {|
  showWebAuthnTop: boolean,
  isFirefox: boolean
|}

@observer
export default class WebAuthnTopBlock extends React.Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired
  };

  render(): Node {
    const {
      showWebAuthnTop,
      isFirefox
    } = this.props;

    if (!showWebAuthnTop) {
      // Do not show this component
      return (null);
    }

    const styleComponent = isFirefox ?
      `${styles.component} ${styles.componentFirefox}` :
      `${styles.component}`;

    return (
      <div className={styleComponent}>
        <div className={styles.warningBlock}>
          <img
            className={styles.warningIcon}
            src={imgWarningIcon}
            alt="Warning Icon"
          />
          <div className={styles.text}>
            {<FormattedMessage {...messages.noteText} />}
          </div>
        </div>
      </div>
    );
  }
}
