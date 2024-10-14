// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import styles from './WarningHeader.scss';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Box, Typography } from '@mui/material';
import { ReactComponent as AttentionIcon } from '../../../assets/images/attention-modern.inline.svg';

type Props = {|
  +message: Node,
  +children?: ?Node,
|};

@observer
export default class WarningHeader extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  static defaultProps: {| children: void |} = {
    children: undefined,
  };

  render(): Node {
    const { intl } = this.context;
    return (
      <Box className={styles.component}>
        <div className={styles.header}>
          <Box
            sx={{
              backgroundColor: 'ds.sys_magenta_100',
            }}
            className={styles.warningSection}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
              }}
            >
              <AttentionIcon />
              <Typography
                variant="body1"
                color="ds.sys_magenta_500"
                sx={{
                  fontWeight: 500,
                  paddingLeft: '8px',
                }}>
                {intl.formatMessage(globalMessages.attentionHeaderText)}
              </Typography>
            </Box>
            <Box sx={{ paddingTop: '8px' }}>
              {this.props.message}
            </Box>
          </Box>
        </div>
        {this.props.children}
      </Box>
    );
  }
}
