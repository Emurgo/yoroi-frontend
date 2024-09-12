// TODO - silly implementation add more logic
export const isPrimaryToken = tokenInfo => {
  if (tokenInfo.id.length === 0) {
    return true;
  }
  return false;
};
