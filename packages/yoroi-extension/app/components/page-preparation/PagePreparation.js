import { Typography, Box, Button } from '@mui/material';
import { Ilustration } from './Ilustration';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { Node } from 'react';
import { Component } from 'react';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import { ROUTES } from '../../routes-config';

const messages = defineMessages({
  preparation: {
    id: 'global.labels.preparation',
    defaultMessage: '!!!Page preparation failed',
  },
  somethingWrong: {
    id: 'global.labels.somethingWrong',
    defaultMessage: '!!!Something went wrong when preparing this page.',
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

export default class PagePreparation extends Component<StoresAndActionsProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

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
        <Ilustration />
        <Typography variant="h3" fontWeight={500} mt="32px" mb="4px" color="ds.gray_max">
          {this.context.intl.formatMessage(messages.preparation)}
        </Typography>
        <Typography color="ds.gray_600" variant="body1">
          {this.context.intl.formatMessage(messages.somethingWrong)}
        </Typography>
        <Typography color="ds.gray_600" variant="body1" mb="16px">
          {this.context.intl.formatMessage(messages.goBack)}
        </Typography>
        <Button
          variant="primary"
          onClick={() => {
            this.props.actions.router.goToRoute.trigger({ route: ROUTES.SWAP.ROOT });
          }}
        >
          {this.context.intl.formatMessage(messages.back)}
        </Button>
      </Box>
    );
  }
}
