import CatalystRegistrationLayout from './layout';
import CatalystRegistration from '../../features/catalyst-registration/useCases/CatalystRegistration';
import InsufficientFunds from '../../features/catalyst-registration/useCases/InsufficientFunds';
import { useVoting } from '../../features/catalyst-registration/common/hooks/useVoting';

type Props = {
  stores: any;
};

const CatalystRegistrationPage = (props: Props) => {
  const { cantRegister } = useVoting();
  return (
    <CatalystRegistrationLayout {...props}>
      {cantRegister ? <InsufficientFunds /> : <CatalystRegistration />}
    </CatalystRegistrationLayout>
  );
};

export default CatalystRegistrationPage;
