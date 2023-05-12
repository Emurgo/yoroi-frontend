// @flow
const asDialogId: string => string = (dialogId: string) => `dialog__${dialogId}`;

export function markDialogAsShown(dialogId: string): void {
  localStorage.setItem(asDialogId(dialogId), 'true');
}

export function isDialogShownBefore(dialogId: string): boolean {
  return localStorage.getItem(asDialogId(dialogId)) === 'true';
}
