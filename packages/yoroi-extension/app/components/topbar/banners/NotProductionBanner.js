// @flow
import type { Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import { ReactComponent as ShelleyTestnetWarningSvg } from '../../../assets/images/shelley-testnet-warning.inline.svg';
import { Box } from '@mui/material';
import styles from './NotProductionBanner.scss';

const messages = defineMessages({
  notProdLabel: {
    id: 'notprod.label.message',
    defaultMessage:
      "!!!WARNING: this is a non-production build. If something unusual occurs, double-check Yoroi's installation.",
  },
});

type Props = {||};

@observer
export default class NotProductionBanner extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <Box sx={{ bgcolor: 'ds.sys_orange_c500' }} className={styles.notProdWarning}>
        <span className={styles.warningIcon}>
          <ShelleyTestnetWarningSvg />
        </span>
        <Box sx={{ color: 'ds.white_static' }} className={styles.text}>
          {intl.formatMessage(messages.notProdLabel)}
        </Box>
      </Box>
    );
  }
}
