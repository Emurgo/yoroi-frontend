// @flow
export interface IHeadCell {
  id: string;
  label: string;
  align: string;
  sortType?: string;
  disabledSort?: boolean;
  isPadding?: boolean;
}
