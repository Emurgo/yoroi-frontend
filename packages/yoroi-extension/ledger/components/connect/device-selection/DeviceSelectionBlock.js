// @flow //
import React from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages, FormattedHTMLMessage } from 'react-intl';

import type {
  DeviceCodeType,
  OperationNameType
} from '../../../types/enum';
import { DEVICE_CODE } from '../../../types/enum';
import type {
  executeActionFunc,
  setDeviceCodeFunc,
} from '../../../types/func';
import { getTutorialLink } from '../../../utils/cmn';
import imgExternalLink from '../../../assets/img/external-link.svg';

import styles from './DeviceSelectionBlock.scss';

const message = defineMessages({
  deviceNanos: {
    id: 'wallet.title.ledgerNanoS',
    defaultMessage: '!!!Ledger Nano S'
  },
  deviceNanox: {
    id: 'wallet.title.ledgerNanoX',
    defaultMessage: '!!!Ledger Nano X'
  },
  chooseDevice: {
    id: 'deviceSelection.chooseDevice',
    defaultMessage: '!!!Choose your device'
  },
  videoLinkPart1: {
    id: 'deviceSelection.videoLink.part1',
    defaultMessage: '!!!You can also check video instruction for '
  },
  videoLinkPart2: {
    id: 'deviceSelection.videoLink.part2',
    defaultMessage: '!!! or '
  },
  videoLinkPart3: {
    id: 'deviceSelection.videoLink.part3',
    defaultMessage: '!!! .'
  },
  knownInfo1: {
    id: 'deviceKnown.info.connectToComputer',
    defaultMessage: '!!!Make sure your <strong>{deviceName}<strong> is connected to your computer.'
  },
  knownInfo2: {
    id: 'deviceKnown.info.doNotDisconnect',
    defaultMessage: '!!!Do not disconnect it until all operations are complete.'
  },
  knownInfo3: {
    id: 'deviceKnown.info.pressContinue',
    defaultMessage: '!!!Press the <strong>Continue</strong> button below when ready.'
  },
  knownContinueButtonText: {
    id: 'button.continue.text',
    defaultMessage: '!!!Continue'
  },
  knownChoseWrongDevice: {
    id: 'deviceKnown.choseWrongDevice',
    defaultMessage: '!!!Chose the wrong device model?'
  },
  knownChoseWrongDeviceClickHere: {
    id: 'deviceKnown.choseWrongDevice.clickHere',
    defaultMessage: '!!!Click here'
  },
});

type Props = {|
  currentOperationName: OperationNameType,
  executeAction: executeActionFunc,
  knownDeviceCode: DeviceCodeType,
  setDeviceCode: setDeviceCodeFunc,
|};

@observer
export default class DeviceSelectionBlock extends React.Component<Props> {
  static contextTypes = { intl: intlShape.isRequired };

  onExecuteActionClicked = (deviceCode: DeviceCodeType): void => {
    this.props.executeAction(deviceCode);
  };

  onDeviceSelectionClicked = (): void => {
    this.props.setDeviceCode(DEVICE_CODE.NONE);
  }

  render() {
    const { intl } = this.context;
    const {
      knownDeviceCode,
      currentOperationName,
    } = this.props;

    let middleComp;
    switch (knownDeviceCode) {
      case DEVICE_CODE.NONE:
        middleComp = (
          <div className={styles.deviceSelection}>
            <div className={styles.title}>
              {intl.formatMessage(message.chooseDevice)}
            </div>
            <button
              className={styles.button}
              type="button"
              onClick={this.onExecuteActionClicked.bind(this, DEVICE_CODE.NANO_S)}
            >
              <div className={styles.text}>
                {intl.formatMessage(message.deviceNanos)}
              </div>
            </button>
            <button
              className={styles.button}
              type="button"
              onClick={this.onExecuteActionClicked.bind(this, DEVICE_CODE.NANO_X)}
            >
              <div className={styles.text}>
                {intl.formatMessage(message.deviceNanox)}
              </div>
            </button>
          </div>
        );
        break;
      case DEVICE_CODE.NANO_S:
      case DEVICE_CODE.NANO_X:
        {
          const deviceName = intl.formatMessage(message[`deviceNano${knownDeviceCode}`]);
          middleComp = (
            <div className={styles.deviceKnown}>
              <div className={styles.knowInfoBlock}>
                <div className={styles.knownInfoText}>
                  <FormattedHTMLMessage {...message.knownInfo1} values={{ deviceName }} />
                </div>
                <div className={styles.knownInfoText}>
                  {intl.formatMessage(message.knownInfo2)}
                </div>
                <div className={styles.knownInfoText}>
                  <FormattedHTMLMessage {...message.knownInfo3} />
                </div>
              </div>
              <div className={styles.continueButtonBlock}>
                <button
                  className={styles.button}
                  type="button"
                  onClick={this.onExecuteActionClicked.bind(this, knownDeviceCode)}
                >
                  <div className={styles.text}>
                    {intl.formatMessage(message.knownContinueButtonText)}
                  </div>
                </button>
              </div>
              <div className={styles.knownChoseWrongBlock}>
                <span className={styles.knownChoseWrongText}>
                  {intl.formatMessage(message.knownChoseWrongDevice)}
                </span>
                <button
                  className={styles.linkClickHere}
                  type="button"
                  onClick={this.onDeviceSelectionClicked.bind(this)}
                >
                  {intl.formatMessage(message.knownChoseWrongDeviceClickHere)}
                </button>
              </div>
            </div>
          );
        }
        break;
      default:
        console.error(`[YLC] Unexpected device type: ${knownDeviceCode}`);
        return (null);
    }

    return (
      <div className={styles.component}>
        {middleComp}
        <div className={styles.videoLink}>
          <span className={styles.videoLinkText}>
            {intl.formatMessage(message.videoLinkPart1)}
          </span>
          <a
            href={getTutorialLink(DEVICE_CODE.NANO_S, currentOperationName)}
            className={styles.link}
            rel="noopener noreferrer"
            target="_blank"
          >
            {intl.formatMessage(message.deviceNanos)}
          </a>
          <img
            className={styles.linkIcon}
            src={imgExternalLink}
            alt="External Link"
          />
          <span className={styles.videoLinkText}>
            {intl.formatMessage(message.videoLinkPart2)}
          </span>
          <a
            href={getTutorialLink(DEVICE_CODE.NANO_X, currentOperationName)}
            className={styles.link}
            rel="noopener noreferrer"
            target="_blank"
          >
            {intl.formatMessage(message.deviceNanox)}
          </a>
          <img
            className={styles.linkIcon}
            src={imgExternalLink}
            alt="External Link"
          />
          <span className={styles.videoLinkText}>
            {intl.formatMessage(message.videoLinkPart3)}
          </span>
        </div>
      </div>
    );
  }
}
