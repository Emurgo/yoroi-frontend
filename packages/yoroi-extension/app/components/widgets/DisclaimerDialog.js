// @flow
import { useState, Element } from 'react';
import { injectIntl, defineMessages, type $npm$ReactIntl$IntlShape } from 'react-intl';
import Dialog from './Dialog';
import globalMessages from '../../i18n/global-messages';
import { Typography, Checkbox, FormControlLabel } from '@mui/material';
import { styled } from '@mui/material/styles';

const messages = defineMessages({
  disclaimer: {
    id: 'cashback.disclaimer',
    defaultMessage:
      '!!!By clicking "Proceed," you acknowledge that you will be redirected to a third-party service provider offering cashback services in ADA currency. You may be required to agree to the terms, conditions, and privacy policies of the third-party provider to complete the transaction. Yoroi Wallet does not control, endorse, or assume responsibility for the content, security, policies, or services provided by the third party.',
  },
  disclaimerNote: {
    id: 'cashback.disclaimer.note',
    defaultMessage: '!!!Please note:',
  },
  disclaimerNote1: {
    id: 'cashback.disclaimer.note.1',
    defaultMessage:
      '!!!1. Yoroi Wallet is not liable for any losses, delays, or errors that may occur while using the third-party service.',
  },
  disclaimerNote2: {
    id: 'cashback.disclaimer.note.2',
    defaultMessage:
      "!!!2. Transactions may be subject to restrictions based on your geographic location, applicable laws, financial institution policies, or the service provider's limitations.",
  },
  disclaimerNote3: {
    id: 'cashback.disclaimer.note.3',
    defaultMessage:
      "!!!3. Ensure you review and understand the third party's terms, as your interactions are solely governed by their agreements.",
  },
  disclaimerNote4: {
    id: 'cashback.disclaimer.note.4',
    defaultMessage:
      '!!!4. Yoroi Wallet does not collect or store any personal or financial data submitted through the third-party platform.',
  },
  disclaimerAgree: {
    id: 'cashback.disclaimer.agree',
    defaultMessage: '!!!I understand this disclaimer.',
  },
});

type Props = {|
  onProceed: () => void,
  closeButton: Element<any>,
|};
type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

const DisclaimerText = styled(Typography)(({ theme }) => ({
  fontSize: '16px',
  lineHeight: '24px',
  color: theme.palette.ds.text_gray_medium,
}));
const DisclaimerBold = styled(Typography)(({ theme }) => ({
  fontSize: '16px',
  lineHeight: '24px',
  fontWeight: 500,
  color: theme.palette.ds.text_gray_medium,
}));

const DisclaimerDialog: React$ComponentType<Props> = injectIntl((props: Props & Intl) => {
  const { intl } = props;
  const [disclaimerAgreed, setDisclaimerAgreed] = useState(false);
  return (
    <Dialog
      title={intl.formatMessage(globalMessages.disclaimer)}
      closeButton={props.closeButton}
      dialogActions={[
        {
          label: intl.formatMessage(globalMessages.proceed),
          onClick: props.onProceed,
          disabled: !disclaimerAgreed,
          primary: true,
        },
      ]}
    >
      <DisclaimerText>{intl.formatMessage(messages.disclaimer)}</DisclaimerText>
      <DisclaimerText>&nbsp;</DisclaimerText>
      <DisclaimerBold>{intl.formatMessage(messages.disclaimerNote)}</DisclaimerBold>
      <DisclaimerText>{intl.formatMessage(messages.disclaimerNote1)}</DisclaimerText>
      <DisclaimerText>{intl.formatMessage(messages.disclaimerNote2)}</DisclaimerText>
      <DisclaimerText>{intl.formatMessage(messages.disclaimerNote3)}</DisclaimerText>
      <DisclaimerText>{intl.formatMessage(messages.disclaimerNote4)}</DisclaimerText>
      <DisclaimerText>&nbsp;</DisclaimerText>
      <FormControlLabel
        sx={{ marginLeft: '0px', color: 'ds.text_gray_medium' }}
        control={<Checkbox checked={disclaimerAgreed} onChange={event => setDisclaimerAgreed(event.target.checked)} />}
        label={intl.formatMessage(messages.disclaimerAgree)}
      />
    </Dialog>
  );
});

export default DisclaimerDialog;
