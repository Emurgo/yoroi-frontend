// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import type { MessageDescriptor, $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import styles from './LinkButton.scss';
import { Typography, Box } from '@mui/material';

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
  static defaultProps: {| svgClass: void |} = {
    svgClass: undefined,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
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
        <Box sx={{ borderRadius: '4px', '&:hover': { backgroundColor: 'ds.gray_c200' } }}>
          <a href={url} onClick={event => onExternalLinkClick(event)} className={styles.block}>
            <div className={styles.icon}>
              <span className={svgClass}>
                <SvgElem />
              </span>
            </div>
            <Typography variant="body3" color="ds.text_gray_normal">
              {intl.formatMessage(message)}
            </Typography>
          </a>
        </Box>
      </div>
    );
  }
}
