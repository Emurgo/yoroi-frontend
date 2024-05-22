import { useModal } from '../../context/ModalContext';
import { ChooseDRepModal } from '../../features/gouvernace/common/ChooseDRepModal';

const ModalLookup = {
  ChooseDRepModal: ChooseDRepModal,
};

const ModalManager = () => {
  const { modal, closeModal } = useModal();

  if (!modal) return null;
  const Modal = ModalLookup[modal.name];

  return <Modal onClose={closeModal} {...modal.props} />;
};

export default ModalManager;
