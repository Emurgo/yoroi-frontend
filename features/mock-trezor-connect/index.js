// @flow

import type {
  CardanoGetAddress,
  CardanoGetPublicKey,
  CardanoSignTransaction,
  EventListener,
  Settings,
  DeviceMessage, UiMessage,
} from 'trezor-connect/lib/types';
import type {
  CardanoGetAddress$,
  CardanoGetPublicKey$,
  CardanoSignTransaction$,
} from 'trezor-connect/lib/types/cardano';

const UI_EVENT: 'UI_EVENT' = 'UI_EVENT';
const DEVICE_EVENT: 'DEVICE_EVENT' = 'DEVICE_EVENT';

class MockTrezorConnect {

  static deviceEventListeners: Array<DeviceMessage => void> = [];
  static uiEventListeners: Array<UiMessage => void> = [];

  static cardanoGetAddress: CardanoGetAddress = async (_params) => {
    MockTrezorConnect.mockConnectDevice();
    const result = ({
      success: (true: true),
      payload: {
        path: [2147483692, 2147485463, 2147483648, 0, 8],
        serializedPath: `m/44'/1815'/0'/0/8`,
        address: 'Ae2tdPwUPEZAVDjkPPpwDhXMSAjH53CDmd2xMwuR9tZMAZWxLhFphrHKHXe',
      },
    }: CardanoGetAddress$);
    return (result: any);
  };

  static cardanoGetPublicKey: CardanoGetPublicKey = async (_params) => {
    MockTrezorConnect.mockConnectDevice();
    const result = ({
      success: (true: true),
      payload: {
        path: [2147483692, 2147485463, 2147483648],
        serializedPath: `m/44'/1815'/0'`,
        publicKey: 'd79d217e4dda6bd6ded1ae91221ab49752ae29906a2551bfb829b21187797a285a9b9c083feb3c6411779928d4264776c46065c46507f416a771ce39ecab4a9b',
        node: {
          depth: 3,
          fingerprint: 3586099367,
          child_num: 2147483648,
          chain_code: '5a9b9c083feb3c6411779928d4264776c46065c46507f416a771ce39ecab4a9b',
          private_key: null,
          public_key: 'd79d217e4dda6bd6ded1ae91221ab49752ae29906a2551bfb829b21187797a28'
        }
      },
    }: CardanoGetPublicKey$);
    return (result: any);
  };

  static cardanoSignTransaction: CardanoSignTransaction = async (_params) => {
    MockTrezorConnect.mockConnectDevice();
    const result = ({
      success: (true: true),
      payload: {
        hash: '969a4a0f5753e726405eb1883bf9cf755faec84308bca600a70f97315ee2a10b',
        body: '82839f8200d8185824825820058405892f66075d83abd1b7fe341d2d5bfd2f6122b2f874700039e5078e0dd5018200d81858248258203677e75c7ba699bfdc6cd57d42f246f86f69aefd76025006ac78313fad2bba20018200d81858248258201029eef5bb0f06979ab0b9530a62bac11e180797d08cab980fe39389d42b365700ff9f8282d818582183581c891ac9abaac999b097c81ea3c0450b0fbb693d0bd232bebc0f4a391fa0001af2ff7e211a004e7f41ffa0838200d81858858258406e270ca44caaad7e2e4ec8c61e246f94c822d869c939c0b18894d129db8519567d65825edc57e2c6da24312e09c3305266acdfb18609de937eda9cc1cb2d14265840c9209de12ec1aa608571ed3902974b01d3ef1b5d781cd750c27da2bd6451589b735d2fbb58a6ef011e1a97841e2035d63110dd03cbe362a2f0f00da7367bf0058200d8185885825840fcecc9147c4f94c2850d6f441719983d55603d5cee81011e24a8bc1ba679dd2035792712c2caabe905db7495ef847decd2d6720767f4953dbb5a16e81d35b10d58408142ee83e227e67daaeb624fa835e44f12c4d52879f84de7ea9d9e388d9625d5193dfa944d4b942cc464ba2b7a0c35734b9096eaff250231894f2697e6c8c9008200d8185885825840ef6876bb0c32bae4ef4e676d51b9156657a2e0b3901f14f151e300c88abbe15bdbaf8579574f8937610077cadeac6b1441503178abe476ae2c56b3afb0267d6a584098cedb0f6143daad1b4486d07c214236bd34c3f16181cdd3fc569d8754ee84689fa356739bf2fa5eaa6dbe9ca025981d83d97dd085730911e793517378951709',
      },
    }: CardanoSignTransaction$);
    return (result: any);
  };

  static manifest = (_data: Object): void => {
  }

  static init = async (_settings: Settings): Promise<void> => {
  }

  static dispose = (): void => {
  }

  static on: EventListener = (type, fn): void => {
    if (type === DEVICE_EVENT) {
      this.deviceEventListeners.push((fn: any));
    }
    if (type === UI_EVENT) {
      this.uiEventListeners.push((fn: any));
    }
  }

  static off: EventListener = (type, fn): void => {
    if (type === DEVICE_EVENT) {
      this.deviceEventListeners = this.deviceEventListeners.filter(event => event !== fn);
    }
    if (type === UI_EVENT) {
      this.uiEventListeners = this.uiEventListeners.filter(event => event !== fn);
    }
  }

  static mockConnectDevice: void => void = () => {
    this.deviceEventListeners.forEach(func => func({
      event: DEVICE_EVENT,
      type: 'device-changed',
      payload: {
        type: 'acquired',
        path: '5',
        label: 'My Trezor',
        state: '6dac00bf532594194beaf682e5fc5659ffcf131466455cd9fb4e964a3a47c983',
        status: 'available',
        mode: 'normal',
        firmware: 'valid',
        firmwareRelease: undefined,
        features: {
          vendor: 'trezor.io',
          major_version: 2,
          minor_version: 3,
          patch_version: 0,
          bootloader_mode: (null: any),
          device_id: '6495958994A4025BB5EE1DB0',
          pin_protection: false,
          passphrase_protection: false,
          language: 'en-US',
          label: (null: any),
          initialized: true,
          revision: '306237613834343966',
          bootloader_hash: (null: any),
          imported: (null: any),
          pin_cached: false,
          passphrase_cached: (null: any),
          firmware_present: (null: any),
          needs_backup: false,
          flags: 0,
          model: 'T',
          fw_major: (null: any),
          fw_minor: (null: any),
          fw_patch: (null: any),
          fw_vendor: (null: any),
          fw_vendor_keys: (null: any),
          unfinished_backup: false,
          no_backup: false
        }
      }
    }));
  }
}

export default MockTrezorConnect;

export { UI_EVENT, DEVICE_EVENT, };
