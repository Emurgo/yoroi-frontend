// @flow //
import React from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape, FormattedMessage } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from './HintBlock.scss';

type Props = {|
  number: number,
  text: any,
  secondaryText?: ?string,
  imagePath: string,
|};

@observer
export default class HintBlock extends React.Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired
  };
  static defaultProps: {| secondaryText: ?string |}  = { secondaryText: undefined }

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
              <FormattedMessage {...text} />
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
