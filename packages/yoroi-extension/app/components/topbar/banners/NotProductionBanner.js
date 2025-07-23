// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { IntlContext, defineMessages, } from 'react-intl';
import styles from './NotProductionBanner.scss';
import { ReactComponent as ShelleyTestnetWarningSvg }  from '../../../assets/images/shelley-testnet-warning.inline.svg';

const messages = defineMessages({
  notProdLabel: {
    id: 'notprod.label.message',
    defaultMessage: '!!!WARNING: this is a non-production build. If something unusual occurs, double-check Yoroi\'s installation.',
  },
});

type Props = {|
|};

@observer
export default class NotProductionBanner extends Component<Props> {

  static contextType:any = IntlContext;
  render(): Node {
    const intl = this.context;

    return (
      <div className={styles.notProdWarning}>
        <span className={styles.warningIcon}><ShelleyTestnetWarningSvg /></span>
        <div className={styles.text}>
          {intl.formatMessage(messages.notProdLabel)}
        </div>
      </div>
    );
  }
}
