const HIDDEN_AMOUNT = '****** ';

export const HiddenAmount = ({ isHidden = false, children }) => {
  if (isHidden) {
    return HIDDEN_AMOUNT;
  }

  return children || null;
};
