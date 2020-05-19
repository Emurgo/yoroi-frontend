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
  +buttonLabel: string,
  +onSubmit: void => PossiblyAsync<void>,
  +isSubmitting: boolean,
  +onCancel: void => void,
  +isChecked: boolean,
  +toggleCheck: void => void,
  +error: ?LocalizableError,
  +children: Node,
|};

@observer
export default class DangerousActionDialog extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const {
      onCancel,
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
        onClick: this.props.onCancel,
        primary: false,
        disabled: this.props.isSubmitting,
      },
      {
        label: this.props.buttonLabel,
        onClick: this.props.onSubmit,
        primary: true,
        className: confirmButtonClasses,
        disabled: !this.props.isChecked ? true : undefined,
        themeOverrides: dangerousButtonStyles,
        isSubmitting: this.props.isSubmitting
      },
    ];

    return (
      <Dialog
        title={this.props.title}
        actions={actions}
        closeOnOverlayClick={false}
        onClose={onCancel}
        className={dialogClasses}
        closeButton={<DialogCloseButton onClose={onCancel} />}
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
