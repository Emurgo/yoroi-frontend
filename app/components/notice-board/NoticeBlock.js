// @flow
import React, { Component } from 'react';
import { intlShape, defineMessages } from 'react-intl';

import styles from './NoticeBlock.scss';
import Notice from '../../domain/Notice';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import AdaSymbol from '../../assets/images/ada-symbol.inline.svg';

const messages = defineMessages({
  titleStakeDelegation: {
    id: 'noticeBoard.notice.stakeDelegation.title',
    defaultMessage: '!!!TBD',
  },
  fullMessageStakeDelegation: {
    id: 'noticeBoard.notice.stakeDelegation.fullMessage',
    defaultMessage: '!!!TBD',
  },
  titleOwnerStakeDelegation: {
    id: 'noticeBoard.notice.ownerStakeDelegation.title',
    defaultMessage: '!!!TBD',
  },
  fullMessageOwnerStakeDelegation: {
    id: 'noticeBoard.notice.ownerStakeDelegation.fullMessage',
    defaultMessage: '!!!TBD',
  },
  titlePoolRegistration: {
    id: 'noticeBoard.notice.poolRegistration.title',
    defaultMessage: '!!!TBD',
  },
  fullMessagePoolRegistration: {
    id: 'noticeBoard.notice.poolRegistration.fullMessage',
    defaultMessage: '!!!TBD',
  },
  titlePoolRetirement: {
    id: 'noticeBoard.notice.poolRetirement.title',
    defaultMessage: '!!!TBD',
  },
  fullMessagePoolRetirement: {
    id: 'noticeBoard.notice.poolRetirement.fullMessage',
    defaultMessage: '!!!TBD',
  },
  titlePoolUpdate: {
    id: 'noticeBoard.notice.poolUpdate.title',
    defaultMessage: '!!!TBD',
  },
  fullMessagePoolUpdate: {
    id: 'noticeBoard.notice.poolUpdate.fullMessage',
    defaultMessage: '!!!TBD',
  },
});

type Props = {|
  +notice: Notice
|};

export default class NoticeBlock extends Component<Props> {
  static contextTypes = { intl: intlShape.isRequired };

  render() {
    const { intl } = this.context;
    const { notice } = this.props;
    let icon = (<span><AdaSymbol /></span>);
    let title;
    let fullMessage;
    let date;
    switch (notice.kind) {
      case RustModule.WalletV3.CertificateKind.StakeDelegation:
        title = intl.formatMessage(messages.titleStakeDelegation);
        fullMessage = intl.formatMessage(messages.fullMessageStakeDelegation);
        break;
      case RustModule.WalletV3.CertificateKind.OwnerStakeDelegation:
        title = intl.formatMessage(messages.titleOwnerStakeDelegation);
        fullMessage = intl.formatMessage(messages.fullMessageOwnerStakeDelegation);
        break;
      case RustModule.WalletV3.CertificateKind.PoolRegistration:
        title = intl.formatMessage(messages.titlePoolRegistration);
        fullMessage = intl.formatMessage(messages.fullMessagePoolRegistration);
        break;
      case RustModule.WalletV3.CertificateKind.PoolRetirement:
        title = intl.formatMessage(messages.titlePoolRetirement);
        fullMessage = intl.formatMessage(messages.fullMessagePoolRetirement);
        break;
      case RustModule.WalletV3.CertificateKind.PoolUpdate:
        title = intl.formatMessage(messages.titlePoolUpdate);
        fullMessage = intl.formatMessage(messages.fullMessagePoolUpdate);
        break;
      default:
        return (null);
    }
    return (
      <div className={styles.component}>
        <div className={styles.wrap}>
          <div className={styles.iconBlock}>{icon}</div>
          <div className={styles.textBlock}>
            <div className={styles.primary}>
              <div className={styles.title}>{title}</div>
              <div className={styles.date}>
                date
              </div>
            </div>
            <div className={styles.secondary}>{fullMessage}</div>
          </div>
        </div>
        <div className={styles.line} />
      </div>
    );
  }
}
