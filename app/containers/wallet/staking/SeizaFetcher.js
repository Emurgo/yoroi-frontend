// @flow

import React, { Component } from 'react';
import type { Node } from 'react';
import { computed, action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { intlShape, } from 'react-intl';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import LocalizableError from '../../../i18n/LocalizableError';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import type { ConfigType } from '../../../../config/config-types';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import type {SelectedPool} from "../../../actions/jormungandr/delegation-transaction-actions";

declare var CONFIG: ConfigType;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +children?: Node,
  +stakingUrl: string,
  stakepoolSelectedAction: any,
|};

@observer
export default class SeizaFetcher extends Component<Props> {
  static defaultProps: {|children: void|} = {
    children: undefined
  };

  @observable iframe: ?HTMLIFrameElement;
  @observable frameHeight: number = 0;

  @action
  messageHandler: any => Promise<void> = async (event: any) => {
    if (event.origin !== process.env.POOLS_UI_URL_FOR_YOROI) return;
    const pool: SelectedPool = JSON.parse(decodeURI(event.data));

    this.props.stakepoolSelectedAction(pool.poolHash)
  }

  @action setFrame: (null | HTMLIFrameElement) => void = (frame) => {
    this.iframe = frame;
  }

  constructor(props: Props) {
    super(props);
    window.addEventListener('message', this.messageHandler, false);
  }

  componentDidMount() {
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('message', this.messageHandler);
  }

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { stakingUrl } = this.props;

    if (stakingUrl == null) {
      throw new Error('Staking undefined POOLS_UI_URL_FOR_YOROI should never happen');
    }

    return (
        <iframe
          ref={this.setFrame}
          title="Staking"
          src={`${stakingUrl}`}
          frameBorder="0"
          width="100%"
          height={this.iframe != null && this.frameHeight != null ? this.frameHeight + 'px' : null}
        />
    );
  }

  @action
  resize: void => void = () => {
    if (this.iframe == null) {
      this.frameHeight = 0;
      return;
    }
    this.frameHeight = Math.max(
      window.innerHeight - this.iframe.getBoundingClientRect().top - 30,
      0
    );
  }
}
