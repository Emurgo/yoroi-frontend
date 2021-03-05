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
  +totalAda: ?number,
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
    if (this.iframe == null) return;
    /**
     * We want to ignore messages that come from any source that is not our pool selection iframe
     * Usually, this would be done by doing something like
     * event.origin !== our-iframe-url-here
     * However, you cannot access event.origin unless you set allow-same-origin for the iframe
     * But we don't want to treat the iframe as same-origin as a safety precaution.
     *
     * Therefore, instead, we check the source of the origin is the same window as our iframe
     *
     * For more information, see https://www.html5rocks.com/en/tutorials/security/sandboxed-iframes/
     */
    if (!(
      event.origin === 'null' && /* message from a different origin implies event.origin is "null" */
      event.source === this.iframe.contentWindow /* check it belongs to our iframe */
    )) {
      return;
    }
    const response = JSON.parse(decodeURI(event.data));
    if (!Array.isArray(response)) {
      throw new Error(`${nameof(SeizaFetcher)} Server response is not an array`);
    }
    const pool = response[0];
    if (typeof pool !== 'string') {
      throw new Error(`${nameof(SeizaFetcher)} Server response is not a string`);
    }
    const poolId: string = pool;
    if (poolId.length !== 56) {
      throw new Error(`${nameof(SeizaFetcher)} Server response has incorrect pool length. Expected 56, got ${poolId.length}`);
    }

    await this.props.stakepoolSelectedAction(pool);
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
    const { urlTemplate, locale, totalAda } = this.props;

    if (urlTemplate == null) {
      throw new Error('Staking undefined POOLS_UI_URL_FOR_YOROI should never happen');
    }

    const stakingUrl = this._prepareStakingURL(urlTemplate, locale, totalAda);
    if (stakingUrl == null) {
      return (
        <VerticallyCenteredLayout>
          <LoadingSpinner />
        </VerticallyCenteredLayout>
      );
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
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
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
    if (environment.userAgentInfo.isExtension()) {
      if (environment.userAgentInfo.isFirefox()) {
        return 'firefox&mozId=' + location.hostname;
      }
      // otherwise assume Chrome
      // $FlowFixMe[cannot-resolve-name]
      return 'chrome&chromeId=' + chrome.runtime.id;
    }

    // 2) Handle Yoroi running as a website
    if (environment.userAgentInfo.isFirefox()) {
      return 'firefox&host' + location.host;
    }
    // otherwise assume Chrome
    return 'chrome&chromeId=' + location.host;
  }

  _prepareStakingURL(urlTemplate: string, locale: string, totalAda: ?number): null | string {
    let finalURL = urlTemplate
      .replace(
        '$$BROWSER$$',
        this._getBrowserReplacement()
      );

    // TODO: adds locale when adapools supports it
    const lang = locale == null ? 'en' : locale.slice(0, 2);
    finalURL += `&lang=${lang}`;

    finalURL += `&delegated=${encodeURIComponent(JSON.stringify(this.props.poolList))}`;

    finalURL += totalAda == null ? '' : `&totalAda=${totalAda}`;

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
