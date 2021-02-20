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

  addAddressToWidget: (string, string) => string = (widgetURL, address) => {
    if (address == null) return widgetURL
    return widgetURL + '&address=' + address
  }

  render(): Node {
    const { widgetURL, address } = this.props;

    if (widgetURL == null) {
      throw new Error('Changelly URL undefined. this should never happen');
    }

    // TODO: look into iframe's CSP policy once our backend implement a CSP
    return (
      <iframe
        /**
          * Rationale for allowing the following:
          *
          * allow-scripts:
          * The iframe uses javascript for:
          *   - General UI
          *   - Communicate with the extension (ex: postMessage)
          *
          * allow-popups:
          * The stake pool list contains list for things like
          *   - Accessing the stake pool website
          *   - Seeing more information on an explorer
          * Instead of opening these links inside the iframe, we open these as new tabs
          * This requires "allows-popups"
          * TODO: we can get rid of this in the future by making that instead,
          *       links pass a website URL back through postMessage
          *       Then, Yoroi opens a dialog asking "You're about to visit https://foo.com are you sure?
          *
          * allow-popups-to-escape-sandbox:
          * (see above for why we need popups at all)
          * Popups from an iframe inherit the sandbox behavior
          * We need popups to escape the sandbox
          * Otherwise it will block sites from standard web behavior like
          *     - Playing media
          *     - Storing cookies on the website
        */
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"
        referrerPolicy="no-referrer"
        ref={this.setFrame}
        title="Staking"
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
