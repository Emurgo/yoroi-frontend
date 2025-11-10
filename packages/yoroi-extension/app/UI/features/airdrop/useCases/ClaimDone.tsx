import { ClaimInfo2 } from './ClaimInfo';

interface Props {
  alloc: string;
  destAddrBech32: string;
  destAddrError: string;
  walletPlate: unknown;
  walletName: string;
}

export default function ClaimDone(props: Readonly<Props>) {
  return <ClaimInfo2 {...props} />;
}
