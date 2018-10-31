// @flow
export type WalletType = 'CWTWeb' | 'CWTHardwareBacked';

export type HardwareWalletVendorInfo = {
    vendor : string,
    model: string,
    deviceId: string,
    lable: string,
    majorVersion: string,
    minorVersion: string,
    patchVersion: string,
    language: string
};

export type WalletTypeInfo = {
    type: WalletType,
    vendorInfo: ?HardwareWalletVendorInfo
};