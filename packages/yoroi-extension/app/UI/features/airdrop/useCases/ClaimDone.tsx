import { ClaimInfo2 } from './ClaimInfo';

interface Props {
  alloc: string,
  destAddrBech32: string,
}

export default function ClaimDone(props: Props) {
  return (
    <ClaimInfo2 {...props} />
  );
}
