// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { IntlContext } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Box, Typography } from '@mui/material';

import styles from './WarningBox.scss';

type Props = {|
  +children: ?Node,
|};

@observer
export default class WarningBox extends Component<Props> {
  static contextType = IntlContext;
  render(): Node {
    const { intl } = this.context;
    const { children } = this.props;
    return (
      <Box sx={{ backgroundColor: 'ds.sys_yellow_100', borderRadius: '8px', mb: '24px', p: '24px' }} className={styles.component}>
        {/* Warning header  */}
        <div className={styles.header}>
          <div className={styles.headerIcon} />
          <Typography color="ds.sys_orange_500" className={styles.headerText}>
            {intl.formatMessage(globalMessages.attentionHeaderText)}
          </Typography>
        </div>
        {/* Warning content  */}
        <div className={styles.warning}>{children}</div>
      </Box>
    );
  }
}
