// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import type { MessageDescriptor } from 'react-intl';
import { intlShape } from 'react-intl';
import styles from './LinkButton.scss';

type Props = {|
  +url: string,
  +svg: string,
  +message: MessageDescriptor,
  +svgClass?: string,
  +textClassName: string,
  +onExternalLinkClick: MouseEvent => void,
|};

@observer
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

    const SvgElem = svg;
    return (
      <div className={styles.component}>
        <a
          href={url}
          onClick={event => onExternalLinkClick(event)}
          className={styles.block}
          title={intl.formatMessage(message)}
        >
          <div className={styles.icon}>
            <span className={svgClass}><SvgElem /></span>
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
