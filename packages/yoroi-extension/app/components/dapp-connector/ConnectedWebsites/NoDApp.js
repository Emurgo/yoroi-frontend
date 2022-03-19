// @flow
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { Component } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { defineMessages, intlShape } from 'react-intl';
import NoItemsFoundImg from '../../../assets/images/dapp-connector/no-websites-connected.inline.svg'
import { connectorMessages } from '../../../i18n/global-messages';
import { BRANDED_DAPPS } from './dapps'
import { Box, styled } from '@mui/system';
import DApp from './DApp';
import { Typography } from '@mui/material';

const messages = defineMessages({
    noWebsitesConnected: {
      id: 'connector.connect.noWebsitesConnected',
      defaultMessage: `!!!You don't have any websites connected yet`,
    },
});

@observer
export default class NoDApp extends Component {
    static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
        intl: intlShape.isRequired,
    };

    render(): Node {
        const { intl } = this.context
        return (
          <Box
            sx={{
             height: '100%',
            }}
          >
            <DappsWrapper>
              <Box
                sx={{
                  backgroundColor: 'var(--yoroi-palette-common-white)',
                  display: 'flex',
                  alignItems: 'stretch',
                  borderRadius: '8px',
                  minWidth: '600px',
                  overflowY: 'auto',
                  marginX: '16px',
                }}
              >
                {BRANDED_DAPPS.map(dapp => <DApp key={dapp.id} dapp={dapp} />)}
              </Box>
            </DappsWrapper>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '65px'
              }}
            >
              <NoItemsFoundImg />
              <Typography
                variant='h4'
                color='#242838'
                marginTop='32px'
                fontSize='24px'
                fontWeight='400'
              >{intl.formatMessage(messages.noWebsitesConnected)}
              </Typography>
              <Typography
                variant='p'
                color='#6B7384'
                marginTop='8px'
                fontSize='16px'
              >{intl.formatMessage(connectorMessages.messageReadOnly)}
              </Typography>
            </Box>
          </Box>
        )
    }
}

const DappsWrapper = styled('Box')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '40px',
});

