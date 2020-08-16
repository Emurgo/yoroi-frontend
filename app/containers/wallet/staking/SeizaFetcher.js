// @flow

import React, { Component } from 'react';
import type { Node } from 'react';
import { action, observable } from 'mobx';
import { intlShape, } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import environment from '../../../environment';
import VerticallyCenteredLayout from '../../../components/layout/VerticallyCenteredLayout';
import LoadingSpinner from '../../../components/widgets/LoadingSpinner';
import { observer } from 'mobx-react';

type Props = {|
  +children?: Node,
  +urlTemplate: string,
  +locale: string,
  +stakepoolSelectedAction: (string) => Promise<void>,
  +poolList: Array<string>,
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
    const pools: Array<string> = JSON.parse(decodeURI(event.data));
    this.props.stakepoolSelectedAction(pools[0]);
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
    const { urlTemplate, locale } = this.props;

    if (urlTemplate == null) {
      throw new Error('Staking undefined POOLS_UI_URL_FOR_YOROI should never happen');
    }

    const stakingUrl = this._prepareStakingURL(urlTemplate, locale);
    if (stakingUrl == null) {
      return (
        <VerticallyCenteredLayout>
          <LoadingSpinner />
        </VerticallyCenteredLayout>
      );
    }

    return (
      <iframe
        sandbox="allow-scripts allow-same-origin"
        referrerPolicy="no-referrer"
        ref={this.setFrame}
        title="Staking"
        src={`${stakingUrl}`}
        frameBorder="0"
        width="100%"
        height={this.iframe != null && this.frameHeight != null ? this.frameHeight + 'px' : null}
      />
    );
  }

  _getBrowserReplacement(): string {
    // 1) handle Yoroi running as an extension
    if (environment.userAgentInfo.isExtension) {
      if (environment.userAgentInfo.isFirefox) {
        return 'firefox&mozId=' + location.hostname;
      }
      // otherwise assume Chrome
      // $FlowFixMe
      return 'chrome&chromeId=' + chrome.runtime.id;
    }

    // 2) Handle Yoroi running as a website
    if (environment.userAgentInfo.isFirefox) {
      return 'firefox&host' + location.host;
    }
    // otherwise assume Chrome
    return 'chrome&chromeId=' + location.host;
  }

  _prepareStakingURL(urlTemplate: string, locale: string): null | string {
    let finalURL = urlTemplate
      .replace(
        '$$BROWSER$$',
        this._getBrowserReplacement()
      );

    // TODO: adds locale when adapools supports it
    const lang = locale == null ? 'en' : locale.slice(0, 2);
    finalURL += `&lang=${lang}`;

    finalURL += `&delegated=${encodeURIComponent(JSON.stringify(this.props.poolList))}`;

    return finalURL;
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
