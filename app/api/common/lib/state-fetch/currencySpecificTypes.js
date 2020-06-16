// @flow

// checkAddressesInUse

export type FilterUsedRequest = {| addresses: Array<string>, |};
export type FilterUsedResponse = Array<string>;
export type FilterFunc = (body: FilterUsedRequest) => Promise<FilterUsedResponse>;
