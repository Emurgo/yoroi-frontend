// @flow
export type AssuranceMode = {|
    /** <95% assurance */
    low: number,
    /** <99.9% assurance */
    medium: number,
|};
export type AssuranceLevel = 'low' | 'medium' | 'high';
