// @flow
import type { Node } from 'react';
import { Component } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import { observer } from 'mobx-react';
import { Box, Checkbox as MuiCheckbox, FormControlLabel } from '@mui/material';
import classnames from 'classnames';
import DialogCloseButton from './DialogCloseButton';
import Dialog from './Dialog';
import globalMessages from '../../i18n/global-messages';
import LocalizableError from '../../i18n/LocalizableError';
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
export default class DangerousActionDialog extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { isSubmitting, error, id } = this.props;

    const dialogClasses = classnames(['removeWalletDialog', styles.dialog]);

    const confirmButtonClasses = classnames(['confirmButton', styles.removeButton, isSubmitting ? styles.isSubmitting : null]);

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

    return (
      <Dialog
        title={this.props.title}
        dialogActions={actions}
        closeOnOverlayClick={false}
        onClose={this.props.onCancel}
        className={dialogClasses}
        closeButton={<DialogCloseButton onClose={this.props.onCancel} />}
        id={id}
      >
        {(
          <Box maxWidth="600px">
            {this.props.children}
            <Box mb="24px" ml="3px">
              <FormControlLabel
                label={this.props.checkboxAcknowledge}
                control={
                  <MuiCheckbox
                    onChange={this.props.toggleCheck}
                    checked={this.props.isSubmitting || this.props.isChecked}
                    sx={{
                      marginRight: '8px',
                      width: '16px',
                      height: '16px',
                      fontSize: '16px'
                    }}
                  />
                }
                id={id + '-acknowledgeAction-checkbox'}
                sx={{ marginLeft: '-0px' }}
              />
            </Box>
            {error ? <p className={styles.error}>{intl.formatMessage(error, error.values)}</p> : null}
          </Box>
        )}
      </Dialog>
    );
  }
}
