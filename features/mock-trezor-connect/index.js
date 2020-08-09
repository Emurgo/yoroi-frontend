// @flow

import type { DeviceEvent, KnownDevice } from 'trezor-connect/lib/types/trezor/device';
import type { UiEvent } from 'trezor-connect/lib/types/events';
import type {
  API
} from 'trezor-connect/lib/types/api';
import type {
  CardanoAddress,
  CardanoPublicKey,
  CardanoSignedTx,
  CardanoGetPublicKey,
  CardanoGetAddress,
} from 'trezor-connect/lib/types/networks/cardano';
import type { Success, } from 'trezor-connect/lib/types/params';
import { ADDRESS_TYPE } from './lib/constants/cardano';
import {
  bip32StringToPath, toDerivationPathString,
} from '../../app/api/common/lib/crypto/keys/path';
import {
  WalletTypePurpose,
  ChainDerivations,
} from '../../app/config/numbersConfig';

const UI_EVENT: 'UI_EVENT' = 'UI_EVENT';
const DEVICE_EVENT: 'DEVICE_EVENT' = 'DEVICE_EVENT';

class MockTrezorConnect {

  static deviceEventListeners: Array<DeviceEvent => void> = [];
  static uiEventListeners: Array<UiEvent => void> = [];

  static cardanoGetAddress: $PropertyType<API, 'cardanoGetAddress'> = async (params) => {
    MockTrezorConnect.mockConnectDevice();

    const genPayload = (request: CardanoGetAddress): CardanoAddress => {
      const arrayPath = typeof request.addressParameters.path === 'string'
        ? bip32StringToPath(request.addressParameters.path)
        : request.addressParameters.path;
      const serializedPath = typeof request.addressParameters.path === 'string'
        ? request.addressParameters.path
        : toDerivationPathString(request.addressParameters.path);

      const serializedStakingPath = (() => {
        const copy = [...arrayPath];
        copy[3] = ChainDerivations.CHIMERIC_ACCOUNT;
        return toDerivationPathString(copy);
      })();

      const result = arrayPath[0] === WalletTypePurpose.BIP44
        ? {
          addressParameters: {
            addressType: ADDRESS_TYPE.Byron,
            path: serializedPath,
          },
          protocolMagic: 764824073,
          networkId: 1,
          serializedStakingPath,
          serializedPath,
          address: 'Ae2tdPwUPEZAVDjkPPpwDhXMSAjH53CDmd2xMwuR9tZMAZWxLhFphrHKHXe',
        }
        : {
          addressParameters: {
            addressType: ADDRESS_TYPE.Base,
            path: serializedPath,
          },
          protocolMagic: 764824073,
          networkId: 1,
          serializedStakingPath,
          serializedPath,
          address: 'addr1qye3dmfedpm024cggelrazpjzu80a72qapuynzlrj4t40eryyw9u88yk923gz44ytfrpyymhpkydszyfv7zljtp65nfqkkpfp9',
        };

      return result;
    };

    const result = ({
      success: (true: true),
      id: 0,
      payload: params.bundle
        ? params.bundle.map(entry => genPayload(entry))
        : genPayload(params),
    }: Success<Array<CardanoAddress> | CardanoAddress>);
    return (result: Success<any>);
  };

  static cardanoGetPublicKey: $PropertyType<API, 'cardanoGetPublicKey'> = async (params) => {
    MockTrezorConnect.mockConnectDevice();

    const genPayload = (key: CardanoGetPublicKey): CardanoPublicKey => {
      const path = typeof key.path === 'string'
        ? bip32StringToPath(key.path)
        : key.path;
      const serializedPath = typeof key.path === 'string'
        ? key.path
        : toDerivationPathString(key.path);

      const rest = path[0] === WalletTypePurpose.BIP44
        ? {
          publicKey: 'd79d217e4dda6bd6ded1ae91221ab49752ae29906a2551bfb829b21187797a285a9b9c083feb3c6411779928d4264776c46065c46507f416a771ce39ecab4a9b',
          node: {
            depth: 3,
            fingerprint: 3586099367,
            child_num: 2147483648,
            chain_code: '5a9b9c083feb3c6411779928d4264776c46065c46507f416a771ce39ecab4a9b',
            private_key: null,
            public_key: 'd79d217e4dda6bd6ded1ae91221ab49752ae29906a2551bfb829b21187797a28'
          }
        }
        : {
          publicKey: '791e4af898d3a21ba35c19721466ce0df532d67736f75f9b86070d5c868e9dc9c29f93a6d869a3047343725e11473a49715b4a2a82e2d2882c42a0a59b1eb373',
          node: {
            depth: 3,
            fingerprint: 786977236,
            child_num: 2147483648,
            chain_code: 'c29f93a6d869a3047343725e11473a49715b4a2a82e2d2882c42a0a59b1eb373',
            private_key: null,
            public_key: '791e4af898d3a21ba35c19721466ce0df532d67736f75f9b86070d5c868e9dc9'
          }
        };

      return {
        path,
        serializedPath,
        ...rest,
      };
    };
    const result = ({
      success: (true: true),
      id: 0,
      payload: params.bundle
        ? params.bundle.map(entry => genPayload(entry))
        : genPayload(params),
    }: Success<Array<CardanoPublicKey> | CardanoPublicKey>);
    return (result: Success<any>);
  };

  static cardanoSignTransaction: $PropertyType<API, 'cardanoSignTransaction'> = async (_params) => {
    MockTrezorConnect.mockConnectDevice();
    const result = ({
      success: (true: true),
      id: 0,
      payload: {
        // note: this is the same bip44 tx for bip44 and cip1852
        // should be an if/else in the future
        hash: '36cc16cef021460f142589839c29e88f9c42ae2bd346e25d4d9d15dd195d942c',
        serializedTx: '83a40083825820058405892f66075d83abd1b7fe341d2d5bfd2f6122b2f874700039e5078e0dd5018258203677e75c7ba699bfdc6cd57d42f246f86f69aefd76025006ac78313fad2bba20018258201029eef5bb0f06979ab0b9530a62bac11e180797d08cab980fe39389d42b365700018182582b82d818582183581c891ac9abaac999b097c81ea3c0450b0fbb693d0bd232bebc0f4a391fa0001af2ff7e211a005620dd021a0002ae89031a000641a5a1028384582073fea80d424276ad0978d4fe5310e8bc2d485f5f6bb3bf87612989f112ad5a7d5840c8b042a7af2de6f10c991de1fc7ce42e437550bb810482028eb188d5f4470bd43d540b8a2e9e9bf2207ad674c6bbaf82fece10f3641f9b3b58551f2b06847d055820dd75e154da417becec55cdd249327454138f082110297d5e87ab25e15fad150f41a0845820f626ab887eb5f40b502463ccf2ec5a7311676ee9e5d55c492059a366c0b4d4a15840674080739c7e4f097ab0133bd341adafe5d51e141da68afb3d396654f6c5b10c75a5f709e843d4c80e0dfc1195956c52e38c8128150daefb5b306b605c1159075820f7ab126f2884db9059fa09ca83be6b8bd0250426aeb62191bdd9861457b8bc9141a084582086e8a3880767e1ed521a47de1e031d47f33d5a8095be467bffbbd3295e27258e5840fa27413636aaf44834348a56cbf469851dbb183440f13e162e3297cb3d0505479ac922e2cae8c368c276d03427b59b004227666b927600f5eae87a3536ee660d5820580bba4bb0b9c56974e16a6998322a91e857e2fac28674404da993f6197fd29f41a0f6',
      },
    }: Success<CardanoSignedTx>);
    return result;
  };

  static manifest: $PropertyType<API, 'manifest'> = (_data) => {
  }

  static init: $PropertyType<API, 'init'> = async (_settings) => {
  }
  static dispose: $PropertyType<API, 'dispose'> = (): void => {
  }

  static on: $PropertyType<API, 'on'> = (type, fn): void => {
    if (type === DEVICE_EVENT) {
      this.deviceEventListeners.push((fn: any));
    }
    if (type === UI_EVENT) {
      this.uiEventListeners.push((fn: any));
    }
  }

  static off: $PropertyType<API, 'off'> = (type, fn): void => {
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
      payload: ({
        type: 'acquired',
        id: null,
        path: '5',
        label: 'My Trezor',
        state: '6dac00bf532594194beaf682e5fc5659ffcf131466455cd9fb4e964a3a47c983',
        status: 'available',
        mode: 'normal',
        firmware: 'valid',
        firmwareRelease: undefined,
        unavailableCapabilities: {},
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
      }: KnownDevice)
    }));
  }
}

export default MockTrezorConnect;

export { UI_EVENT, DEVICE_EVENT, };
