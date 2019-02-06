import React, { Component } from 'react';
import SvgInline from 'react-svg-inline';
import { intlShape } from 'react-intl';
import styles from './FooterItem.scss';


type Props = {
  url: string,
  svg: string,
  message: any
};

export default class FooterItem extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const { url, svg, message } = this.props;
    
    return (
      <div className={styles.component}>
        {/* Buy a Trezor Hardware wallet */}
        {
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.block}
          >
            <div className={styles.icon}>
              <SvgInline svg={svg} cleanup={['title']} />
            </div>
            <div className={styles.text}>
              {intl.formatMessage(message)}
            </div>
          </a>}
      </div>
    );
  }
}
