// @flow
import { Component } from 'react';
import type { Node } from 'react'
import styles from './SendFormHeader.scss'
import classnames from 'classnames'
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { defineMessages, intlShape } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';

type Props = {|
    step: number,
    onUpdateStep: number => void
|}

const messages = defineMessages({
  receiver: {
    id: 'wallet.send.form.receiver.label',
    defaultMessage: '!!!Receiver',
  },
  preview: {
    id: 'wallet.send.form.preview.label',
    defaultMessage: '!!!Preview',
  }
})

const TABS = [
    {
        title: messages.receiver,
        step: 1,
    },
    {
        title: globalMessages.amount,
        step: 2,
    },
    {
        title: messages.preview,
        step: 3,
    }
]

@observer
export default class SendFormHeader extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };
  getBarClassnames: (tabStep: number, currentStep: number) => string = (
    tabStep, currentStep
    ) => {
    if (tabStep === currentStep ) return styles.halfBar
    if (tabStep < currentStep) return styles.fullBar
    return styles.noBar
  }

  render(): Node {
    const { intl } = this.context;
    const { step: currentStep, onUpdateStep } = this.props

    return (
      <div className={styles.component}>
        <ul className={styles.header}>
          {TABS.map(tab => (
            <button
              type='button'
              key={tab.step}
              onClick={() => (tab.step < currentStep) && onUpdateStep(tab.step)}
            >
              <p className={
                classnames(
                  [styles.tab, currentStep === tab.step ? styles.tabActive : styles.tabInActive ]
                )
              }
              >
                {intl.formatMessage(tab.title)}
              </p>
              <div className={this.getBarClassnames(tab.step, currentStep)}>
                <span className={styles.right} />
                <span className={styles.dot} />
                <span className={styles.left} />
              </div>
            </button>
            ))
          }
        </ul>
      </div>
    )
  }
}