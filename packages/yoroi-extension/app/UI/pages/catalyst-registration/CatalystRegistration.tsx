import CatalystRegistrationLayout from './layout';
import CatalystRegistration from '../../features/catalyst-registration/useCases/CatalystRegistration';

type Props = {
  stores: any;
};

const CatalystRegistrationPage = (props: Props) => {
  return (
    <CatalystRegistrationLayout {...props}>
      <CatalystRegistration />
    </CatalystRegistrationLayout>
  );
};

export default CatalystRegistrationPage;
