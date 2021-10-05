// @flow

import React, { Component } from 'react';
import type { Node } from 'react';
import { action, observable } from 'mobx';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { observer } from 'mobx-react';

type Props = {|
  +children?: Node,
  +address: ?string,
  +currency: ?string,
|};

@observer
export default class ChangellyFetcher extends Component<Props> {
  static defaultProps: {| children: void |} = {
    children: undefined,
  };

  @observable iframe: ?HTMLIFrameElement;
  @observable frameHeight: number = 0;

  @action setFrame: (null | HTMLIFrameElement) => void = frame => {
    this.iframe = frame;
  };

  componentDidMount() {
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  getWidgetUrl(currency: ?string, address: ?string): string {
    return `https://widget.changelly.com?from=*&to=*&amount=200&fromDefault=usd&theme=default&merchant_id=g9qheu8vschp16jj&payment_id=&v=3&toDefault=${
      currency?.toLowerCase() || 'ada'
    }&address=${address || ''}`;
  }

  render(): Node {
    const { currency, address } = this.props;

    return (
      <iframe
        /**
          * Rationale for allowing the following:
          *
          * allow-scripts:
          * The iframe uses javascript for:
          *   - Integrate Changelly Widget
          *
          * allow-popups:
          * Part of the flow of Changelly, requires sometimes to open a new page
          * on a partner website like MoonPay for KYC.
          * This requires "allows-popups"

          * 'allow-popups-to-escape-sandbox':
          * (see above for why we need popups at all)
          * Popups from an iframe inherit the sandbox behavior
          * We need popups to escape the sandbox
          * Otherwise it will block sites from standard web behavior like
          *     - Filling out forms (need to fill a form w/ info to register for MoonPay, etc.)
          *
          * Popups from an iframe inherit the sandbox behavior
          * We need popups to escape the sandbox
          * Otherwise it will block sites from standard web behavior like
          *     - Playing media
          *     - Storing cookies on the website
        */
        sandbox="allow-scripts allow-popups allow-same-origin allow-popups-to-escape-sandbox"
        referrerPolicy="no-referrer"
        ref={this.setFrame}
        title="Changelly"
        src={`${this.getWidgetUrl(currency, address)}`}
        frameBorder="0"
        width="100%"
        height={this.iframe != null && this.frameHeight != null ? '500px' : null}
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
  };
}
