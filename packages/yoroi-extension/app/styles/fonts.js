// @flow
import RobotoMonoLightTtf from '../assets/fonts/RobotoMono-Light.ttf';
import RobotoMonoRegularTtf from '../assets/fonts/RobotoMono-Regular.ttf';
import RobotoMonoMediumTtf from '../assets/fonts/RobotoMono-Medium.ttf';
import RobotoMonoBoldTtf from '../assets/fonts/RobotoMono-Bold.ttf';

import RubikLightTtf from '../assets/fonts/Rubik-Light.ttf';
import RubikRegularTtf from '../assets/fonts/Rubik-Regular.ttf';
import RubikMediumTtf from '../assets/fonts/Rubik-Medium.ttf';
import RubikBoldTtf from '../assets/fonts/Rubik-Bold.ttf';

import SFUIDisplayLightTtf from '../assets/fonts/SFUIDisplay-Light.woff';
import SFUIDisplayRegularTtf from '../assets/fonts/SFUIDisplay-Regular.woff';
import SFUIDisplayMediumTtf from '../assets/fonts/SFUIDisplay-Medium.woff';
import SFUIDisplayBoldTtf from '../assets/fonts/SFUIDisplay-Bold.woff';

const RobotoMonoFonts = `
  @font-face {
    font-family: 'RobotoMono';
    font-style: normal;
    font-display: swap;
    font-weight: 300;
    src: local('RobotoMono'), local('RobotoMono-Light'), url(${RobotoMonoLightTtf}) format('truetype');
  }
  @font-face {
    font-family: 'RobotoMono';
    font-style: normal;
    font-display: swap;
    font-weight: 400;
    src: local('RobotoMono'), local('RobotoMono-Regular'), url(${RobotoMonoRegularTtf}) format('truetype');
  }
  @font-face {
    font-family: 'RobotoMono';
    font-style: normal;
    font-display: swap;
    font-weight: 500;
    src: local('RobotoMono'), local('RobotoMono-Medium'), url(${RobotoMonoMediumTtf}) format('truetype');
  }
  @font-face {
    font-family: 'RobotoMono';
    font-style: normal;
    font-display: swap;
    font-weight: 700;
    src: local('RobotoMono'), local('RobotoMono-Bold'), url(${RobotoMonoBoldTtf}) format('truetype');
  }
`;

const RubikFonts = `
  @font-face {
    font-family: 'Rubik';
    font-style: normal;
    font-display: swap;
    font-weight: 300;
    src: local('Rubik'), local('Rubik-Light'), url(${RubikLightTtf}) format('truetype');
  }
  @font-face {
    font-family: 'Rubik';
    font-style: normal;
    font-display: swap;
    font-weight: 400;
    src: local('Rubik'), local('Rubik-Regular'), url(${RubikRegularTtf}) format('truetype');
  }
  @font-face {
    font-family: 'Rubik';
    font-style: normal;
    font-display: swap;
    font-weight: 500;
    src: local('Rubik'), local('Rubik-Medium'), url(${RubikMediumTtf}) format('truetype');
  }
  @font-face {
    font-family: 'Rubik';
    font-style: normal;
    font-display: swap;
    font-weight: 700;
    src: local('Rubik'), local('Rubik-Bold'), url(${RubikBoldTtf}) format('truetype');
  }
`;

const SFUIDisplayFonts = `
  @font-face {
    font-family: 'SFUIDisplay';
    font-style: normal;
    font-display: swap;
    font-weight: 300;
    src: local('SFUIDisplay'), local('SFUIDisplay-Light'), url(${SFUIDisplayLightTtf}) format('woff');
  }
  @font-face {
    font-family: 'SFUIDisplay';
    font-style: normal;
    font-display: swap;
    font-weight: 400;
    src: local('SFUIDisplay'), local('SFUIDisplay-Regular'), url(${SFUIDisplayRegularTtf}) format('woff');
  }
  @font-face {
    font-family: 'SFUIDisplay';
    font-style: normal;
    font-display: swap;
    font-weight: 500;
    src: local('SFUIDisplay'), local('SFUIDisplay-Medium'), url(${SFUIDisplayMediumTtf}) format('woff');
  }
  @font-face {
    font-family: 'SFUIDisplay';
    font-style: normal;
    font-display: swap;
    font-weight: 700;
    src: local('SFUIDisplay'), local('SFUIDisplay-Bold'), url(${SFUIDisplayBoldTtf}) format('woff');
  }
`;
export { RobotoMonoFonts, RubikFonts, SFUIDisplayFonts };
