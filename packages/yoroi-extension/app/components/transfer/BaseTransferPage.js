// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { IntlContext } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import DialogBackButton from '../widgets/DialogBackButton';
import Dialog from '../widgets/Dialog';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import LocalizableError from '../../i18n/LocalizableError';
import { Box, Typography } from '@mui/material';

type Props = {|
  +children: Node,
  +onSubmit: void => Promise<void>,
  +onBack: void => void,
  +step0: string,
  +isDisabled: boolean,
  +error?: ?LocalizableError,
|};

@observer
export default class BaseTransferPage extends Component<Props> {
  static defaultProps: {| error: void |} = {
    error: undefined,
  };

  static contextType:any = IntlContext;
  render(): Node {
    const intl = this.context;
    const { onBack, step0 } = this.props;

    const actions = [
      {
        label: intl.formatMessage(globalMessages.backButtonLabel),
        onClick: onBack,
        className: classnames(['backTransferButtonClasses']),
      },
      {
        label: intl.formatMessage(globalMessages.nextButtonLabel),
        onClick: this.props.onSubmit,
        primary: true,
        className: classnames(['proceedTransferButtonClasses']),
        disabled: this.props.isDisabled,
      },
    ];

    return (
      <Dialog
        title={intl.formatMessage(globalMessages.instructionTitle)}
        dialogActions={actions}
        closeOnOverlayClick={false}
        onClose={onBack}
        backButton={<DialogBackButton onBack={onBack} />}
      >
        <Box>
          <Box>
            <Box>
              <Typography variant="body2" color="ds.text_gray_medium">
                {step0}
              </Typography>
              <Typography
                variant="body2"
                color="ds.text_gray_medium"
                sx={{
                  pt: '16px',
                }}
              >
                {intl.formatMessage(globalMessages.step1)}
              </Typography>
            </Box>
            {this.props.children}
            {this.props.error && (
              <Box textAlign="center">
                <Typography variant="body1" color="ds.text_error">
                  {intl.formatMessage(this.props.error, this.props.error.values)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Dialog>
    );
  }
}
