// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Button, Box } from '@mui/material';
import globalMessages from '../../i18n/global-messages';
import { styled } from '@mui/material/styles';
import banxaPng from '../../assets/images/banxa.png';
import { ReactComponent as Illustration } from '../../assets/images/exchange-end-illustration.svg';

const messages = defineMessages({
  congrats: {
    id: 'buysell.end.text',
    defaultMessage: '!!!Congrats! 🎉 Your transaction is now in progress. You should be receiving the funds soon.',
  },
});

const PageContent = styled(Box)({
  width: '464px',
  // have to center the content with this because the parent container is not a flex box
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  '&>*': {
    marginBottom: '16px',
  },
});

const Congrats = styled(Box)({
  color: 'var(--grayscale-contrast-max, #000)',
  textAlign: 'center',
  fontFeatureSettings: `'clig' off, 'liga' off`,
  fontFamily: 'Rubik',
  fontSize: '18px',
  fontStyle: 'normal',
  fontWeight: '500',
  lineHeight: '26px',
});

const ProviderRow = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const ProviderLabel = styled(Box)({
  color: 'var(--grayscale-contrast-600, #6B7384)',
  fontFeatureSettings: `'clig' off, 'liga' off`,
  fontFamily: 'Rubik',
  fontSize: '16px',
  fontStyle: 'normal',
  fontWeight: 400,
  lineHeight: '24px',
});

const ProviderInfo = styled(Box)({
  color: 'var(--grayscale-contrast-max, #000)',
  fontFeatureSettings: `'clig' off, 'liga' off`,
  fontFamily: 'Rubik',
  fontSize: '16px',
  fontStyle: 'normal',
  fontWeight: 500,
  lineHeight: '24px',
});

type Props = {|
  onConfirm: () => void,
|};

@observer
export default class ExchangeEndPageContent extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    return (
      <PageContent>
        <Illustration style={{ margin: 'auto', display: 'block' }} />

        <Congrats>{intl.formatMessage(messages.congrats)}</Congrats>

        <ProviderRow>
          <ProviderLabel>
            {intl.formatMessage(globalMessages.provider)}
          </ProviderLabel>
          <ProviderInfo>
            <img style={{ verticalAlign: 'bottom' }} src={banxaPng} alt="" />
            Banxa
          </ProviderInfo>
        </ProviderRow>

        <Button
          variant="contained"
          onClick={this.props.onConfirm}
          sx={{ margin: 'auto', display: 'block' }}
        >
          {intl.formatMessage(globalMessages.goToTransactions)}
        </Button>
      </PageContent>
    );
  }
}
