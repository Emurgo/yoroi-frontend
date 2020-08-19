// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { intlShape } from 'react-intl';
import DialogCloseButton from './DialogCloseButton';
import Dialog from './Dialog';
import globalMessages from '../../i18n/global-messages';
import LocalizableError from '../../i18n/LocalizableError';
import { Checkbox } from 'react-polymorph/lib/components/Checkbox';
import { CheckboxSkin } from 'react-polymorph/lib/skins/simple/CheckboxSkin';
import styles from './DangerousActionDialog.scss';
import dangerousButtonStyles from '../../themes/overrides/DangerousButton.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {|
  +title: string,
  +checkboxAcknowledge: string,
  +isSubmitting: boolean,
  +isChecked: boolean,
  +toggleCheck: void => void,
  +error: ?LocalizableError,
  +children: Node,
  +onCancel: void => void,
  +primaryButton: {|
    +label: string,
    +onClick: void => PossiblyAsync<void>,
  |},
  +secondaryButton: {|
    label?: string,
    onClick: void => void,
    primary?: boolean,
  |},
|};

@observer
export default class DangerousActionDialog extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const {
      isSubmitting,
      error,
    } = this.props;

    const dialogClasses = classnames(['removeWalletDialog', styles.dialog]);

    const confirmButtonClasses = classnames([
      'confirmButton',
      styles.removeButton,
      isSubmitting ? styles.isSubmitting : null,
    ]);

    const actions = [
      {
        label: intl.formatMessage(globalMessages.cancel),
        primary: false,
        disabled: this.props.isSubmitting,
        ...(this.props.secondaryButton ?? Object.freeze({})),
      },
      {
        primary: true,
        className: confirmButtonClasses,
        disabled: !this.props.isChecked ? true : undefined,
        themeOverrides: dangerousButtonStyles,
        isSubmitting: this.props.isSubmitting,
        ...(this.props.primaryButton ?? Object.freeze({})),
      },
    ];

    return (
      <Dialog
        title={this.props.title}
        actions={actions}
        closeOnOverlayClick={false}
        onClose={this.props.onCancel}
        className={dialogClasses}
        closeButton={<DialogCloseButton onClose={this.props.onCancel} />}
      >

        {this.props.children}

        <div className={styles.checkbox}>
          <Checkbox
            label={this.props.checkboxAcknowledge}
            onChange={this.props.toggleCheck}
            checked={this.props.isSubmitting || this.props.isChecked}
            skin={CheckboxSkin}
          />
        </div>

        {error ? <p className={styles.error}>{intl.formatMessage(error)}</p> : null}

      </Dialog>
    );
  }

}
