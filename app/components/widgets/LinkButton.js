// @flow
import React, { Component } from 'react';
import type { MessageDescriptor } from 'react-intl';
import SvgInline from 'react-svg-inline';
import { intlShape } from 'react-intl';
import styles from './LinkButton.scss';

type Props = {|
  +url: string,
  +svg: string,
  +message: MessageDescriptor,
  +svgClass?: string,
  +textClassName: string,
  +onExternalLinkClick: Function,
|};

export default class LinkButton extends Component<Props> {
  static defaultProps = {
    svgClass: undefined
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const {
      url,
      svg,
      message,
      svgClass,
      textClassName,
      onExternalLinkClick
    } = this.props;

    return (
      <div className={styles.component}>
        <a
          href={url}
          onClick={event => onExternalLinkClick(event)}
          className={styles.block}
          title={intl.formatMessage(message)}
        >
          <div className={styles.icon}>
            <SvgInline svg={svg} className={svgClass} />
          </div>
          <div className={styles.text}>
            <span className={textClassName}>
              {intl.formatMessage(message)}
            </span>
          </div>
        </a>
      </div>
    );
  }
}
