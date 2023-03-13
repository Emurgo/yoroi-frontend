// @flow
import type { Node, ComponentType } from 'react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { injectIntl } from 'react-intl';
import { observer } from 'mobx-react';
import { Button, Stack } from '@mui/material';
import globalMessages from '../../../i18n/global-messages';

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

type Props = {|
  goNext?: void => void,
  goBack?: void => void,
  showBackButton?: boolean,
  showNextButton?: boolean,
|};

function StepController(props: Props & Intl): Node {
  const { intl, showBackButton = true, showNextButton = true, goBack, goNext } = props;

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      mt="14px"
      py="24px"
      gap="24px"
    >
      {showBackButton && (
        <Button
          variant="outlined"
          disableRipple={false}
          disabled={!goBack}
          onClick={() => goBack && goBack()}
          sx={{
            width: '144px',
            height: '40px',
            minWidth: 'unset',
            minHeight: 'unset',
            fontSize: '14px',
            lineHeight: '15px',
          }}
        >
          {intl.formatMessage(globalMessages.backButtonLabel)}
        </Button>
      )}
      {showNextButton && (
        <Button
          variant="rv-primary"
          disableRipple={false}
          disabled={!goNext}
          onClick={() => goNext && goNext()}
          sx={{
            width: '144px',
            height: '40px',
            fontSize: '14px',
            lineHeight: '15px',
          }}
        >
          {intl.formatMessage(globalMessages.nextButtonLabel)}
        </Button>
      )}
    </Stack>
  );
}

StepController.defaultProps = {
  goNext: undefined,
  goBack: undefined,
};

export default (injectIntl(observer(StepController)): ComponentType<Props>);
