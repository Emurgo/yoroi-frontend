// TODO - silly implementation add more logic
export const isPrimaryToken = tokenInfo => {
  if (tokenInfo.id === '-') {
    return true;
  }
  return false;
};
