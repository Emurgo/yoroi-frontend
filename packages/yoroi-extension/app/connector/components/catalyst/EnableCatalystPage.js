// @flow
import { Component } from 'react';
import { injectIntl, defineMessages } from 'react-intl';
import type { Node, ComponentType } from 'react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { observer } from 'mobx-react';
import { Button, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { ReactComponent as NoDappIcon } from '../../../assets/images/dapp-connector/no-dapp.inline.svg';
import globalMessages from '../../../i18n/global-messages';

const messages = defineMessages({
  title: {
    id: 'connector.catalyst.enable',
    defaultMessage: '!!!Enable Catalyst Voting'
  },
});
                                
type Props = {|
  favicon: ?string,
  url: string,
  onConfirm: boolean => void,
|};

@observer
class EnableCatalystPage extends Component<
  Props & {| intl: $npm$ReactIntl$IntlShape |}
> {
  onConfirm(enable: boolean): void {
    this.props.onConfirm(enable);
  }

  render(): Node {
    const { favicon, url, intl } = this.props;

    return (
      <Box display="flex" alignItems="center" flexDirection="column">
        <Box sx={{ flexGrow: 1 }}>
          <Typography color="#242838" variant="h4" align="center" my="32px">
            {intl.formatMessage(messages.title)}
          </Typography>

          <Box
            sx={{
              marginRight: '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '40px',
              height: '40px',
              border: '1px solid #A7AFC0',
              borderRadius: '50%',
              img: { width: '30px' },
            }}
          >
            {favicon != null && favicon !== '' ? (
              <img src={favicon} alt={`${url} favicon`} />
            ) : (
              <NoDappIcon />
            )}
          </Box>
          <Typography variant="body1" fontWeight="400" color="#242838">
            {url}
          </Typography>
        </Box>

        <Box
          sx={{
            padding: '32px',
            borderTop: '1px solid #DCE0E9',
            width: '100%',
            backgroundColor: '#fff',
            position: 'fixed',
            bottom: '0px',
          }}
        >
          <Box sx={{ display: 'flex', gap: '15px' }}>
            <Button
              sx={{ minWidth: 0 }}
              fullWidth
              variant="outlined"
              color="primary"
              onClick={this.onConfirm.bind(this, false)}
            >
              {intl.formatMessage(globalMessages.cancel)}
            </Button>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={this.onConfirm.bind(this, true)}
              sx={{ minWidth: 0 }}
            >
              {intl.formatMessage(globalMessages.allowLabel)}
            </Button>
          </Box>
        </Box>

      </Box>
    );
  }
}

export default (injectIntl(EnableCatalystPage): ComponentType<Props>);
