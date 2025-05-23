// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { IntlContext } from 'react-intl';
import styles from './DeprecatedCurrencyBanner.scss';
import globalMessages from '../../../i18n/global-messages';
import { Button } from '@mui/material';

type Props = {|
  +children: Node,
  +onSubmit: void | (void => void),
|};

@observer
export default class DeprecatedCurrencyBanner extends Component<Props> {
  static contextType:any = IntlContext;
  render(): Node {
    const intl = this.context;
    const { onSubmit } = this.props;

    return (
      <div className={styles.component}>
        <div className={styles.center}>
          <div className={styles.background} />
          <div className={styles.content}>
            <div className={styles.textPart}>
              <div className={styles.title}>
                {intl.formatMessage(globalMessages.noteLabel)}
              </div>
              <div className={styles.explanation}>
                {this.props.children}
              </div>
            </div>
            {onSubmit != null && (
              <div className={styles.action}>
                <Button variant="primary" onClick={() => onSubmit()} sx={{ width: '230px' }}>
                  {intl.formatMessage(globalMessages.upgradeLabel)}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
