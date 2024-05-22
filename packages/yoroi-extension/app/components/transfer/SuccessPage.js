// @flow
import type { ComponentType, Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import styles from './SuccessPage.scss';
import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';
import LoadingSpinner from '../widgets/LoadingSpinner';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Typography } from '@mui/material';
import { withLayout } from '../../styles/context/layout';
import type { InjectedLayoutProps } from '../../styles/context/layout';

type Props = {|
  +title: string,
  +text: string,
  +classicTheme: boolean,
  +closeInfo?: {|
    +onClose: void => PossiblyAsync<void>,
    +closeLabel: string,
  |},
|};

@observer
class SuccessPage extends Component<Props & InjectedLayoutProps> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  static defaultProps: {|closeInfo: void|} = {
    closeInfo: undefined
  };

  render(): Node {
    const { title, text, isRevampLayout } = this.props;

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
        actions={actions}
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
              color={isRevampLayout ? 'primary' : 'secondary.300'}
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

export default (withLayout(SuccessPage): ComponentType<Props>);