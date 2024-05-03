// @flow
import type { Node, ComponentType } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { InjectedLayoutProps } from '../../../styles/context/layout';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import { withLayout } from '../../../styles/context/layout';
import { Box, FormControlLabel, Checkbox as MuiCheckbox } from '@mui/material';
import classnames from 'classnames';
import DialogCloseButton from './DialogCloseButton';
import Dialog from './Dialog';
import globalMessages from '../../../i18n/global-messages';
import LocalizableError from '../../../i18n/LocalizableError';
import CheckboxLabel from '../../common/CheckboxLabel';
import styles from './DangerousActionDialog.scss';

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
    +danger?: boolean,
  |},
  +secondaryButton: {|
    label?: string,
    onClick: void => void,
    primary?: boolean,
  |},
  id: string,
|};

@observer
class DangerousActionDialog extends Component<Props & InjectedLayoutProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { isSubmitting, error, renderLayoutComponent, id } = this.props;

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
        danger: this.props.primaryButton.danger ?? true,
        isSubmitting: this.props.isSubmitting,
        ...(this.props.primaryButton ?? Object.freeze({})),
      },
    ];

    const classicLayout = (
      <div>
        {this.props.children}
        <div className={styles.checkbox}>
          <CheckboxLabel
            label={this.props.checkboxAcknowledge}
            onChange={this.props.toggleCheck}
            checked={this.props.isSubmitting || this.props.isChecked}
            id={id + '-acknowledgeAction'}
          />
        </div>

        {error ? <p className={styles.error}>{intl.formatMessage(error, error.values)}</p> : null}
      </div>
    );

    const revampLayout = (
      <Box maxWidth="600px">
        {this.props.children}
        <Box mb="24px">
          <FormControlLabel
            label={this.props.checkboxAcknowledge}
            control={
              <MuiCheckbox
                onChange={this.props.toggleCheck}
                checked={this.props.isSubmitting || this.props.isChecked}
                sx={{ marginRight: '8px', width: '16px', height: '16px' }}
              />
            }
            id={id + '-acknowledgeAction-checkbox'}
            sx={{ marginLeft: '-0px' }}
          />
        </Box>
        {error ? <p className={styles.error}>{intl.formatMessage(error, error.values)}</p> : null}
      </Box>
    );

    const content = renderLayoutComponent({
      CLASSIC: classicLayout,
      REVAMP: revampLayout,
    });

    return (
      <Dialog
        title={this.props.title}
        actions={actions}
        closeOnOverlayClick={false}
        onClose={this.props.onCancel}
        className={dialogClasses}
        closeButton={<DialogCloseButton onClose={this.props.onCancel} />}
        id={id}
      >
        {content}
      </Dialog>
    );
  }
}

export default (withLayout(DangerousActionDialog): ComponentType<Props>);
