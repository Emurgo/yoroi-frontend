// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import type { MessageDescriptor, $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import styles from './LinkButton.scss';

type Props = {|
  +url: string,
  +svg: string,
  +message: MessageDescriptor,
  +svgClass?: string,
  +textClassName: string,
  +onExternalLinkClick: MouseEvent => void,
  +componentId?: string,
|};

@observer
export default class LinkButton extends Component<Props> {
  static defaultProps: {|svgClass: void|} = {
    svgClass: undefined
  };

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const {
      url,
      svg,
      message,
      svgClass,
      textClassName,
      onExternalLinkClick,
      componentId,
    } = this.props;

    const SvgElem = svg;
    return (
      <div className={styles.component} id={componentId || 'somewhere-someValue-linkButton'}>
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
