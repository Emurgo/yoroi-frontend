// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import styles from './WarningHeader.scss';
import { ReactComponent as InvalidURIImg } from '../../../assets/images/uri/invalid-uri.inline.svg';
import VerticallyCenteredLayout from '../../layout/VerticallyCenteredLayout';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Box } from '@mui/material';
import { Typography } from '@mui/material';

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
          <Box sx={{ backgroundColor: 'ds.sys_yellow_100' }} className={styles.warningSection}>
            <div className={styles.attentionLabel}>
              <Typography variant="body1" color="ds.text_gray_max">
                {intl.formatMessage(globalMessages.attentionHeaderText)}
              </Typography>
            </div>
            <div className={styles.text}>{this.props.message}</div>
          </Box>
          <div className={styles.invalidURIImg}>
            <VerticallyCenteredLayout>
              <InvalidURIImg />
            </VerticallyCenteredLayout>
          </div>
        </div>
        {this.props.children}
      </Box>
    );
  }
}
