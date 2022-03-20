// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import { connectorMessages } from '../../../i18n/global-messages';
import { Link } from '@mui/material';
import styles from './DApp.scss'
import type { BrandedDapp } from './dapps'

type Props = {|
  +dapp: BrandedDapp
|}

@observer
export default class DApp extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
      const { dapp } = this.props;

      return (
        <div className={styles.component}>
          <div className={styles.logo} style={{ backgroundColor: dapp.bgColor }}>
            {dapp.logo}
          </div>
          <div>
            <p className={styles.name}>{intl.formatMessage(dapp.name)}</p>
            <p className={styles.description}>{intl.formatMessage(dapp.description)}</p>
          </div>

          <Link
            variant="secondary"
            sx={{
                textDecoration: 'none',
                textTransform: 'uppercase',
                color: 'var(--yoroi-palette-secondary-300)',
                fontWeight: '500',
                fontSize: '16px',
                marginTop: '23px',
                display: 'inline-block',
              }}
            href={dapp.url}
            target="_blank"
            rel="noreferrer noopener"
          >
            {intl.formatMessage(connectorMessages.connect)}
          </Link>
        </div>
      )
  }
}