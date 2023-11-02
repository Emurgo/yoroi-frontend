// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { intlShape } from 'react-intl';
import DialogCloseButton from './DialogCloseButton';
import ThemedDialog from './ThemedDialog';
import globalMessages from '../../i18n/global-messages';
import LocalizableError from '../../i18n/LocalizableError';
import CheckboxLabel from '../common/CheckboxLabel';
import styles from './DangerousActionDialog.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { withLayout } from '../../styles/context/layout';
import type { InjectedLayoutProps } from '../../styles/context/layout';
import { Box } from '@mui/material';

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
class DangerousActionDialog extends Component<Props & InjectedLayoutProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { isSubmitting, error, isRevampLayout } = this.props;

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
        danger: true,
        isSubmitting: this.props.isSubmitting,
        ...(this.props.primaryButton ?? Object.freeze({})),
      },
    ];

    return (
      <ThemedDialog
        title={this.props.title}
        actions={actions}
        closeOnOverlayClick={false}
        onClose={this.props.onCancel}
        className={dialogClasses}
        closeButton={<DialogCloseButton onClose={this.props.onCancel} />}
      >
        <Box maxWidth={isRevampLayout ? '600px' : 'unset'}>
          {this.props.children}
          <div className={styles.checkbox}>
            <CheckboxLabel
              label={this.props.checkboxAcknowledge}
              onChange={this.props.toggleCheck}
              checked={this.props.isSubmitting || this.props.isChecked}
            />
          </div>

          {error ? <p className={styles.error}>{intl.formatMessage(error, error.values)}</p> : null}
        </Box>
      </ThemedDialog>
    );
  }
}

export default (withLayout(DangerousActionDialog): ComponentType<Props>);
