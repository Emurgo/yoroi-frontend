import React, { Component } from 'react';
import SvgInline from 'react-svg-inline';
import { intlShape } from 'react-intl';
import styles from './LinkButton.scss';

type Props = {
  url: string,
  svg: string,
  message: any
};

export default class LinkButton extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const { url, svg, message, svgClassName } = this.props;

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
              <SvgInline svg={svg} className={svgClassName} width="20" height="52" />
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
