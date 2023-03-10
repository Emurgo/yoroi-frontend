// @flow
export const CREATE_WALLET_SETPS = Object.freeze({
    LEARN_ABOUT_RECOVERY_PHRASE: 'LEARN_ABOUT_RECOVER_PHRASE',
    SAVE_RECOVERY_PHRASE: 'SAVE_RECOVERY_PHRASE',
    VERIFY_RECOVERY_PHRASE: 'VERIFY_RECOVERY_PHRASE',
    ADD_WALLET_DETAILS: 'ADD_WALLET_DETAILS',
});

export const TIPS_DIALOGS = Object.freeze({
    LEARN_ABOUT_RECOVERY_PHRASE: 'LEARN_ABOUT_RECOVER_PHRASE',
    SAVE_RECOVERY_PHRASE: 'SAVE_RECOVERY_PHRASE',
    WALLET_NAME_AND_PASSWORD: 'WALLET_NAME_AND_PASSWORD',
})

const asDialogId: string => string = (dialogId: string) => `dialog__${dialogId}`;

export function markDialogAsShown(dialogId: string) {
    localStorage.setItem(asDialogId(dialogId), 'true');
}

export function isDialogShownBefore(dialogId: string) {
    // Todo: undo the change below
    return false;
    // return localStorage.getItem(asDialogId(dialogId)) === 'true';
}