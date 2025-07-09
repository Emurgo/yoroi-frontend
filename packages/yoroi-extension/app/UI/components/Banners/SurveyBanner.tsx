import { useStrings } from '../../common/hooks/useStrings';
import { BaseBanner } from './BaseBanner';
import { ReactComponent as SurveyIllustration } from './survey-illustration.svg';

export const SurveyBanner = (props: { onClose: () => void, }) => {
  const { surveyTitle, surveyDescription, surveyButton } = useStrings();

  const handleClick = () => {
    props.onClose();
    window.open(
      'https://emurgohelpdesk.zendesk.com/hc/en-us/articles/9634494298895-Yoroi-Wallet-Experience-Survey',
      '_blank',
      'noreferrer,noopener'
    );
  };

  return (
    <BaseBanner
      onClose={props.onClose}
      title={surveyTitle}
      description={surveyDescription}
      buttonText={surveyButton}
      buttonProps={{
        onClick: handleClick,
        //  @ts-ignore
        variant: 'primary',
        sx: {
          width: 'fit-content',
          height: '40px',
          '&.MuiButton-sizeMedium': {
            p: '9px 20px',
          },
        },
      }}
      displayIllustration
      illustration={<SurveyIllustration />}
      illustrationProps={{
        sx: {
          height: '154px',
          zIndex: 20,
          marginRight: '5px',
        },
      }}
    />
  );
};
