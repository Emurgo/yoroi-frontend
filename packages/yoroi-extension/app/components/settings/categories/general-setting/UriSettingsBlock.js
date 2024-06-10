// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { Box, Button, Typography } from '@mui/material';
import { intlShape } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import { observable, runInAction } from 'mobx';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { withLayout } from '../../../../styles/context/layout';

type Props = {|
  +registerUriScheme: void => void,
  +isFirefox: boolean,
|};
type InjectedProps = {| +isRevampLayout: boolean |};

@observer
class UriSettingsBlock extends Component<Props & InjectedProps> {
  @observable hasPressed: boolean = false;

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { isRevampLayout } = this.props;

    // On firefox since there is no prompt,
    // We need to give the user feedback that they pressed the button
    const isDisabled = this.props.isFirefox && this.hasPressed;

    return (
      <Box
        sx={{
          pb: '24px',
          pt: !isRevampLayout && '24px',
          borderTop: !isRevampLayout && '1px solid',
          borderColor: !isRevampLayout && 'var(--yoroi-palette-gray-200)',
        }}
      >
        <Typography component="div" variant={isRevampLayout ? 'body1' : 'h5'} fontWeight={500} mb="12px">
          {intl.formatMessage(globalMessages.uriSchemeLabel)}
        </Typography>

        <Typography component="div" variant={isRevampLayout ? 'body1' : 'body2'} color="ds.black_static">
          {intl.formatMessage(
            isRevampLayout ? globalMessages.uriExplanationRevamp : globalMessages.uriExplanation
          )}
        </Typography>

        <Button
          className="allowButton"
          variant={isRevampLayout ? 'contained' : 'primary'}
          onClick={() => {
            this.props.registerUriScheme();
            runInAction(() => {
              this.hasPressed = true;
            });
          }}
          disabled={isDisabled}
          sx={{
            width: isRevampLayout ? 'fit-content' : '287px',
            marginTop: isRevampLayout ? '40px' : '20px',
            '&.MuiButton-sizeMedium': {
              p: isRevampLayout && '13px 24px',
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

export default (withLayout(UriSettingsBlock): ComponentType<Props>);
