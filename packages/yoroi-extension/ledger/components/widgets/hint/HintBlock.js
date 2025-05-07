// @flow //
import React from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { IntlContext, FormattedMessage } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from './HintBlock.scss';
import { strong } from '../../../../app/i18n/htmlEmbeddedMessageHelper';

type Props = {|
  number: number,
  text: any,
  secondaryText?: ?string,
  imagePath: string,
|};

@observer
export default class HintBlock extends React.Component<Props> {
  static contextType:any = IntlContext;

  render(): Node {
    const {
      number,
      text,
      secondaryText,
      imagePath,
    } = this.props;

    return (
      <div className={styles.component}>
        <div className={styles.imageBlock}>
          <img
            className={styles.image}
            src={imagePath}
            alt="HintImage"
          />
        </div>
        <div className={styles.infoBlock}>
          <div className={styles.counterBlock}>
            <div className={styles.counter}>
              {number}
            </div>
          </div>
          <div className={styles.textBlock}>
            <div className={styles.primaryText}>
              <FormattedMessage {...text}  values={{ strong }}/>
            </div>
            {secondaryText != null && (
              <div className={styles.secondaryText}>
                {secondaryText}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
