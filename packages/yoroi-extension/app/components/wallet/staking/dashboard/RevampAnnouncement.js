// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { observer } from 'mobx-react';
import { Box } from '@mui/system';
import { Button, Typography, styled } from '@mui/material';
import globalMessages from '../../../../i18n/global-messages';

const messages = defineMessages({
    title: {
      id: 'wallet.dashboard.revampAnnouncement.title',
      defaultMessage: '!!!New yoroi version is available',
    },
    text: {
      id: 'wallet.dashboard.revampAnnouncement.text',
      defaultMessage: '!!!New Yoroi version enables an exceptional experience for Cardano ADA holders. Apply it and take advantage of the new and improved existing features.',
    },
});

@observer
export default class RevampAnnouncement extends Component<{}> {
    static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
        intl: intlShape.isRequired,
    };

    render(): Node {
        const { intl } = this.context;

        return (
          <Box
            sx={{
              background: 'linear-gradient(74.13deg, #244ABF 22.14%, #4760FF 75.53%)',
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '24px',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap'
              }}
            >
              <Typography fontWeight='500' fontSize='16px' lineHeight='24px' color='var(--yoroi-palette-common-white)'>
                {intl.formatMessage(messages.title)} 🎉🎉🎉
              </Typography>
              <LearnMoreButton
                variant='text'
                size='small'
              >
                {intl.formatMessage(globalMessages.learnMore)}
              </LearnMoreButton>
            </Box>
            <Typography fontWeight='400' fontSize='14px' lineHeight='22px' color='var(--yoroi-palette-common-white)'>
              {intl.formatMessage(messages.text)}
            </Typography>
          </Box>
        )
    }
}

const LearnMoreButton = styled(Button)({
    color: 'var(--yoroi-palette-common-white)',
    minWidth: '90px',
    minHeight: '25px',
    width: '130px',
    height: '23px',
    padding: '0px',
    margin: '0px'
})