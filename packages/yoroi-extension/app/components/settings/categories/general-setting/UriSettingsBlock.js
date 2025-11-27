// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { Box, Button, Typography } from '@mui/material';
import { IntlContext } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import { observable, runInAction } from 'mobx';

type Props = {|
  +registerUriScheme: void => void,
|};

@observer
export default class UriSettingsBlock extends Component<Props> {
  @observable hasPressed: boolean = false;

  static contextType: any = IntlContext;
  render(): Node {
    const intl = this.context;

    return (
      <Box
        sx={{
          pb: '24px',
          pt: false,
          borderTop: false,
          borderColor: false,
        }}
      >
        <Typography component="div" variant="body1" fontWeight={500} mb="12px" color="ds.text_gray_medium">
          {intl.formatMessage(globalMessages.uriSchemeLabel)}
        </Typography>

        <Typography component="div" variant="body1" color="ds.text_gray_medium">
          {intl.formatMessage(globalMessages.uriExplanationRevamp)}
        </Typography>

        <Button
          className="allowButton"
          variant="contained"
          onClick={() => {
            this.props.registerUriScheme();
            runInAction(() => {
              this.hasPressed = true;
            });
          }}
          sx={{
            width: 'fit-content',
            marginTop: '40px',
            '&.MuiButton-sizeMedium': {
              p: '13px 24px',
            },
          }}
          id="settings:blockchain-allowPaymentURL-button"
        >
          {intl.formatMessage(globalMessages.allowLabel)}
        </Button>
      </Box>
    );
  }
}
