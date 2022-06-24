// @flow //
import React from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages, FormattedHTMLMessage } from 'react-intl';

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
  static contextTypes = { intl: intlShape.isRequired };

  render() {
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
            {<FormattedHTMLMessage {...messages.noteText} />}
          </div>
        </div>
      </div>
    );
  }
}
