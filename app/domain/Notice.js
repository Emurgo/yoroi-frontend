// @flow
import type { CertificateKindType } from '@emurgo/js-chain-libs/js_chain_libs';

export default class Notice {
  id: string = '';
  kind: CertificateKindType;
  date: Date

  constructor(data: {
    id: string,
    kind: CertificateKindType,
    date: Date,
  }) {
    Object.assign(this, data);
  }
}
