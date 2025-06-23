import { Typography, Box, Button } from '@mui/material';
import { defineMessages, IntlContext } from 'react-intl';
import type { Node } from 'react';
import { Component } from 'react';
import { ROUTES } from '../../routes-config';
import { ReactComponent as UnexpectedError } from '../../assets/images/revamp/page-unexpected-error.inline.svg';
import type { StoresProps } from '../../stores';

const messages = defineMessages({
  preparation: {
    id: 'global.labels.unexpectedError',
    defaultMessage: '!!!Something unexpected happened',
  },
  somethingWrong: {
    id: 'global.labels.contactSupport',
    defaultMessage: '!!!If this keep happening, contact our support team. ',
  },
  goBack: {
    id: 'global.labels.pleaseGoBack',
    defaultMessage: '!!!Please go back and try again.',
  },
  back: {
    id: 'global.labels.back',
    defaultMessage: '!!!back',
  },
});

export default class PagePreparation extends Component<StoresProps> {
  static contextType:any = IntlContext;
  render(): Node {
    return (
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
          marginTop: '117px',
        }}
      >
        <UnexpectedError />
        <Typography variant="h3" fontWeight={500} mt="32px" mb="4px" color="ds.gray_max">
          {this.context.formatMessage(messages.preparation)}
        </Typography>
        <Typography color="ds.gray_600" variant="body1">
          {this.context.formatMessage(messages.goBack)}
        </Typography>
        <Typography color="ds.gray_600" variant="body1" mb="16px">
          {this.context.formatMessage(messages.somethingWrong)}
        </Typography>
        <Button
          variant="primary"
          onClick={() => {
            this.props.stores.routing.goToRoute({ route: ROUTES.SWAP.ROOT });
          }}
        >
          {this.context.formatMessage(messages.back)}
        </Button>
      </Box>
    );
  }
}
