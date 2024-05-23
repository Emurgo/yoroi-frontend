// @flow
import GeneralPageLayout from '../../layout/GeneralPageLayout';
import { DelagationForm } from '../../features/gouvernace/useCases/DelagationForm/DelagationForm';
import NavBarContainerRevamp from '../../../containers/NavBarContainerRevamp';
import NavBar from '../../../components/topbar/NavBar';
import NavBarTitle from '../../../components/topbar/NavBarTitle';

type Props = {|
  stores: any,
  actions: any,
  children?: React$Node,
|};

const GouvernanceDelegationFormPage = ({ stores, actions, children }: Props): any => {
  return (
    <GeneralPageLayout
      stores={stores}
      actions={actions}
      navbar={
        <NavBarContainerRevamp
          actions={actions}
          stores={stores}
          title={<NavBarTitle title={'Governance'} />}
        />
      }
    >
      <DelagationForm />
    </GeneralPageLayout>
  );
};

export default GouvernanceDelegationFormPage;
