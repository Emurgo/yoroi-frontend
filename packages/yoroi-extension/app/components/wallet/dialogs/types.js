// @flow

export type ManageDialogsProps = {|
  openDialog(dialog: any): void,
  closeDialog(dialogId: string): void,
  isDialogOpen(dialog: any): boolean,
|};
