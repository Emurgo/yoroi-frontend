// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import styles from './SuccessPage.scss';
import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';
import LoadingSpinner from '../widgets/LoadingSpinner';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {|
  +title: string,
  +text: string,
  +classicTheme: boolean,
  +closeInfo?: {|
    +onClose: void => PossiblyAsync<void>,
    +closeLabel: string,
  |},
|};

@observer
export default class SuccessPage extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  static defaultProps: {|closeInfo: void|} = {
    closeInfo: undefined
  };

  render(): Node {
    const { title, text } = this.props;

    const actions = this.props.closeInfo == null
      ? undefined
      : [{
        label: this.props.closeInfo.closeLabel,
        onClick: this.props.closeInfo.onClose,
        primary: true
      }];

    return (
      <Dialog
        title=""
        actions={actions}
        closeOnOverlayClick={false}
        onClose={this.props.closeInfo ? this.props.closeInfo.onClose : undefined}
        className={styles.dialog}
        closeButton={this.props.closeInfo ? (<DialogCloseButton />) : undefined}
      >
        <div className={styles.component}>
          <div>
            <div className={styles.successImg} />
            <div className={styles.title}>
              {title}
            </div>
            <div className={styles.text}>
              {text}
            </div>
            {this.props.closeInfo == null && (
              <div className={styles.spinnerSection}>
                <LoadingSpinner />
              </div>
            )}
          </div>
        </div>
      </Dialog>
    );
  }
}
