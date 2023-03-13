// @flow
const asDialogId: string => string = (dialogId: string) => `dialog__${dialogId}`;

export function markDialogAsShown(dialogId: string) {
  localStorage.setItem(asDialogId(dialogId), 'true');
}

export function isDialogShownBefore(dialogId: string) {
  return localStorage.getItem(asDialogId(dialogId)) === 'true';
}
