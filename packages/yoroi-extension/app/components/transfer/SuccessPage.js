// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import styles from './SuccessPage.scss';
import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';
import LoadingSpinner from '../widgets/LoadingSpinner';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Typography } from '@mui/material';

type Props = {|
  +title: string,
  +text: string,
  +closeInfo?: {|
    +onClose: void => PossiblyAsync<void>,
    +closeLabel: string,
  |},
|};

@observer
export default class SuccessPage extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  static defaultProps: {|closeInfo: void|} = {
    closeInfo: undefined
  };

  render(): Node {
    const { title, text } = this.props;

    const actions = this.props.closeInfo == null
      ? undefined
      : [{
        label: this.props.closeInfo.closeLabel,
        onClick: this.props.closeInfo.onClose,
        primary: true
      }];

    return (
      <Dialog
        title=""
        dialogActions={actions}
        closeOnOverlayClick={false}
        onClose={this.props.closeInfo ? this.props.closeInfo.onClose : undefined}
        className={styles.dialog}
        closeButton={this.props.closeInfo ? <DialogCloseButton /> : undefined}
      >
        <div className={styles.component}>
          <div>
            <div className={styles.successImg} />
            <Typography component="div"
              variant="body1"
              color="primary"
              textAlign="center"
              mt="16px"
              fontWeight={500}
            >
              {title}
            </Typography>
            <Typography component="div"
              variant="body2"
              color="gray.900"
              textAlign="center"
              mt="4px"
            >
              {text}
            </Typography>
            {this.props.closeInfo == null && (
              <div className={styles.spinnerSection}>
                <LoadingSpinner />
              </div>
            )}
          </div>
        </div>
      </Dialog>
    );
  }
}
