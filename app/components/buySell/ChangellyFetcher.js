// @flow

import React, { Component } from 'react';
import type { Node } from 'react';
import { action, observable } from 'mobx';
import { intlShape, } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { observer } from 'mobx-react';

type Props = {|
  +children?: Node,
  +widgetURL: string,
  +address: ?string,
|};

@observer
export default class ChangellyFetcher extends Component<Props> {
  static defaultProps: {|children: void|} = {
    children: undefined
  };

  @observable iframe: ?HTMLIFrameElement;
  @observable frameHeight: number = 0;

  @action setFrame: (null | HTMLIFrameElement) => void = (frame) => {
    this.iframe = frame;
  }

  componentDidMount() {
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  addAddressToWidget: (string, ?string) => string = (widgetURL, address) => {
    if (address == null) return widgetURL
    return widgetURL + '&address=' + address
  }

  render(): Node {
    const { widgetURL, address } = this.props;

    if (widgetURL == null) {
      throw new Error('Changelly URL undefined. this should never happen');
    }

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
        src={`${this.addAddressToWidget(widgetURL, address)}`}
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
  }
}
