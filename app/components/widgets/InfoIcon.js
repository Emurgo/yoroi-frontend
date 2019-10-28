// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import type { MessageDescriptor } from 'react-intl';
import SvgInline from 'react-svg-inline';
import { intlShape } from 'react-intl';
import { Tooltip } from 'react-polymorph/lib/components/Tooltip';
import { TooltipSkin } from 'react-polymorph/lib/skins/simple/TooltipSkin';

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
        <Tooltip
          className={styles.SimpleTooltip}
          skin={TooltipSkin}
          tip={intl.formatMessage(toolTip)}
        >
          <SvgInline
            svg={infoIcon}
            width="14"
            height="14"
            className={styles.infoIcon}
          />
        </Tooltip>
      </div>
    );
  }
}
