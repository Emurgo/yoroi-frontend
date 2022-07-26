// @flow //
import type {
  TransportIdType,
  DeviceCodeType
} from './enum';

export type setTransportFunc = TransportIdType => void;
export type setLocaleFunc = string => void;
export type setDeviceCodeFunc = DeviceCodeType => void;
export type executeActionFunc = DeviceCodeType => void;
