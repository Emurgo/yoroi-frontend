// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import styles from './WarningHeader.scss';
import InvalidURIImg from '../../../assets/images/uri/invalid-uri.inline.svg';
import VerticallyCenteredLayout from '../../layout/VerticallyCenteredLayout';
import globalMessages from '../../../i18n/global-messages';

type Props = {|
  +message: Node,
  +children?: ?Node,
|};

@observer
export default class WarningHeader extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  static defaultProps = {
    children: undefined
  };

  render() {
    const { intl } = this.context;
    return (
      <div className={styles.component}>
        <div className={styles.header}>
          <div className={styles.warningSection}>
            <div className={styles.attentionLabel}>
              <p>{intl.formatMessage(globalMessages.attentionHeaderText)}</p>
            </div>
            <div className={styles.text}>
              {this.props.message}
            </div>
          </div>
          <div className={styles.invalidURIImg}>
            <VerticallyCenteredLayout>
              <InvalidURIImg />
            </VerticallyCenteredLayout>
          </div>
        </div>
        {this.props.children}
      </div>
    );
  }
}
