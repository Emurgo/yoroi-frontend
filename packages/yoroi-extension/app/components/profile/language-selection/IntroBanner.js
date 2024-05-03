// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import styles from './IntroBanner.scss';
import { intlShape } from 'react-intl';
import { ReactComponent as NightlyLogo } from '../../../assets/images/yoroi-logo-nightly.inline.svg';
import { ReactComponent as YoroiLogo } from '../../../assets/images/yoroi-logo-blue.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { withLayout } from '../../../styles/context/layout';
import type { InjectedLayoutProps } from '../../../styles/context/layout';
import { ReactComponent as YoroiRevampLogo } from '../../../assets/images/yoroi-logo-revamp-blue.inline.svg';
import { ReactComponent as YoroiRevampNightlyLogo } from '../../../assets/images/yoroi-logo-revamp-nightly-blue.inline.svg';
import { Box, Typography } from '@mui/material';
import globalMessages from '../../../i18n/global-messages';

type Props = {|
  +isNightly: boolean,
|};

@observer
class IntroBanner extends Component<Props & InjectedLayoutProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  getLogo: void => string = () => {
    if (this.props.isNightly) return NightlyLogo;
    return YoroiLogo;
  };

  getRevampLogo: void => string = () => {
    if (this.props.isNightly) return YoroiRevampNightlyLogo;
    return YoroiRevampLogo;
  };

  render(): Node {
    const { renderLayoutComponent } = this.props;
    const { intl } = this.context;
    const Logo = this.getLogo();
    const RevampLogo = this.getRevampLogo();

    const classicLayout = (
      <div className={styles.component}>
        <span className={styles.banner}>
          <Logo />
        </span>
      </div>
    );

    const revampLayout = (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          mt: '24px',
        }}
      >
        <Box mb="24px">
          <RevampLogo />
        </Box>

        <Box textAlign="center">
          <Typography component="div" variant="h1" fontWeight={500} color="ds.primary_c600" mb="8px">
            {intl.formatMessage(globalMessages.yoroi)}
          </Typography>
          <Typography component="div" variant="body1" fontWeight={500} color="ds.primary_c600">
            {intl.formatMessage(globalMessages.yoroiIntro)}
          </Typography>
        </Box>
      </Box>
    );

    return renderLayoutComponent({
      CLASSIC: classicLayout,
      REVAMP: revampLayout,
    });
  }
}

export default (withLayout(IntroBanner): ComponentType<Props>);
