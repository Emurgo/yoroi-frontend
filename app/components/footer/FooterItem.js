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
        {
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.block}
            title={intl.formatMessage(message)}
          >
            <div className={styles.icon}>
              <SvgInline svg={svg} cleanup={['title']} width="20" height="52" />
            </div>
            <div className={styles.text}>
              {intl.formatMessage(message)}
            </div>
          </a>
        }
      </div>
    );
  }
}
