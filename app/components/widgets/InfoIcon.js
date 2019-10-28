// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import type { MessageDescriptor } from 'react-intl';
import SvgInline from 'react-svg-inline';
import { intlShape } from 'react-intl';

import styles from './InfoIcon.scss';
import infoIcon from '../../assets/images/info-icon.inline.svg';

type Props = {|
  toolTip: MessageDescriptor
|};

@observer
export default class InfoIcon extends Component<Props> {
  static contextTypes = { intl: intlShape.isRequired };

  render() {
    const { intl } = this.context;
    const { toolTip } = this.props;

    return (
      <div className={styles.component}>
        <SvgInline
          svg={infoIcon}
          width="14"
          height="14"
          className={styles.infoIcon}
          title={intl.formatMessage(toolTip)}
        />
      </div>
    );
  }
}
